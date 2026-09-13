export * from "./competitor";
export function getUserFullName(user) {
  if (!user) return "";
  const first = user.firstName || "";
  const middle = user.middleName || user.lastName || "";
  return `${first} ${middle}`.trim();
}
