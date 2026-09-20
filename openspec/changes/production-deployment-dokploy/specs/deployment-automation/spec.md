## Purpose

Define el contrato observable entre la pipeline de CI que ya califica y publica imágenes inmutables por SHA, y el despliegue real de esas imágenes al VPS con Dokploy: qué se entrega, cómo se confirma que la release correcta quedó sirviendo tráfico, y qué queda registrado cuando el despliegue falla o se revierte.

## ADDED Requirements

### Requirement: Solo imágenes inmutables por SHA son desplegables
El mecanismo de entrega SHALL rechazar cualquier valor de imagen que no tenga la forma de un tag inmutable por SHA de Git para el rol correspondiente (`runner` o `migrator`); un alias mutable (por ejemplo, uno que apunte a la rama en lugar de a un commit específico) SHALL NOT poder desplegarse.

#### Scenario: Se intenta desplegar un alias mutable
- **WHEN** el valor propuesto para `RUNNER_IMAGE` o `MIGRATOR_IMAGE` no corresponde a un tag inmutable por SHA
- **THEN** el mecanismo de entrega SHALL rechazar el despliegue antes de aplicarlo

#### Scenario: Se despliega un tag inmutable válido
- **WHEN** el valor propuesto corresponde a un tag inmutable por SHA ya publicado en el registro de imágenes
- **THEN** el despliegue SHALL proceder usando exactamente ese valor

### Requirement: El despliegue automático se detiene esperando aprobación humana
Tras una calificación FULL exitosa en la rama principal, el despliegue a producción SHALL quedar detenido esperando una aprobación humana explícita antes de aplicarse al VPS; SHALL NOT aplicarse automáticamente sin esa aprobación.

#### Scenario: Calificación FULL exitosa en la rama principal
- **WHEN** la calificación FULL de un commit en la rama principal termina exitosamente
- **THEN** el despliegue a producción queda pendiente de aprobación humana antes de tocar el VPS

#### Scenario: Aprobación otorgada
- **WHEN** un revisor autorizado aprueba el despliegue pendiente
- **THEN** el despliegue procede a aplicarse al VPS usando las imágenes ya calificadas

Referencia: AC-CI-001, AC-CI-003

### Requirement: La actualización del entorno de despliegue no expone secretos
Al preparar el entorno de despliegue para Dokploy, cualquier valor de configuración sensible SHALL NOT aparecer en texto plano en los logs del proceso de despliegue.

#### Scenario: El proceso de despliegue registra su progreso
- **WHEN** el mecanismo de entrega lee o escribe el entorno de despliegue
- **THEN** los logs generados SHALL NOT contener el valor en texto plano de ningún secreto de runtime

Referencia: AC-SEC-004, AC-SEC-010

### Requirement: El despliegue se considera completo solo cuando la release correcta queda sirviendo tráfico
Un despliegue SHALL NOT reportarse como exitoso hasta que se confirme, mediante una señal observable del propio sistema en ejecución, que la release correspondiente al SHA desplegado — y no una release anterior — está respondiendo tráfico.

#### Scenario: La release anterior sigue respondiendo durante la transición
- **WHEN** el despliegue está en curso y la aplicación todavía responde con el SHA de la release anterior
- **THEN** el despliegue SHALL NOT reportarse como exitoso todavía

#### Scenario: La release nueva queda confirmada sirviendo tráfico
- **WHEN** la aplicación responde de forma sostenida con el SHA de la release recién desplegada
- **THEN** el despliegue SHALL reportarse como exitoso

Referencia: AC-HEALTH-001, AC-HEALTH-002

### Requirement: Un smoke post-despliegue verifica las rutas públicas críticas
Tras confirmar que la release correcta quedó sirviendo tráfico, el mecanismo de entrega SHALL verificar que un conjunto representativo de rutas públicas de producción (incluyendo el estado de salud, una página de contenido, y la búsqueda) responde exitosamente antes de dar por completo el despliegue.

#### Scenario: Todas las rutas del smoke responden exitosamente
- **WHEN** se ejecuta el smoke post-despliegue contra la URL pública de producción
- **THEN** cada ruta verificada SHALL responder con un código de éxito

#### Scenario: Una ruta del smoke falla
- **WHEN** alguna ruta verificada por el smoke no responde exitosamente
- **THEN** el despliegue SHALL marcarse como fallido aunque las demás señales hayan sido positivas

### Requirement: Un despliegue fallido nunca se revierte automáticamente
Si un despliegue falla en cualquiera de sus verificaciones, el mecanismo de entrega SHALL NOT intentar revertirlo, reiniciarlo, ni detener servicios automáticamente; SHALL dejar constancia de la falla para que un operador decida la siguiente acción.

#### Scenario: El despliegue falla una de sus verificaciones
- **WHEN** el despliegue no logra confirmar que la release correcta quedó sirviendo tráfico, o el smoke post-despliegue falla
- **THEN** el mecanismo de entrega SHALL NOT ejecutar ninguna acción de reversión automática, y SHALL producir un registro observable de la falla que indique qué release quedó sirviendo tráfico realmente

### Requirement: El rollback despliega una imagen ya construida, nunca reconstruye
Un rollback a un SHA anterior SHALL reutilizar el mismo mecanismo de entrega y las mismas verificaciones que un despliegue nuevo, seleccionando una imagen inmutable ya publicada; SHALL NOT reconstruir la imagen a partir del código fuente.

#### Scenario: Se solicita un rollback a un SHA anterior
- **WHEN** un operador solicita un rollback especificando un SHA de una release previamente publicada
- **THEN** el mecanismo de entrega SHALL desplegar las imágenes ya publicadas para ese SHA sin reconstruirlas

#### Scenario: El SHA solicitado no tiene imágenes publicadas
- **WHEN** el SHA solicitado para el rollback no corresponde a imágenes ya publicadas en el registro
- **THEN** el rollback SHALL rechazarse antes de intentar aplicarse

### Requirement: El registro de provenance refleja el resultado real del despliegue
Al finalizar un intento de despliegue a producción, SHALL quedar registrado un resumen observable con al menos: el SHA desplegado, si el despliegue tuvo éxito o falló, y — en caso de falla — qué release quedó sirviendo tráfico.

#### Scenario: Un despliegue exitoso queda registrado
- **WHEN** un despliegue se completa exitosamente
- **THEN** el registro de esa corrida SHALL indicar el SHA desplegado y su resultado exitoso

#### Scenario: Un despliegue fallido queda registrado sin ambigüedad
- **WHEN** un despliegue falla
- **THEN** el registro de esa corrida SHALL indicar la falla y qué release quedó sirviendo tráfico, sin describirlo como un despliegue exitoso
