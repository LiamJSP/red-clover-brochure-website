import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { CaseStudies } from './collections/CaseStudies'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { SiteSetting } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4321,http://localhost:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const plugins = []

if (process.env.S3_BUCKET && process.env.S3_REGION) {
  plugins.push(
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION,
      },
    }),
  )
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'development-secret-change-me',
  serverURL: process.env.CMS_PUBLIC_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' · Red Clover CMS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cors: corsOrigins,
  csrf: corsOrigins,
  collections: [Users, Media, Pages, CaseStudies, Posts, Categories],
  globals: [SiteSetting],
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL || 'postgres://payload:payload@localhost:5432/payload',
    },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  plugins,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  }
})
