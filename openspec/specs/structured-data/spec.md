## Purpose

Define los datos estructurados (JSON-LD) públicos del sitio — Organization/WebSite/NewsArticle/BreadcrumbList — y su serialización segura frente a contenido editorial no confiable.

## Requirements

### Requirement: JSON-LD por tipo de página
Article SHALL incluir JSON-LD `NewsArticle` y `BreadcrumbList`. Home SHALL incluir `Organization`/`WebSite`. Category SHALL incluir `BreadcrumbList`.

#### Scenario: Se renderiza un Article publicado
- **WHEN** se solicita un Article publicado
- **THEN** la respuesta incluye JSON-LD `NewsArticle` y `BreadcrumbList` coherente con el breadcrumb visual de la página

#### Scenario: Se renderiza Home
- **WHEN** se solicita Home
- **THEN** la respuesta incluye JSON-LD `Organization` y `WebSite`

Referencia: §41.5 del Master Spec, AC-SEO-006, AC-SEO-007

### Requirement: Publisher/Organization centralizado
El `publisher`/`Organization` representado en cualquier JSON-LD SHALL originarse únicamente en `SiteSettings.organization`, nunca hardcodeado de forma independiente en múltiples archivos.

#### Scenario: Se audita el JSON-LD de dos páginas distintas
- **WHEN** se comparan los datos de `publisher` en el JSON-LD de un Article y de Home
- **THEN** ambos provienen de la misma lectura de `SiteSettings.organization`

Referencia: §41.5 del Master Spec, AC-SEO-008

### Requirement: Serialización segura de JSON-LD
El JSON-LD SHALL serializarse escapando cualquier secuencia capaz de cerrar prematuramente la etiqueta `<script>` contenedora (por ejemplo `</script>` literal dentro de un campo editorial), nunca mediante interpolación de string sin escapar.

#### Scenario: Un campo editorial contiene una secuencia que cerraría el script
- **WHEN** el título, descripción o bio de autor de un documento contiene literalmente `</script>` o una secuencia equivalente
- **THEN** el HTML servido no se corrompe y el bloque JSON-LD permanece válido

### Requirement: Autor en JSON-LD limitado al allowlist público existente
El autor representado en JSON-LD `NewsArticle` SHALL usar únicamente los campos ya expuestos por el `AuthorSummary` público (`displayName`/`slug`/`avatar`/`bio`) — SHALL NOT incluir `email`, `role`, `active` ni ningún otro campo interno del usuario.

#### Scenario: Se audita el JSON-LD de un Article con autor
- **WHEN** se inspecciona el JSON-LD `NewsArticle` de un Article con autor asignado
- **THEN** el objeto de autor solo contiene `displayName`/`slug`/`avatar`/`bio`, sin `email`/`role`/`active`
