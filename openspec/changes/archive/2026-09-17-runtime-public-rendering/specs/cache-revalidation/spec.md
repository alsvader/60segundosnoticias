## RENAMED Requirements

- FROM: `### Requirement: Remoción de force-dynamic condicionada a invalidación verificada`
- TO: `### Requirement: Presencia de force-dynamic en el layout público`

## MODIFIED Requirements

### Requirement: Presencia de force-dynamic en el layout público
`export const dynamic = 'force-dynamic'` SHALL estar presente en `src/app/(frontend)/layout.tsx` y en `src/app/sitemap.ts`. Esto no reinstaura la postura sin-cache de Fase 5: es un invariante distinto, de Fase 10 (`production-docker-image`, "El build de la aplicación no requiere una base de datos alcanzable") - `next build` intenta generación estática para `/`, `/buscar` y `/sitemap.xml` por defecto, y esa generación estática ejecuta las mismas consultas a Payload que fallan sin una base de datos disponible en build time. La invalidación dirigida por tags (Navigation, Footer, SiteSettings, Home) verificada al remover `force-dynamic` en Fase 8 SHALL seguir reflejando cambios administrables sin rebuild, ahora garantizado por el renderizado dinámico por solicitud en cada request en vez de por la revalidación de una página estática - las funciones DAL subyacentes (`getHome`, `getSettings`, `getNavigation`, `getFooter`, `getSitemapEntries`) SHALL seguir envueltas en `unstable_cache` con sus tags existentes, sin cambios.

#### Scenario: Se remueve force-dynamic
- **WHEN** se remueve `force-dynamic` del layout público
- **THEN** una edición de Navigation, Footer o SiteSettings ya se refleja públicamente sin rebuild, verificado antes de la remoción

#### Scenario: Se restaura force-dynamic por el invariante de build
- **WHEN** se agrega `force-dynamic` al layout público y a `src/app/sitemap.ts`
- **THEN** `docker build --target runner` ya no requiere una base de datos alcanzable, y una edición de Navigation, Footer o SiteSettings sigue reflejándose públicamente sin rebuild

#### Scenario: Las consultas DAL cacheadas siguen sirviéndose desde el Data Cache
- **WHEN** una misma función DAL envuelta en `unstable_cache` (p. ej. `getSettings`) se invoca en solicitudes sucesivas sin que su tag se invalide entre medio
- **THEN** solo la primera invocación ejecuta la consulta real a Payload; las siguientes reutilizan el resultado cacheado, sin importar que la ruta se renderice de forma dinámica en cada solicitud

#### Scenario: revalidateTag sigue refrescando el resultado cacheado
- **WHEN** se invoca `revalidateTag` sobre el tag de una función DAL cacheada (p. ej. tras un `afterChange` de SiteSettings)
- **THEN** la siguiente invocación de esa función ejecuta la consulta real a Payload de nuevo, en vez de reutilizar el resultado previamente cacheado
