## Purpose

Centraliza el acceso server-side a Payload (Posts, Categories, Pages y los Globals Navigation/Footer/SiteSettings) detrás de una Data Access Layer que hace seguro por defecto el acceso público, evitando que cualquier componente o página consulte Payload directamente.

## Requirements

### Requirement: DAL centraliza toda lectura pública de Payload
Ninguna página, layout o componente SHALL invocar Payload Local API directamente. Toda lectura pública SHALL pasar por funciones de `src/lib/data/`.

#### Scenario: Un Server Component necesita Posts recientes
- **WHEN** una página necesita los últimos Posts publicados
- **THEN** invoca una función del DAL (por ejemplo `getLatestPosts()`), no `payload.find()` directamente

### Requirement: Acceso público seguro por defecto, sin escape hatch genérico
El helper de acceso público compartido SHALL ejecutar toda lectura pública con `overrideAccess: false`. El DAL público no SHALL exponer un parámetro booleano genérico que permita a una función pública cambiar a `overrideAccess: true`. Un futuro acceso confiable de preview/admin (Fase 8) SHALL usar una ruta separada y explícitamente nombrada, no una opción que debilite el helper público.

#### Scenario: Se agrega una nueva función pública al DAL
- **WHEN** un desarrollador añade una nueva función de lectura pública al DAL
- **THEN** usa el helper de acceso público compartido, que ya ejecuta con `overrideAccess: false`, sin posibilidad de pasar un flag para desactivarlo

#### Scenario: Una función DAL pública intenta ver Drafts
- **WHEN** el helper de acceso público compartido se invoca para leer Posts o Pages
- **THEN** el resultado nunca incluye documentos con `_status: draft`

Referencia: AC-DRAFT-001, AC-DRAFT-002, AC-DRAFT-003

### Requirement: Filtrado explícito de _status como defensa adicional
Las consultas públicas de Posts y Pages SHALL incluir explícitamente `_status: { equals: 'published' }` en su `where`, además de `overrideAccess: false`, como defensa en profundidad independiente del control de acceso de la Collection.

#### Scenario: Se audita una query pública de Posts
- **WHEN** se revisa una función pública del DAL que consulta `posts` o `pages`
- **THEN** su `where` incluye explícitamente la restricción `_status: published`, sin depender únicamente de `overrideAccess: false`

### Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL
El sistema SHALL definir los Payload Globals `Navigation`, `Footer` y `SiteSettings`, y el DAL SHALL exponer `getNavigation()`, `getFooter()` y `getSettings()` para leerlos. El Global `Home` no SHALL existir.

#### Scenario: El site shell necesita la configuración de navegación
- **WHEN** el layout público necesita los items de navegación
- **THEN** llama a `getNavigation()`, que lee el Global `Navigation` vía Payload Local API con `overrideAccess: false`

#### Scenario: Se busca el Global Home
- **WHEN** se revisan los Globals definidos en `payload.config.ts`
- **THEN** no existe un Global `Home`

### Requirement: Proyección/profundidad evita sobre-consulta
Las consultas de listado de Posts (por ejemplo para `ArticleCard`) SHALL evitar cargar el campo `content` (Lexical) completo y SHALL usar una profundidad de relación suficiente para poblar `featuredImage`, `primaryCategory` y `author`, sin poblar relaciones anidadas innecesarias.

#### Scenario: Se listan Posts para tarjetas
- **WHEN** el DAL consulta Posts para alimentar una lista de `ArticleCard`
- **THEN** la consulta no incluye el campo `content` completo y resuelve `featuredImage`/`primaryCategory`/`author` sin profundidad adicional innecesaria
