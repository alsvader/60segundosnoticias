import 'server-only'

import config from '@payload-config'
import { getPayload as getPayloadInstance } from 'payload'

/**
 * The single point where application code obtains a Payload instance.
 * `getPayload()` from the `payload` package already memoizes per config,
 * so this module only centralizes the `@payload-config` import instead of
 * repeating it in every file under src/lib/data/.
 */
export function getPayload() {
  return getPayloadInstance({ config })
}
