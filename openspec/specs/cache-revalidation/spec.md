## Purpose

Define el esquema de cache por dependencias y la invalidación dirigida que reemplaza la postura sin-cache (`force-dynamic`) heredada de Fase 5, sin sacrificar la administrabilidad del contenido sin cambio de código.

## Requirements

### Requirement: Cache pública con invalidación por tags de dependencia
El sistema SHALL cachear las consultas públicas del DAL usando tags específicos por dependencia (post, category, listado de posts, home, page, navigation, footer, settings, sitemap, llms), y SHALL invalidar exclusivamente mediante esos tags — nunca mediante un rebuild o revalidación global arbitraria.

#### Scenario: Se publica un Post
- **WHEN** un Post cambia de estado a publicado
- **THEN** solo los tags de dependencia realmente afectados se invalidan, no la totalidad de la cache pública

Referencia: §40 del Master Spec, AC-CACHE-001

### Requirement: Invalidación por publicación/actualización de Post
Publicar o actualizar un Post SHALL invalidar ese Post, sus categorías (primaria y adicionales) y el/los listado(s) general(es) de Posts. Home SHALL invalidarse únicamente si el Post está referenciado por un bloque automático de Home.

#### Scenario: Se actualiza un Post no referenciado por Home
- **WHEN** se actualiza un Post publicado que ningún bloque de Home referencia manualmente
- **THEN** Home no se invalida

Referencia: §40.1 del Master Spec, AC-CACHE-002

### Requirement: Invalidación por cambio de Category
Cambiar una Category SHALL invalidar esa Category y, cuando corresponda, la navegación. Un cambio de `slug` de Category SHALL además invalidar cada Post publicado cuya URL canónica cambió como consecuencia.

#### Scenario: Cambio de slug de Category
- **WHEN** cambia el `slug` de una Category con Posts publicados
- **THEN** se invalida la Category y cada Post publicado afectado

Referencia: §40.2 del Master Spec, AC-CACHE-003

### Requirement: Invalidación de Home
Un cambio en el Global Home SHALL invalidar únicamente el tag de Home.

#### Scenario: Se reordenan bloques de Home
- **WHEN** un Admin reordena o modifica el `layout` de Home
- **THEN** solo se invalida Home

Referencia: §40.3 del Master Spec, AC-CACHE-004

### Requirement: Invalidación específica de Navigation/Footer/SiteSettings/ArticleSidebar
Cada uno de Navigation, Footer, SiteSettings y el Global `ArticleSidebar` (introducido en Fase 7, no nombrado en los tags conceptuales de §40 por ser posterior a esa sección) SHALL invalidarse mediante su propio tag específico, sin invalidar innecesariamente los demás Globals ni el contenido editorial.

#### Scenario: Se actualiza Footer
- **WHEN** se actualiza el Global Footer
- **THEN** solo se invalida el tag de Footer

#### Scenario: Se actualiza ArticleSidebar
- **WHEN** se actualiza el Global `ArticleSidebar`
- **THEN** solo se invalida el tag de `ArticleSidebar`, sin afectar Navigation/Footer/SiteSettings ni el contenido de Posts

Referencia: §40.4 del Master Spec, AC-CACHE-005

### Requirement: Draft Mode nunca sirve ni contamina cache pública
Mientras Draft Mode está habilitado para una sesión autorizada, ninguna lectura SHALL devolver accidentalmente una versión cacheada públicamente, y el contenido en Draft servido durante esa sesión SHALL NOT escribirse en la cache pública compartida.

#### Scenario: Sesión de Preview activa junto a tráfico público
- **WHEN** un usuario autorizado navega en Draft Mode mientras hay tráfico público concurrente
- **THEN** el tráfico público nunca recibe contenido en Draft, y la sesión de Preview nunca sirve una versión pública obsoleta cacheada

Referencia: §40.5 del Master Spec, AC-CACHE-006

### Requirement: Fallo de invalidación no corrompe una publicación
Un fallo al invalidar cache SHALL registrarse de forma diagnosticable y SHALL NOT impedir, revertir ni corromper la operación de publicación/actualización que lo originó.

#### Scenario: La invalidación de un tag falla durante un publish
- **WHEN** falla la invalidación de cache asociada a un Post recién publicado
- **THEN** el Post queda publicado igualmente y el fallo queda registrado para diagnóstico

Referencia: AC-ERR-003

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
