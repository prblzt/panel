export function isIcloudAddress(email: string) {
  return /^[^\s@]+@(icloud\.com|me\.com|mac\.com)$/i.test(email);
}

export function isUid(uid: string) {
  return /^[1-9]\d{0,19}$/.test(uid);
}
