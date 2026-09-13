import { permanentRedirect, redirect } from 'next/navigation'

/**
 * Emits a stored `Redirects.statusCode` using the closest Next.js Server
 * Component redirect primitive available. Confirmed against
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/`:
 * Server Components can only emit `redirect()` (307) or
 * `permanentRedirect()` (308) - a literal 301/302 status is only
 * reachable from a Route Handler/Middleware via `NextResponse.redirect()`,
 * which these two resolvers (Category/Page and Article) are not. `308`/
 * `307` are the modern replacements Next's own docs describe for `301`/
 * `302` respectively, so this is the closest correct mapping available
 * from a Server Component (design.md Decisión 9).
 */
export function applyStoredRedirect(to: string, statusCode: '301' | '302'): never {
  if (statusCode === '301') {
    permanentRedirect(to)
  }

  redirect(to)
}
