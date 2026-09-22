## ADDED Requirements

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
