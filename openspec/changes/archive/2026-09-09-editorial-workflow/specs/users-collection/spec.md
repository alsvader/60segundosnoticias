## ADDED Requirements

### Requirement: Eliminación de Users bloqueada mientras existan Posts que los referencian
El sistema SHALL rechazar la eliminación de un `User` mientras existan Posts cuyo `author` sea ese `User`; un Admin SHALL reasignar esos Posts a otro autor antes de poder eliminarlo.

#### Scenario: intentar eliminar un User con Posts propios
- **WHEN** un Admin intenta eliminar un `User` que es `author` de al menos un Post
- **THEN** la eliminación es rechazada

#### Scenario: eliminar un User sin Posts propios
- **WHEN** un Admin elimina un `User` que no es `author` de ningún Post
- **THEN** la eliminación se completa

Referencia: §14.2 del Master Spec
