## Purpose

Normaliza documentos y relaciones de Payload hacia los contratos frontend ya establecidos en Fase 4 (`ArticleCardData`, `CategoryCardData`) y nuevos (`AuthorSummary`, `MediaData`, enlaces resueltos), para que los componentes presentacionales nunca dependan de la forma interna de Payload.

## ADDED Requirements

### Requirement: Los componentes presentacionales no reciben documentos Payload completos
`ArticleCard`, `CategoryCard`, `Header`, `Footer` y cualquier otro componente presentacional SHALL recibir únicamente los contratos de view model definidos, nunca un `Post`, `Category`, `User` o `Media` completo de `payload-types.ts`, ni consultar Payload por sí mismos.

#### Scenario: Se renderiza un listado de Posts reales
- **WHEN** una página compone `ArticleCard` con Posts reales
- **THEN** le pasa un objeto `ArticleCardData` producido por un mapper, no el `Post` original

### Requirement: AuthorSummary excluye campos privados de Users
El mapper de autor SHALL exponer únicamente `displayName`, `slug`, `avatar` y, cuando corresponda, `bio`/`socialLinks`. No SHALL exponer `email`, `role`, `active` ni ningún dato de autenticación.

#### Scenario: Se mapea un Post con autor a ArticleCardData
- **WHEN** se normaliza el `author` de un Post hacia `AuthorSummary`
- **THEN** el resultado no contiene `email`, `role` ni `active`, incluso si el documento de Payload consultado los incluye

Referencia: AC-USER-008

### Requirement: Solo view models con consumidor real en esta change
El sistema SHALL crear únicamente los mappers/contratos con un consumidor concreto en esta change (`ArticleCardData`, `CategoryCardData`, `AuthorSummary`, `MediaData`, enlaces de Navigation/Footer). No SHALL crearse un contrato especulativo sin uso en Fase 5.

#### Scenario: Se evalúa crear un nuevo view model
- **WHEN** se considera añadir un nuevo contrato de view model
- **THEN** existe un componente o página de esta change que lo consume; si no existe, no se crea

### Requirement: Selección de tamaño de imagen apropiado
El mapper de Media hacia `MediaData` SHALL seleccionar un tamaño generado por Payload apropiado al contexto (por ejemplo `card`/`tablet` para tarjetas), sin usar por defecto el tamaño `hero` en contextos de listado.

#### Scenario: Se mapea la imagen destacada de un Post para una tarjeta
- **WHEN** se normaliza `featuredImage` de un Post hacia `MediaData` para `ArticleCard`
- **THEN** el `src` resultante usa un tamaño de imagen apto para tarjeta, no el tamaño `hero`

Referencia: AC-MEDIA-004

### Requirement: Category theme/icon permanecen controlados en el mapeo
El mapper de Category hacia `CategoryCardData` SHALL preservar `colorTheme`/`icon` como las keys controladas ya validadas por el CMS (Fase 2) y consumidas por el sistema de category theme (Fase 4), sin introducir un valor de color o icono arbitrario en el view model.

#### Scenario: Se mapea una Category real a CategoryCardData
- **WHEN** se normaliza una Category con `colorTheme: 'blue'` e `icon: 'video'`
- **THEN** `CategoryCardData` conserva esas keys tal cual, para que `CategoryCard` las resuelva con el mecanismo ya existente
