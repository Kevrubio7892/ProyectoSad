import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber } from './phoneNumber';

describe('normalizePhoneNumber', () => {
  it('normalizes a formatted international phone number', () => {
    expect(normalizePhoneNumber('+56 9 4685-7892')).toBe('+56946857892');
  });

  it('rejects numbers without an international country code', () => {
    expect(normalizePhoneNumber('946857892')).toBeNull();
  });

  it('rejects invalid international numbers', () => {
    expect(normalizePhoneNumber('+0123')).toBeNull();
  });
});
