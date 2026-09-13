## Purpose

Expone `sitemap.xml` y `robots.txt` públicos que reflejan únicamente contenido publicado y controlan la indexación de forma consistente según el entorno.

## Requirements

### Requirement: Contenido del sitemap
El sitemap SHALL incluir Home, todas las Categories, las Pages publicadas y los Posts publicados, usando la URL canónica de cada Post (`primaryCategory`, nunca `additionalCategories`). El sitemap SHALL NOT incluir Drafts, rutas de Admin, rutas de Preview, URLs de resultados de búsqueda, ni URLs históricas registradas en `Redirects.from`.

#### Scenario: Un Post tiene una Draft y otro publicado
- **WHEN** se genera el sitemap
- **THEN** solo el Post publicado aparece, con su URL basada en `primaryCategory`

#### Scenario: Existe un Redirect histórico activo
- **WHEN** se genera el sitemap y existe un Redirect activo para una URL antigua
- **THEN** esa URL antigua no aparece en el sitemap

Referencia: §42 del Master Spec, AC-SEO-009, AC-SEO-010, AC-SEO-011

### Requirement: robots por entorno
En producción, `robots.txt` SHALL permitir la indexación pública del sitio y SHALL referenciar la URL del sitemap. En un entorno no productivo, `robots.txt` SHALL bloquear la indexación mediante configuración de entorno, sin requerir un despliegue distinto de código.

#### Scenario: Entorno de producción
- **WHEN** se solicita `robots.txt` en producción
- **THEN** permite la indexación pública y referencia `sitemap.xml`

#### Scenario: Entorno de staging/pruebas
- **WHEN** se solicita `robots.txt` en un entorno no productivo
- **THEN** bloquea la indexación completa

Referencia: §42 del Master Spec, AC-SEO-012, AC-SEO-013

### Requirement: robots.txt no sustituye control de acceso
Las rutas de Admin, API interna y Preview SHALL permanecer protegidas por autenticación/autorización real independientemente de lo declarado en `robots.txt`; una directiva de `robots.txt` SHALL NOT considerarse un mecanismo de seguridad.

#### Scenario: Una ruta de Admin está listada como `Disallow` en robots.txt
- **WHEN** se accede directamente a esa ruta sin sesión autenticada
- **THEN** el acceso se rechaza por el control de acceso real, no por la directiva de robots

### Requirement: Política neutral respecto a crawlers de IA
`robots.txt` SHALL NOT declarar reglas específicas por user-agent de crawler de IA (de entrenamiento o de recuperación/búsqueda) en esta fase. `/llms.txt` SHALL permanecer públicamente accesible y SHALL NOT bloquearse por `robots.txt`.

#### Scenario: Se audita robots.txt
- **WHEN** se revisa el contenido de `robots.txt`
- **THEN** no contiene reglas para `GPTBot`, `Google-Extended`, `ClaudeBot` ni ningún otro user-agent específico de IA, y no bloquea `/llms.txt`
