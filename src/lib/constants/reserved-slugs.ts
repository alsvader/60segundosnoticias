export const RESERVED_SLUGS = [
  'buscar',
  'admin',
  'api',
  'preview',
  'media',
  'autor',
  'tag',
  '_next',
] as const

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug)
}
