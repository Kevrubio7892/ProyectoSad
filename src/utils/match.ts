export const getMatchId = (firstUserId: string, secondUserId: string): string => {
  if (!firstUserId || !secondUserId || firstUserId === secondUserId) {
    throw new Error('Un match requiere dos usuarios distintos.');
  }

  return [firstUserId, secondUserId].sort().join('_');
};
