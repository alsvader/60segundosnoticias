## MODIFIED Requirements

### Requirement: Globals Navigation, Footer y SiteSettings accesibles vía DAL
El sistema SHALL definir los Payload Globals `Navigation`, `Footer`, `SiteSettings` y `Home`, y el DAL SHALL exponer `getNavigation()`, `getFooter()`, `getSettings()` y `getHome()` para leerlos, cada uno vía Payload Local API con `overrideAccess: false`.

#### Scenario: El site shell necesita la configuración de navegación
- **WHEN** el layout público necesita los items de navegación
- **THEN** llama a `getNavigation()`, que lee el Global `Navigation` vía Payload Local API con `overrideAccess: false`

#### Scenario: Se busca el Global Home
- **WHEN** se revisan los Globals definidos en `payload.config.ts`
- **THEN** existe un Global `Home`

#### Scenario: La página de inicio necesita el layout de Home
- **WHEN** la página pública `/` necesita el layout configurado de Home
- **THEN** llama a `getHome()`, que lee el Global `Home` vía Payload Local API con `overrideAccess: false` y devuelve únicamente el estado publicado
