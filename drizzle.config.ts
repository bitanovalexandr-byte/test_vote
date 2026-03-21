import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_j2OveImpGt5J@ep-dark-wildflower-als76czu-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  },
});