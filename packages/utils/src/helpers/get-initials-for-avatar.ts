export function getInitialsForAvatar({
  displayName,
  firstName,
  lastName,
}: {
  displayName?: string;
  firstName?: string;
  lastName?: string;
}) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`;
  }
  if (displayName) {
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  }
  return 'U';
}
