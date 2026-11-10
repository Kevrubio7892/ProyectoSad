import { describe, expect, it } from 'vitest';
import { filterDiscoveryProfiles } from './discovery';

const baseOptions = {
  currentUserId: 'me',
  currentEmail: 'me@duocuc.cl',
  campus: 'Duoc UC Puente Alto',
  blockedIds: new Set<string>(),
  excludedIds: new Set<string>(),
  today: new Date(2026, 10, 10),
};

describe('filterDiscoveryProfiles', () => {
  it('only includes visible adult student profiles from the selected campus and career', () => {
    const profiles = [
      { id: 'adult', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01', carrera: 'Informática' },
      { id: 'hidden', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01', carrera: 'Informática', isDiscoverable: false },
      { id: 'wrong-campus', role: 'Estudiante', sedeAcademica: 'Otra sede', fechaNacimiento: '2000-01-01', carrera: 'Informática' },
    ];

    expect(filterDiscoveryProfiles(profiles, { ...baseOptions, career: 'Informática' }).map((profile) => profile.id))
      .toEqual(['adult']);
  });

  it('excludes self, minors, blocked profiles and previously evaluated profiles', () => {
    const profiles = [
      { id: 'me', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01' },
      { id: 'minor', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2010-01-01' },
      { id: 'blocked', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01' },
      { id: 'excluded', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01' },
      { id: 'eligible', role: 'Estudiante', sedeAcademica: 'Duoc UC Puente Alto', fechaNacimiento: '2000-01-01' },
    ];

    expect(filterDiscoveryProfiles(profiles, {
      ...baseOptions,
      blockedIds: new Set(['blocked']),
      excludedIds: new Set(['excluded']),
    }).map((profile) => profile.id)).toEqual(['eligible']);
  });
});
