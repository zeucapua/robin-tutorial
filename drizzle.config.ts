// ---------------------------------------

/* Import packages (installed via npm/pnpm) */ 

// to type check the configuration
import type { Config } from "drizzle-kit";

// load .env variables
import * as dotenv from "dotenv";
dotenv.config();

// ---------------------------------------

/* declare Drizzle config */
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string
  }
} satisfies Config

// ---------------------------------------
