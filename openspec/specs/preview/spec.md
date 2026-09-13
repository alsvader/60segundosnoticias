## Purpose

Permite a Writers y Admins previsualizar contenido en Draft (Posts, Pages, Home) usando el frontend público real vía Next.js Draft Mode, sin URLs públicas permanentes ni acceso no autorizado a contenido sin publicar.

## Requirements

### Requirement: Entrada de Preview protegida por secreto
El sistema SHALL exponer una ruta `/api/preview` que valida `PREVIEW_SECRET` antes de continuar con cualquier resolución de documento. Un secreto ausente o inválido SHALL rechazar la solicitud sin resolver ningún documento.

#### Scenario: Secreto ausente o inválido
- **WHEN** se invoca `/api/preview` sin `PREVIEW_SECRET` o con un valor incorrecto
- **THEN** la solicitud se rechaza y no se resuelve ningún documento en Draft

Referencia: §31 del Master Spec, AC-PREVIEW-005

### Requirement: Autorización de Preview delegada al control de acceso existente
El sistema SHALL determinar qué documento puede previsualizar el usuario actual reutilizando el `access.read` ya definido en las Collections Posts/Pages (Admin ve cualquier documento; Writer ve únicamente lo publicado o lo propio), sin duplicar esa lógica de autorización en la ruta de Preview.

#### Scenario: Writer previsualiza su propio Draft
- **WHEN** un Writer autenticado solicita Preview de un Post en Draft del que es autor
- **THEN** el documento se resuelve y se muestra en Draft Mode

#### Scenario: Writer intenta previsualizar el Draft de otro autor
- **WHEN** un Writer autenticado solicita Preview de un Post en Draft del que no es autor
- **THEN** la solicitud se rechaza por el control de acceso existente de Posts

#### Scenario: Admin previsualiza cualquier Draft
- **WHEN** un Admin solicita Preview de cualquier Post o Page en Draft
- **THEN** el documento se resuelve y se muestra en Draft Mode

Referencia: §31 del Master Spec, AC-PREVIEW-001, AC-PREVIEW-002

### Requirement: Destino de Preview derivado del documento, nunca de la URL de la solicitud
El sistema SHALL calcular la URL de destino del Preview a partir del documento ya resuelto y autorizado, usando los helpers canónicos existentes (`getPostUrl()`/`getPageUrl()`, o `/` para Home). El sistema SHALL NOT aceptar un path o slug de destino arbitrario recibido por query string u otro parámetro de la solicitud.

#### Scenario: La solicitud de Preview incluye un parámetro de destino no derivado del documento
- **WHEN** `/api/preview` recibe un parámetro que intenta especificar directamente la URL de redirección
- **THEN** ese parámetro se ignora y el destino se calcula únicamente a partir del documento resuelto

Referencia: AC-SEC-007

### Requirement: Habilitación y salida de Draft Mode
El sistema SHALL habilitar Next.js Draft Mode únicamente después de una resolución autorizada del documento, y SHALL exponer `/api/preview-exit` para deshabilitarlo y devolver al usuario a la experiencia pública normal.

#### Scenario: Salida de Preview
- **WHEN** el usuario invoca `/api/preview-exit`
- **THEN** Draft Mode se deshabilita y las siguientes solicitudes vuelven a servir únicamente contenido publicado

Referencia: §31 del Master Spec, AC-PREVIEW-006

### Requirement: Draft Mode no sirve ni contamina cache pública
Mientras Draft Mode está habilitado para una sesión autorizada, ninguna respuesta SHALL reutilizar contenido cacheado públicamente, y el contenido en Draft servido durante Preview SHALL NOT escribirse en la cache pública.

#### Scenario: Un usuario en Preview ve un Draft recién editado
- **WHEN** un usuario autorizado en Draft Mode solicita un Post con cambios no publicados
- **THEN** ve los cambios sin depender de una versión cacheada, y ningún otro visitante público recibe esos cambios

Referencia: §40.5 del Master Spec, AC-CACHE-006

### Requirement: Categories sin flujo de Preview
Categories SHALL NOT tener flujo de Preview, dado que no tienen estado Draft/versiones.

#### Scenario: Se intenta previsualizar una Category
- **WHEN** se invoca `/api/preview` con una Category como documento objetivo
- **THEN** la solicitud se rechaza por no ser un tipo de documento previsualizable

### Requirement: Indicador visible de Draft Mode
El sistema SHALL mostrar, en toda página pública servida con Draft Mode habilitado, un indicador visible que informe al usuario que está viendo contenido sin publicar, y SHALL incluir en ese indicador un enlace directo a `/api/preview-exit`.

#### Scenario: Página pública con Draft Mode habilitado
- **WHEN** una página del frontend público se renderiza con `draftMode().isEnabled` en `true`
- **THEN** la página muestra un indicador visible de Draft Mode con un enlace a `/api/preview-exit`

#### Scenario: Página pública con Draft Mode deshabilitado
- **WHEN** una página del frontend público se renderiza con `draftMode().isEnabled` en `false`
- **THEN** la página no muestra ningún indicador de Draft Mode

#### Scenario: Salida desde el indicador
- **WHEN** el usuario sigue el enlace del indicador de Draft Mode
- **THEN** se invoca `/api/preview-exit`, Draft Mode se deshabilita y el usuario vuelve a la experiencia pública normal

Referencia: §31 del Master Spec, AC-PREVIEW-006 (extiende el mecanismo de salida ya existente con un punto de descubrimiento visible; no reemplaza `/api/preview-exit`).
