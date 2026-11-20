import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { requiredEnv } from "../lib/env";
import * as schema from "./schema";

export const pool = new Pool({
  connectionString: requiredEnv("DATABASE_URL"),
  ssl: process.env.DATABASE_SSL !== "false",
  max: parseInt(process.env.DB_POOL_MAX ?? "10"),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS ?? "10000"),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONNECTION_TIMEOUT_MS ?? "10000",
  ),
  keepAlive: true,
});

export const db = drizzle(pool, { schema });

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
