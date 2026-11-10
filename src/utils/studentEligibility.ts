export const isAdultOnDate = (birthDate: string, today = new Date()): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return false;
  }

  const [year, month, day] = birthDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > today
  ) {
    return false;
  }

  let age = today.getFullYear() - year;
  const birthdayHasPassed =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age >= 18;
};

export const isDuocInstitutionalEmail = (email: string): boolean =>
  /^[^\s@]+@duocuc\.cl$/i.test(email.trim());
