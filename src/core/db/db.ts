import { Database } from "bun:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { config } from "../../config/index.js";
import { logger } from "../utils/logger.js";

const MIGRATIONS_DIR = join(import.meta.dir, "migrations");

/** Open de SQLite-database en draai eventuele openstaande migraties. */
export function openDatabase(): Database {
  const dir = dirname(config.dbPath);
  if (dir !== "." && dir !== "") {
    mkdirSync(dir, { recursive: true });
    logger.debug(`Databasemap verzekerd: ${dir}`);
  }

  const db = new Database(config.dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  runMigrations(db);
  return db;
}

/** Draai .sql migraties uit de migrations-map in bestandsnaamvolgorde. */
function runMigrations(db: Database): void {
  let files: string[];
  try {
    files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    logger.warn(`Geen migraties gevonden in ${MIGRATIONS_DIR}`);
    return;
  }

  db.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (" +
      "  name TEXT PRIMARY KEY," +
      "  applied_at TEXT NOT NULL DEFAULT (datetime('now'))" +
      ");",
  );

  const rows = db.query("SELECT name FROM _migrations").all() as { name: string }[];
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    logger.info(`Migratie toepassen: ${file}`);
    db.exec(sql);
    db.query("INSERT INTO _migrations (name) VALUES (?)").run(file);
  }
}
