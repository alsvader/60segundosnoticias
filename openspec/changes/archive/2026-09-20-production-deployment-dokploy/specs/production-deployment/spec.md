## ADDED Requirements

### Requirement: La entrega a producción usa exclusivamente imágenes inmutables ya calificadas
Un despliegue de producción SHALL desplegar únicamente imágenes que ya hayan pasado la calificación FULL y que estén identificadas por un tag inmutable por SHA de Git; SHALL NOT desplegar una imagen construida directamente en el VPS ni un tag mutable que pueda apuntar a un commit distinto con el tiempo.

#### Scenario: Despliegue de una imagen ya calificada
- **WHEN** se despliega una release a producción
- **THEN** la imagen desplegada SHALL corresponder a un tag inmutable por SHA que ya pasó la calificación FULL

#### Scenario: El VPS no construye imágenes
- **WHEN** se prepara un despliegue de producción
- **THEN** el VPS SHALL únicamente descargar y ejecutar la imagen ya construida, SHALL NOT ejecutar un build de la imagen

Referencia: AC-DOCKER-010, AC-DOCKER-011, AC-CI-002

### Requirement: El despliegue a producción requiere aprobación humana explícita
Ningún despliegue SHALL alcanzar el VPS de producción sin que un humano autorizado lo haya aprobado explícitamente, incluso cuando la calificación FULL haya pasado automáticamente.

#### Scenario: Calificación FULL exitosa sin aprobación
- **WHEN** la calificación FULL de una release termina exitosamente pero ningún revisor ha aprobado el despliegue
- **THEN** la release SHALL NOT aplicarse al VPS de producción

#### Scenario: Aprobación explícita otorgada
- **WHEN** un revisor autorizado aprueba explícitamente el despliegue de una release calificada
- **THEN** el despliegue SHALL poder aplicarse al VPS de producción

Referencia: AC-CI-001, AC-CI-003
