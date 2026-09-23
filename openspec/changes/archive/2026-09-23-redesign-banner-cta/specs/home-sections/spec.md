## MODIFIED Requirements

### Requirement: BannerSection comparte contrato con el Page Banner block
`BannerBlock` de Home SHALL usar el mismo schema (`title`, `description`, `image`, `link` — grupo con el modelo de enlace reutilizable `linkFields`, no un par de campos de texto plano —, `variant: editorial | promotional | dark`) que el Banner block ya existente para `Pages`. `BannerSection` SHALL ser el mismo componente presentacional consumido desde ambos contextos, con el mismo contrato visual (variantes, tipografía, composición y CTA). La única diferencia permitida entre contextos SHALL ser el ancho del fondo: en Home el fondo ocupa todo el ancho de la página; en una Page se presenta contenido dentro del contenedor de la Page.

#### Scenario: Se configura un BannerBlock en Home
- **WHEN** el Admin agrega un `BannerBlock` a `Home.layout` con `variant: dark`
- **THEN** `BannerSection` lo renderiza con los mismos colores, tipografía, composición y CTA que tendría el mismo Banner en una Page
- **AND** en Home su fondo ocupa todo el ancho de la página

Referencia: AC-HOME-014, §26, §59, §60 del Master Spec

## ADDED Requirements

### Requirement: El Banner de Home tiene fondo a ancho completo y contenido alineado al contenedor del sitio
En Home, el fondo del Banner SHALL extenderse horizontalmente hasta ambos bordes del viewport en todos los breakpoints, sin importar su posición en `Home.layout`. Su contenido (título, descripción, CTA e imagen) SHALL usar exactamente el mismo ancho máximo y los mismos gutters horizontales que el resto de las Home Sections. El Banner SHALL tener espaciado vertical propio y SHALL NOT alterar el layout de los bloques anteriores o posteriores, ni provocar scroll horizontal.

#### Scenario: Banner entre dos bloques del Home
- **GIVEN** un `Home.layout` con un `LatestPosts`, un `BannerBlock` y un `PostsByCategory`
- **WHEN** se renderiza el Home en 375px, 768px y 1440px
- **THEN** el fondo del Banner ocupa todo el ancho del viewport
- **AND** el borde izquierdo del título del Banner coincide con el borde izquierdo del contenido de los bloques vecinos
- **AND** la página no tiene scroll horizontal

#### Scenario: Varios Banners en distintas posiciones
- **WHEN** el Admin agrega dos `BannerBlock` en posiciones distintas de `Home.layout`
- **THEN** ambos se renderizan con fondo a ancho completo y contenido alineado, sin afectar a los demás bloques

Referencia: AC-RESP-001, AC-RESP-002, §53 del Master Spec

### Requirement: La composición del Banner depende de la presencia de imagen
El Banner SHALL presentarse correctamente con y sin imagen, sin que el Admin configure la composición. Sin imagen, título, descripción y CTA SHALL alinearse al centro. Con imagen, en desktop el texto y el CTA SHALL ir en una columna y la imagen en otra; en móvil y tablet el contenido SHALL apilarse verticalmente. La imagen SHALL mostrarse con su proporción original, sin recorte, dentro de un tamaño máximo acotado (ancho de su columna y alto limitado) para que no domine el bloque. La imagen SHALL NOT desbordar el viewport ni recortar el texto, y el Banner SHALL NOT usar alturas fijas que corten contenido.

#### Scenario: Banner sin imagen
- **WHEN** un `BannerBlock` no tiene `image`
- **THEN** título, descripción y CTA se muestran centrados

#### Scenario: Banner con imagen en desktop
- **WHEN** un `BannerBlock` tiene `image` y se visualiza a 1440px
- **THEN** título, descripción y CTA aparecen a la izquierda y la imagen a la derecha

#### Scenario: Imagen vertical u horizontal
- **WHEN** la imagen del Banner es vertical (p. ej. 3:4) u horizontal (p. ej. 3:2)
- **THEN** se muestra completa con su proporción original, sin recorte
- **AND** no excede el ancho de su columna ni el alto máximo del Banner

#### Scenario: Banner con imagen en móvil
- **WHEN** el mismo Banner se visualiza a 375px
- **THEN** el contenido se apila verticalmente y la imagen no excede el ancho disponible

Referencia: AC-RESP-001, AC-RESP-006

### Requirement: El Banner presenta una jerarquía clara y un CTA accesible
El título del Banner SHALL renderizarse como encabezado de segundo nivel, coherente con el único H1 de la página. La descripción SHALL ser visualmente secundaria al título. Cuando el enlace se resuelve, el CTA SHALL ser un enlace con etiqueta visible, foco visible, área de interacción de al menos 44px de alto y contraste AA contra el fondo de cada variante. Un enlace externo que abre en nueva pestaña SHALL llevar `rel="noopener noreferrer"`. Si el enlace no se resuelve, el Banner SHALL renderizarse sin CTA. Una imagen con `alt` de Media SHALL exponer ese texto alternativo. Cualquier elemento puramente decorativo SHALL estar oculto a tecnologías de asistencia.

#### Scenario: CTA navegable con teclado
- **WHEN** un usuario llega al CTA del Banner con Tab
- **THEN** el CTA muestra un indicador de foco visible y se activa con Enter

#### Scenario: Contraste por variante
- **WHEN** se auditan con axe Banners en `editorial`, `promotional` y `dark`
- **THEN** no hay violaciones de contraste en título, descripción ni CTA

#### Scenario: Enlace no resuelto
- **WHEN** el `link` del Banner está vacío o mal configurado
- **THEN** el Banner se renderiza con título y descripción, sin CTA

Referencia: AC-A11Y-001, AC-A11Y-003, AC-A11Y-004, AC-A11Y-005, AC-A11Y-007, AC-A11Y-008

### Requirement: El Banner es un CTA editorial interno, no publicidad
El Banner SHALL limitarse a promocionar contenido, secciones o iniciativas propias del sitio mediante título, descripción, un CTA e imagen opcional. SHALL NOT exponer campos ni comportamientos de publicidad pagada (anunciante, campaña, tracking publicitario, etiquetas de "Anuncio" o formatos de anuncio estándar).

#### Scenario: Configuración del Banner en el Admin
- **WHEN** el Admin edita un `BannerBlock`
- **THEN** solo ve título, descripción, imagen, botón (CTA) y variante, sin campos publicitarios

Referencia: §26 del Master Spec
