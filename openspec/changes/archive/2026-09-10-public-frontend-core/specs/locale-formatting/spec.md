## Purpose

Centraliza el formato de fechas en `es-MX` sobre APIs nativas de la plataforma, para que ningún componente configure `Intl.DateTimeFormat` de forma dispersa.

## ADDED Requirements

### Requirement: Utilidad centralizada de formato de fecha
El sistema SHALL exponer una utilidad centralizada que formatee fechas (`publishedAt` y similares) en `es-MX` usando `Intl.DateTimeFormat`, sin introducir una librería de fechas nueva. Ningún componente SHALL instanciar `Intl.DateTimeFormat` de forma independiente para contenido editorial.

#### Scenario: Se formatea la fecha de publicación de un Post
- **WHEN** el mapper de `ArticleCardData`/`ArticleMetadata` necesita una fecha de publicación legible
- **THEN** usa la utilidad centralizada de formato, que produce el string ya en `es-MX`

#### Scenario: Se revisan las dependencias tras este change
- **WHEN** se inspeccionan las dependencias de runtime
- **THEN** no se ha añadido `date-fns`, `dayjs` ni ninguna librería de fechas
