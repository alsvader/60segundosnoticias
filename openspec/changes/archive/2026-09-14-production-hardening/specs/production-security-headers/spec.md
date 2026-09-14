## Purpose

Define los headers de seguridad HTTP que la aplicación SHALL enviar en producción, derivados del uso real de embeds de terceros, sin romper Payload Admin.

## ADDED Requirements

### Requirement: Headers de protección base en todas las respuestas
Las respuestas de producción SHALL incluir `X-Content-Type-Options: nosniff`, una política de `Referrer-Policy` restrictiva, y una `Permissions-Policy` que deshabilite por defecto capacidades del navegador no usadas por la aplicación.

#### Scenario: inspeccionar los headers de una respuesta pública
- **WHEN** se inspecciona la respuesta HTTP de una página pública en producción
- **THEN** incluye `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`

### Requirement: Content-Security-Policy derivada de los proveedores de embed reales
La `Content-Security-Policy` de producción SHALL permitir explícitamente únicamente los orígenes de terceros efectivamente usados por la aplicación para embeds (YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook, LinkedIn) y el origen configurado de Object Storage para imágenes de `Media`, y SHALL NOT usar un wildcard que permita orígenes arbitrarios de script o frame.

#### Scenario: un embed de un proveedor soportado se renderiza correctamente
- **WHEN** una página con un embed de YouTube, Vimeo, Instagram, X/Twitter, TikTok, Facebook o LinkedIn se carga en producción
- **THEN** el embed se renderiza sin ser bloqueado por la Content-Security-Policy

#### Scenario: un origen no soportado no está permitido
- **WHEN** se revisa la Content-Security-Policy de producción
- **THEN** no incluye un wildcard de origen para `script-src` ni para `frame-src`

Referencia: AC-SEC-009

### Requirement: Payload Admin permanece funcional bajo la política de headers
La política de headers de seguridad de producción SHALL permitir que Payload Admin (`/admin`, `/api`) funcione normalmente para editores autenticados.

#### Scenario: un editor usa Payload Admin en producción
- **WHEN** un editor autenticado navega Payload Admin en producción
- **THEN** puede iniciar sesión y editar contenido sin que la política de headers bloquee funcionalidad propia del Admin

### Requirement: HSTS condicionado a terminación TLS confirmada
El header `Strict-Transport-Security` SHALL emitirse únicamente cuando la aplicación puede confirmar que el tráfico llega sobre HTTPS (terminado por el proxy/plataforma), y SHALL NOT emitirse en un entorno de verificación local sin TLS.

#### Scenario: verificación local sin TLS
- **WHEN** la aplicación de producción se verifica localmente sin un proxy TLS delante
- **THEN** la respuesta no incluye `Strict-Transport-Security`
