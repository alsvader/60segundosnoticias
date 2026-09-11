## Purpose

Renderiza de forma segura el contenido Lexical del body de un Article y sus 6 Article Content Blocks, sin ejecutar nunca HTML o scripts arbitrarios provenientes del CMS.

## ADDED Requirements

### Requirement: Renderizado seguro de Lexical
El body de un Article SHALL renderizarse usando la API oficial de renderizado de `@payloadcms/richtext-lexical`. El sistema SHALL NOT usar `dangerouslySetInnerHTML` para renderizar contenido almacenado en Payload.

#### Scenario: Contenido enriquecido básico
- **WHEN** el body de un Article contiene texto con negritas, listas y encabezados
- **THEN** se renderiza fielmente sin HTML inyectado directamente desde el CMS

Referencia: AC-CONTENT-001, AC-CONTENT-002, AC-CONTENT-004, AC-CONTENT-005

### Requirement: ImageBlock
El sistema SHALL renderizar `ImageBlock` respetando `size` restringido a `small`, `medium`, `large` o `full`, mostrando `caption`/`credits` cuando existan, sin aceptar tamaños o márgenes arbitrarios. Cada valor de `size` mapea a una clase fija definida en el componente (nunca CSS/margen libre proveniente de Payload).

#### Scenario: Tamaño ampliado
- **WHEN** se renderiza un `ImageBlock` con `size: full`
- **THEN** ocupa el ancho de la columna de lectura del artículo (`70ch`), no un valor arbitrario

Referencia: AC-BLOCK-IMG-001, AC-BLOCK-IMG-002

### Requirement: GalleryBlock
El sistema SHALL renderizar `GalleryBlock` en layout `grid` o `carousel`. El layout `carousel` SHALL ser navegable con teclado y con gestos táctiles nativos, sin depender de una librería de carousel externa.

#### Scenario: Carousel accesible
- **WHEN** se renderiza un `GalleryBlock` con `layout: carousel`
- **THEN** es navegable con teclado y con gestos táctiles nativos

Referencia: AC-BLOCK-GAL-001, AC-BLOCK-GAL-002

### Requirement: VideoBlock
El sistema SHALL renderizar `VideoBlock` para los providers `youtube`, `vimeo` y `uploaded`, sin aceptar un iframe arbitrario, y ningún video SHALL reproducirse automáticamente con audio. Un campo `portrait` (checkbox) SHALL controlar el aspect ratio vertical (9:16) para contenido tipo Shorts/Reels.

#### Scenario: Provider externo soportado
- **WHEN** se renderiza un `VideoBlock` con provider `youtube` o `vimeo` y una URL válida de ese proveedor
- **THEN** se resuelve un embed controlado

#### Scenario: Host no soportado
- **WHEN** la URL de un `VideoBlock` externo pertenece a un host no soportado
- **THEN** no se renderiza como embed

#### Scenario: Video propio
- **WHEN** se renderiza un `VideoBlock` con provider `uploaded`
- **THEN** se reproduce el video propio con su `poster`, sin depender de un proveedor externo

#### Scenario: Sin autoplay con audio
- **WHEN** se renderiza cualquier `VideoBlock`
- **THEN** no reproduce audio automáticamente al cargar la página

Referencia: AC-BLOCK-VID-001, AC-BLOCK-VID-002, AC-BLOCK-VID-003

### Requirement: QuoteBlock y CalloutBlock
El sistema SHALL renderizar `QuoteBlock` y `CalloutBlock` con la apariencia y colores definidos por el Design System, sin aceptar CSS ni clases arbitrarias desde Payload.

#### Scenario: Variante de Callout
- **WHEN** se renderiza un `CalloutBlock` con `variant: warning`
- **THEN** usa la apariencia definida por el Design System para esa variante

Referencia: §10.5 del Master Spec

### Requirement: EmbedBlock con providers controlados
El sistema SHALL renderizar `EmbedBlock` con resolución específica y enriquecida para los providers `instagram`, `x`, `tiktok`, `facebook` y `linkedin`. Un campo `alignment` (`left`/`center`/`right`, default `left`) SHALL controlar únicamente dónde queda la caja del embed dentro de la columna, mapeando a una clase fija (nunca CSS/margen libre proveniente de Payload) — cada provider controlado se renderiza en un ancho fijo responsivo para que la alineación tenga efecto visual. Para `provider: generic`, el sistema SHALL NOT renderizar un iframe arbitrario, HTML crudo, scripts, ni usar `dangerouslySetInnerHTML`; en su lugar SHALL validar la URL como http(s) válida y renderizarla como una tarjeta de enlace externo segura, mostrando el destino, con `rel="noopener noreferrer"` y texto de enlace accesible.

#### Scenario: Provider controlado con URL válida
- **WHEN** se renderiza un `EmbedBlock` con provider `instagram`, `x`, `tiktok`, `facebook` o `linkedin` y una URL válida de ese proveedor
- **THEN** se renderiza el embed enriquecido correspondiente a ese proveedor, alineado según `alignment`

#### Scenario: Provider generic
- **WHEN** se renderiza un `EmbedBlock` con `provider: generic` y una URL http(s) válida
- **THEN** se renderiza como una tarjeta de enlace externo con `rel="noopener noreferrer"`, nunca como iframe o HTML inyectado

#### Scenario: URL inválida
- **WHEN** un `EmbedBlock` tiene una URL inválida o que no usa http(s)
- **THEN** no rompe la página del Article

Referencia: AC-EMBED-001, AC-EMBED-002

### Requirement: Bloque no reconocido no rompe la página
Un tipo de bloque no reconocido dentro del contenido de un Article SHALL registrarse con una advertencia y omitirse, sin afectar el renderizado del resto del Article.

#### Scenario: Bloque desconocido
- **WHEN** el contenido de un Article incluye un tipo de bloque no reconocido por el renderer
- **THEN** se omite ese bloque con una advertencia registrada, y el resto del Article se renderiza normalmente

Referencia: §61 del Master Spec
