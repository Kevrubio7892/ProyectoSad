import { describe, expect, it } from 'vitest';
import { isAdultOnDate, isDuocInstitutionalEmail } from './studentEligibility';

describe('student eligibility validation', () => {
  it('requires an adult birth date', () => {
    const today = new Date(2026, 10, 10);
    expect(isAdultOnDate('2008-11-10', today)).toBe(true);
    expect(isAdultOnDate('2008-11-11', today)).toBe(false);
  });

  it('rejects invalid and future birth dates', () => {
    const today = new Date(2026, 10, 10);
    expect(isAdultOnDate('2000-02-31', today)).toBe(false);
    expect(isAdultOnDate('2027-01-01', today)).toBe(false);
  });

  it('accepts only the configured institutional email domain', () => {
    expect(isDuocInstitutionalEmail('person@duocuc.cl')).toBe(true);
    expect(isDuocInstitutionalEmail('person@gmail.com')).toBe(false);
    expect(isDuocInstitutionalEmail('person@notduocuc.cl')).toBe(false);
  });
});
