## ADDED Requirements

### Requirement: El build de la aplicación no requiere una base de datos alcanzable
El stage `builder` del Dockerfile (`pnpm build`) SHALL completarse exitosamente sin necesitar una conexión alcanzable a PostgreSQL. Las rutas públicas respaldadas por Payload que de otro modo intentarían generación estática en build time (`/`, `/buscar`, `/sitemap.xml`) SHALL renderizarse en tiempo de solicitud, precisamente para sostener este invariante sin depender de que exista un Postgres real durante el build.

#### Scenario: build de producción con una base de datos inalcanzable
- **WHEN** se construye el stage `builder`/`runner` con un `DATABASE_URI` sintácticamente válido pero inalcanzable, sin ningún Postgres en ejecución
- **THEN** el build se completa exitosamente

#### Scenario: la imagen arranca normalmente una vez hay Postgres real
- **WHEN** la imagen construida bajo la condición anterior se ejecuta contra un Postgres real y migrado
- **THEN** la aplicación arranca y sirve tráfico normalmente, sin ningún paso manual adicional

Referencia: incidente descubierto en `openspec/changes/testing-qa-performance` tarea 8.1 (primera ejecución real de `scripts/docker-smoke.sh` de punta a punta).
