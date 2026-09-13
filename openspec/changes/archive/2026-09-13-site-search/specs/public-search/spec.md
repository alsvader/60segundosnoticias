## Purpose

Ofrece la experiencia pública de búsqueda en `/buscar`, normalizando los resultados del índice de búsqueda en un contrato seguro para el frontend, con paginación, estado vacío y accesibilidad consistentes con el resto del sitio.

## ADDED Requirements

### Requirement: Ruta pública de búsqueda
El sistema SHALL exponer `/buscar` como ruta pública, y SHALL ejecutar una búsqueda cuando la solicitud incluye el parámetro `q`.

#### Scenario: Búsqueda con término
- **WHEN** un usuario visita `/buscar?q=<término>`
- **THEN** el sistema ejecuta una búsqueda y muestra los resultados correspondientes a `<término>`

Referencia: AC-SEARCH-001, AC-SEARCH-002.

### Requirement: Búsqueda vacía no consulta todo el contenido
El sistema SHALL NOT ejecutar una consulta amplia sobre todo el contenido indexado cuando `q` está ausente, vacío o contiene solo espacios en blanco.

#### Scenario: Visitar /buscar sin término
- **WHEN** un usuario visita `/buscar` sin `q`, o con `q` vacío/solo espacios
- **THEN** el sistema muestra un estado de búsqueda inicial sin ejecutar una consulta amplia sobre todo el contenido indexado

Referencia: AC-SEARCH-003.

### Requirement: Resultados usan URLs públicas canónicas
El sistema SHALL construir el destino de cada resultado usando los helpers de URL canónica existentes, según su tipo de contenido de origen.

#### Scenario: Resultado de tipo Post
- **WHEN** un resultado de búsqueda corresponde a un Post
- **THEN** su URL se construye a partir de su `primaryCategory` y su slug, igual que la URL canónica del Post

#### Scenario: Resultado de tipo Page
- **WHEN** un resultado de búsqueda corresponde a una Page
- **THEN** su URL se construye a partir de la URL canónica de esa Page

Referencia: AC-SEARCH-012.

### Requirement: Paginación de resultados
El sistema SHALL paginar los resultados de búsqueda del lado del servidor, SHALL preservar `q` en los enlaces de paginación, y SHALL manejar de forma explícita un número de página inválido o fuera de rango.

#### Scenario: Navegar a la siguiente página
- **WHEN** un usuario navega a `/buscar?q=<término>&page=2`
- **THEN** se muestra la segunda página de resultados para `<término>`, y los enlaces de paginación conservan `q`

#### Scenario: Página fuera de rango
- **WHEN** se solicita una página que no existe para los resultados actuales
- **THEN** el sistema responde con un comportamiento explícito y consistente con el resto del sitio (no un error no controlado)

Referencia: AC-SEARCH-005, AC-SEARCH-006.

### Requirement: Estado vacío
El sistema SHALL mostrar un estado vacío accesible cuando una búsqueda con término no produce resultados.

#### Scenario: Búsqueda sin resultados
- **WHEN** una búsqueda con `q` no encuentra ningún resultado
- **THEN** se muestra un estado vacío con una sugerencia para el usuario

Referencia: AC-SEARCH-007.

### Requirement: Ningún contenido en Draft aparece en los resultados públicos
El sistema SHALL NOT mostrar en `/buscar` ningún Post o Page en estado Draft, bajo ninguna circunstancia.

#### Scenario: Contenido en Draft con texto único
- **WHEN** existe un Post o Page en Draft cuyo contenido no aparece en ninguna versión publicada
- **THEN** ese texto nunca es un resultado de búsqueda público

Referencia: AC-SEARCH-013, AC-DRAFT-003.

### Requirement: Accesibilidad de la interfaz de búsqueda
La interfaz de `/buscar` SHALL incluir un encabezado principal, un campo de búsqueda con etiqueta accesible, un formulario navegable y activable por teclado, y enlaces de resultado descriptivos.

#### Scenario: Uso con teclado
- **WHEN** un usuario navega `/buscar` únicamente con teclado
- **THEN** puede enfocar el campo de búsqueda, enviar la búsqueda, y navegar entre resultados y paginación, con foco visible en todo momento

Referencia: AC-A11Y-001, AC-A11Y-002, AC-A11Y-003, AC-A11Y-005, AC-A11Y-007, AC-A11Y-008.

### Requirement: Comportamiento responsive
La interfaz de `/buscar` SHALL funcionar sin scroll horizontal ni desbordamiento desde mobile hasta desktop.

#### Scenario: Vista en mobile
- **WHEN** `/buscar` se visualiza en un viewport de ancho mobile
- **THEN** el campo de búsqueda, los resultados y la paginación se muestran sin scroll horizontal ni contenido desbordado

Referencia: AC-RESP-001, AC-RESP-002, AC-RESP-006.

### Requirement: Search es descubrible desde la navegación global
El sistema SHALL exponer un punto de entrada visible a Search desde el Header público (desktop) y desde la navegación móvil, además de desde `/buscar` mismo. Ese punto de entrada SHALL navegar a `/buscar?q=<término>` mediante el mismo formulario GET, sin duplicar la lógica de búsqueda.

#### Scenario: Entrada de Search en el Header (desktop)
- **WHEN** un usuario visita cualquier página pública en un viewport de escritorio
- **THEN** el Header expone un control de Search con nombre accesible que revela un campo de búsqueda

#### Scenario: Entrada de Search en la navegación móvil
- **WHEN** un usuario abre la navegación móvil
- **THEN** encuentra un formulario de búsqueda dentro de esa navegación, sin necesitar el Header de escritorio

#### Scenario: `/buscar` sin término muestra su propio formulario
- **WHEN** un usuario visita `/buscar` sin `q`
- **THEN** ve un formulario de búsqueda visible, no una página vacía

Referencia: refinamiento de UX aprobado explícitamente (Header/MobileNav no eran requisito original de Fase 9, ver design.md).

### Requirement: `/buscar` no se trata como destino indexable
El sistema SHALL excluir `/buscar` de `sitemap.xml` y `/llms.txt`, y SHALL señalizar sus páginas de resultado como no indexables para buscadores.

#### Scenario: Metadata de una página de resultados
- **WHEN** se solicita `/buscar?q=<término>`
- **THEN** su metadata indica a los buscadores que no debe indexarse, y la URL no aparece en `sitemap.xml` ni en `/llms.txt`

Referencia: §36/§53 del Master Spec.
