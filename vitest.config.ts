import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws unconditionally outside Next's own bundler -
      // see tests/setup/server-only-stub.ts.
      'server-only': path.resolve(import.meta.dirname, 'tests/setup/server-only-stub.ts'),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          setupFiles: ['./tests/setup/env.ts'],
          include: ['src/**/*.test.ts', 'tests/setup/**/*.test.ts', 'tests/fixtures/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          setupFiles: ['./tests/setup/env.ts'],
          include: ['tests/integration/**/*.test.ts'],
          // Cada archivo de esta carpeta ejercita el mismo Postgres de
          // pruebas real y comparte fixtures base (categorías/usuarios vía
          // `seedBaseFixtures`, con "find or create") - confirmado
          // empíricamente que correr los archivos en paralelo (el
          // comportamiento por defecto de Vitest entre archivos) produce
          // resultados intermitentes (una lectura pública devolviendo un
          // Post que otro archivo acababa de despublicar/eliminar). Los
          // tests dentro de un mismo archivo ya son secuenciales por
          // defecto; esto solo serializa entre archivos.
          fileParallelism: false,
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'happy-dom',
          environment: 'happy-dom',
          // Sin esto, happy-dom intenta cargar de verdad el `src` de
          // cualquier <iframe> renderizado (p. ej. los embeds de
          // TikTok/Facebook) contra la red real - confirmado empíricamente
          // (peticiones reales a tiktok.com abortadas al limpiar el test).
          // Los componentes de prueba nunca dependen de que un iframe cargue
          // contenido real.
          environmentOptions: {
            happyDOM: {
              settings: { disableIframePageLoading: true },
            },
          },
          setupFiles: ['./tests/setup/env.ts', './tests/setup/testing-library.ts'],
          include: ['src/**/*.test.tsx'],
        },
      },
    ],
  },
})
