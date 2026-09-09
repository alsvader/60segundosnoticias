## ADDED Requirements

### Requirement: Eliminación de Categories bloqueada mientras existan Posts que las referencian
El sistema SHALL rechazar la eliminación de una `Category` mientras existan Posts que la referencien como `primaryCategory` o dentro de `additionalCategories`.

#### Scenario: intentar eliminar una Category referenciada
- **WHEN** un Admin intenta eliminar una `Category` que al menos un Post referencia como `primaryCategory` o en `additionalCategories`
- **THEN** la eliminación es rechazada

#### Scenario: eliminar una Category sin Posts que la referencien
- **WHEN** un Admin elimina una `Category` que ningún Post referencia
- **THEN** la eliminación se completa

Referencia: AC-CAT-006
