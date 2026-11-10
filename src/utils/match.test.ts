import { describe, expect, it } from 'vitest';
import { getMatchId } from './match';

describe('getMatchId', () => {
  it('returns the same conversation id regardless of participant order', () => {
    expect(getMatchId('user-a', 'user-b')).toBe(getMatchId('user-b', 'user-a'));
  });

  it('rejects invalid participant pairs', () => {
    expect(() => getMatchId('user-a', 'user-a')).toThrow();
    expect(() => getMatchId('', 'user-b')).toThrow();
  });
});
