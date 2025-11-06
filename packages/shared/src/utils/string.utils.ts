/**
 * Normalize a string by trimming whitespace and converting to lowercase
 * @param value - The string to normalize
 * @returns The normalized string
 */
export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Normalize an email address
 * @param email - The email to normalize
 * @returns The normalized email
 */
export function normalizeEmail(email: string | null | undefined): string {
  return normalizeString(email);
}

/**
 * Normalize a ward or stake name
 * @param name - The ward/stake name to normalize
 * @returns The normalized name
 */
export function normalizeWardStakeName(
  name: string | null | undefined
): string {
  return normalizeString(name);
}
