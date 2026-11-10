import { isAdultOnDate } from './studentEligibility';

export interface DiscoveryProfile {
  id: string;
  nombreCompleto?: string;
  email?: string;
  telefono?: string;
  role?: string;
  sedeAcademica?: string;
  fechaNacimiento?: string;
  carrera?: string;
  isDiscoverable?: boolean;
}

export const filterDiscoveryProfiles = (
  profiles: DiscoveryProfile[],
  options: {
    currentUserId: string;
    currentEmail?: string | null;
    currentPhone?: string | null;
    campus: string;
    blockedIds: Set<string>;
    excludedIds: Set<string>;
    career?: string;
    today?: Date;
  }
): DiscoveryProfile[] => {
  const phoneDigits = (phone?: string | null) => phone?.replace(/\D/g, '') || '';
  const currentPhoneDigits = phoneDigits(options.currentPhone);

  return profiles.filter((profile) => {
    if (
      profile.id === options.currentUserId ||
      profile.role !== 'Estudiante' ||
      profile.sedeAcademica !== options.campus ||
      profile.isDiscoverable === false ||
      !profile.fechaNacimiento ||
      !isAdultOnDate(profile.fechaNacimiento, options.today) ||
      options.blockedIds.has(profile.id) ||
      options.excludedIds.has(profile.id)
    ) {
      return false;
    }
    if (options.currentEmail && profile.email === options.currentEmail) {
      return false;
    }
    if (
      currentPhoneDigits &&
      phoneDigits(profile.telefono) === currentPhoneDigits
    ) {
      return false;
    }
    if (options.career && profile.carrera !== options.career) {
      return false;
    }

    return true;
  });
};
