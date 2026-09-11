## Purpose

Resuelve el segmento raíz público `/<slug>` hacia una Category, una Page publicada o un 404, y define los boundaries de 404/error del frontend público para todo el contenido introducido en esta fase.

## ADDED Requirements

### Requirement: Resolución de `/<slug>`
El sistema SHALL resolver una solicitud a `/<slug>` intentando primero una Category con ese slug (siempre pública) y, si no existe, una Page publicada con ese slug. Si ninguna coincide, SHALL responder 404.

#### Scenario: Slug de Category existente
- **WHEN** se solicita `/<slug>` y existe una Category con ese slug
- **THEN** se renderiza la Category Page correspondiente

#### Scenario: Slug de Page publicada existente
- **WHEN** se solicita `/<slug>`, no existe ninguna Category con ese slug, y existe una Page publicada con ese slug
- **THEN** se renderiza la Generic Page correspondiente

#### Scenario: Slug sin coincidencia
- **WHEN** se solicita `/<slug>` y no coincide con ninguna Category ni con ninguna Page publicada
- **THEN** se responde 404

Referencia: §32.2 del Master Spec

### Requirement: Rutas reservadas no colisionan con `/<slug>`
El resolver de `/<slug>` SHALL nunca interceptar una ruta reservada (`buscar`, `admin`, `api`, `preview`, `media`, `autor`, `tag`, `_next` y equivalentes técnicas de Next.js/Payload), ya que el CMS impide asignar esos slugs a Categories o Pages.

#### Scenario: Solicitud a una ruta reservada
- **WHEN** se solicita `/admin` o `/api/...`
- **THEN** la ruta estática correspondiente responde, sin pasar por el resolver de `/<slug>`

Referencia: AC-ROUTE-002

### Requirement: 404 con identidad de marca
El sistema SHALL mostrar una experiencia 404 propia de 60 Segundos (nunca el 404 genérico de Next.js) para: Post inexistente, Category inexistente, Page inexistente, y contenido en draft accedido públicamente.

#### Scenario: Slug inexistente
- **WHEN** se solicita un slug que no corresponde a ninguna Category ni Page publicada
- **THEN** se muestra el 404 de 60 Segundos, conservando el site shell (Header/Footer)

#### Scenario: Contenido en draft accedido públicamente
- **WHEN** se solicita la URL de un Post o una Page que existe pero está en estado draft
- **THEN** se responde 404, nunca el contenido en draft

Referencia: AC-404-001, AC-404-002, AC-404-003

### Requirement: Error boundary con identidad de marca para fallas inesperadas
El sistema SHALL mostrar una experiencia de error propia de 60 Segundos ante una falla inesperada de infraestructura o runtime en una ruta pública (por ejemplo, una consulta a Payload/base de datos que falla), sin exponer stack trace ni detalles técnicos, y SHALL nunca convertir esa falla en un 404.

#### Scenario: Falla de infraestructura durante el render
- **WHEN** una consulta a Payload/base de datos falla de forma inesperada mientras se renderiza una ruta pública
- **THEN** se muestra el error boundary de 60 Segundos, sin stack trace, con una acción de recuperación cuando Next.js lo soporte

#### Scenario: Contenido inexistente no activa el error boundary
- **WHEN** el contenido solicitado simplemente no existe o no está publicado
- **THEN** se responde 404, no el error boundary

Referencia: AC-ERR-001, AC-ERR-002
