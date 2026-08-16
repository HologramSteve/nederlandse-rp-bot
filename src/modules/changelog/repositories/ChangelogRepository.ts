import type { Database } from "bun:sqlite";

export type ChangeType = "add" | "remove" | "update";

export interface ChangelogEntry {
  id: number;
  item_name: string;
  change_type: ChangeType;
  amount: number;
  note: string | null;
  changed_by: string;
  changed_at: number;
}

/** Repository voor de stash-changelog. */
export class ChangelogRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  add(opts: {
    itemName: string;
    changeType: ChangeType;
    amount: number;
    note?: string;
    changedBy: string;
  }): ChangelogEntry {
    const now = Date.now();
    const result = this.db
      .query(
        `INSERT INTO stash_changelog (item_name, change_type, amount, note, changed_by, changed_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        opts.itemName,
        opts.changeType,
        opts.amount,
        opts.note ?? null,
        opts.changedBy,
        now,
      );
    return {
      id: Number(result.lastInsertRowid),
      item_name: opts.itemName,
      change_type: opts.changeType,
      amount: opts.amount,
      note: opts.note ?? null,
      changed_by: opts.changedBy,
      changed_at: now,
    };
  }

  list(limit = 10): ChangelogEntry[] {
    return this.db
      .query("SELECT * FROM stash_changelog ORDER BY changed_at DESC LIMIT ?")
      .all(limit) as ChangelogEntry[];
  }
}
