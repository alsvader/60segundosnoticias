## Purpose

Define el comportamiento del renderer que traduce el layout resuelto de Home en los Section components correspondientes, garantizando que un bloque inválido o desconocido nunca rompa la página completa.

## ADDED Requirements

### Requirement: Renderizado exhaustivo de los tipos de bloque soportados
El sistema SHALL proveer un `HomeBlockRenderer` que maneje explícitamente cada uno de los 8 tipos de bloque de Home V1 (`EditorialIntro`, `HeroNews`, `CategoryExplorer`, `LatestPosts`, `PostsByCategory`, `FeaturedPosts`, `VideoFeature`, `Banner`), renderizando la Section correspondiente a cada uno.

#### Scenario: Home con los 8 tipos de bloque configurados
- **WHEN** el layout resuelto de Home contiene una instancia de cada uno de los 8 tipos de bloque soportados
- **THEN** `HomeBlockRenderer` renderiza las 8 Sections correspondientes en el orden resuelto

Referencia: §19.1, §61 del Master Spec

### Requirement: Bloque desconocido o malformado no rompe la página
Si el layout resuelto de Home contiene un bloque de un tipo no reconocido, o un bloque cuya resolución falló, `HomeBlockRenderer` SHALL omitir ese bloque, registrar una advertencia, y SHALL continuar renderizando el resto de los bloques válidos sin producir un error que rompa la página completa.

#### Scenario: Home contiene un tipo de bloque no reconocido
- **WHEN** el layout resuelto de Home incluye un bloque cuyo tipo no está entre los 7 soportados
- **THEN** ese bloque se omite con una advertencia registrada, y el resto de la página se renderiza normalmente

Referencia: §61 del Master Spec

### Requirement: Home mantiene un único encabezado H1 principal
Independientemente del tipo, cantidad u orden de los bloques configurados por el Admin, la página de Home SHALL exponer exactamente un encabezado H1 principal. Los encabezados de sección producidos por cada bloque SHALL usar un nivel de encabezado subordinado (H2 o inferior).

#### Scenario: Admin reordena HeroNews fuera de la primera posición
- **WHEN** el Admin configura el layout de Home de forma que `HeroNews` no sea el primer bloque
- **THEN** la página renderizada sigue exponiendo exactamente un H1, sin duplicarlo ni omitirlo

Referencia: AC-A11Y-005, §62 del Master Spec

### Requirement: Home sin bloques configurados degrada de forma segura
Si el layout publicado de `Home` no contiene ningún bloque, la página de Home SHALL renderizarse dentro del site shell (Header/Footer) sin producir un error.

#### Scenario: Home publicada sin bloques
- **WHEN** el layout publicado de `Home` está vacío
- **THEN** la página `/` se renderiza con el site shell y sin bloques de contenido, sin lanzar un error

Referencia: §61 del Master Spec
