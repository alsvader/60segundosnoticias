## Purpose

Define los 8 Home Blocks V1 y sus Section components correspondientes: el contrato de configuración de cada bloque en el CMS, la forma resuelta que consume su Section, y su comportamiento cuando el contenido disponible es insuficiente.

## Requirements

### Requirement: EditorialIntroSection compone un fondo y un primer plano gestionados desde el CMS

`EditorialIntroBlock` SHALL configurarse con `headlinePrimary`, `headlineAccent`, `description`, `cta` (grupo usando el mismo modelo de enlace reutilizable `linkFields` que Navigation/Footer — label/type[category|page|external]/category/page/url/openInNewTab, no un par de campos de texto plano), `backgroundImage` (relación a Media) y `foregroundImage` (relación a Media). No depende de ningún Post. `EditorialIntroSection` SHALL renderizar `backgroundImage` como la composición visual de fondo completa de la sección y `foregroundImage` por encima de ella, junto al texto; el CMS provee un único asset preparado por capa, sin campos separados por elemento decorativo (por ejemplo, un mapa o un collage no son campos independientes — son parte del `backgroundImage` que el Admin prepara). `headlinePrimary` SHALL renderizarse en el color de tinta/ink; `headlineAccent` SHALL renderizarse en el rojo de marca.

#### Scenario: Se configura un EditorialIntroBlock con ambas imágenes
- **WHEN** el Admin configura `EditorialIntroBlock` con `backgroundImage` y `foregroundImage` distintos
- **THEN** `EditorialIntroSection` renderiza ambas imágenes en capas (fondo detrás, primer plano encima), junto con el titular en dos colores, la descripción y el CTA resuelto

#### Scenario: EditorialIntro no depende de contenido editorial dinámico
- **WHEN** se resuelve `EditorialIntroBlock`
- **THEN** el bloque no consulta Posts ni Categories — toda su información proviene directamente de sus propios campos configurados

Referencia: AC-HOME-019, AC-HOME-020, §19.2 del Master Spec

### Requirement: HeroNewsSection soporta selección manual y automática con un contrato unificado
`HeroNewsBlock` SHALL soportar `contentMode: manual | automatic`. En modo `manual`, el Admin SHALL configurar `mainPost` y hasta aproximadamente 3 `secondaryPosts`. En modo `automatic`, el Admin SHALL poder configurar `sourceCategory` (opcional) y `limit`. Independientemente del modo, `HeroNewsSection` SHALL recibir siempre el mismo contrato resuelto: un `mainPost` y una lista de `secondaryPosts`. El `cta` opcional SHALL usar el mismo modelo de enlace reutilizable `linkFields` que Navigation/Footer, no un par de campos de texto plano.

#### Scenario: HeroNews en modo automático con categoría fuente
- **WHEN** `HeroNewsBlock` está en modo `automatic` con `sourceCategory` configurada
- **THEN** el resolver selecciona Posts publicados de esa categoría y los normaliza a `mainPost`/`secondaryPosts`

#### Scenario: HeroNews en modo manual con Posts insuficientes
- **WHEN** `HeroNewsBlock` está en modo `manual` y uno o más `secondaryPosts` configurados ya no están publicados
- **THEN** `HeroNewsSection` recibe solo los Posts publicados restantes, sin un hueco vacío ni un error

Referencia: AC-HOME-008, §20 del Master Spec

### Requirement: CategoryExplorerSection usa categorías seleccionadas explícitamente
`CategoryExplorerBlock` SHALL configurarse con `categories` (relación múltiple seleccionada explícitamente por el Admin), `title`, `showViewAll` y `viewAllLabel`. El bloque SHALL NOT derivarse automáticamente de `Categories.showOnHome`/`Categories.order`; esos campos permanecen sin consumidor en esta capability, igual que `Posts.featured` permanece sin consumidor en `FeaturedPostsBlock`.

#### Scenario: Admin agrega categorías explícitas al Category Explorer
- **WHEN** el Admin selecciona un conjunto de Categories en `CategoryExplorerBlock.categories`
- **THEN** `CategoryExplorerSection` renderiza exactamente esas categorías, en el orden configurado, cada una con `name`/`description`/`icon`/`colorTheme`

Referencia: AC-HOME-009, §21 del Master Spec

### Requirement: LatestPostsSection consulta automáticamente por fecha de publicación
`LatestPostsBlock` SHALL ser siempre de resolución automática, configurable con `title`, `limit` (por defecto aproximadamente 6), `category` (opcional) y `layout: grid | list | mixed`. Cuando `category` no está configurada, SHALL mostrar los Posts publicados más recientes de cualquier categoría, ordenados por `publishedAt` descendente.

#### Scenario: LatestPosts sin categoría configurada
- **WHEN** `LatestPostsBlock` no tiene `category` configurada
- **THEN** `LatestPostsSection` muestra los Posts publicados más recientes de cualquier categoría, hasta `limit`

#### Scenario: LatestPosts con categoría configurada
- **WHEN** `LatestPostsBlock` tiene `category` configurada
- **THEN** `LatestPostsSection` solo muestra Posts publicados que pertenecen a esa categoría

#### Scenario: LatestPosts con layout list en desktop
- **WHEN** `LatestPostsBlock` usa `layout: list` y el viewport es de desktop (`lg` o mayor)
- **THEN** `LatestPostsSection` distribuye las tarjetas `compact` en 2 columnas, sin estirar cada tarjeta a todo el ancho del contenedor; en viewports menores usa 1 columna

Referencia: AC-HOME-010, §22 del Master Spec

### Requirement: PostsByCategorySection consulta automáticamente por categoría requerida
`PostsByCategoryBlock` SHALL requerir `category`, y ser configurable con `limit`, `layout: grid | horizontal | featured-grid` y `showViewAll`. Cuando no existen Posts publicados que pertenezcan a la categoría configurada, `PostsByCategorySection` SHALL degradar de forma restringida (ocultarse u mostrar un estado vacío discreto) en vez de fallar.

#### Scenario: PostsByCategory sin Posts publicados en la categoría configurada
- **WHEN** ninguna Post publicado pertenece a la categoría configurada en `PostsByCategoryBlock`
- **THEN** `PostsByCategorySection` no produce un error, y se oculta o muestra un estado vacío restringido

Referencia: AC-HOME-011, §23 del Master Spec

### Requirement: FeaturedPostsSection usa selección manual explícita únicamente
`FeaturedPostsBlock` SHALL configurarse con `posts` (relación múltiple seleccionada explícitamente por el Admin) y `layout: grid | carousel | editorial`. El bloque SHALL NOT tener un modo automático basado en `Posts.featured`.

#### Scenario: Admin selecciona Posts destacados manualmente
- **WHEN** el Admin selecciona un conjunto de Posts en `FeaturedPostsBlock.posts`
- **THEN** `FeaturedPostsSection` renderiza únicamente los Posts seleccionados que siguen publicados, en el layout configurado

Referencia: AC-HOME-012, §24 del Master Spec

### Requirement: VideoFeatureSection soporta una fuente por Post o una fuente externa controlada
`VideoFeatureBlock` SHALL configurarse con `source: post | external`, mostrando campos condicionales según el valor: `post` cuando `source` es `post`; `videoURL` cuando `source` es `external`; además `thumbnail`, `headline` y `description` en ambos casos.

#### Scenario: VideoFeature con source "post" referenciando un Post despublicado
- **WHEN** `VideoFeatureBlock.source` es `post` y el Post referenciado deja de estar publicado
- **THEN** `VideoFeatureSection` no se renderiza con ese Post, sin exponer contenido no publicado

#### Scenario: VideoFeature con source "external"
- **WHEN** `VideoFeatureBlock.source` es `external`
- **THEN** el bloque muestra `videoURL`, `thumbnail`, `headline` y `description`, y oculta el campo `post`

Referencia: AC-HOME-013, §25 del Master Spec

### Requirement: BannerSection comparte contrato con el Page Banner block
`BannerBlock` de Home SHALL usar el mismo schema (`title`, `description`, `image`, `link` — grupo con el modelo de enlace reutilizable `linkFields`, no un par de campos de texto plano —, `variant: editorial | promotional | dark`) que el Banner block ya existente para `Pages`. `BannerSection` SHALL ser el mismo componente presentacional consumido desde ambos contextos, con el mismo contrato visual (variantes, tipografía, composición y CTA). La única diferencia permitida entre contextos SHALL ser el ancho del fondo: en Home el fondo ocupa todo el ancho de la página; en una Page se presenta contenido dentro del contenedor de la Page.

#### Scenario: Se configura un BannerBlock en Home
- **WHEN** el Admin agrega un `BannerBlock` a `Home.layout` con `variant: dark`
- **THEN** `BannerSection` lo renderiza con los mismos colores, tipografía, composición y CTA que tendría el mismo Banner en una Page
- **AND** en Home su fondo ocupa todo el ancho de la página

Referencia: AC-HOME-014, §26, §59, §60 del Master Spec

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

### Requirement: Cada Home Section es presentacional y recibe solo props resueltas
Ningún componente `*Section` de Home SHALL importar configuración de Payload, invocar la Local API, ni consultar la base de datos. Cada uno SHALL recibir su contenido exclusivamente vía props ya resueltas por la capa de resolución.

#### Scenario: Se inspecciona una Home Section
- **WHEN** se revisa la implementación de cualquier `*Section` en `src/components/sections/home/`
- **THEN** no contiene ninguna llamada a Payload ni a la base de datos

Referencia: AC-COMP-004 (principio equivalente aplicado a las Home Sections)
