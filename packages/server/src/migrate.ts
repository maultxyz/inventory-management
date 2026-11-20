import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";
import { MIGRATIONS_DIR } from "./lib/constants/server";

migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  .then(async () => {
    console.log("[migrate] Database is up to date.");
    await pool.end();
  })
  .catch((error) => {
    console.error("[migrate] Applying migrations failed:", error);
    process.exit(1);
  });
