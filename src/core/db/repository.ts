import type { Database, Statement } from "bun:sqlite";

export abstract class Repository<T extends { id: string | number }> {
  protected readonly db: Database;
  protected readonly table: string;

  constructor(db: Database, table: string) {
    this.db = db;
    this.table = table;
  }

  async findById(id: T["id"]): Promise<T | null> {
    const stmt: Statement = this.db.query(`SELECT * FROM "${this.table}" WHERE id = ?`);
    return (stmt.get(id) as T | null) ?? null;
  }

  async findAll(): Promise<T[]> {
    const stmt: Statement = this.db.query(`SELECT * FROM "${this.table}"`);
    return stmt.all() as T[];
  }

  async deleteById(id: T["id"]): Promise<boolean> {
    const stmt: Statement = this.db.query(`DELETE FROM "${this.table}" WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
