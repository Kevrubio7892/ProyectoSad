import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import ProtectedRoute from './ProtectedRoute';
import { getUserRoleByPhone, getUserRoleFromCollections } from '../firebaseConfig';

const { mockAuthStateChanged } = vi.hoisted(() => ({
  mockAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockAuthStateChanged,
}));

vi.mock('../firebaseConfig', () => ({
  auth: {},
  getUserRoleByPhone: vi.fn(),
  getUserRoleFromCollections: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        callback({ email: 'student@example.com' } as User);
        return vi.fn();
      }
    );
  });

  it('renders the protected component when the user role matches', async () => {
    vi.mocked(getUserRoleFromCollections).mockResolvedValue('Estudiante');

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <ProtectedRoute
          path="/perfil"
          role="Estudiante"
          component={() => <div>Contenido protegido</div>}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });

    expect(getUserRoleFromCollections).toHaveBeenCalledWith('student@example.com');
  });

  it('waits for Firebase to restore the signed-in user before redirecting', async () => {
    let notifyAuthState: ((user: User | null) => void) | undefined;
    mockAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        notifyAuthState = callback;
        return vi.fn();
      }
    );
    vi.mocked(getUserRoleFromCollections).mockResolvedValue('Estudiante');

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Route path="/login" render={() => <div>Login page</div>} />
        <ProtectedRoute
          path="/perfil"
          role="Estudiante"
          component={() => <div>Contenido protegido</div>}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();

    notifyAuthState?.({ email: 'student@example.com' } as User);

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });
  });

  it('authorizes a phone-authenticated user using the verified phone number', async () => {
    mockAuthStateChanged.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        callback({ phoneNumber: '+56912345678' } as User);
        return vi.fn();
      }
    );
    vi.mocked(getUserRoleByPhone).mockResolvedValue('Estudiante');

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <ProtectedRoute
          path="/perfil"
          role="Estudiante"
          component={() => <div>Contenido protegido</div>}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });
    expect(getUserRoleByPhone).toHaveBeenCalledWith('+56912345678');
  });

  it('redirects to login when the user role does not match', async () => {
    vi.mocked(getUserRoleFromCollections).mockResolvedValue('Administrador');

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Route path="/login" render={() => <div>Login page</div>} />
        <ProtectedRoute
          path="/perfil"
          role="Estudiante"
          component={() => <div>Contenido protegido</div>}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });
  });
});
