## MODIFIED Requirements

### Requirement: Content-Security-Policy derivada de los proveedores de embed reales
La `Content-Security-Policy` de producción SHALL permitir explícitamente únicamente los orígenes de terceros efectivamente usados por la aplicación para embeds (YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook, LinkedIn) y el origen de Object Storage configurado para imágenes de `Media` **en el entorno de ejecución real del contenedor**, y SHALL NOT usar un wildcard que permita orígenes arbitrarios de script o frame. El origen de Object Storage incluido SHALL reflejar la configuración vigente al momento de cada solicitud, no un valor fijado al construir la aplicación.

#### Scenario: un embed de un proveedor soportado se renderiza correctamente
- **WHEN** una página con un embed de YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook o LinkedIn se carga en producción
- **THEN** el embed se renderiza sin ser bloqueado por la Content-Security-Policy

#### Scenario: un origen no soportado no está permitido
- **WHEN** se revisa la Content-Security-Policy de producción
- **THEN** no incluye un wildcard de origen para `script-src` ni para `frame-src`

#### Scenario: la política refleja el origen de Object Storage configurado en runtime
- **WHEN** el contenedor de producción arranca con un origen de Object Storage S3-compatible determinado configurado en su entorno
- **THEN** la Content-Security-Policy de las respuestas públicas incluye ese origen exacto en las directivas que permiten cargar Media

#### Scenario: el mismo build se reconfigura contra un origen de Object Storage distinto
- **WHEN** la misma imagen construida de la aplicación se ejecuta con un origen de Object Storage S3-compatible diferente al usado en un despliegue anterior, sin reconstruir la aplicación
- **THEN** la Content-Security-Policy de las respuestas públicas refleja el nuevo origen, no el usado en el despliegue anterior

#### Scenario: un origen de Media no configurado permanece bloqueado
- **WHEN** se solicita cargar una imagen desde un origen que no coincide con el Object Storage configurado en el entorno de ejecución
- **THEN** la Content-Security-Policy no permite implícitamente ese origen

Referencia: AC-SEC-009
