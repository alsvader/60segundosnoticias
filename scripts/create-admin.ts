/**
 * Crea el primer usuario Admin en una base recién migrada y vacía.
 *
 * Por qué existe: este proyecto NO tiene bypass de "crear primer
 * usuario" - `Users` usa `create: isAdmin` sin excepción para el primer
 * documento, y el Admin UI pega contra el mismo endpoint. Por lo tanto
 * `POST /api/users` contra una base sin usuarios devuelve 403 (ver
 * `docs/DEPLOYMENT.md`, sección "Primer usuario Admin"). Este script usa
 * la Local API con `overrideAccess: true` para saltar ese chequeo de
 * acceso una sola vez, con la misma técnica que ya usa
 * `src/payload/seed/dev.ts` para sus Writers de desarrollo.
 *
 * Idempotente: si ya existe cualquier usuario (Admin o Writer), no hace
 * nada y sale 0. Nunca sobreescribe ni resetea la contraseña de un
 * usuario existente.
 *
 * Invocación prevista en el VPS de producción (Dokploy), dentro de la
 * red del stack, usando el container `migrate` de un solo uso:
 *
 *   docker compose run --rm migrate pnpm payload run scripts/create-admin.ts
 *
 * Variables de entorno requeridas (sin valor por defecto - nunca se
 * hardcodea ni se commitea una credencial de Admin):
 *   ADMIN_EMAIL    - correo del primer usuario Admin.
 *   ADMIN_PASSWORD - contraseña del primer usuario Admin.
 */
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  console.error(
    'Error: faltan variables de entorno. ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias y no tienen ' +
      'valor por defecto (nunca se hardcodea una credencial de Admin). Ejemplo de invocación en el VPS: ' +
      'ADMIN_EMAIL=admin@ejemplo.com ADMIN_PASSWORD=... docker compose run --rm migrate pnpm payload run scripts/create-admin.ts',
  )
  process.exit(1)
}

const payload = await getPayload({ config })

const existingUsers = await payload.find({
  collection: 'users',
  limit: 1,
  overrideAccess: true,
})

if (existingUsers.docs.length > 0) {
  console.log('Ya existe al menos un usuario - no se crea ningún Admin (script idempotente).')
  await payload.destroy()
  process.exit(0)
}

await payload.create({
  collection: 'users',
  data: {
    active: true,
    displayName: 'Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  },
  overrideAccess: true,
})

// Nunca se loguea la contraseña - solo el correo, que ya es conocido por
// quien invocó el script vía ADMIN_EMAIL.
console.log(`Usuario Admin creado: ${adminEmail}`)
await payload.destroy()
process.exit(0)
