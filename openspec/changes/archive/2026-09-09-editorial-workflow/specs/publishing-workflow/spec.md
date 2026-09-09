## Purpose

Define cuándo un Post puede transicionar a estado publicado y cómo se gestiona `publishedAt` a lo largo de su ciclo de vida editorial, incluyendo ediciones posteriores, despublicación/republicación y restauración de versiones.

## ADDED Requirements

### Requirement: Validación de campos obligatorios al publicar
Antes de que un Post transicione a `_status: published`, el sistema SHALL validar que `title`, `slug`, `excerpt`, `featuredImage`, `primaryCategory`, `author` y `content` tengan un valor; si falta alguno, la transición a publicado SHALL ser rechazada. Estos campos SHALL permanecer opcionales mientras el Post está en Draft.

#### Scenario: guardar un draft incompleto
- **WHEN** un Writer guarda un Post en Draft sin completar todos los campos requeridos para publicar
- **THEN** el guardado como Draft es exitoso

#### Scenario: intentar publicar un Post incompleto
- **WHEN** se intenta transicionar a `_status: published` un Post al que le falta alguno de los campos requeridos para publicar
- **THEN** la transición es rechazada y el Post permanece en Draft

#### Scenario: publicar un Post completo
- **WHEN** se intenta transicionar a `_status: published` un Post que tiene todos los campos requeridos completos
- **THEN** la transición es exitosa

Referencia: AC-PUB-001, AC-DRAFT-001

### Requirement: publishedAt se asigna una sola vez
La primera vez que un Post transiciona a `_status: published`, el sistema SHALL asignar `publishedAt` a la fecha/hora de esa transición si el campo aún no tiene valor.

#### Scenario: primera publicación de un Post
- **WHEN** un Post sin `publishedAt` transiciona a publicado por primera vez
- **THEN** `publishedAt` queda establecido a ese momento

Referencia: AC-PUB-002

### Requirement: publishedAt permanece estable
Una vez asignado, `publishedAt` SHALL NOT cambiar por ediciones posteriores del Post, por un ciclo de despublicar/republicar, ni por la restauración de una versión anterior; `updatedAt` SHALL seguir reflejando la última modificación de forma nativa.

#### Scenario: editar un Post ya publicado
- **WHEN** se edita y guarda un Post que ya tiene `publishedAt`
- **THEN** `publishedAt` no cambia

#### Scenario: despublicar y volver a publicar
- **WHEN** un Post publicado se despublica y luego se vuelve a publicar
- **THEN** `publishedAt` conserva el valor de la primera publicación

#### Scenario: restaurar una versión anterior
- **WHEN** se restaura una versión anterior de un Post que ya fue publicado alguna vez
- **THEN** `publishedAt` conserva su valor original y no se reemplaza por `null` ni por el valor que tuviera esa versión anterior

Referencia: AC-PUB-003, AC-PUB-004, AC-VER-004, AC-VER-005

### Requirement: Un Post nunca publicado no tiene publishedAt
Un Post que nunca transicionó a `_status: published` SHALL NOT tener un valor en `publishedAt`.

#### Scenario: Post que solo existe como draft
- **WHEN** se consulta un Post que nunca fue publicado
- **THEN** su `publishedAt` es `null`/vacío

Referencia: §30.5 del Master Spec

### Requirement: Writer publica y despublica solo sus propios Posts
Un Writer SHALL poder publicar y despublicar únicamente los Posts cuyo `author` sea él mismo; un Admin SHALL poder publicar y despublicar cualquier Post.

#### Scenario: Writer despublica su propio Post
- **WHEN** un Writer transiciona a Draft un Post propio previamente publicado
- **THEN** la operación es permitida

#### Scenario: Writer intenta publicar el Post de otro Writer
- **WHEN** un Writer intenta transicionar a publicado un Post cuyo `author` es otro Writer
- **THEN** la operación es rechazada

Referencia: AC-PERM-001, AC-PERM-002, §7.3 del Master Spec
