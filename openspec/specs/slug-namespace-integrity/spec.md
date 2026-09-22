## Purpose

Garantiza que los slugs de `Categories` y `Pages` no colisionen entre sí ni con rutas reservadas del sitio, protegiendo el namespace raíz compartido `/[slug]`, tanto para slugs escritos a mano como para los generados automáticamente.

## Requirements

### Requirement: Constante compartida de reserved slugs
El sistema SHALL definir una única constante compartida con los reserved slugs del sitio (como mínimo `buscar`, `admin`, `api`, `preview`, `media`, `autor`, `tag`, `_next`), usada por la validación de `Categories` y `Pages`.

#### Scenario: fuente única de reserved slugs
- **WHEN** se necesita validar un slug contra la lista de reserved slugs
- **THEN** tanto `Categories` como `Pages` consultan la misma constante compartida

Referencia: §6.3 del Master Spec

### Requirement: Validación de reserved slugs en Categories y Pages
`Categories` y `Pages` SHALL rechazar un `slug` que coincida con un reserved slug.

#### Scenario: intento de usar un reserved slug
- **WHEN** se intenta guardar una Category o una Page con `slug: "admin"`
- **THEN** la operación es rechazada

Referencia: AC-ROUTE-002

### Requirement: Prevención de colisión entre Categories y Pages
El sistema SHALL impedir que una `Category` y una `Page` compartan el mismo `slug`, dado que ambas Collections comparten el namespace raíz `/[slug]`.

#### Scenario: Page intenta usar el slug de una Category existente
- **WHEN** se intenta crear una Page con el mismo `slug` que una Category ya existente
- **THEN** la operación es rechazada

#### Scenario: Category intenta usar el slug de una Page existente
- **WHEN** se intenta crear una Category con el mismo `slug` que una Page ya existente
- **THEN** la operación es rechazada

Referencia: AC-ROUTE-001, §6.2 del Master Spec

### Requirement: La generación automática respeta el namespace raíz
Cuando el sistema genera el `slug` de una `Category` o una `Page` desde su campo fuente, el valor generado SHALL NOT coincidir con un reserved slug ni con el `slug` de un documento de la otra Collection del namespace raíz `/[slug]`. Si coincide, el sistema SHALL agregar el primer sufijo numérico libre (`-2`, `-3`, …).

#### Scenario: Page cuyo título es un reserved slug
- **WHEN** se crea una Page con `title: "Admin"` sin `slug`
- **THEN** la Page recibe `slug: "admin-2"` y la operación no es rechazada

#### Scenario: Page cuyo título coincide con una Category existente
- **WHEN** existe una Category con `slug: "deportes"` y se crea una Page con `title: "Deportes"` sin `slug`
- **THEN** la Page recibe `slug: "deportes-2"`

#### Scenario: slug explícito reservado sigue rechazado
- **WHEN** se crea una Category con `slug: "admin"` explícito
- **THEN** la operación es rechazada

Referencia: AC-ROUTE-001, AC-ROUTE-002, §6.2, §6.3 del Master Spec
