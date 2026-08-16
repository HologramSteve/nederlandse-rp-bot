import type { Database } from "bun:sqlite";

export type InfractionType = "strike" | "warning" | "termination";

export interface Infraction {
  id: number;
  type: InfractionType;
  user_id: string;
  moderator_id: string;
  reason: string | null;
  case_no: number;
  created_at: number;
}

/** Repository voor infracties (moderatie-log). */
export class InfractionRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /** Retourneert het hoogste case-nummer + 1 (of 1 als er nog geen zijn). */
  nextCaseNo(): number {
    const row = this.db.query("SELECT MAX(case_no) AS max FROM infractions").get() as {
      max: number | null;
    };
    return (row.max ?? 0) + 1;
  }

  add(opts: {
    type: InfractionType;
    userId: string;
    moderatorId: string;
    reason?: string;
  }): Infraction {
    const caseNo = this.nextCaseNo();
    const now = Date.now();
    const result = this.db
      .query(
        `INSERT INTO infractions (type, user_id, moderator_id, reason, case_no, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(opts.type, opts.userId, opts.moderatorId, opts.reason ?? null, caseNo, now);
    return {
      id: Number(result.lastInsertRowid),
      type: opts.type,
      user_id: opts.userId,
      moderator_id: opts.moderatorId,
      reason: opts.reason ?? null,
      case_no: caseNo,
      created_at: now,
    };
  }

  listByUser(userId: string, limit = 10): Infraction[] {
    return this.db
      .query(
        "SELECT * FROM infractions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      )
      .all(userId, limit) as Infraction[];
  }
}
