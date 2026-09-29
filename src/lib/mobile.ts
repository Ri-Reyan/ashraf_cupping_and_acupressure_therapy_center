// Bangladesh mobile normalization shared by validators and forms.
// Accepted stored format is 01XXXXXXXXX.
export const BD_MOBILE_PATTERN = /^01[3-9]\d{8}$/;

export function normalizeBdMobile(value: string): string {
  const compact = value.trim().replace(/[\s()-]/g, "");
  if (compact.startsWith("+88")) return compact.slice(3);
  if (compact.startsWith("88")) return compact.slice(2);
  return compact;
}

export function isValidBdMobile(value: string): boolean {
  return BD_MOBILE_PATTERN.test(normalizeBdMobile(value));
}
