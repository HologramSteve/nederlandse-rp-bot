import type { Database, Statement } from "bun:sqlite";

/**
 * Abstracte repository-base. Toekomstige repositories erven hiervan en krijgen
 * een stabiel CRUD-contract i.p.v. rechtstreeks de SQLite-API te gebruiken.
 */
export abstract class Repository<T extends { id: string | number }> {
  protected readonly db: Database;
  protected readonly table: string;

  constructor(db: Database, table: string) {
    this.db = db;
    this.table = table;
  }

  /** Haal één rij op op basis van id. */
  async findById(id: T["id"]): Promise<T | null> {
    const stmt: Statement = this.db.query(`SELECT * FROM "${this.table}" WHERE id = ?`);
    return (stmt.get(id) as T | null) ?? null;
  }

  /** Haal alle rijen op. */
  async findAll(): Promise<T[]> {
    const stmt: Statement = this.db.query(`SELECT * FROM "${this.table}"`);
    return stmt.all() as T[];
  }

  /** Verwijder een rij op basis van id; retourneert true bij succes. */
  async deleteById(id: T["id"]): Promise<boolean> {
    const stmt: Statement = this.db.query(`DELETE FROM "${this.table}" WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
