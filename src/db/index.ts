import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import * as schema from "./schema/_index.js";

config({ path: ".env" });

const connectionString = process.env.DATABASE_URL!;
const pool = postgres(connectionString, { max: 1 });
export const db = drizzle(pool, { schema });
