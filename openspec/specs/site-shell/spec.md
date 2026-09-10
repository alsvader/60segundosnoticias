## Purpose

Construye el shell público (Header, Footer, integración de SiteSettings) alimentado por los nuevos Globals administrables, manteniendo los componentes de UI presentacionales y sin implementar el Home editorial.

## Requirements

### Requirement: Header y Footer son presentacionales
`Header` y `Footer` SHALL recibir sus datos (items de navegación, columnas de footer, branding) exclusivamente vía props. Ninguno de los dos SHALL importar Payload ni realizar su propia consulta de datos.

#### Scenario: Se revisa el código de Header
- **WHEN** se inspecciona la implementación de `Header`
- **THEN** no contiene ningún import de Payload ni llamada a `getPayload`/Local API; toda su información llega por props

### Requirement: Navigation es administrable y dirige el Header
El item de Navigation SHALL soportar los tipos `category`, `page` y `external`, y `children` para submenús. Cambiar la configuración de Navigation en el CMS SHALL reflejarse en el Header sin cambios de código.

#### Scenario: Un Admin agrega un item de Navigation
- **WHEN** un Admin agrega un nuevo item al Global Navigation con `type: 'category'`
- **THEN** el Header lo renderiza en la siguiente carga, sin requerir un cambio de código

Referencia: AC-NAV-001, AC-NAV-002, AC-NAV-003, AC-NAV-004

### Requirement: Footer es administrable
El Global Footer SHALL controlar logo, descripción, columnas de enlaces, redes sociales, enlaces legales y copyright. Cambiar esta configuración SHALL reflejarse en el Footer sin cambios de código.

#### Scenario: Un Admin agrega una columna al Footer
- **WHEN** un Admin agrega una columna con enlaces al Global Footer
- **THEN** el Footer la renderiza sin requerir un cambio de código

Referencia: AC-FOOT-001, AC-FOOT-002

### Requirement: SiteSettings integrado para identidad de marca
El shell público SHALL leer de `SiteSettings` únicamente los campos de identidad de marca con un consumidor real: `branding.siteName` (nombre de sitio de respaldo cuando no hay logo — usado como texto del Header y como `alt` de respaldo de las imágenes de logo) y `branding.logo` (logo de respaldo del Footer cuando el propio Global Footer no define uno). El Header usa únicamente el `logo` de su propio Global (`Navigation`); no cae a `SiteSettings.branding.logo`. Ningún campo operativo o sensible se expone en el contrato público. Los enlaces sociales visibles del Header/Footer NO SHALL leerse de `SiteSettings` — cada Global (`Navigation`, `Footer`) tiene su propio campo `socialLinks` independiente (Master Spec §27/§28) y es ese campo el que se renderiza. `SiteSettings.contact` y `SiteSettings.social` quedan definidos en el schema y disponibles para un consumidor real futuro (por ejemplo datos estructurados de Organización); no tienen consumidor en el shell actual.

#### Scenario: El Footer no tiene logo propio configurado
- **WHEN** el Global Footer no tiene `logo` configurado
- **THEN** el Footer usa `SiteSettings.branding.logo` como respaldo, obtenido vía `getSettings()`

#### Scenario: El Header no tiene logo propio configurado
- **WHEN** el Global Navigation no tiene `logo` configurado
- **THEN** el Header renderiza `SiteSettings.branding.siteName` como texto, sin caer a `SiteSettings.branding.logo`

#### Scenario: El Footer necesita sus enlaces de redes sociales
- **WHEN** el Footer renderiza sus iconos de redes sociales
- **THEN** los obtiene de `getFooter()` (el campo `socialLinks` del propio Global Footer), no de `getSettings()`

### Requirement: Navegación móvil como Client Component acotado
La interacción del menú móvil (abrir/cerrar, foco, Escape) SHALL implementarse en un Client Component acotado a esa responsabilidad. El resto del Header, el layout público y la obtención de datos SHALL permanecer en Server Components.

#### Scenario: Se revisa qué archivos declaran 'use client'
- **WHEN** se audita el shell público en busca de `'use client'`
- **THEN** solo el componente de interacción del menú móvil lo declara; `Header`, `Footer` y el layout permanecen Server Components

### Requirement: La ruta raíz no implementa contenido de Home
La ruta `/` SHALL renderizarse dentro del shell (Header/Footer), pero no SHALL incluir contenido editorial de Home, bloques dinámicos, ni datos de ejemplo/hardcodeados que simulen dicho contenido.

#### Scenario: Se revisa la página raíz
- **WHEN** se inspecciona `src/app/(frontend)/page.tsx`
- **THEN** no renderiza bloques de Home ni Posts/Categorías hardcodeados como sustituto del Home real
