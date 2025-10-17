import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema: './src/schemas/*.schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://sv_sdk_user:password@localhost:5432/sv_sdk',
  },
  schemaFilter: ['auth', 'email', 'audit', 'permissions'],
  verbose: true,
  strict: true,
})
