## Purpose

Renderiza los 8 Page Blocks de una Generic Page, reutilizando la infraestructura de renderizado de Article donde el schema ya es compartido, en vez de duplicar implementaciones.

## ADDED Requirements

### Requirement: Renderizado de los 8 Page Blocks
El sistema SHALL renderizar una Generic Page componiendo, en el orden configurado en `Page.layout`, cualquier combinación de: `Hero`, `RichText`, `ImageText`, `Gallery`, `Video`, `CTA`, `FAQ` y `Banner`.

#### Scenario: Page con múltiples blocks
- **WHEN** una Page publicada tiene varios blocks configurados en su `layout`
- **THEN** se renderizan en el mismo orden configurado

Referencia: AC-PAGE-004

### Requirement: Gallery y Video de Page reutilizan la infraestructura de Article
Dado que `Gallery` y `Video` de Page comparten el mismo schema que `GalleryBlock`/`VideoBlock` de Article, el sistema SHALL reutilizar el mismo renderizado seguro (incluyendo el mismo comportamiento de accesibilidad de carousel y el mismo control de providers de video) en vez de una segunda implementación.

#### Scenario: Gallery en una Page
- **WHEN** una Page tiene un block `Gallery` con `layout: carousel`
- **THEN** se comporta igual que el `GalleryBlock` equivalente en un Article

#### Scenario: Video en una Page
- **WHEN** una Page tiene un block `Video` con un provider soportado
- **THEN** se resuelve con la misma lógica de providers que `VideoBlock` de Article

Referencia: §16 del Master Spec

### Requirement: RichText de Page reutiliza el renderizado seguro de Lexical de Article
El block `RichText` de Page SHALL renderizarse con el mismo stack de renderizado seguro de Lexical usado para el body de Article, sin una segunda implementación de renderizado de rich text.

#### Scenario: RichText con contenido enriquecido
- **WHEN** una Page tiene un block `RichText` con contenido enriquecido
- **THEN** se renderiza con las mismas garantías de seguridad que el body de un Article, sin HTML arbitrario

Referencia: AC-CONTENT-004, AC-CONTENT-005

### Requirement: Banner de Page reutiliza el componente ya compartido
El block `Banner` de Page SHALL renderizarse con el mismo componente ya compartido con Home desde Fase 6, sin una segunda implementación visual.

#### Scenario: Banner configurado en una Page
- **WHEN** una Page tiene un block `Banner` en su `layout`
- **THEN** se renderiza con el mismo componente `BannerSection` que usa Home

Referencia: Fase 6 — reubicación de `Banner` a `blocks/shared/`

### Requirement: FAQ accesible
El block `FAQ` SHALL renderizarse con un patrón de acordeón navegable con teclado, exponiendo su estado expandido/colapsado de forma accesible.

#### Scenario: Interacción con FAQ
- **WHEN** un usuario navega un `FAQ` con teclado
- **THEN** puede expandir y colapsar cada ítem, y su estado se expone de forma accesible

Referencia: §16.3 del Master Spec

### Requirement: Bloque no reconocido no rompe la página
Un `blockType` no reconocido en el `layout` de una Page SHALL registrarse con una advertencia y omitirse, sin afectar el renderizado del resto de la Page.

#### Scenario: Bloque desconocido en una Page
- **WHEN** el `layout` de una Page incluye un `blockType` no reconocido
- **THEN** se omite con una advertencia registrada, y el resto de la Page se renderiza normalmente

Referencia: §61 del Master Spec

### Requirement: Page en draft nunca se renderiza públicamente
Una Page en estado draft SHALL responder 404 ante una solicitud pública, nunca su contenido.

#### Scenario: Solicitud de una Page en draft
- **WHEN** se solicita el slug de una Page que existe pero está en draft
- **THEN** se responde 404

Referencia: AC-PAGE-003
