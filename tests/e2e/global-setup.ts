import '../setup/env.ts'

/**
 * Playwright arranca `webServer` (migrate+seed+build+start, ver
 * package.json `test:e2e:server`) antes de que este global setup
 * corra, así que su única responsabilidad aquí es cargar/validar el
 * entorno de pruebas para el propio proceso de test runner (que hace
 * peticiones HTTP contra el `webServer`, no contra la base de datos
 * directamente). Ver design.md, Decisión 4 y Decisión 7.
 */
export default function globalSetup(): void {
  // La importación de ../setup/env.ts ya validó DATABASE_URI al cargar
  // este módulo (assertTestDatabase se ejecuta como side effect).
}
