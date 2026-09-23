import { postgresAdapter } from '@payloadcms/db-postgres'
import { es } from '@payloadcms/translations/languages/es'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Categories } from './src/payload/collections/Categories.ts'
import { Media } from './src/payload/collections/Media.ts'
import { Pages } from './src/payload/collections/Pages.ts'
import { Posts } from './src/payload/collections/Posts.ts'
import { Redirects } from './src/payload/collections/Redirects.ts'
import { Tags } from './src/payload/collections/Tags.ts'
import { Users } from './src/payload/collections/Users.ts'
import { ArticleSidebar } from './src/payload/globals/ArticleSidebar.ts'
import { Footer } from './src/payload/globals/Footer.ts'
import { Home } from './src/payload/globals/Home.ts'
import { Navigation } from './src/payload/globals/Navigation.ts'
import { SiteSettings } from './src/payload/globals/SiteSettings.ts'
import { payloadEnv } from './src/lib/env/payload.ts'
import { mediaStoragePlugins } from './src/payload/plugins/media-storage.ts'
import { search } from './src/payload/plugins/search.ts'

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
  globals: [Navigation, Footer, SiteSettings, Home, ArticleSidebar],
  plugins: [search, ...mediaStoragePlugins],
  // Admin solo en español. Payload no acepta la llave `es-MX` (su lista
  // cerrada `acceptedLanguages` solo trae `es` y reduce `es-MX` a `es`);
  // con un único idioma soportado el admin no muestra selector de idioma.
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
})
