import type { Database } from "bun:sqlite";

export interface MemberRow {
  user_id: string;
  joined_at: number;
  is_chosen: number;
}

/** Repository voor leden (voor stats-tellers). */
export class MemberRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  upsert(userId: string, joinedAt: number): void {
    this.db
      .query(
        `INSERT INTO members (user_id, joined_at) VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET joined_at = excluded.joined_at`,
      )
      .run(userId, joinedAt);
  }

  /** Telt leden gemarkeerd als "gekozen". */
  countChosen(): number {
    const row = this.db
      .query("SELECT COUNT(*) AS n FROM members WHERE is_chosen = 1")
      .get() as { n: number };
    return row.n;
  }
}
