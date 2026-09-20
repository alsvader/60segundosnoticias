## Purpose

Define el contrato observable de cómo una release llega a producción en el modelo simplificado — Dokploy construye y despliega solo desde `main`, sin aprobación humana intermedia — y cómo se revierte cuando algo sale mal.

## ADDED Requirements

### Requirement: Dokploy construye la imagen de producción, no GitHub Actions
El artefacto de despliegue de producción (`compose.dokploy.yaml`) SHALL construirse a partir del código fuente (`build:` sobre el `Dockerfile` del repositorio) en el momento del despliegue, en vez de depender de una imagen pre-construida y publicada por un sistema externo.

#### Scenario: Se despliega un push a main
- **WHEN** un commit llega a la rama `main`
- **THEN** el mecanismo de despliegue construye las imágenes `runner`/`migrator` desde el `Dockerfile` de ese commit, sin depender de un registro de imágenes externo

### Requirement: El gate de calidad obligatorio corre antes del merge, no antes del despliegue
El repositorio SHALL exigir que la suite de calidad obligatoria (typecheck, lint, unit, integración, E2E chromium) pase en cada Pull Request antes de permitir el merge a `main`; el despliegue a producción SHALL NOT depender de una re-ejecución de esa suite después del merge.

#### Scenario: Un PR con la suite en verde se mergea
- **WHEN** un Pull Request pasa la suite de calidad obligatoria
- **THEN** puede mergearse a `main`, y ese merge por sí solo es suficiente para que el despliegue a producción proceda

#### Scenario: Un PR con la suite en rojo
- **WHEN** un Pull Request no pasa la suite de calidad obligatoria
- **THEN** el merge a `main` SHALL NOT permitirse

### Requirement: El despliegue a producción no requiere aprobación humana explícita
Tras un merge exitoso a `main`, el despliegue a producción SHALL proceder automáticamente, sin quedar detenido esperando una aprobación humana adicional.

#### Scenario: Un merge a main dispara el despliegue
- **WHEN** un commit llega a `main` (ya habiendo pasado el gate de PR)
- **THEN** el mecanismo de despliegue construye y despliega esa release sin pausa de aprobación intermedia

### Requirement: Un despliegue fallido nunca se revierte automáticamente
Si el job de migración de una release falla, el despliegue SHALL detenerse sin reemplazar el container de aplicación en ejecución, y la release anterior SHALL continuar sirviendo tráfico; el mecanismo de despliegue SHALL NOT intentar revertir, reiniciar, ni detener servicios automáticamente.

#### Scenario: El job de migración falla
- **WHEN** el job de migración de la nueva release termina con error
- **THEN** el container de aplicación de la release anterior sigue sirviendo tráfico, y no se ejecuta ninguna acción de reversión automática

### Requirement: El rollback por reversión de árbol nunca reescribe ni fuerza el historial de main
Un rollback SHALL poder solicitarse especificando un commit anterior de `main` conocido como bueno; el mecanismo de rollback SHALL dejar el árbol de trabajo de `main` idéntico al de ese commit mediante un nuevo commit hacia adelante, y SHALL NOT reescribir el historial existente ni requerir un push forzado.

#### Scenario: Se solicita un rollback a un commit anterior
- **WHEN** un operador solicita un rollback especificando un commit ya presente en el historial de `main`
- **THEN** el mecanismo de rollback produce un nuevo commit en `main` cuyo árbol coincide con el del commit objetivo, y lo publica sin reescribir historia existente

#### Scenario: El commit objetivo no pertenece al historial de main
- **WHEN** el commit especificado para el rollback no es un ancestro de `main`
- **THEN** el rollback SHALL rechazarse antes de modificar `main`

### Requirement: Un rollback de aplicación se documenta explícitamente como distinto de un rollback de esquema
Todo mecanismo de rollback SHALL advertir explícitamente que revierte únicamente el código de la aplicación, nunca el esquema de la base de datos, dado que las migraciones son forward-only.

#### Scenario: Se completa un rollback
- **WHEN** un rollback termina, exitoso o no
- **THEN** el registro de esa corrida SHALL indicar explícitamente que no revierte el esquema de base de datos, y que un cambio de esquema incompatible requiere dump + fix-forward
