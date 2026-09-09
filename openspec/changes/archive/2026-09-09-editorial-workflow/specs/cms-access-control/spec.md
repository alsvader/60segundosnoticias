## ADDED Requirements

### Requirement: Alcance de lectura de Posts para Writer y Admin
La lectura autenticada de `Posts` SHALL respetar el siguiente alcance: un Writer SHALL poder leer todos sus propios Posts (incluidos los que están en Draft) y los Posts publicados de cualquier autor, pero SHALL NOT poder leer los Posts en Draft de otro Writer; un Admin SHALL poder leer todos los Posts sin restricción.

#### Scenario: Writer lee su propio draft
- **WHEN** un Writer solicita un Post propio en estado Draft
- **THEN** el Post se devuelve

#### Scenario: Writer lee un Post publicado de otro autor
- **WHEN** un Writer solicita un Post publicado cuyo `author` es otro Writer
- **THEN** el Post se devuelve

#### Scenario: Writer intenta leer el draft de otro Writer
- **WHEN** un Writer solicita un Post en Draft cuyo `author` es otro Writer
- **THEN** el Post no se devuelve

#### Scenario: Admin lee cualquier Post
- **WHEN** un Admin solicita cualquier Post, publicado o en Draft, de cualquier autor
- **THEN** el Post se devuelve

Referencia: AC-DRAFT-002, AC-PERM-002, §7.3 del Master Spec
