## Purpose

Define el conjunto de componentes editoriales presentacionales de la Fase 4 (`CategoryBadge`, `CategoryCard`, `ArticleCard`, `ArticleMetadata`, `SectionHeader`, `Breadcrumbs`, `Pagination`, `ResponsiveMedia`) como fundación reutilizable para las páginas de fases posteriores, sin acceso a datos.

## Requirements

### Requirement: Componentes editoriales son presentacionales
Ningún componente de esta capability SHALL consultar Payload directamente (ni Local API, ni API REST/GraphQL, ni acceso a base de datos). Cada componente SHALL recibir sus datos exclusivamente vía props.

#### Scenario: Se revisa el código de CategoryCard
- **WHEN** se inspecciona la implementación de `CategoryCard`
- **THEN** no contiene ninguna llamada a Payload ni a la base de datos; toda su información llega por props

### Requirement: ArticleCard como fundación reutilizable
El sistema SHALL proveer un componente `ArticleCard` único y reutilizable, sin duplicar una variante de componente por cada variante visual. `ArticleCard` SHALL definirse contra un contrato de datos propio del frontend (por ejemplo `ArticleCardData`), no contra el tipo `Post` generado por Payload.

#### Scenario: Se necesita otra variante visual de ArticleCard
- **WHEN** una fase futura necesita una variante visual adicional de `ArticleCard`
- **THEN** se implementa como variante del mismo componente (por ejemplo vía prop `variant`), no como un componente `ArticleCard` distinto

#### Scenario: Se provee data de Payload a ArticleCard
- **WHEN** una página de fase futura renderiza `ArticleCard`
- **THEN** le pasa un objeto que cumple `ArticleCardData`, transformado previamente por la capa de datos, no el tipo `Post` de Payload directamente

Referencia: AC-COMP-001, AC-COMP-002, AC-COMP-003, AC-COMP-004

### Requirement: CategoryCard muestra icon/name/description/theme autorizado
`CategoryCard` SHALL mostrar el icono de categoría (resuelto desde una category icon key controlada), el nombre en mayúsculas, la descripción y el theme visual autorizado de la categoría.

#### Scenario: Se renderiza CategoryCard con una categoría válida
- **WHEN** `CategoryCard` recibe una categoría con `icon: 'plane'` y `colorTheme: 'orange'`
- **THEN** renderiza el icono Lucide mapeado a `plane` y aplica el theme visual `orange` mediante `data-cat-theme`

Referencia: AC-COMP-005, AC-COMP-006

### Requirement: CategoryBadge con variantes controladas
`CategoryBadge` SHALL soportar como mínimo las variantes `default`, `compact` y `overlay`, todas consumiendo el mismo sistema de category theme.

#### Scenario: Se usa CategoryBadge sobre una imagen
- **WHEN** se necesita un badge de categoría superpuesto sobre una fotografía
- **THEN** se usa la variante `overlay` del mismo componente `CategoryBadge`

### Requirement: SectionHeader sin acceso a datos
`SectionHeader` SHALL aceptar props como `title`, `eyebrow`, `action` y `theme`, sin realizar ninguna consulta de datos, y SHALL renderizar un encabezado semánticamente correcto para la jerarquía de la página que lo use.

#### Scenario: Se usa SectionHeader en un futuro listado de categoría
- **WHEN** una fase futura renderiza `SectionHeader` con `title` y `eyebrow`
- **THEN** el componente solo consume esas props, sin acceder a Payload

### Requirement: ResponsiveMedia con contrato de accesibilidad
`ResponsiveMedia` SHALL requerir un texto alternativo (`alt`) explícito, gestionar el sizing responsivo y el aspect-ratio, soportar `priority` opcional, y no SHALL realizar ninguna consulta a Payload Media internamente.

#### Scenario: Se usa ResponsiveMedia sin alt
- **WHEN** un desarrollador intenta usar `ResponsiveMedia` sin proveer `alt`
- **THEN** el contrato de tipos del componente lo rechaza en tiempo de compilación

### Requirement: Media de Payload se renderiza sin depender de una lista de hosts fijada en build
Cualquier componente presentacional que renderice Media de Payload (incluyendo, sin limitarse a, `ResponsiveMedia` y `ArticleMetadata`) SHALL mostrar exitosamente esa Media sin importar qué origen de almacenamiento (local o S3-compatible) esté configurado en el entorno de ejecución, y SHALL NOT depender de que ese origen haya sido conocido en el momento del build de la aplicación.

#### Scenario: Media servida desde almacenamiento local en desarrollo
- **WHEN** un componente renderiza Media cuya URL es servida por el almacenamiento local (sin Object Storage S3-compatible configurado)
- **THEN** la imagen se solicita y se muestra correctamente

#### Scenario: Media servida desde un origen S3-compatible en producción
- **WHEN** un componente renderiza Media cuya URL apunta a un origen de Object Storage S3-compatible configurado en el entorno de ejecución
- **THEN** la imagen se solicita directamente a ese origen y se muestra correctamente, sin ser rechazada por el optimizador de imágenes del framework

#### Scenario: El mismo build se reconfigura contra un origen S3-compatible distinto
- **WHEN** la misma imagen construida de la aplicación se ejecuta con un origen de Object Storage S3-compatible diferente al usado en un despliegue anterior, sin reconstruir la aplicación
- **THEN** la Media servida desde el nuevo origen se muestra correctamente

#### Scenario: Ancho, alto y aspect-ratio permanecen estables
- **WHEN** se renderiza Media de Payload bajo cualquier origen de almacenamiento soportado
- **THEN** el espacio reservado en el layout (ancho, alto o aspect-ratio, según corresponda) no cambia respecto al comportamiento ya especificado por el contrato de `ResponsiveMedia`

### Requirement: Breadcrumbs y Pagination presentacionales
`Breadcrumbs` SHALL renderizar una lista de items provista por props (label + href), y `Pagination` SHALL renderizar el estado de página actual/total provisto por props. Ninguno de los dos SHALL resolver rutas ni datos por sí mismo.

#### Scenario: Se usa Pagination en un futuro listado
- **WHEN** una fase futura necesita paginación
- **THEN** le pasa `currentPage`/`totalPages`/navegación por props a `Pagination`, sin que el componente calcule esos valores internamente
