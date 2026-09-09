## Purpose

Establece que Next.js y Payload CMS operan como una única aplicación desplegable, con TypeScript y PostgreSQL como base, sirviendo de fundación técnica para todas las fases posteriores.

## Requirements

### Requirement: Next.js y Payload como una sola aplicación
El sistema SHALL ejecutar Next.js (App Router) y Payload CMS dentro de la misma aplicación/proceso desplegable, sin un backend de Payload separado.

#### Scenario: Payload Admin accesible desde la misma app
- **WHEN** un usuario visita la ruta administrativa de Payload
- **THEN** el panel de administración se sirve desde la misma aplicación Next.js, sin requerir un servicio backend independiente

Referencia: AC-GEN-003, AC-GEN-008

### Requirement: Build y tipado sin errores
El sistema SHALL compilar con TypeScript sin errores críticos y SHALL producir un build de producción exitoso.

#### Scenario: Build de producción exitoso
- **WHEN** se ejecuta el build de producción de la aplicación
- **THEN** el proceso finaliza correctamente y sin errores críticos de TypeScript

Referencia: AC-GEN-001, AC-GEN-002

### Requirement: Persistencia de Payload en PostgreSQL
Payload SHALL usar PostgreSQL como su capa de persistencia mediante el adaptador oficial.

#### Scenario: Payload conecta a PostgreSQL al arrancar
- **WHEN** la aplicación arranca con una cadena de conexión de PostgreSQL válida
- **THEN** Payload establece conexión con esa base de datos PostgreSQL

Referencia: AC-GEN-004

### Requirement: Server Components por defecto
Los componentes de página/ruta creados en esta fase SHALL ser React Server Components, salvo que exista una necesidad real de interacción de navegador.

#### Scenario: página base es Server Component
- **WHEN** se inspecciona la página base de la aplicación
- **THEN** el componente no está marcado como Client Component, salvo que implemente una interacción de navegador real

Referencia: AC-GEN-007

### Requirement: shadcn/ui como única base de primitivos de UI
La capa de primitivos de interfaz SHALL inicializarse usando shadcn/ui y SHALL NOT introducir un segundo framework de componentes UI.

#### Scenario: primitivo de UI agregado proviene de shadcn/ui
- **WHEN** se agrega un primitivo de interfaz a la aplicación durante este change
- **THEN** proviene de la inicialización de shadcn/ui y no de otra librería de componentes

Referencia: AC-GEN-009

### Requirement: Sin Collections ni Globals de Payload en esta fase
La configuración de Payload creada en este change SHALL NOT definir ninguna Collection ni ningún Global.

#### Scenario: configuración de Payload mínima al finalizar el change
- **WHEN** se revisa la configuración de Payload al finalizar este change
- **THEN** no existe ninguna Collection ni ningún Global definido
