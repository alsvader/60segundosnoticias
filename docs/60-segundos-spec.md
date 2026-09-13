# 60 Segundos Noticias — Master Specification

> **Archivo objetivo en el repositorio:** `docs/60-segundos-spec.md`  
> **Estado:** Especificación normativa V1  
> **Idioma del producto:** Español (México) — `es-MX`  
> **Propósito:** Fuente de verdad funcional, editorial, visual y técnica para la implementación de 60 Segundos Noticias.

---

## 0. Cómo usar esta especificación

Este documento es la **fuente de verdad principal del proyecto**. Durante el onboarding inicial del repositorio, Codex, Claude Code, Cursor o cualquier otro agente de código debe revisarlo completo. En cambios posteriores debe consultar como mínimo las secciones relevantes para el OpenSpec Change activo antes de modificar arquitectura, modelos de datos, rutas, permisos, infraestructura o componentes principales.

### Orden de prioridad ante una contradicción

1. Este Master Specification.
2. El OpenSpec Change activo para el cambio que se está implementando.
3. La implementación existente y verificada del repositorio.
4. Las instrucciones específicas del agente/herramienta, siempre que no contradigan los puntos anteriores.
5. El criterio técnico del implementador.

`docs/60-segundos-spec.md` define el **estado objetivo** del producto. A partir de Phase 0, OpenSpec define el **alcance del cambio activo** y `openspec/specs/` documenta el comportamiento ya implementado después de archivar cambios. Graphify es una ayuda para comprender la estructura actual del repositorio y no sustituye ni al código fuente ni a esta especificación.

Si una decisión existente en el repositorio contradice este documento y corregirla implica una migración, cambio de modelo, cambio de rutas, cambio de permisos o una dependencia mayor, el implementador debe **reportar la contradicción antes de introducir una tercera arquitectura**.

### Reglas para agentes de código

- No implementar funcionalidades futuras u opcionales de manera oportunista.
- No cambiar decisiones arquitectónicas principales sin señalar el conflicto.
- No agregar un segundo CMS.
- No agregar un segundo framework UI.
- No crear un backend separado para Payload sin una necesidad explícita.
- No hardcodear categorías, navegación, redes sociales ni secciones editoriales que están definidas como administrables.
- No crear una Collection distinta para Noticias, Vlog, Experiencias, Recomendaciones o Entretenimiento.
- No crear una ruta Next.js específica por cada categoría.
- No permitir CSS, clases Tailwind, HTML o scripts arbitrarios desde Payload.
- No convertir componentes en Client Components sin necesidad real.
- No añadir Redis, queues, Elasticsearch, Algolia, Redux, Zustand, React Query u otra infraestructura no requerida por V1.
- No crear carpetas, factories, services, repositories o abstracciones vacías solo para imitar diagramas de este documento.
- Mantener la implementación incremental y validar los Acceptance Criteria correspondientes a cada fase.
- A partir de Phase 0, no iniciar implementación de producto sin un OpenSpec Change activo, salvo mantenimiento explícito del tooling del repositorio.
- Antes de exploraciones amplias del código, consultar Graphify para identificar módulos, dependencias y blast radius; después confirmar conclusiones inspeccionando los archivos fuente relevantes.
- OpenSpec, Graphify y los skills de agentes son tooling de desarrollo y no deben convertirse en dependencias runtime de la aplicación.

---

# 1. Visión del proyecto

**60 Segundos Noticias** es un medio digital editorial y multimedia construido con una estética inspirada en periódico tradicional, pero adaptada a un portal moderno de noticias, video, experiencias, recomendaciones y entretenimiento.

El producto debe permitir a un equipo editorial operar el portal desde Payload CMS sin depender de un desarrollador para tareas normales como:

- crear y publicar noticias;
- organizar categorías;
- subir fotografías;
- modificar navegación y footer;
- reorganizar la página principal;
- crear páginas institucionales;
- actualizar redes sociales y datos generales;
- conservar URLs cuando cambian slugs o categorías.

El sitio público debe priorizar:

- velocidad;
- lectura;
- SEO;
- accesibilidad;
- responsive design;
- fotografía;
- jerarquía editorial;
- bajo JavaScript en cliente;
- control visual consistente.

---

# 2. Objetivos de V1

La V1 debe entregar un portal editorial completamente operativo con:

- Home administrable por bloques.
- Páginas dinámicas de categoría.
- Páginas individuales de artículos.
- Páginas institucionales.
- Buscador.
- CMS editorial con Admin y Writer.
- Drafts, Preview, Publish y versiones.
- Media library.
- Navegación y footer administrables.
- SEO técnico y editorial.
- Sharing.
- Redirects automáticos para cambios de URL.
- Docker Compose para levantar aplicación + PostgreSQL.
- Arquitectura preparada para producción con PostgreSQL persistente y Object Storage externo.

---

# 3. Fuera de alcance de V1

No se implementarán salvo cambio explícito de alcance:

- rol `editor` y aprobación formal de contenido;
- `Submit for Review`;
- publicación programada;
- comentarios;
- push notifications;
- newsletter;
- dashboard analítico propio;
- ranking “más leídas”;
- recommendation engine;
- ad manager;
- feed social;
- páginas de autor;
- páginas públicas de tags;
- dark mode;
- internacionalización completa;
- Redis;
- queues;
- Kafka/RabbitMQ;
- Elasticsearch/Algolia/Meilisearch/Typesense;
- sistema propio de video streaming;
- builder visual con CSS libre;
- Google Docs-like collaborative editing.

La arquitectura debe permitir que varias de estas funciones puedan añadirse posteriormente sin rehacer el modelo principal.

---

# 4. Stack oficial

## 4.1 Aplicación

- Next.js
- App Router
- React
- TypeScript
- React Server Components por defecto
- Tailwind CSS
- shadcn/ui como capa estándar de primitivos
- Lucide para iconografía de UI
- pnpm como package manager

## 4.2 CMS

- Payload CMS integrado dentro de la misma aplicación Next.js.
- Payload Admin.
- Payload Auth.
- Payload Drafts y Versions.
- Payload Local API para acceso server-side desde la propia aplicación.
- Lexical Rich Text para contenido editorial.

## 4.3 Persistencia

- PostgreSQL.
- Adapter oficial de Payload compatible con PostgreSQL.
- Object Storage compatible con S3 en producción para Media.
- Cloudflare R2 es la opción recomendada, pero la aplicación no debe acoplarse directamente a un proveedor concreto.

## 4.4 Infraestructura

- Docker.
- Docker Compose.
- Dockerfile multi-stage.
- Aplicación container-ready.
- PostgreSQL dockerizado para desarrollo.
- PostgreSQL administrado recomendado para producción.

## 4.5 Versiones

Al iniciar la implementación se deben seleccionar **versiones estables y oficialmente compatibles** entre:

- Payload;
- Next.js;
- React;
- Tailwind;
- shadcn;
- PostgreSQL adapter.

No usar versiones experimentales sin una necesidad demostrada.

---

# 5. Principios arquitectónicos

## 5.1 Separación de responsabilidades

> **Payload decide qué contenido existe, qué se muestra y en qué orden. Next.js decide cómo se ve.**

Payload controla:

- contenido;
- relaciones;
- jerarquía editorial;
- selección de bloques;
- orden de bloques;
- variantes previamente aprobadas;
- navegación;
- footer;
- settings;
- metadata SEO.

Next.js controla:

- layout;
- tipografía;
- spacing;
- CSS;
- responsive behavior;
- componentes;
- animations;
- accesibilidad;
- presentación visual.

Payload **no** controla:

- tamaños arbitrarios;
- márgenes;
- paddings;
- clases Tailwind;
- CSS;
- font-family;
- HTML arbitrario;
- JavaScript;
- scripts;
- colores arbitrarios de categorías.

## 5.2 Server Components por defecto

Todos los componentes serán Server Components salvo que exista una necesidad real del navegador.

Client Components esperados:

- MobileNavigation;
- ShareActions;
- Copy Link;
- carousels;
- gallery carousel;
- FAQ accordion cuando el primitivo lo requiera;
- interacciones específicas del browser.

No convertir layouts o páginas enteras en Client Components por comodidad.

## 5.3 Progressive enhancement

Las funciones críticas deben funcionar sin depender innecesariamente de JavaScript:

- navegación;
- links;
- búsqueda;
- paginación;
- categorías;
- lectura de artículos.

JavaScript mejora:

- menú móvil;
- native share;
- copiar enlace;
- carousel;
- accordion.

---

# 6. Arquitectura de URLs

## 6.1 Rutas públicas V1

```text
/
├── /buscar
├── /[slug]
└── /[category]/[post]
```

Ejemplos:

```text
/
/noticias
/vlog
/experiencias
/recomendaciones
/entretenimiento

/nosotros
/contacto
/aviso-de-privacidad

/noticias/gobierno-anuncia-inversion
/experiencias/conociendo-palenque

/buscar?q=tabasco
/buscar?q=tabasco&page=2
```

## 6.2 Categorías y Pages

`Categories` y `Pages` comparten el namespace raíz:

```text
/[slug]
```

No pueden utilizar el mismo slug.

## 6.3 Reserved slugs

Como mínimo:

```text
buscar
admin
api
preview
media
autor
tag
_next
```

También se deben proteger rutas técnicas equivalentes que requiera Next.js/Payload.

Los reserved slugs deben existir en **una única fuente compartida** y ser utilizados por la validación de Payload.

## 6.4 URL canónica del Post

```text
/[primaryCategory.slug]/[post.slug]
```

Las categorías secundarias no generan una segunda URL.

Ejemplo:

```text
primaryCategory = noticias
additionalCategories = politica
```

Puede aparecer en `/noticias` y `/politica`, pero su URL continúa siendo:

```text
/noticias/post-slug
```

## 6.5 Categoría incorrecta en URL

Si se solicita:

```text
/experiencias/post-slug
```

pero el Post tiene:

```text
primaryCategory.slug = noticias
```

el sitio debe redirigir hacia:

```text
/noticias/post-slug
```

y nunca renderizar dos URLs equivalentes.

---

# 7. Roles y permisos

## 7.1 Roles V1

```text
admin
writer
```

No existe `editor` en V1.

## 7.2 Admin

Puede:

- administrar todos los Posts;
- crear, editar, publicar, despublicar y eliminar Posts;
- cambiar autor;
- restaurar versiones;
- administrar categorías;
- administrar tags;
- administrar Media;
- administrar Pages;
- administrar Home;
- administrar Navigation;
- administrar Footer;
- administrar SiteSettings;
- administrar Users;
- administrar Redirects.

## 7.3 Writer

Puede:

- crear Posts;
- editar sus propios Posts;
- guardar Drafts;
- hacer Preview de sus Posts;
- publicar sus propios Posts;
- despublicar sus propios Posts;
- modificar sus Posts publicados;
- utilizar categorías existentes;
- seleccionar Tags;
- crear Tags;
- subir Media;
- reutilizar Media existente;
- editar metadata de Media creada por él cuando sea aplicable.

No puede:

- modificar Posts de otros autores;
- cambiar autor;
- eliminar definitivamente Posts;
- administrar categorías;
- eliminar Tags;
- eliminar Media indiscriminadamente;
- administrar Pages;
- administrar Home;
- administrar Navigation;
- administrar Footer;
- administrar SiteSettings;
- administrar Redirects;
- modificar su rol.

## 7.4 Seguridad

Los permisos deben existir en Payload Access Control y Field-level Access.

**Ocultar botones no es autorización.**

---

# 8. Payload Collections

La V1 tendrá:

1. `Posts` — label de Admin: **Noticias**
2. `Categories`
3. `Tags`
4. `Pages`
5. `Media`
6. `Users`
7. `Redirects`

No crear Collections separadas por categoría editorial.

---

# 9. Collection: Posts

## 9.1 Configuración

- `slug: posts`
- Admin label: `Noticias`
- `drafts: true`
- `versions: true`
- timestamps habilitados
- `admin.useAsTitle = title`
- estado editorial mediante `_status` de Payload
- no crear un campo manual redundante `status`

## 9.2 Campos

### General

- `title`
  - text
  - obligatorio como mínimo para trabajar con el registro
- `slug`
  - text
  - globally unique
  - indexado
  - auto-generado inicialmente
  - editable manualmente
- `excerpt`
  - textarea
  - recomendado máximo aproximado: 300 caracteres
- `featuredImage`
  - relationship/upload → Media
- `primaryCategory`
  - relationship → Categories
  - single
  - indexado
- `additionalCategories`
  - relationship → Categories
  - hasMany
- `tags`
  - relationship → Tags
  - hasMany
- `author`
  - relationship → Users
  - indexado
- `content`
  - Lexical Rich Text
- `source`
  - text opcional
- `photoCredits`
  - text opcional
- `publishedAt`
  - date
  - indexado
- `featured`
  - checkbox
  - default false
  - indexado cuando aporte valor
- `readingTimeMinutes`
  - calculado automáticamente
  - no editable manualmente
- `seo`
  - grupo reutilizable

## 9.3 Campos requeridos para Publish

Drafts deben poder guardarse parcialmente.

Antes de publicar se deben validar como mínimo:

- title
- slug
- excerpt
- featuredImage
- primaryCategory
- author
- content

`publishedAt` se asigna automáticamente en la primera publicación si no existe.

## 9.4 SEO del Post

Campos:

- `metaTitle`
- `metaDescription`
- `metaImage`
- `canonicalURL`
- `noIndex`

Fallbacks:

```text
metaTitle       → title
metaDescription → excerpt
metaImage       → featuredImage
canonical       → URL generada por sitio + categoría + slug
```

Un valor SEO personalizado nunca debe ser sobrescrito automáticamente por el fallback.

## 9.5 Slug behavior

- Generar slug desde el título al crearse cuando no exista.
- Normalizar espacios, acentos y caracteres inválidos.
- No regenerar el slug automáticamente cuando se edita el título de un Post que ya posee slug.
- Si el usuario modifica explícitamente el slug de un Post publicado, crear redirect.

## 9.6 Autor

Writer:

```text
author = currentUser
```

automáticamente.

Writer no puede modificar `author`.

Admin sí.

## 9.7 Reading time

Calcular aproximadamente sobre el contenido editorial.

Referencia inicial:

```text
~200 palabras/minuto
```

La implementación puede ajustar el algoritmo, pero debe ser consistente y automática.

## 9.8 Hooks esperados

- slug generation;
- set Writer author;
- calculate reading time;
- set first `publishedAt`;
- create/update redirect when canonical URL changes;
- targeted revalidation;
- prevent unsafe deletion where applicable.

---

# 10. Article Content Blocks

Lexical manejará el contenido textual y permitirá insertar bloques controlados.

## 10.1 ImageBlock

Campos:

- image → Media, required
- caption
- credits
- alignment:
  - `normal`
  - `wide`
  - `full`

No aceptar tamaños/márgenes/CSS arbitrarios.

## 10.2 GalleryBlock

- images array, mínimo 2
  - image
  - caption
- layout:
  - `grid`
  - `carousel`

## 10.3 VideoBlock

- provider:
  - `youtube`
  - `vimeo`
  - `uploaded`
- url
- video upload
- poster
- caption

Campos condicionales según provider.

V1 debe priorizar YouTube/Vimeo para video pesado.

## 10.4 QuoteBlock

- quote, required
- author
- source

## 10.5 CalloutBlock

- variant:
  - `info`
  - `warning`
  - `important`
- title
- content

El frontend define apariencia y colores.

## 10.6 EmbedBlock

- provider:
  - `instagram`
  - `x`
  - `tiktok`
  - `generic`
- url

No aceptar raw `<script>`, raw iframe o HTML arbitrario.

---

# 11. Collection: Categories

Campos:

- `name`
  - required
  - unique
- `slug`
  - required
  - unique
  - indexado
- `description`
- `colorTheme`
  - select controlado
- `icon`
  - select controlado
- `image`
  - Media opcional
- `showInNavigation`
- `showOnHome`
- `order`
- `seo`

## 11.1 Category color themes

Keys iniciales permitidas:

```text
red
blue
orange
green
pink
purple
cyan
yellow
teal
indigo
```

Payload guarda la key semántica, no un hexadecimal.

## 11.2 Category icons

Keys iniciales:

```text
newspaper
video
plane
star
popcorn
dots
```

Puede ampliarse mediante el código del proyecto.

Payload nunca importa Lucide React; el frontend mapea keys → iconos.

## 11.3 Eliminación

No permitir eliminar una categoría mientras existan Posts que dependan de ella sin resolver relaciones.

## 11.4 Category Page membership

Una página de categoría lista Posts donde:

```text
primaryCategory = category
OR
additionalCategories contains category
```

Solo `_status = published`.

Orden default:

```text
publishedAt DESC
```

---

# 12. Collection: Tags

Campos:

- `name`
- `slug`

Ambos únicos cuando corresponda.

Permisos:

- Public: read seguro.
- Writer: read/create.
- Admin: CRUD.

En V1 los Tags pueden mostrarse visualmente al final del artículo, pero no es obligatorio que enlacen a `/tag/[slug]`.

---

# 13. Collection: Media

Payload Upload Collection.

Campos:

- `alt`
- `caption`
- `credits`
- `description`

## 13.1 Image sizes

Conceptualmente:

- thumbnail ≈ 400
- card ≈ 768
- tablet ≈ 1200
- desktop ≈ 1600
- hero ≈ 2000

Los valores exactos se pueden ajustar durante implementación para optimizar diseño y rendimiento.

## 13.2 Formatos

Imágenes compatibles y seguras, por ejemplo:

- JPEG
- PNG
- WebP
- AVIF

GIF solo si existe necesidad editorial.

SVG subido por usuarios debe manejarse de forma restrictiva por su capacidad de contener contenido activo.

## 13.3 Access

Writer:

- upload
- read
- reutilizar
- metadata de sus recursos cuando corresponda
- no delete indiscriminado

Admin:

- CRUD completo con protecciones por referencias.

## 13.4 Persistencia

Development:

```text
local media directory / persistent Docker volume
```

Production:

```text
Payload Storage Adapter
→ S3-compatible Object Storage
```

El filesystem del App Container se considera efímero en producción.

---

# 14. Collection: Users

Payload Auth Collection.

Campos públicos/editoriales:

- `name`
- `displayName`
- `slug`
- `avatar`
- `bio`
- `socialLinks`

Campos administrativos:

- `email`
- `role`
  - `admin`
  - `writer`
- `active`
  - default true

Password y auth son manejados por Payload.

## 14.1 Public author shape

El frontend público solo puede recibir:

```text
displayName
slug
avatar
bio
socialLinks
```

No:

```text
email
password
role interno
tokens
sessions
auth data
```

## 14.2 Deactivation

`active = false` debe impedir autenticación.

Los Posts históricos siguen existiendo.

Preferir desactivar Writers con contenido existente en lugar de eliminarlos.

---

# 15. Collection: Pages

Uso:

- Nosotros
- Contacto
- Aviso de Privacidad
- Términos
- Publicidad
- páginas institucionales similares

Campos:

- `title`
- `slug`
- `layout`
- `seo`

Config:

- drafts
- versions

Permisos:

- Public: published read
- Writer: read / sin edición
- Admin: CRUD

---

# 16. Page Blocks

V1:

- Hero
- RichText
- ImageText
- Gallery
- Video
- CTA
- FAQ
- Banner

## 16.1 Hero

- eyebrow
- title
- description
- image
- alignment:
  - `left`
  - `center`

## 16.2 ImageText

- image
- eyebrow
- title
- content
- imagePosition:
  - `left`
  - `right`

## 16.3 FAQ

- items:
  - question
  - answer

Usar primitivo accesible basado en shadcn Accordion.

---

# 17. Collection: Redirects

Campos:

- `from`
- `to`
- `statusCode`
- `active`

`from` debe estar indexado.

Para redirects generados automáticamente por cambios canónicos usar permanent redirect / 301.

## 17.1 Reglas

Si cambia:

- `Post.slug`
- `Post.primaryCategory`
- `Category.slug` (§30.10)
- `Page.slug` (Page publicada — mismo tratamiento simétrico que Post/Category)

comparar URL anterior vs nueva y crear redirect directo.

Si cambia slug + categoría simultáneamente:

```text
old final URL → new final URL
```

sin redirects intermedios.

Evitar cadenas:

```text
A → B → C
```

cuando pueda resolverse:

```text
A → C
B → C
```

No generar redirect arbitrario al eliminar un Post sin destino lógico.

---

# 18. Payload Globals

V1:

1. `Home`
2. `Navigation`
3. `Footer`
4. `SiteSettings`

---

# 19. Global: Home

Config:

- drafts
- versions
- `layout[]`
- SEO override opcional

Admin puede:

- agregar bloques;
- eliminar bloques;
- configurar bloques;
- reordenarlos;
- guardar Draft;
- Preview;
- Publish.

No puede editar CSS arbitrario.

## 19.1 Home Blocks V1

- EditorialIntro
- HeroNews
- CategoryExplorer
- LatestPosts
- PostsByCategory
- FeaturedPosts
- VideoFeature
- Banner

## 19.2 EditorialIntroBlock

Composición editorial introductoria inspirada en `docs/references/home-reference.jpeg`. No es un Hero de noticias (no depende de un Post) ni un Banner (identidad editorial/publicación, no contenido secundario/promocional).

Campos:

- headlinePrimary (texto, requerido) — primera parte del titular, tinta/negro.
- headlineAccent (texto, requerido) — segunda parte del titular, rojo de marca.
- description (textarea, requerido)
- backgroundImage (relación a Media, requerido) — composición visual de fondo completa (puede incluir mapa, collage editorial u otros elementos decorativos como una sola imagen preparada; esos elementos NO se modelan como campos CMS separados).
- foregroundImage (relación a Media, requerido) — imagen/gráfico prominente junto al texto, hacia el centro de la composición en desktop, renderizado sobre backgroundImage.
- cta (grupo, modelo de enlace reutilizable `linkFields` — mismo shape que Navigation/Footer: label/type[category|page|external]/category/page/url/openInNewTab)

No incluye: posición de fondo/foreground configurable, colores personalizados, CSS arbitrario, selector de variante visual, selector de textura, selector de fuente, campo de mapa separado, campos de galería separados, un modelo de enlace propio distinto al ya usado por Navigation/Footer. El Admin controla copy y assets; el componente posee la composición aprobada.

Capa conceptual: canvas del sitio → backgroundImage → foregroundImage → headline/description/CTA.

Como cualquier Home block, es agregable, eliminable y reordenable libremente — no está forzado a renderizar primero.

---

# 20. HeroNewsBlock

Campos generales:

- eyebrow
- headline
- description
- cta opcional (grupo, modelo de enlace reutilizable `linkFields` — mismo shape que Navigation/Footer, no un par de campos de texto plano)
- contentMode:
  - `manual`
  - `automatic`

Manual:

- mainPost
- secondaryPosts, máximo aproximado 3

Automatic:

- sourceCategory opcional
- limit

El resolver convierte cualquiera de los dos modos a:

```text
mainPost
secondaryPosts
```

antes de llegar a la UI.

---

# 21. CategoryExplorerBlock

- title
- categories, hasMany
- showViewAll
- viewAllLabel

Las Cards consumen:

- name
- description
- icon
- colorTheme

---

# 22. LatestPostsBlock

- title
- limit, default aproximado 6
- category opcional
- layout:
  - `grid`
  - `list`
  - `mixed`

---

# 23. PostsByCategoryBlock

- title
- category required
- limit
- layout:
  - `grid`
  - `horizontal`
  - `featured-grid`
- showViewAll

---

# 24. FeaturedPostsBlock

- title
- posts hasMany
- layout:
  - `grid`
  - `carousel`
  - `editorial`

---

# 25. VideoFeatureBlock

- title
- source:
  - `post`
  - `external`
- post
- videoURL
- thumbnail
- headline
- description

Campos condicionales según source.

---

# 26. BannerBlock

- title
- description
- image
- link opcional (grupo, modelo de enlace reutilizable `linkFields` — mismo shape que Navigation/Footer)
- variant:
  - `editorial`
  - `promotional`
  - `dark`

---

# 27. Global: Navigation

Campos:

- logo
- items[]
- socialLinks
- CTA

Navigation item:

- label
- type:
  - `category`
  - `page`
  - `external`
- category
- page
- url
- openInNewTab
- children[]

Soporta un item tipo “Más” mediante children.

La navegación no está hardcodeada por categoría.

---

# 28. Global: Footer

Campos:

- logo
- description
- columns[]
  - title
  - links[]
- socialLinks
- legalLinks
- copyright

Links utilizan el modelo reutilizable de enlace.

---

# 29. Global: SiteSettings

## Branding

- siteName
- tagline
- logo
- logoDark opcional
- favicon

## Contact

- publicEmail
- phone
- whatsapp

## Social

- facebook
- instagram
- x
- youtube
- tiktok

## SEO

- defaultMetaTitle
- defaultMetaDescription
- defaultMetaImage
- siteURL

## Organization structured data

- organizationName
- organizationLogo
- organizationDescription

## Locale / fechas

- timezone
- locale base `es-MX`

No guardar aquí secretos de infraestructura.

---

# 30. Editorial workflow

## 30.1 Estados

Payload:

```text
draft
published
```

No crear un status manual redundante.

## 30.2 Crear noticia

Writer:

```text
Create
→ author=currentUser
→ Save Draft
→ Preview
→ Publish
```

## 30.3 Draft

Debe poder guardar contenido incompleto.

Draft:

- no aparece públicamente;
- no aparece en Home automática;
- no aparece en Category;
- no aparece en Search;
- no aparece en Related Posts;
- no aparece en Sitemap.

## 30.4 Publish

Antes de publicar:

- validar campos editoriales obligatorios;
- calcular reading time;
- asignar `publishedAt` si es primera publicación;
- guardar versión;
- cambiar `_status`;
- disparar revalidation;
- hacer contenido accesible.

## 30.5 publishedAt

Representa la primera publicación.

No cambia en ediciones posteriores.

`updatedAt` representa última edición.

## 30.6 Edit published Post

Writer puede editar sus Posts publicados.

La URL se conserva salvo modificación explícita de slug/categoría.

## 30.7 Unpublish

Writer puede despublicar su propio Post.

Admin puede despublicar cualquier Post.

La URL pública deja de mostrar contenido y puede responder 404 mientras no exista redirect.

## 30.8 Delete

Solo Admin.

No crear redirect arbitrario.

## 30.9 Version restoration

Admin puede restaurar una versión anterior.

La restauración debe conservar el historial, generando una nueva versión equivalente al contenido restaurado.

## 30.10 Category slug changes

Cambiar un slug de categoría publicada puede modificar muchas URLs.

Solo Admin puede hacerlo.

Debe preservar URLs anteriores mediante redirects y revalidar el contenido afectado.

---

# 31. Preview

Payload Admin → Preview debe utilizar el frontend real de Next.js.

Flujo:

```text
Payload Admin
→ Preview URL segura
→ Next.js Draft Mode
→ canonical frontend route
```

Requisitos:

- Preview de Drafts para autores autorizados.
- No exponer Drafts con solo conocer URL.
- Draft Mode no utiliza cache pública publicada.
- Debe existir mecanismo para salir de Preview.
- Validar secreto/contexto/autorización.
- No crear enlaces públicos permanentes que otorguen acceso indefinido a Drafts.

Rutas conceptuales:

```text
/api/preview
/api/preview-exit
```

La implementación exacta seguirá APIs estables de la versión Next.js/Payload usada.

---

# 32. Frontend public architecture

## 32.1 Home `/`

```text
getHome()
→ resolveHomeBlocks()
→ HomeBlockRenderer
→ Sections
```

La página no debe contener toda la lógica visual y queries inline.

## 32.2 `/[slug]`

Resolver:

```text
Category?
  yes → Category Page
  no  → Page?
          yes → Generic Page
          no  → Redirect?
                  yes → redirect
                  no  → 404
```

Las colisiones se previenen en CMS.

## 32.3 `/[category]/[post]`

- obtener Post por slug;
- validar published/draft context;
- comprobar primary category;
- redirigir si categoría URL no corresponde;
- resolver redirect si la URL es antigua;
- render Article Page.

## 32.4 Search

```text
/buscar
/buscar?q=...
/buscar?q=...&page=2
```

---

# 33. Category Page

Debe incluir:

- breadcrumb;
- CategoryHeader;
- descripción opcional;
- identidad visual de categoría;
- Posts publicados;
- paginación.

Query:

```text
_status = published
AND
(
  primaryCategory = currentCategory
  OR additionalCategories contains currentCategory
)
ORDER BY publishedAt DESC
```

Paginación server-side.

Cantidad inicial recomendada:

```text
12 posts/page
```

Ajustable por diseño, no desde Payload salvo necesidad futura.

---

# 34. Article Page

Estructura:

```text
Header
Breadcrumbs
Category
H1
Excerpt / Lead
Article metadata
Share actions
Featured image
Article content
Tags
Share actions
Author card
Related posts
Footer
```

## 34.1 Metadata visual

Puede mostrar:

- autor;
- published date;
- updated date solo cuando tenga sentido;
- reading time.

## 34.2 Related Posts

V1:

```text
same primaryCategory
AND id != current
AND published
ORDER BY publishedAt DESC
LIMIT ~4
```

No necesita configuración manual.

## 34.3 Author Card

Datos públicos únicamente.

## 34.4 Tags

Visuales en V1.

No requieren rutas públicas.

---

# 35. Sharing

Componente reusable `ShareActions`.

Soporta:

- Facebook
- X
- WhatsApp
- Copy link
- Web Share API / Native Share

Siempre utilizar canonical URL.

Instagram no tendrá un botón falso de “share to Instagram” web. En móvil, Native Share puede permitir que el sistema operativo ofrezca Instagram si corresponde.

Copy link debe proporcionar feedback visible y accesible.

---

# 36. Search

V1 usa el Payload Search Plugin (`@payloadcms/plugin-search`) como backend de indexación, respaldado por la infraestructura PostgreSQL ya existente. No se introduce ningún servicio de búsqueda externo (Algolia, Elasticsearch, OpenSearch, Meilisearch, Typesense u otro) en V1 — es una decisión de escala inicial del proyecto, no una afirmación de que esas alternativas sean innecesarias para siempre; se reconsideran solo si una escala, relevancia, tolerancia a errores tipográficos, analítica o requisitos multilingües/operativos demostrados lo justifican.

El plugin mantiene una Collection `search` dedicada e indexada, sincronizada automáticamente a partir de los documentos fuente. El frontend público NO consulta Posts/Pages completos con `LIKE` amplio como arquitectura primaria de búsqueda; las solicitudes de `/buscar` consultan el índice `search` dedicado.

Solo contenido publicado se sincroniza al índice y es buscable (`syncDrafts: false`, `deleteDrafts: true`). Ningún Draft aparece nunca en `/buscar`.

Al índice `search` solo se sincroniza la información crítica para búsqueda, nunca el documento completo de Payload. Para contenido Lexical, evaluar derivar texto plano acotado vía `beforeSync` del plugin en vez de indexar el documento Lexical serializado completo.

Buscar como mínimo:

- title;
- excerpt;
- tags;
- category.

Body content puede añadirse si se implementa eficientemente como texto plano derivado (no el documento Lexical completo), pero **no es requisito V1**.

Solo Posts publicados en V1. La Fase 9 debe verificar si Pages/Categories también deben participar en el índice, y qué campos adicionales participan en relevancia.

No ejecutar búsqueda vacía sobre toda la base.

Relevancia V1: determinística y simple, usando la prioridad de collection/documento que ya expone el plugin — sin algoritmo de ranking complejo ni búsqueda semántica/vectorial/IA.

Ciclo de vida del índice:

- indexación inicial del contenido ya existente;
- indexación automática de contenido publicado/actualizado;
- remoción del índice cuando el contenido deja de ser público (unpublish/delete);
- reindexación manual/bajo demanda para mantenimiento.

Instalar el plugin no garantiza por sí solo la indexación retroactiva de registros preexistentes — la Fase 9 debe documentar cómo se reindexa el contenido ya existente tras el despliegue.

Search UI:

```text
Buscar
[ input ]
Resultados para "..."
N resultados
ArticleCard horizontal × N
Pagination
```

Sin resultados:

- EmptyState;
- sugerencia de revisar búsqueda;
- link a últimas noticias si aporta valor.

La capa de búsqueda pública debe estar detrás de un contrato de frontend estable, independiente del backend de indexación:

```text
/buscar?q=...
→ Search Page
→ searchContent()
→ Payload Search collection (@payloadcms/plugin-search)
→ PostgreSQL
```

`searchContent()` normaliza los resultados del plugin a un contrato `SearchResult` seguro para el frontend: nunca expone campos internos de Payload, IDs internos innecesarios, URLs de Admin/Preview ni datos privados de User, y siempre usa URLs públicas canónicas (`getPostUrl()`/`getPageUrl()`). Esto preserva la posibilidad de sustituir el backend de indexación en el futuro sin tocar la UI pública.

El `access` de la Collection `search` se define explícitamente en Fase 9 — no se expone como API de datos de frontend sin restricciones solo por ser generada por un plugin.

La sincronización del índice (hooks propios del plugin) es la fuente de verdad de frescura de Search, distinta de la invalidación de cache de contenido fuente (§40); no se diseña una estrategia de cache global competidora para Search.

El plugin agrega schema respaldado por base de datos (su Collection `search`); cualquier migración sigue el flujo ya establecido en §67 y `README.md` — nunca se corren migraciones versionadas contra la base de datos de desarrollo (administrada por push).

---

# 37. Data Access Layer

No dispersar queries Payload dentro de componentes.

Ubicación conceptual:

```text
src/lib/data/
```

Funciones:

- `getPostBySlug()`
- `getPostById()`
- `getLatestPosts()`
- `getPostsByCategory()`
- `getRelatedPosts()`
- `getCategoryBySlug()`
- `getPageBySlug()`
- `getHome()`
- `getNavigation()`
- `getFooter()`
- `getSettings()`
- `searchPosts()`
- redirect lookup

Usar Payload Local API para server-side dentro de la aplicación.

No crear un proxy HTTP interno innecesario.

---

# 38. View Models

Los componentes visuales no deben depender profundamente de los tipos/relaciones internas de Payload.

Pipeline:

```text
Payload Model
→ Mapper / Normalizer
→ View Model
→ UI Component
```

Ejemplos:

```ts
type ArticleCardData = {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: MediaData
  primaryCategory: CategorySummary
  author?: AuthorSummary
  publishedAt: string
}

type CategorySummary = {
  id: string
  name: string
  slug: string
  colorTheme: CategoryThemeKey
  icon?: CategoryIconKey
}

type AuthorSummary = {
  id: string
  displayName: string
  slug?: string
  avatar?: MediaData
}

type MediaData = {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
  sizes?: Record<string, string | undefined>
  caption?: string
  credits?: string
}

type ResolvedLink = {
  href: string
  label: string
  external?: boolean
}
```

La forma concreta puede ajustarse sin romper estas responsabilidades.

---

# 39. URL helpers y link resolver

Centralizar:

- `getPostUrl()`
- `getCategoryUrl()`
- `getPageUrl()`
- `normalizePath()`
- `resolveLink()`

Nunca construir URLs editoriales manualmente en múltiples components.

---

# 40. Cache y revalidation

La estrategia exacta debe usar las APIs estables de la versión Next.js instalada, pero la semántica debe ser por dependencias.

Tags conceptuales:

```text
post:{id}
category:{id}
posts
home
navigation
footer
settings
page:{id}
```

## 40.1 Publish/update Post

Invalidar según corresponda:

- post;
- primary category;
- additional categories;
- posts;
- home cuando existan secciones automáticas afectadas.

## 40.2 Category update

Invalidar:

- category;
- Home cuando consume identidad/categoría;
- navegación si corresponde;
- Posts afectados cuando cambia slug.

## 40.3 Home

Solo Home.

## 40.4 Navigation / Footer / Settings

Usar tags/dependencias globales específicas, no full rebuild arbitrario.

## 40.5 Draft Mode

Nunca devolver accidentalmente cache publicada cuando el usuario autorizado está previsualizando Draft.

---

# 41. SEO

SEO forma parte de V1.

Centralizar lógica en `src/lib/seo/`.

## 41.1 Article

- title;
- description;
- canonical;
- OpenGraph;
- social preview;
- NewsArticle JSON-LD;
- BreadcrumbList.

## 41.2 Category

- metadata desde Category SEO;
- fallback:
  - title: `{Category.name} | 60 Segundos`
  - description: Category.description

## 41.3 Page

- metadata desde Page SEO;
- fallback a title y contenido apropiado.

## 41.4 Home

- SiteSettings defaults;
- Home SEO override opcional.

## 41.5 Structured data

- Organization
- WebSite
- NewsArticle
- BreadcrumbList

Publisher/Organization viene de SiteSettings, no hardcodeado en múltiples archivos.

## 41.6 LLM / Agent Discoverability (`/llms.txt`)

`GET /llms.txt` expone un documento Markdown curado y acotado, complementario a metadata/JSON-LD/sitemap/robots — nunca un sustituto de ninguno de ellos, y nunca garantiza posicionamiento, citación ni inclusión en entrenamiento de modelos.

Contenido:

- identidad del sitio (H1) y resumen breve (blockquote), desde SiteSettings;
- Categorías públicas;
- Posts publicados recientes, acotados (no un volcado histórico completo);
- Pages publicadas relevantes.

Solo contenido publicado. URLs absolutas; los Posts usan `primaryCategory`. Estructura según la especificación llms.txt v2 vigente (H1/blockquote/secciones H2 de enlaces).

---

# 42. Sitemap y robots

## sitemap

Incluir:

- Home;
- Categories;
- published Pages;
- published Posts.

Excluir:

- Drafts;
- Admin;
- Preview;
- Search result URLs.

## robots

Production: indexación pública.

Staging/preview: configuración `noindex`/bloqueo mediante entorno.

No permitir indexación accidental del entorno de pruebas.

---

# 43. Design System

## 43.1 Concepto

**Editorial + inmediato + multimedia**

Combina:

```text
Periódico tradicional
+
Medio digital moderno
```

La Home de referencia proporcionada por el cliente es el **North Star visual**.

La nueva marca visible será **60 Segundos Noticias**. La referencia puede contener elementos/mastheads previos que no deben copiarse literalmente si pertenecen a otra marca.

Se recomienda conservar la imagen de referencia dentro del repositorio como:

```text
docs/references/home-reference.jpeg
```

para que los agentes de código puedan consultarla.

## 43.2 Personalidad

- directo;
- actual;
- enérgico;
- editorial;
- popular;
- accesible;
- dinámico;
- multimedia;
- confiable.

No debe sentirse como:

- SaaS;
- landing corporativa;
- blog genérico;
- template shadcn sin personalización.

---

# 44. Design Tokens

## Brand

```css
--brand-red: #D71920;

--brand-red-50:  #FFF1F1;
--brand-red-100: #FFE0E1;
--brand-red-500: #D71920;
--brand-red-600: #C3141A;
--brand-red-700: #A90F15;
--brand-red-900: #65070B;
```

## Ink

```css
--ink-950: #111111;
--ink-900: #181818;
--ink-800: #262626;
--ink-700: #3A3A3A;
```

## Paper

```css
--paper-50:  #FCFAF6;
--paper-100: #F7F3EC;
--paper-200: #EEE8DE;
--paper-300: #DED6C9;
```

Base:

```css
--paper: #F7F3EC;
```

## Border

```css
--border-soft: #DDD6CC;
--border-default: #CBC3B7;
--border-strong: #9F978D;
```

## Semantic

```css
--success: #148344;
--warning: #D87A00;
--error:   #C62828;
--info:    #1769AA;
```

---

# 45. Category themes

Identidad inicial:

| Theme | Uso inicial | Accent |
|---|---|---|
| `red` | Noticias | `#D71920` |
| `blue` | Vlog | `#129BE8` |
| `orange` | Experiencias | `#FF7A00` |
| `green` | Recomendaciones | `#74BD00` |
| `pink` | Entretenimiento | `#E6008D` |
| `purple` | Otras categorías | `#8500E8` |

También disponibles:

```text
cyan
yellow
teal
indigo
```

Cada theme debe definir conceptualmente:

- accent;
- accentForeground;
- softBackground;
- softForeground;
- border.

No asumir texto blanco sobre todos los accents; yellow/green pueden necesitar foreground oscuro.

---

# 46. Typography

## Display / Editorial

**Oswald**

Usar para:

- nav;
- headings;
- section titles;
- category labels;
- buttons;
- display text.

## Body / UI

**Inter**

Usar para:

- article body;
- excerpt;
- metadata;
- captions;
- descriptions;
- forms.

## Escalas

### Article H1

- Desktop: ~56–64px
- Tablet: ~46–52px
- Mobile: ~36–42px
- line-height: ~1.05–1.12

### H2

- Desktop: ~38–42px
- Mobile: ~28–32px

### H3

- Desktop: ~28–32px
- Mobile: ~24–26px

### Section Heading

- Desktop: ~28–32px
- Mobile: ~22–26px

### Article body

- Desktop: ~18px
- Mobile: ~17px
- line-height: ~1.65–1.75

### Lead / excerpt

- ~20–23px
- line-height ~1.45

### Metadata

- ~14–15px

No usar uppercase en párrafos largos ni en headlines completos de artículos.

---

# 47. Layout, grid y spacing

## Site container

- max general aproximado: 1360–1440px
- centrado

Gutters:

- Mobile: 16–20px
- Tablet: 24–32px
- Desktop: 40–48px

## Article body

- ~680–760px de ancho legible.

## Wide article media

- ~1000–1120px.

`full` usa el canvas editorial disponible, no necesariamente 100vw hasta el borde físico.

## Spacing scale

```text
4
8
12
16
20
24
32
40
48
64
80
96
120
```

Grand sections:

- Desktop: ~64–96px
- Mobile: ~40–64px

---

# 48. Cards, radius y shadows

Cards:

- paper/white surface;
- border sutil;
- radius 12–16px;
- sombras restringidas.

Radius scale:

```text
4
8
12
16
999
```

No aplicar grandes sombras SaaS a cada card.

Sombras se reservan para:

- menus;
- overlays;
- dropdowns;
- floating UI;
- elementos donde sean necesarias.

---

# 49. Textures

Puede existir:

- `paper-clean`
- `paper-news`
- `paper-map`

La textura de periódico debe ser sutil:

- opacity aproximada 3–7% según contexto;
- nunca competir con texto;
- reducirse todavía más en lectura larga.

No permitir selection de textura libre desde CMS salvo variantes previamente diseñadas.

---

# 50. Photography

- fotografías editoriales reales;
- `object-fit: cover` para thumbnails;
- recortes consistentes;
- no deformar imágenes;
- no aplicar filtros destructivos;
- priorizar fotografía en Cards y Hero.

Aspect ratios base:

- ArticleCard: 16:9
- Hero: 16:9 o 4:3 según composición
- Horizontal card: 4:3
- Article hero: 16:9
- Avatar: 1:1

---

# 51. Iconografía

UI:

- Lucide.

Category icons:

- keys controladas;
- mismo lenguaje visual;
- no SVG arbitrario.

---

# 52. Motion

Tokens conceptuales:

```text
fast   120ms
normal 200ms
slow   320ms
```

Interacciones:

- image scale 1 → ~1.02/1.03;
- translateY ~-2/-3px;
- arrow translateX ~3px.

Respetar:

```css
prefers-reduced-motion: reduce
```

No bloquear scroll ni lectura con animaciones.

---

# 53. Responsive

Mobile first.

Breakpoints aproximados alineados con Tailwind:

```text
sm 640
md 768
lg 1024
xl 1280
2xl 1536
```

La composición manda; responsive puede reorganizar layouts, no solo reducir tamaño.

Ejemplos:

- Hero desktop → stack/editorial layout mobile.
- Category cards: desktop varias columnas, tablet 3, mobile 1–2.
- Article grid: desktop 3, tablet 2, mobile 1.
- Header desktop → logo + search + menu en mobile.

No depender de hover para funciones críticas.

---

# 54. Header

Desktop:

- logo 60 Segundos;
- Navigation;
- Search;
- Social;
- CTA opcional.

Altura aproximada:

- Desktop: 80–96px
- Mobile: 64–72px

Recomendación:

- sticky;
- al scroll puede compactarse sutilmente;
- paper background;
- border inferior.

Navigation:

- Oswald ~16–18px;
- active state con rojo + underline/accent.

Mobile Navigation:

- shadcn Sheet;
- teclado;
- Escape;
- focus management;
- scroll lock.

---

# 55. Footer

Background:

```text
ink-950
```

Texto:

- white;
- muted gray.

Accent:

- brand red.

Estructura:

- brand;
- columnas;
- social;
- legal;
- copyright.

---

# 56. UI Components Architecture

## 56.1 Primitive layer

`src/components/ui/`

Basada en shadcn.

Agregar incrementalmente, no `shadcn add --all`.

Primitivos esperados según necesidad:

- Button
- Input
- Textarea
- Label
- Separator
- Sheet
- Dialog
- DropdownMenu
- NavigationMenu
- Accordion
- Carousel
- Avatar
- Skeleton
- Tooltip
- Popover
- Sonner/toast

Primitivos propios:

- Container
- ResponsiveMedia
- IconButton
- Empty/Error state cuando corresponda

## 56.2 Regla

> shadcn es la implementación base de primitives; el Design System de 60 Segundos es la autoridad visual.

No conservar apariencia genérica de ejemplos shadcn.

No agregar Material UI, Chakra, Ant Design, Mantine u otro framework equivalente.

---

# 57. Editorial Components

V1:

- SectionHeader
- CategoryBadge
- CategoryCard
- ArticleCard
- ArticleMetadata
- ArticleHeader
- ArticleHero
- Breadcrumbs
- ShareActions
- AuthorCard
- TagsList
- RelatedPosts
- Pagination

## ArticleCard

Variantes:

```text
standard
horizontal
compact
featured
overlay
```

No crear un componente diferente si una variante satisface el caso.

ArticleCard recibe datos; no consulta Payload.

## CategoryCard

Recibe:

- name
- slug
- description
- icon
- colorTheme

## SectionHeader

Puede recibir:

- title
- action
- theme
- eyebrow

## ArticleMetadata

Centraliza:

- author;
- publishedAt;
- updatedAt;
- reading time.

---

# 58. Content Components

- RichText
- ArticleImageBlock
- ArticleGalleryBlock
- GalleryCarousel
- ArticleVideoBlock
- ArticleQuoteBlock
- ArticleCalloutBlock
- ArticleEmbedBlock

External embeds/videos deben degradar de forma segura si fallan.

---

# 59. Home Sections

- EditorialIntroSection
- HeroNewsSection
- CategoryExplorerSection
- LatestPostsSection
- PostsByCategorySection
- FeaturedPostsSection
- VideoFeatureSection
- BannerSection

Payload Block y React Section son conceptos diferentes.

Ejemplo:

```text
src/payload/blocks/home/PostsByCategory.ts
```

define schema CMS.

```text
src/components/sections/home/PostsByCategorySection.tsx
```

define UI.

---

# 60. Page Sections

- PageHeroSection
- RichTextSection
- ImageTextSection
- GallerySection
- VideoSection
- CTASection
- FAQSection
- BannerSection compartido cuando sea el mismo diseño

---

# 61. Block rendering

Pipeline:

```text
Payload Block
→ Resolver
→ queries/normalization
→ View Model
→ Renderer
→ Section
```

Un Section no debería saber si la selección era `manual` o `automatic`.

Renderers:

- HomeBlockRenderer
- PageBlockRenderer
- ArticleBlockRenderer

Unknown block:

- log warning;
- skip safely en production;
- no romper toda la página.

---

# 62. Accessibility

Requisitos:

- semantic HTML;
- keyboard navigation;
- focus visible;
- alt text;
- labels;
- heading hierarchy;
- contrast;
- touch targets apropiados;
- reduced motion;
- mobile nav accesible;
- carousel accesible;
- accordion accesible.

Heading ownership:

- Article Page → ArticleHeader owns H1.
- Category Page → CategoryHeader owns H1.
- Generic Page → Page Hero/Header owns H1.
- Home → un solo H1 principal.
- SectionHeader normalmente H2.
- Cards usan heading level apropiado por contexto.

---

# 63. Performance

- Server Components por defecto.
- Responsive images.
- `next/image` mediante `ResponsiveMedia`.
- priority solo para imágenes LCP reales.
- lazy-load debajo del fold cuando corresponda.
- lazy-load external embeds.
- no scripts externos globales si solo los utiliza una página.
- paginación server-side.
- evitar N+1 queries.
- controlar Payload `depth`.
- solicitar/proyectar solo datos necesarios cuando aporte valor.
- usar `next/font` o estrategia equivalente estable.
- no cargar pesos tipográficos innecesarios.

---

# 64. Docker Architecture

Docker Compose es el entorno reproducible oficial.

## 64.1 Services

```text
app
db
```

### app

- Node
- pnpm
- Next.js
- Payload
- frontend
- Payload Admin

### db

- PostgreSQL

Dentro de Docker:

```text
DATABASE host = db
port = 5432
```

No `localhost` desde `app`.

## 64.2 Volumes

Como mínimo:

- `postgres_data`
- estrategia segura para container `node_modules`
- `media_data` en development si media local

`docker compose down` conserva DB.

`docker compose down -v` elimina explícitamente volumes.

## 64.3 Healthchecks

PostgreSQL:

```text
pg_isready
```

o equivalente.

App:

```text
/api/health
```

El health endpoint debe ser seguro y no revelar secrets.

## 64.4 Development

Debe soportar:

- source mount;
- Fast Refresh;
- hot reload.

Evitar reemplazar dependencias Linux del container con `node_modules` del host macOS.

## 64.5 Dockerfile

Multi-stage:

```text
base
deps
development
builder
runner
```

Production runner:

- mínimo;
- reproducible;
- non-root cuando sea viable;
- stateless;
- sin secrets;
- sin `.git`;
- sin caches/dev tooling innecesario.

## 64.6 `.dockerignore`

Excluir:

- node_modules
- .next
- .git
- .env
- coverage
- logs
- local uploads/media
- IDE metadata

---

# 65. Environment variables

El repo incluye:

```text
.env.example
```

No versionar `.env` real.

Variables conceptuales:

```text
DATABASE_URI

POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD

PAYLOAD_SECRET

NEXT_PUBLIC_SITE_URL

PREVIEW_SECRET
REVALIDATION_SECRET

S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_PUBLIC_URL
```

Solo valores realmente públicos llevan `NEXT_PUBLIC_`.

Nunca:

```text
NEXT_PUBLIC_PAYLOAD_SECRET
NEXT_PUBLIC_DATABASE_URI
NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
```

Validar variables críticas al arrancar/build.

Puede usarse Zod o equivalente.

---

# 66. Health endpoint

Ruta:

```text
/api/health
```

Debe indicar que la app está operativa y, si se decide, hacer una comprobación ligera de DB.

No exponer:

- DB URI;
- password;
- Payload secret;
- stack;
- información interna sensible.

---

# 67. Database y migrations

PostgreSQL real en desarrollo/producción.

Migrations:

- versionadas en Git;
- revisables;
- explícitas;
- reproducibles.

Workflow:

```text
schema change
→ generate migration
→ review
→ commit
→ run migration during deployment
```

No ejecutar mutaciones destructivas ciegas en cada startup.

Backups antes de migraciones sensibles en producción.

---

# 68. Seeds

Scripts:

```text
seed:initial
seed:dev
```

## seed:initial

Puede crear:

- Noticias
- Vlog
- Experiencias
- Recomendaciones
- Entretenimiento
- Navigation base
- Home base
- SiteSettings base

Las categorías iniciales utilizan themes/icons oficiales.

La navegación “Más” puede contener categorías adicionales; no es obligatorio crear una Category fija llamada “Y más”.

## seed:dev

- sample posts
- writers de prueba
- media de prueba
- páginas de prueba

No ejecutar automáticamente en production.

Seeds deben ser idempotentes cuando sea razonable.

No hardcodear credenciales reales.

---

# 69. Production architecture

Arquitectura recomendada:

```text
Internet
  ↓
CDN / Reverse Proxy
  ↓
App Container (Next.js + Payload)
  ├── Managed PostgreSQL
  └── R2 / S3 Object Storage
```

El App Container es disposable/stateless.

Recrearlo no elimina:

- DB;
- users;
- Posts;
- Media.

## 69.1 Production DB

Managed PostgreSQL recomendado por:

- backups;
- recovery;
- upgrades;
- monitoring;
- disk management;
- availability.

Self-hosted PostgreSQL con Docker sigue siendo compatible si el operador asume esas responsabilidades.

## 69.2 Hosting

No acoplar la app a Vercel u otro proveedor concreto.

Debe permanecer portable/container-ready.

Posibles destinos futuros:

- Railway
- Render
- Fly.io
- AWS
- Azure
- GCP
- VPS
- otra plataforma container-compatible

No son decisiones del código V1 salvo deployment final.

---

# 70. Security

- Payload Admin requiere autenticación.
- Access Control server-side.
- Field-level access.
- CORS restrictivo.
- CSRF/same-origin seguro.
- cookies seguras en producción.
- no secrets en browser.
- upload validation.
- raw script/HTML prohibido.
- external URLs validadas.
- `noopener noreferrer` cuando corresponde.
- Security Headers razonables:
  - Content-Security-Policy
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy
- CSP allowlist solo para providers realmente utilizados.
- No `script-src *`.
- logs no contienen secrets.
- rate limiting puede vivir en CDN/proxy cuando sea necesario.
- PostgreSQL no debe exponerse públicamente en producción.

---

# 71. Logging y errors

Runtime logs:

```text
stdout
stderr
```

Registrar:

- startup failures;
- DB failures;
- migration failures;
- revalidation failures;
- redirect hook failures;
- storage failures;
- Payload errors relevantes.

Nunca registrar:

- passwords;
- tokens;
- secrets;
- connection strings completas.

Public errors:

- no stack traces;
- ErrorState de 60 Segundos;
- 404 propio;
- embeds externos con fallback;
- una revalidation fallida no debe corromper el Post ya publicado.

---

# 72. 404

Debe existir experiencia propia de 60 Segundos.

Usar para:

- Post inexistente;
- Category inexistente;
- Page inexistente;
- Draft accedido públicamente;
- URL eliminada sin redirect.

El diseño puede utilizar el recurso gráfico “60” como identidad.

No dejar el 404 genérico de Next.js como experiencia final.

---

# 73. Analytics

No hay dashboard analítico propio en V1.

La arquitectura debe permitir añadir posteriormente:

- Google Analytics;
- Plausible;
- PostHog;
- herramienta equivalente.

Eventos custom podrían centralizarse detrás de `trackEvent()`.

No implementar `Post.views += 1` en PostgreSQL por cada visita.

---

# 74. Observability

Error/performance monitoring como Sentry puede incorporarse posteriormente.

No es dependencia obligatoria para V1.

---

# 75. Project Structure

Árbol conceptual:

```text
60-segundos/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   ├── 60-segundos-spec.md
│   └── references/
│       └── home-reference.jpeg
│
├── public/
│   ├── branding/
│   ├── textures/
│   ├── icons/
│   └── placeholders/
│
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── buscar/
│   │   │   │   └── page.tsx
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── [category]/
│   │   │       └── [post]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (payload)/
│   │   │   └── [rutas requeridas por template oficial Payload]
│   │   │
│   │   ├── api/
│   │   │   ├── health/
│   │   │   ├── preview/
│   │   │   └── preview-exit/
│   │   │
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── not-found.tsx
│   │   └── global-error.tsx
│   │
│   ├── payload/
│   │   ├── collections/
│   │   ├── globals/
│   │   ├── blocks/
│   │   │   ├── home/
│   │   │   ├── article/
│   │   │   └── page/
│   │   ├── fields/
│   │   ├── access/
│   │   ├── hooks/
│   │   ├── utilities/
│   │   └── migrations/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── editorial/
│   │   ├── content/
│   │   ├── sections/
│   │   │   ├── home/
│   │   │   └── pages/
│   │   └── states/
│   │
│   ├── features/
│   │   ├── posts/
│   │   ├── categories/
│   │   ├── search/
│   │   ├── sharing/
│   │   ├── preview/
│   │   └── content-rendering/
│   │
│   ├── lib/
│   │   ├── payload/
│   │   ├── data/
│   │   ├── urls/
│   │   ├── links/
│   │   ├── seo/
│   │   ├── cache/
│   │   ├── env/
│   │   ├── dates/
│   │   ├── constants/
│   │   ├── themes/
│   │   ├── logger/
│   │   ├── validation/
│   │   └── utils/
│   │
│   ├── types/
│   ├── scripts/
│   │   ├── seed-initial.ts
│   │   └── seed-dev.ts
│   └── payload-types.ts
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── Dockerfile
├── compose.yaml
├── .dockerignore
├── .env.example
├── .gitignore
├── components.json
├── next.config.ts
├── payload.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

Este árbol es una guía de responsabilidades. No generar carpetas vacías sin código.

---

# 76. Project Structure Rules

- `src/app` → routing.
- `src/payload` → CMS schemas y lógica específica de Payload.
- `src/components/ui` → shadcn/primitives.
- `src/components/editorial` → UI editorial propia.
- `src/components/sections` → Sections completas.
- `src/lib/data` → Data Access Layer server-only.
- `src/features` → lógica de dominio cuando exista responsabilidad real.
- Payload blocks separados de React Sections.
- Presentational components no consultan Payload.
- Generated Payload types no se editan manualmente.
- URL helpers centralizados.
- secrets fuera del repo.
- Docker config en raíz.
- Media de Payload no se guarda en `public/`.
- No global state library sin necesidad.
- No React Query para CMS server-rendered por defecto.
- No Axios/genérico API client para llamar Payload desde el mismo server.
- `@/* → src/*` como alias recomendado.
- component files PascalCase.
- non-component files kebab-case.
- no `index.ts` obligatorios en cada carpeta.
- server-only boundaries explícitos.
- Client Components lo más abajo posible.

---

# 77. Shared constants

Elementos utilizados por Payload y frontend deben vivir en módulos neutrales, sin React ni UI.

Ejemplos:

```text
src/lib/constants/category-theme-keys.ts
src/lib/constants/category-icon-keys.ts
src/lib/constants/reserved-slugs.ts
```

Frontend visual:

```text
src/lib/themes/category-themes.ts
src/lib/themes/category-icons.ts
```

Payload puede importar las keys, pero nunca Tailwind, CVA o Lucide React.

---

# 78. No global client state en V1

No usar:

- Redux
- Zustand
- MobX

No existe actualmente un caso que lo justifique.

Estado local para:

- menu;
- carousel;
- share;
- accordion.

Evitar Context global genérico.

---

# 79. No React Query en V1 public pages

Las páginas públicas utilizan:

```text
Server Components
Payload Local API
Next cache
```

No volver a descargar Articles desde browser.

---

# 80. CI

Pipeline mínima:

```text
pnpm install
→ typecheck
→ lint
→ tests
→ production build
→ Docker image build
```

Integration tests pueden usar PostgreSQL como service container.

No considerar validada una PR si TypeScript/build falla.

---

# 81. Testing

## Unit

Priorizar:

- slug validation;
- URL generation;
- link resolver;
- reading time;
- view model mappers;
- category themes;
- search param parsing;
- redirect logic;
- permission helpers.

## Integration

- Writer ownership;
- published-only access;
- category deletion protection;
- user deactivation;
- redirects;
- revalidation;
- drafts.

## E2E

Flujos críticos:

- Admin login;
- Writer login;
- create Draft;
- Preview;
- Publish;
- visitor reads Article;
- change slug;
- old URL redirects;
- search.

Playwright es opción recomendada, no obligación si existe una alternativa equivalente ya adoptada.

---

# 82. Implementation Plan

La implementación será incremental.

## Phase -1 — AI Development Environment & Repository Bootstrap

Esta pre-fase prepara el repositorio para un flujo de desarrollo asistido por IA reproducible. **No forma parte del runtime ni del alcance funcional del producto**. OpenSpec comienza a gobernar la implementación de producto a partir de Phase 0.

Objetivos:

- documentar el workflow de IA/SDD del repositorio;
- preparar OpenSpec como framework de Spec-Driven Development;
- preparar Graphify como knowledge graph del estado actual del repo;
- registrar los skills de proyecto que utilicen Claude Code y/o Codex;
- proporcionar instrucciones vendor-neutral mediante `AGENTS.md`;
- proporcionar instrucciones mínimas específicas de Claude mediante `CLAUDE.md`;
- permitir que otra persona clone el repositorio y reconstruya el entorno de IA sin depender de configuración privada del autor;
- mantener toda herramienta de IA separada de las dependencias runtime de 60 Segundos.

Entregables versionados:

- `AGENTS.md`;
- `CLAUDE.md`;
- `docs/AI-WORKFLOW.md`;
- `docs/AI-SKILLS.md`;
- `openspec/config.yaml`;
- `.graphifyignore`;
- `scripts/ai/check-environment.sh`;
- configuración project-scoped generada por OpenSpec/Graphify cuando corresponda;
- `graphify-out/` después de construir el primer grafo, ya que el grafo se comparte con el equipo;
- actualización de `README.md` y `.gitignore`.

Secuencia recomendada:

1. verificar Git, Node, pnpm, Docker y herramientas de IA;
2. instalar OpenSpec CLI;
3. ejecutar `openspec init` y habilitar Claude Code/Codex según corresponda;
4. activar el profile de OpenSpec que incluya `verify` si el equipo decide usar el workflow expandido;
5. instalar los skills adicionales seleccionados y registrarlos en `docs/AI-SKILLS.md`;
6. instalar Graphify CLI y sus integraciones project-scoped para los agentes utilizados;
7. revisar/ajustar `openspec/config.yaml`, `.graphifyignore`, `AGENTS.md` y `CLAUDE.md`;
8. construir el primer grafo de Graphify;
9. verificar que el entorno sea reproducible y no contenga secrets;
10. crear un commit baseline de tooling antes de Phase 0.

No implementar Next.js, Payload, modelos editoriales ni features del producto durante esta pre-fase.

## Phase 0 — Bootstrap

- leer este spec;
- elegir versiones compatibles;
- bootstrap Next.js + Payload;
- pnpm;
- Tailwind;
- shadcn;
- TypeScript;
- aplicación base funcionando.

No desarrollar features mayores.

## Phase 1 — Technical Foundation

- env validation;
- PostgreSQL adapter;
- Payload initialization;
- aliases;
- basic tokens;
- `/api/health`;
- foundation folders solo cuando tengan contenido.

## Phase 2 — Payload CMS Core

Orden recomendado:

1. Users
2. Media
3. Categories
4. Tags
5. Posts
6. Pages
7. Redirects

Configurar drafts/versions y schemas de blocks.

## Phase 3 — Editorial Workflow

- slug behavior;
- ownership;
- permissions;
- Draft/Publish;
- publishedAt;
- reading time;
- versions;
- deletion protections;
- seeds.

## Phase 4 — Design System + shadcn

- CSS variables;
- fonts;
- shadcn primitives necesarios;
- Container;
- ResponsiveMedia;
- CategoryBadge;
- SectionHeader;
- ArticleMetadata;
- CategoryCard;
- ArticleCard;
- Breadcrumbs;
- Pagination.

## Phase 5 — Public Frontend Core

- DAL;
- View Models;
- URLs;
- Links;
- Dates;
- Header;
- Navigation;
- Mobile Navigation;
- Footer;
- SiteSettings integration.

## Phase 6 — Dynamic Home Builder

- Home Global;
- resolvers;
- HomeBlockRenderer;
- todos los Home Blocks;
- manual/automatic;
- responsive Home.

## Phase 7 — Category + Article + Pages

- root slug resolver;
- Category Page;
- Article Page;
- RichText/Article blocks;
- Generic Pages;
- Related Posts;
- Author Card;
- Sharing.

## Phase 8 — Preview + SEO + Cache + Redirects

- Draft Mode;
- preview security;
- metadata;
- JSON-LD;
- sitemap;
- robots;
- LLM / Agent Discoverability vía `/llms.txt`;
- cache tags;
- targeted revalidation;
- redirect hooks/chains.

## Phase 9 — Search

- Payload Search Plugin (`@payloadcms/plugin-search`) como backend de indexación V1;
- configuración del índice de búsqueda (Collection `search`, solo contenido publicado);
- DAL/view model público de búsqueda (`searchContent()`);
- `/buscar?q=...`;
- ciclo de vida de indexación/reindexación;
- search UX (input, resultados, paginación, empty states).

## Phase 10 — Docker + Production Hardening

Docker debe existir desde el desarrollo temprano, pero en esta fase se valida el stack completo:

- multi-stage Dockerfile;
- compose app+db;
- healthchecks;
- Fast Refresh;
- persistent volumes;
- production image;
- Object Storage config;
- security headers;
- upload constraints;
- logging;
- migration workflow.

## Phase 11 — Testing + QA + Performance

- unit;
- integration;
- E2E;
- permissions QA;
- responsive QA;
- accessibility;
- SEO;
- performance;
- Docker onboarding.

## Phase 12 — Release Readiness

- proveedor app;
- production DB;
- object storage;
- backups;
- domain;
- allowed origins;
- production env;
- staging noindex;
- real content;
- smoke test.

---

# 83. Definition of Done por fase

Una fase no se considera terminada hasta cumplir, según corresponda:

- implementación completa;
- TypeScript pasa;
- lint pasa;
- tests relevantes pasan;
- build pasa;
- sin errores runtime evidentes;
- Acceptance Criteria revisados;
- sin scope creep;
- docs/README actualizados cuando aplique;
- desviaciones del spec documentadas.

---

# 84. Acceptance Criteria

Los siguientes criterios son normativos. Un agente debe reportar `PASS`, `FAIL`, `NOT TESTED` o `NOT APPLICABLE` para los criterios asociados a la fase implementada.

## 84.0 AI / Repository Setup

| ID | Criterio |
|---|---|
| AI-SETUP-001 | Existe `docs/AI-WORKFLOW.md` y describe el flujo Master Spec → Graphify → OpenSpec Change → implementación → Graphify update → verify → archive. |
| AI-SETUP-002 | Existe `openspec/config.yaml` y referencia este Master Spec como estado objetivo canónico. |
| AI-SETUP-003 | OpenSpec puede generar/actualizar las integraciones project-scoped de al menos uno de los agentes adoptados por el equipo. |
| AI-SETUP-004 | `docs/AI-SKILLS.md` registra cada skill adicional adoptado con propósito, fuente, scope, versión/commit cuando sea posible e instalación. |
| AI-SETUP-005 | Existe `.graphifyignore` y evita indexar dependencias, builds, secrets, el propio output de Graphify y assets binarios que no aportan arquitectura. |
| AI-SETUP-006 | Graphify puede construir y consultar el knowledge graph del repositorio. |
| AI-SETUP-007 | Existe `AGENTS.md` con instrucciones vendor-neutral para Master Spec, OpenSpec, Graphify y scope incremental. |
| AI-SETUP-008 | Existe `CLAUDE.md` mínimo que remite a `AGENTS.md` y no duplica el Master Spec. |
| AI-SETUP-009 | Un desarrollador que no use IA puede ejecutar el proyecto sin OpenSpec, Graphify, Claude Code o Codex una vez completado el bootstrap de aplicación. |
| AI-SETUP-010 | OpenSpec, Graphify y skills no son dependencias runtime de la aplicación ni requisitos del container de producción. |
| AI-SETUP-011 | No existen tokens, API keys, rutas personales, credenciales ni configuraciones privadas versionadas por la Phase -1. |
| AI-SETUP-012 | Existe `scripts/ai/check-environment.sh` para comprobar prerequisites y tooling sin instalar globalmente software de manera automática. |
| AI-SETUP-013 | El output compartible de Graphify puede versionarse para que un nuevo clone disponga del mapa actual; cualquier estado local no portable permanece fuera de Git. |
| AI-SETUP-014 | Antes de Phase 0 existe un commit baseline que separa tooling/configuración IA de la implementación del producto. |

## 84.1 General

| ID | Criterio |
|---|---|
| AC-GEN-001 | TypeScript no presenta errores críticos. |
| AC-GEN-002 | Production build finaliza correctamente. |
| AC-GEN-003 | Next.js público y Payload forman una misma aplicación. |
| AC-GEN-004 | Payload utiliza PostgreSQL. |
| AC-GEN-005 | El proyecto levanta mediante Docker Compose. |
| AC-GEN-006 | Categorías, navegación, footer y contenido editorial no están hardcodeados. |
| AC-GEN-007 | Server Components son el default. |
| AC-GEN-008 | Payload es el único CMS. |
| AC-GEN-009 | shadcn/ui es la única base de framework de primitives. |
| AC-GEN-010 | La interfaz respeta el Design System de 60 Segundos. |

## 84.2 Users / permisos

| ID | Criterio |
|---|---|
| AC-USER-001 | Existen roles `admin` y `writer`. |
| AC-USER-002 | Admin posee acceso administrativo completo. |
| AC-USER-003 | Writer solo accede a funcionalidades permitidas. |
| AC-USER-004 | Admin puede crear Writers. |
| AC-USER-005 | `active=false` impide autenticación. |
| AC-USER-006 | Desactivar Writer no elimina sus Posts. |
| AC-USER-007 | Writer no puede modificar su role. |
| AC-USER-008 | Frontend no expone datos privados/auth del autor. |

## 84.3 Posts / Slugs

| ID | Criterio |
|---|---|
| AC-POST-001 | Admin y Writer pueden crear Post. |
| AC-POST-002 | Writer nuevo Post recibe `author=currentUser`. |
| AC-POST-003 | Writer no cambia autor. |
| AC-POST-004 | Admin puede cambiar autor. |
| AC-SLUG-001 | Slug se puede generar desde title. |
| AC-SLUG-002 | Post slug es globalmente único. |
| AC-SLUG-003 | Editar title no regenera slug existente. |
| AC-SLUG-004 | Usuario autorizado puede editar slug explícitamente. |
| AC-SLUG-005 | Slug normaliza acentos/espacios/caracteres inválidos. |

## 84.4 Categories / Tags

| ID | Criterio |
|---|---|
| AC-CAT-001 | Admin puede crear Categories. |
| AC-CAT-002 | Crear `/deportes` no requiere ruta/deploy específico. |
| AC-CAT-003 | Category usa `colorTheme` controlado. |
| AC-CAT-004 | Category usa `icon` controlado. |
| AC-CAT-005 | Writer no administra Categories. |
| AC-CAT-006 | Category con Posts no se elimina sin resolver dependencias. |
| AC-CAT-007 | Additional Category incluye el Post en su listado. |
| AC-CAT-008 | Additional Category no crea URL alterna del Post. |
| AC-TAG-001 | Admin administra Tags. |
| AC-TAG-002 | Writer selecciona Tags. |
| AC-TAG-003 | Writer puede crear Tags. |
| AC-TAG-004 | Borrar Tag no borra Posts. |

## 84.5 Draft / Publish / Versioning

| ID | Criterio |
|---|---|
| AC-DRAFT-001 | Writer puede guardar Draft. |
| AC-DRAFT-002 | Draft no es visible públicamente. |
| AC-DRAFT-003 | Draft no aparece en Home automática, Category, Search, Related o Sitemap. |
| AC-PUB-001 | Publish valida campos editoriales requeridos. |
| AC-PUB-002 | Primera publicación asigna `publishedAt`. |
| AC-PUB-003 | Edición posterior conserva `publishedAt`. |
| AC-PUB-004 | `updatedAt` refleja última modificación. |
| AC-PUB-005 | Post publicado queda accesible después de revalidación. |
| AC-PERM-001 | Writer edita sus Posts. |
| AC-PERM-002 | Writer no edita Post de otro Writer. |
| AC-PERM-003 | Restricción se aplica server-side en Payload. |
| AC-PERM-004 | Writer no elimina Posts definitivamente. |
| AC-PERM-005 | Admin administra cualquier Post. |
| AC-VER-001 | Posts tienen versionado. |
| AC-VER-002 | Cambios generan versiones. |
| AC-VER-003 | Admin consulta versiones. |
| AC-VER-004 | Admin restaura versión previa. |
| AC-VER-005 | Restaurar no destruye historial anterior. |

## 84.6 Media / Content

| ID | Criterio |
|---|---|
| AC-READ-001 | Reading time se calcula automáticamente. |
| AC-READ-002 | Writer no edita reading time manualmente. |
| AC-READ-003 | Article Page puede mostrar reading time. |
| AC-MEDIA-001 | Admin/Writer autorizado suben imágenes. |
| AC-MEDIA-002 | Media soporta alt/caption/credits/description. |
| AC-MEDIA-003 | Se generan tamaños editoriales responsivos. |
| AC-MEDIA-004 | Cards no cargan resolución hero innecesariamente. |
| AC-MEDIA-005 | Media referenciada no se elimina silenciosamente. |
| AC-MEDIA-006 | Writer no elimina Media compartida indiscriminadamente. |
| AC-MEDIA-007 | Production Media no depende del App filesystem. |
| AC-CONTENT-001 | Article body usa Lexical. |
| AC-CONTENT-002 | Lexical soporta estructura editorial básica. |
| AC-CONTENT-003 | Article soporta Image/Gallery/Video/Quote/Callout/Embed. |
| AC-CONTENT-004 | Payload no acepta arbitrary CSS. |
| AC-CONTENT-005 | Payload no acepta scripts arbitrarios. |
| AC-BLOCK-IMG-001 | Image size solo small/medium/large/full. |
| AC-BLOCK-IMG-002 | CMS no acepta tamaños/márgenes/clases libres. |
| AC-BLOCK-GAL-001 | Gallery soporta grid/carousel. |
| AC-BLOCK-GAL-002 | Carousel soporta teclado/touch accesible. |
| AC-BLOCK-VID-001 | Video soporta providers aprobados. |
| AC-BLOCK-VID-002 | No raw iframe arbitrario. |
| AC-BLOCK-VID-003 | No autoplay con audio. |
| AC-EMBED-001 | Providers de embed están controlados. |
| AC-EMBED-002 | Embed inválido no rompe Article Page. |

## 84.7 Pages / routing

| ID | Criterio |
|---|---|
| AC-PAGE-001 | Admin crea Pages. |
| AC-PAGE-002 | Writer no edita Pages. |
| AC-PAGE-003 | Page publicada vive en `/[slug]`. |
| AC-PAGE-004 | Page usa Blocks predefinidos. |
| AC-PAGE-005 | No builder visual arbitrario. |
| AC-ROUTE-001 | Pages y Categories no comparten slug. |
| AC-ROUTE-002 | Reserved slugs no se asignan a Pages/Categories. |
| AC-FE-CAT-001 | Category slug resuelve su página. |
| AC-FE-CAT-002 | Category solo muestra published Posts. |
| AC-FE-CAT-003 | Category incluye primary/additional membership. |
| AC-FE-CAT-004 | Category ordena por publishedAt DESC. |
| AC-FE-CAT-005 | Category pagina server-side. |
| AC-FE-POST-001 | URL Post usa primaryCategory/post slug. |
| AC-FE-POST-002 | No URL pública alterna por additional category. |
| AC-FE-POST-003 | Categoría incorrecta redirige a canonical. |

## 84.8 Home / Navigation / Footer / Settings

| ID | Criterio |
|---|---|
| AC-HOME-001 | Admin administra Home desde Payload. |
| AC-HOME-002 | Admin agrega bloques. |
| AC-HOME-003 | Admin elimina bloques. |
| AC-HOME-004 | Admin reordena bloques. |
| AC-HOME-005 | Publish refleja exactamente nuevo orden. |
| AC-HOME-006 | Reordenar no requiere código. |
| AC-HOME-007 | CMS no expone CSS/spacing/Tailwind arbitrario. |
| AC-HOME-008 | Existe HeroNews. |
| AC-HOME-009 | Existe CategoryExplorer. |
| AC-HOME-010 | Existe LatestPosts. |
| AC-HOME-011 | Existe PostsByCategory. |
| AC-HOME-012 | Existe FeaturedPosts. |
| AC-HOME-013 | Existe VideoFeature. |
| AC-HOME-014 | Existe Banner. |
| AC-HOME-015 | Bloque automático se actualiza con publicaciones nuevas. |
| AC-HOME-016 | Bloque manual permite selección editorial explícita. |
| AC-HOME-017 | Home soporta Draft. |
| AC-HOME-018 | Preview muestra Home draft antes de Publish. |
| AC-HOME-019 | Existe EditorialIntro. |
| AC-HOME-020 | EditorialIntro compone backgroundImage y foregroundImage en capas, ambos gestionados desde el CMS. |
| AC-NAV-001 | Navigation es administrable. |
| AC-NAV-002 | Navigation soporta Category/Page/External. |
| AC-NAV-003 | Navigation soporta children/submenu. |
| AC-NAV-004 | Cambiar Navigation no requiere código. |
| AC-NAV-005 | Mobile Nav usa patrón accesible basado en Sheet. |
| AC-NAV-006 | Mobile Nav funciona con teclado. |
| AC-NAV-007 | Escape cierra Mobile Nav. |
| AC-FOOT-001 | Footer es administrable. |
| AC-FOOT-002 | Footer controla brand/columns/social/legal/copyright. |
| AC-FOOT-003 | Links internos usan relaciones/resolver cuando sea posible. |
| AC-SET-001 | SiteSettings controla branding/contact/social/SEO/timezone. |
| AC-SET-002 | SiteSettings no almacena infrastructure secrets. |

## 84.9 Article / Sharing / Search

| ID | Criterio |
|---|---|
| AC-ARTICLE-001 | Article Page muestra estructura editorial definida. |
| AC-ARTICLE-002 | Article tiene un único H1 principal. |
| AC-ARTICLE-003 | Article body conserva readable width. |
| AC-ARTICLE-004 | wide/full media puede salir del text width sin romper layout. |
| AC-ARTICLE-005 | Article funciona en móvil. |
| AC-RELATED-001 | Related no incluye current Post. |
| AC-RELATED-002 | Related solo usa published Posts. |
| AC-RELATED-003 | Related prioriza same primary category. |
| AC-AUTHOR-001 | Author Card muestra datos públicos. |
| AC-AUTHOR-002 | Author Card no muestra email privado. |
| AC-SHARE-001 | Share soporta Facebook/X/WhatsApp/Copy/Native. |
| AC-SHARE-002 | Copy usa canonical URL. |
| AC-SHARE-003 | Copy muestra feedback accesible. |
| AC-SHARE-004 | Native Share se usa cuando existe. |
| AC-SHARE-005 | No botón web falso para Instagram. |
| AC-ASIDE-001 | Aside del Article se controla globalmente (no por Post) vía un Global de Payload. |
| AC-ASIDE-002 | Aside soporta modos latest/newest-per-category/featured, heading opcional editable, y límite configurable. |
| AC-ASIDE-003 | Aside es sticky junto al contenido desde el breakpoint de 2 columnas; mobile-first (apilado, sin sticky, por debajo de ese breakpoint). |
| AC-ASIDE-004 | Aside nunca incluye el Post actual en su listado. |
| AC-SEARCH-001 | Existe `/buscar`. |
| AC-SEARCH-002 | `?q=` ejecuta búsqueda. |
| AC-SEARCH-003 | Search vacío no consulta todos los Posts. |
| AC-SEARCH-004 | Search solo devuelve published Posts. |
| AC-SEARCH-005 | Search pagina. |
| AC-SEARCH-006 | Pagination conserva `q`. |
| AC-SEARCH-007 | Search sin resultados muestra EmptyState. |
| AC-SEARCH-008 | Search se sirve desde la Collection `search` dedicada de `@payloadcms/plugin-search`, nunca desde un `LIKE` amplio sobre Posts/Pages completos. |
| AC-SEARCH-009 | El contenido público existente puede reindexarse bajo demanda. |
| AC-SEARCH-010 | Contenido publicado o actualizado se sincroniza automáticamente al índice de Search. |
| AC-SEARCH-011 | Despublicar o eliminar contenido lo remueve del índice y deja de aparecer en `/buscar`. |
| AC-SEARCH-012 | Los resultados de Search usan URLs públicas canónicas (`getPostUrl()`/`getPageUrl()`). |
| AC-SEARCH-013 | Ningún contenido en Draft aparece nunca en `/buscar`. |
| AC-SEARCH-014 | V1 no requiere ningún servicio de búsqueda externo (Algolia/Elasticsearch/OpenSearch/Meilisearch/Typesense u otro). |

## 84.10 Preview / Redirect / SEO

| ID | Criterio |
|---|---|
| AC-PREVIEW-001 | Writer previsualiza sus Drafts. |
| AC-PREVIEW-002 | Admin previsualiza contenido administrable. |
| AC-PREVIEW-003 | Preview usa frontend real. |
| AC-PREVIEW-004 | No preview simplificada paralela dentro del Admin. |
| AC-PREVIEW-005 | Usuario no autorizado no accede a Drafts. |
| AC-PREVIEW-006 | Se puede salir de Draft Mode. |
| AC-REDIR-001 | Cambiar slug crea permanent redirect. |
| AC-REDIR-002 | Cambiar primaryCategory conserva URL anterior. |
| AC-REDIR-003 | Slug+category simultáneo redirige old → final. |
| AC-REDIR-004 | Redirect chains se minimizan. |
| AC-REDIR-005 | Deleted URL sin destino válido puede ser 404. |
| AC-SEO-001 | Article genera title/description/canonical/OG. |
| AC-SEO-002 | SEO usa fallbacks definidos. |
| AC-SEO-003 | Category genera metadata. |
| AC-SEO-004 | Page genera metadata. |
| AC-SEO-005 | Home genera metadata. |
| AC-SEO-006 | Article genera NewsArticle. |
| AC-SEO-007 | Breadcrumbs relevantes generan BreadcrumbList. |
| AC-SEO-008 | Publisher viene de SiteSettings/Organization. |
| AC-SEO-009 | Sitemap incluye contenido público definido. |
| AC-SEO-010 | Sitemap excluye Drafts. |
| AC-SEO-011 | Sitemap excluye admin/preview/search URLs. |
| AC-SEO-012 | Existe robots.txt. |
| AC-SEO-013 | Non-production puede bloquear indexación. |
| AC-LLM-001 | Existe `GET /llms.txt` público con `Content-Type` Markdown. |
| AC-LLM-002 | El contenido sigue la estructura llms.txt v2 (H1/blockquote/secciones H2 de enlaces). |
| AC-LLM-003 | Solo incluye Categorías públicas y Posts/Pages publicados; ningún Draft. |
| AC-LLM-004 | Todas las URLs son absolutas y los Posts usan `primaryCategory`. |
| AC-LLM-005 | El listado de Posts recientes está acotado, no es un volcado histórico completo. |
| AC-LLM-006 | Se revalida ante publish/unpublish/cambios de campos representados en el documento. |

## 84.11 Cache / Errors / UI / Responsive / A11y / Performance

| ID | Criterio |
|---|---|
| AC-CACHE-001 | Public content puede cachearse. |
| AC-CACHE-002 | Post publish/update invalida contenido relacionado. |
| AC-CACHE-003 | Category se revalida cuando cambia Post relacionado. |
| AC-CACHE-004 | Home se revalida si bloque automático es afectado. |
| AC-CACHE-005 | Navigation usa invalidación específica, no rebuild arbitrario. |
| AC-CACHE-006 | Preview no devuelve versión pública cacheada por error. |
| AC-404-001 | Existe 404 branded. |
| AC-404-002 | 404 cubre recursos inexistentes/Draft público. |
| AC-404-003 | No usar 404 genérico como experiencia final. |
| AC-ERR-001 | Public errors no muestran stack. |
| AC-ERR-002 | Embed failure no rompe Article Page. |
| AC-ERR-003 | Revalidation failure no corrompe Post publicado. |
| AC-UI-001 | shadcn es primitive layer estándar. |
| AC-UI-002 | No instalar todo shadcn sin uso. |
| AC-UI-003 | shadcn usa tokens 60 Segundos. |
| AC-UI-004 | UI no conserva apariencia genérica de shadcn. |
| AC-UI-005 | No segundo UI framework. |
| AC-COMP-001 | Existe ArticleCard reusable. |
| AC-COMP-002 | ArticleCard soporta variantes definidas cuando se usan. |
| AC-COMP-003 | No duplicar ArticleCard por variante. |
| AC-COMP-004 | ArticleCard no consulta Payload. |
| AC-COMP-005 | CategoryCard muestra icon/name/description/theme. |
| AC-COMP-006 | CategoryCard usa theme autorizado. |
| AC-RESP-001 | UI funciona small mobile → wide desktop. |
| AC-RESP-002 | No horizontal scroll accidental. |
| AC-RESP-003 | Hero reorganiza layout en móvil. |
| AC-RESP-004 | Nav desktop → mobile apropiada. |
| AC-RESP-005 | Article mantiene readable width/gutters. |
| AC-RESP-006 | Media/embeds no desbordan viewport. |
| AC-A11Y-001 | Funciones críticas navegables con teclado. |
| AC-A11Y-002 | Icon-only controls tienen accessible name. |
| AC-A11Y-003 | Focus visible. |
| AC-A11Y-004 | Imágenes editoriales tienen alt apropiado. |
| AC-A11Y-005 | Heading hierarchy correcta. |
| AC-A11Y-006 | Category themes cumplen contraste apropiado. |
| AC-A11Y-007 | Touch targets apropiados. |
| AC-A11Y-008 | Motion respeta reduced motion. |
| AC-PERF-001 | Se evita JS cliente innecesario. |
| AC-PERF-002 | Cards usan responsive images. |
| AC-PERF-003 | Priority solo para LCP real. |
| AC-PERF-004 | External scripts se cargan solo cuando se usan. |
| AC-PERF-005 | No N+1 queries evidentes. |
| AC-PERF-006 | Pagination ocurre server/DB-side. |

## 84.12 Design / Docker / DB / Env / Security / CI

| ID | Criterio |
|---|---|
| AC-DESIGN-001 | Fondo principal usa paper/off-white. |
| AC-DESIGN-002 | Rojo es accent principal. |
| AC-DESIGN-003 | Display typography usa familia editorial definida. |
| AC-DESIGN-004 | Long-form usa tipografía legible definida. |
| AC-DESIGN-005 | Newspaper texture no compromete lectura. |
| AC-DESIGN-006 | Cards usan borders/radius/shadows consistentes. |
| AC-DESIGN-007 | No parece template shadcn genérico. |
| AC-DESIGN-008 | Home reference permanece North Star visual. |
| AC-DOCKER-001 | Repo incluye Dockerfile/compose/.dockerignore. |
| AC-DOCKER-002 | `docker compose up --build` inicia app+db. |
| AC-DOCKER-003 | App conecta DB por `db:5432`. |
| AC-DOCKER-004 | DB persiste después de `docker compose down`. |
| AC-DOCKER-005 | `down -v` elimina explícitamente volumes. |
| AC-DOCKER-006 | PostgreSQL tiene healthcheck. |
| AC-DOCKER-007 | App expone health endpoint seguro. |
| AC-DOCKER-008 | Docker dev soporta Fast Refresh. |
| AC-DOCKER-009 | Host node_modules no reemplaza Linux deps. |
| AC-DOCKER-010 | Dockerfile produce production image. |
| AC-DOCKER-011 | Production image arranca sin repo mounts. |
| AC-DB-001 | No SQLite silencioso en production. |
| AC-DB-002 | Migrations están versionadas. |
| AC-DB-003 | Fresh install puede crear schema mediante workflow. |
| AC-DB-004 | No migrations destructivas automáticas en cada startup. |
| AC-SEED-001 | Existe seed inicial explícito. |
| AC-SEED-002 | Seed crea categorías iniciales definidas. |
| AC-SEED-003 | Seed evita duplicados razonablemente. |
| AC-SEED-004 | seed:dev no corre automáticamente en production. |
| AC-ENV-001 | Existe `.env.example`. |
| AC-ENV-002 | `.env` real no se versiona. |
| AC-ENV-003 | Secrets no usan `NEXT_PUBLIC_`. |
| AC-ENV-004 | Missing critical env produce error claro. |
| AC-STOR-001 | App container es stateless en production. |
| AC-STOR-002 | Production uploads usan external object storage. |
| AC-STOR-003 | Recrear App no elimina Media. |
| AC-SEC-001 | Payload Admin requiere auth. |
| AC-SEC-002 | Access control es server-side. |
| AC-SEC-003 | CORS no usa `*` sin necesidad. |
| AC-SEC-004 | Secrets no llegan al browser. |
| AC-SEC-005 | Uploads validan type/size. |
| AC-SEC-006 | No arbitrary raw scripts/HTML desde CMS. |
| AC-SEC-007 | External URLs se validan. |
| AC-SEC-008 | New-tab links usan protections apropiadas. |
| AC-SEC-009 | Production configura security headers. |
| AC-SEC-010 | Logs no contienen secrets. |
| AC-HEALTH-001 | `/api/health` responde cuando el stack está sano. |
| AC-HEALTH-002 | Health endpoint no expone detalles sensibles. |
| AC-LOG-001 | Errores críticos llegan a stdout/stderr. |
| AC-LOG-002 | DB/migration/revalidation/redirect failures son diagnosticables. |
| AC-CI-001 | CI ejecuta install/typecheck/lint/tests/build. |
| AC-CI-002 | CI verifica Docker build según pipeline definida. |
| AC-CI-003 | TypeScript/build failing impide considerar validado el cambio. |

---

# 85. Critical end-to-end scenarios

## Writer ownership

```text
Given:
Writer A
Writer B
Post X belongs to Writer B

When:
Writer A intenta modificar Post X

Then:
Payload rechaza la operación server-side.
```

## Draft privacy

```text
Given:
Post X está Draft

When:
una persona no autenticada solicita su canonical URL

Then:
no puede ver el contenido

And:
no aparece en Home automática, Category, Search o Sitemap.
```

## Publish

```text
Given:
Writer tiene un Draft válido

When:
Writer publica

Then:
publishedAt se asigna si es primera publicación

And:
la URL pública funciona

And:
la Category correspondiente lo incluye

And:
Home lo refleja si sus bloques automáticos corresponden

And:
Sitemap puede incluirlo.
```

## Redirect

```text
Given:
/noticias/post-a

When:
slug cambia a post-b

Then:
/noticias/post-a
permanent redirects to
/noticias/post-b
```

## Home Draft

```text
Given:
Home publicada:
Hero
Categories
LatestPosts

When:
Admin crea Draft:
Hero
LatestPosts
Categories

Then:
la Home pública no cambia antes de Publish

And:
Preview muestra el nuevo orden

And:
después de Publish la Home pública usa el nuevo orden.
```

## Dynamic Category

```text
Given:
Admin creates:
name = Deportes
slug = deportes

Then:
/deportes
funciona sin crear app/deportes/page.tsx.
```

## Docker onboarding

En una máquina limpia con Docker:

```text
git clone
cp .env.example .env
docker compose up --build
```

siguiendo README debe levantar el stack sin requerir PostgreSQL instalado en el host.

---

# 86. Definition of Done — V1

60 Segundos Noticias V1 se considera terminada cuando:

- Admin puede operar el portal.
- Writer puede crear, editar, previsualizar y publicar sus noticias.
- Permisos están protegidos server-side.
- Categories son dinámicas.
- Home es administrable por blocks.
- Navigation y Footer son administrables.
- Posts soportan Draft, Preview, Publish y Versions.
- Public routes funcionan con datos reales.
- URL changes conservan redirects.
- SEO fundamental funciona.
- Search funciona sobre Posts publicados.
- Sitio es responsive.
- Sitio cumple requisitos de accesibilidad definidos.
- Docker Compose levanta app + PostgreSQL.
- DB persiste.
- Production build funciona.
- Container production es stateless.
- Production Media puede vivir en Object Storage.
- Secrets no están comprometidos.
- Migrations están documentadas.
- CI pasa.
- No existen defects críticos conocidos en publishing, routing, permissions, Media, SEO, Docker o seguridad.

---

# 87. Prompt recomendado para agentes por fase

A partir de Phase 0, el cambio debe gestionarse mediante OpenSpec. Prompt base recomendado para iniciar una fase/change:

```text
Read AGENTS.md and docs/AI-WORKFLOW.md first.

Treat docs/60-segundos-spec.md as the canonical target specification.
Use the active OpenSpec change as the exact implementation scope.

Before broad repository exploration:
1. Query Graphify for the architecture, affected modules, dependencies and blast radius.
2. Inspect the actual source files identified as relevant.
3. Read the Master Specification sections and AC-* criteria relevant to this change.
4. Report conflicts between the Master Spec, active OpenSpec artifacts and existing implementation before coding.

Do not implement later phases opportunistically.
Do not introduce major dependencies or architectural changes without explicit approval.

After implementation:
1. Run the validation tasks defined by the active OpenSpec change.
2. Update Graphify so it reflects the current working tree when necessary.
3. Run OpenSpec verify.
4. Report relevant AC-* criteria as PASS / FAIL / NOT TESTED / NOT APPLICABLE.
5. Do not archive the change while required criteria remain FAIL or NOT TESTED.
```

Phase -1 is the exception: it configures the tools that make this workflow possible and therefore is not itself required to be represented as a normal OpenSpec Change.

---

# 88. Regla final

La implementación debe buscar la solución **más simple, mantenible y coherente con esta arquitectura**, sin convertir el proyecto en una arquitectura ceremonial.

La prioridad es que el equipo editorial pueda administrar 60 Segundos Noticias de forma segura y autónoma, mientras el frontend conserva una identidad editorial fuerte, consistente y rápida.

**Payload administra contenido y estructura. Next.js administra experiencia y presentación.**

---

# 89. Visual Asset Inventory

Los siguientes archivos forman parte del paquete visual base y sus rutas se consideran estables para la implementación V1:

```text
docs/references/home-reference.jpeg

public/branding/logo.svg
public/branding/logo-mark.svg

public/textures/paper-grain.webp
public/textures/newspaper-pattern.webp
```

Reglas:

- `home-reference.jpeg` es referencia visual exclusivamente y no debe renderizarse como asset de producción.
- `logo.svg` es la identidad principal aprobada.
- `logo-mark.svg` es la versión reducida/isotipo aprobada.
- `paper-grain.webp` es la textura general sutil del canvas.
- `newspaper-pattern.webp` es una textura editorial decorativa y debe usarse normalmente con opacidad baja, especialmente en Hero/secciones visuales.
- No rediseñar, sustituir o generar logos alternativos sin aprobación explícita.
- Las fotografías editoriales de Posts se administran mediante Payload Media y no se guardan en `public/`.
- Ver `docs/ASSETS.md` para notas de uso y archivos fuente de referencia.

