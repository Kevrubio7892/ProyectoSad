import { beforeEach, describe, expect, it, vi } from 'vitest';
import { likeStudent, sendSuperLike } from './MatchingService';

const { mockCollection, mockDoc, mockGetDoc, mockGetDocs, mockSetDoc } = vi.hoisted(() => ({
  mockCollection: vi.fn(),
  mockDoc: vi.fn(),
  mockGetDoc: vi.fn(),
  mockGetDocs: vi.fn(),
  mockSetDoc: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  limit: vi.fn((count: number) => ({ count })),
  query: vi.fn((...parts: unknown[]) => ({ parts })),
  serverTimestamp: vi.fn(() => 'server-time'),
  setDoc: mockSetDoc,
  where: vi.fn((...parts: unknown[]) => ({ parts })),
}));

vi.mock('../firebaseConfig', () => ({
  db: {},
}));

describe('likeStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection.mockImplementation((_db: unknown, ...segments: string[]) => ({
      path: segments.join('/'),
    }));
    mockDoc.mockImplementation((_db: unknown, ...segments: string[]) => ({
      path: segments.join('/'),
    }));
    mockGetDoc.mockImplementation((reference: { path: string }) => ({
      exists: () => reference.path.split('/').length === 2,
    }));
    mockGetDocs.mockResolvedValue({ empty: true });
    mockSetDoc.mockResolvedValue(undefined);
  });

  it('records a like but does not create a chat before a reciprocal like', async () => {
    const result = await likeStudent('user-a', 'user-b');

    expect(result).toBeNull();
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc.mock.calls[0][0].path).toBe('Estudiantes/user-b/LIKES/user-a');
  });

  it('creates one deterministic chat after a reciprocal like exists', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => true });

    const result = await likeStudent('user-b', 'user-a');

    expect(result).toBe('user-a_user-b');
    expect(mockSetDoc).toHaveBeenCalledTimes(2);
    expect(mockSetDoc.mock.calls[1][0].path).toBe('Chats/user-a_user-b');
  });

  it('rejects liking oneself', async () => {
    await expect(likeStudent('user-a', 'user-a')).rejects.toThrow();
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('records a premium super like without creating a match', async () => {
    await sendSuperLike('user-a', 'user-b');

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc.mock.calls[0][0].path).toBe(
      'Estudiantes/user-b/SUPER_LIKES/user-a'
    );
    expect(mockGetDoc).toHaveBeenCalledTimes(1);
  });

  it('creates a match when a check reciprocates a received super like', async () => {
    mockGetDoc.mockImplementation((reference: { path: string }) => ({
      exists: () =>
        reference.path === 'Estudiantes/user-b' ||
        reference.path === 'Estudiantes/user-a' ||
        reference.path === 'Estudiantes/user-b/SUPER_LIKES/user-a',
    }));

    const result = await likeStudent('user-b', 'user-a');

    expect(result).toBe('user-a_user-b');
    expect(mockSetDoc.mock.calls[0][0].path).toBe(
      'Estudiantes/user-a/LIKES/user-b'
    );
    expect(mockSetDoc.mock.calls[1][0].path).toBe('Chats/user-a_user-b');
  });

  it('recognizes reciprocal likes stored with legacy auto-generated document IDs', async () => {
    mockGetDocs
      .mockResolvedValueOnce({ empty: false })
      .mockResolvedValueOnce({ empty: true });

    const result = await likeStudent('user-b', 'user-a');

    expect(result).toBe('user-a_user-b');
    expect(mockSetDoc.mock.calls[1][0].path).toBe('Chats/user-a_user-b');
  });

  it('finds legacy student profiles by uid before writing likes', async () => {
    mockGetDoc.mockImplementation((reference: { path: string }) => ({
      exists: () =>
        reference.path === 'Estudiantes/user-a' ||
        reference.path.includes('/LIKES/') ||
        reference.path.includes('/SUPER_LIKES/'),
    }));
    mockGetDocs
      .mockResolvedValueOnce({
        empty: false,
        docs: [{ id: 'legacy-profile-b' }],
      })
      .mockResolvedValueOnce({ empty: true })
      .mockResolvedValueOnce({ empty: true });

    await likeStudent('user-a', 'user-b');

    expect(mockSetDoc.mock.calls[0][0].path).toBe(
      'Estudiantes/legacy-profile-b/LIKES/user-a'
    );
  });
});
