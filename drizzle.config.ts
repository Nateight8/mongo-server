require('dotenv').config({ path: '.env' });
const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: [
    "./src/db/schema/account.ts",
    "./src/db/schema/auth.ts"
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
