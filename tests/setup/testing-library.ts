/**
 * `@testing-library/react`'s automatic `afterEach(cleanup)` only registers
 * itself when it detects Jest-like globals; this project runs Vitest
 * without `test.globals`, so cleanup between tests must be wired
 * explicitly here instead (registered as a `setupFiles` entry for the
 * `happy-dom` project only, see vitest.config.ts). Matchers like
 * `toHaveFocus`/`toHaveValue` also need `@testing-library/jest-dom`
 * registered explicitly for the same reason (no Jest globals to
 * auto-detect).
 */
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
