# category-page Specification

## Purpose

Define el listado público paginado de Posts de una Category, con su identidad visual y las reglas de membership inclusivo ya establecidas en Fase 6 para `PostsByCategory`.

## Requirements

### Requirement: Membership inclusivo del listado
El listado de una Category SHALL incluir todo Post publicado donde la Category sea `primaryCategory` O esté presente en `additionalCategories`, ordenado por `publishedAt` descendente.

#### Scenario: Post con la categoría como primaria
- **WHEN** un Post publicado tiene la Category como `primaryCategory`
- **THEN** aparece en el listado de esa Category

#### Scenario: Post con la categoría como adicional
- **WHEN** un Post publicado tiene la Category únicamente en `additionalCategories`
- **THEN** también aparece en el listado de esa Category

#### Scenario: Post en draft
- **WHEN** un Post en draft tiene la Category como primaria o adicional
- **THEN** nunca aparece en el listado

Referencia: AC-FE-CAT-002, AC-FE-CAT-003, AC-FE-CAT-004

### Requirement: Paginación server-side
El listado SHALL paginarse en el servidor con 12 Posts por página, usando el parámetro de query `?page=N`. La página 1 SHALL ser alcanzable por la URL base de la Category sin requerir `?page=1`. Un valor de `page` inválido, no positivo, no numérico o fuera de rango SHALL responder 404.

#### Scenario: Segunda página
- **WHEN** la Category tiene más de 12 Posts publicados y se solicita `?page=2`
- **THEN** se devuelve el siguiente conjunto de hasta 12 Posts

#### Scenario: Página fuera de rango
- **WHEN** se solicita `?page=99` y la Category no tiene tantas páginas de resultados
- **THEN** se responde 404

#### Scenario: Página inválida
- **WHEN** se solicita `?page=abc` o `?page=0`
- **THEN** se responde 404

Referencia: AC-FE-CAT-005, §33 del Master Spec

### Requirement: Composición visual de la Category Page
La Category Page SHALL incluir breadcrumb, un encabezado con nombre/descripción opcional/colorTheme/icon/imagen de la Category, el listado de Posts y la paginación.

#### Scenario: Category con descripción configurada
- **WHEN** la Category tiene `description`
- **THEN** se muestra en el encabezado

#### Scenario: Category sin descripción
- **WHEN** la Category no tiene `description`
- **THEN** el encabezado se renderiza sin ese elemento, sin romper el layout

Referencia: §33 del Master Spec

### Requirement: Un único H1 en la Category Page
El encabezado de la Category Page SHALL ser el único elemento dueño del `<h1>` de la página.

#### Scenario: Verificación de jerarquía de encabezados
- **WHEN** se inspecciona el DOM renderizado de una Category Page
- **THEN** existe exactamente un `<h1>`

Referencia: AC-A11Y-005, §62 del Master Spec
