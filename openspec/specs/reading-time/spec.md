## Purpose

Garantiza que el tiempo estimado de lectura de un Post se calcule automáticamente a partir de su contenido, sin depender de que una persona editora lo mantenga manualmente.

## Requirements

### Requirement: Cálculo automático de readingTimeMinutes
El sistema SHALL calcular `readingTimeMinutes` a partir del texto del campo `content` de un Post, usando una referencia de aproximadamente 200 palabras por minuto, cada vez que el Post se guarda.

#### Scenario: guardar un Post con contenido
- **WHEN** se guarda un Post cuyo `content` tiene texto
- **THEN** `readingTimeMinutes` refleja una estimación derivada de ese contenido

Referencia: AC-READ-001, §9.7 del Master Spec

### Requirement: readingTimeMinutes no es editable manualmente
Un valor de `readingTimeMinutes` enviado explícitamente por el cliente SHALL ser ignorado; el sistema SHALL sobrescribirlo siempre con el valor calculado.

#### Scenario: intento de establecer readingTimeMinutes manualmente
- **WHEN** una petición de creación o actualización de un Post incluye un valor explícito de `readingTimeMinutes`
- **THEN** el valor guardado es el calculado por el sistema, no el enviado

Referencia: AC-READ-002

### Requirement: readingTimeMinutes se actualiza cuando cambia el contenido
Si el `content` de un Post cambia, `readingTimeMinutes` SHALL recalcularse en ese mismo guardado.

#### Scenario: editar el contenido de un Post existente
- **WHEN** se actualiza el `content` de un Post ya existente
- **THEN** `readingTimeMinutes` se recalcula para reflejar el nuevo contenido

Referencia: AC-READ-001
