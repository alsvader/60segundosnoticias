import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { env } from '@/lib/env'

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
    },
  }),
  collections: [],
  globals: [],
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
})
