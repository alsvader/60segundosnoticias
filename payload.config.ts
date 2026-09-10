import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Categories } from './src/payload/collections/Categories.ts'
import { Media } from './src/payload/collections/Media.ts'
import { Pages } from './src/payload/collections/Pages.ts'
import { Posts } from './src/payload/collections/Posts.ts'
import { Redirects } from './src/payload/collections/Redirects.ts'
import { Tags } from './src/payload/collections/Tags.ts'
import { Users } from './src/payload/collections/Users.ts'
import { Footer } from './src/payload/globals/Footer.ts'
import { Home } from './src/payload/globals/Home.ts'
import { Navigation } from './src/payload/globals/Navigation.ts'
import { SiteSettings } from './src/payload/globals/SiteSettings.ts'
import { payloadEnv } from './src/lib/env/payload.ts'

export default buildConfig({
  secret: payloadEnv.PAYLOAD_SECRET,
  sharp,
  db: postgresAdapter({
    pool: {
      connectionString: payloadEnv.DATABASE_URI,
    },
    migrationDir: 'src/payload/migrations',
  }),
  collections: [Users, Media, Categories, Tags, Posts, Pages, Redirects],
  globals: [Navigation, Footer, SiteSettings, Home],
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
})
