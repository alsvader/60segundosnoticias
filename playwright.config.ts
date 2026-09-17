import { defineConfig, devices } from '@playwright/test'

const E2E_PORT = 3100
const baseURL = `http://localhost:${E2E_PORT}`

/**
 * Ver openspec/changes/testing-qa-performance/design.md, Decisiones 6-10:
 * Chromium es el proyecto por defecto (suite completa); Firefox/WebKit
 * solo corren los journeys críticos etiquetados `@smoke-cross-browser`
 * (nivel FULL de CI, no en cada PR).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm test:e2e:server',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 60 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@smoke-cross-browser/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /@smoke-cross-browser/,
    },
  ],
})
