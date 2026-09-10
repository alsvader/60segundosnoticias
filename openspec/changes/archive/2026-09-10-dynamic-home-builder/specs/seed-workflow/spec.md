## MODIFIED Requirements

### Requirement: seed:initial pobla solo entidades con schema ya implementado
El script `seed:initial` SHALL crear únicamente datos correspondientes a Collections y Globals cuyo schema ya existe en el proyecto (Categories iniciales y, ahora que su schema existe, una configuración base de `Home`); SHALL NOT crear ni simular datos de Globals que aún no están implementados (`Navigation`, `SiteSettings`). La configuración base de `Home` SHALL ser idempotente, SHALL NOT depender de Posts de prueba, y SHALL NOT sobrescribir una configuración de `Home` ya guardada por un administrador.

#### Scenario: ejecutar seed:initial en esta fase
- **WHEN** se ejecuta `seed:initial` en el estado actual del proyecto
- **THEN** se crean las Categories iniciales y una configuración base de `Home` compuesta únicamente por bloques que no requieren Posts reales (por ejemplo `CategoryExplorer` con las categorías iniciales); no se crea ni se referencia ningún otro Global

#### Scenario: seed:initial no sobrescribe una Home ya configurada por un administrador
- **WHEN** `seed:initial` se ejecuta sobre una base de datos donde un administrador ya guardó y publicó una configuración de `Home`
- **THEN** la configuración de `Home` existente no se modifica

Referencia: §68 del Master Spec

## ADDED Requirements

### Requirement: seed:dev puede configurar bloques de Home representativos
El script `seed:dev` SHALL poder configurar bloques de Home representativos (por ejemplo `LatestPosts`, `FeaturedPosts` o `EditorialIntro`) usando el contenido de desarrollo que el propio `seed:dev` crea. Esta configuración SHALL permanecer explícitamente invocada y SHALL NOT ejecutarse automáticamente como parte del arranque de la aplicación ni de un despliegue de producción. Un `EditorialIntroBlock` de desarrollo SHALL usar Media de desarrollo ya creada por `seed:dev`, sin depender de contenido de producción; su copy (`headlinePrimary`/`headlineAccent`/`description`) es contenido de demostración definido en el propio script, no hardcodeado en el componente React.

#### Scenario: seed:dev configura Home con contenido de desarrollo
- **WHEN** se ejecuta `seed:dev` después de que existan Posts, Categories y Media de desarrollo
- **THEN** los bloques de Home configurados por `seed:dev` (incluido `EditorialIntro`, si se configura) referencian ese contenido de desarrollo, sin crear Posts de producción falsos

Referencia: §68 del Master Spec
