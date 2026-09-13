## ADDED Requirements

### Requirement: Origen de sitio canónico centralizado
El sistema SHALL exponer `getSiteOrigin()` (origen absoluto del sitio) y `getAbsoluteUrl(path)` como las únicas funciones que producen una URL absoluta pública. Ningún componente o módulo SHALL leer independientemente la configuración del origen del sitio ni construir una URL absoluta concatenando strings por su cuenta. En un entorno de producción, un origen ausente o inválido SHALL producir un error explícito en vez de asumir silenciosamente un origen de desarrollo.

#### Scenario: Se necesita la URL absoluta de un Article para compartir
- **WHEN** `ShareActions` u otro consumidor necesita la URL absoluta de un Article
- **THEN** usa `getAbsoluteUrl()` sobre el resultado de `getPostUrl()`, no una construcción propia

#### Scenario: El origen del sitio falta o es inválido en producción
- **WHEN** el origen del sitio no está configurado o no es una URL válida en un entorno de producción
- **THEN** el sistema falla de forma explícita en vez de asumir silenciosamente `http://localhost:3000`

Referencia: AC-ENV-004
