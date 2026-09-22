export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * URL-safe slug: strips accents/diacritics (NFD), lowercases and collapses
 * any run of non-alphanumeric characters into a single hyphen.
 * "Política Económica ¡Hoy!" → "politica-economica-hoy"
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
