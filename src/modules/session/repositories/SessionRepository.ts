import type { Database } from "bun:sqlite";

export type SessionStatus = "idle" | "vote_active" | "active";

export interface SessionState {
  id: 1;
  status: SessionStatus;
  host_id: string | null;
  started_at: number | null;
  join_code: string | null;
  vote_message_id: string | null;
}

export interface SessionVoter {
  session_id: number;
  user_id: string;
}

export class SessionRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getState(): SessionState | null {
    const row = this.db
      .query("SELECT * FROM session_state WHERE id = 1")
      .get() as SessionState | null;
    if (row) return row;
    this.db
      .query(
        "INSERT INTO session_state (id, status) VALUES (1, 'idle') ON CONFLICT(id) DO NOTHING",
      )
      .run();
    return this.db
      .query("SELECT * FROM session_state WHERE id = 1")
      .get() as SessionState;
  }

  updateState(state: Partial<Omit<SessionState, "id">>): void {
    const current = this.getState()!;
    this.db
      .query(
        `UPDATE session_state SET
           status = ?, host_id = ?, started_at = ?, join_code = ?, vote_message_id = ?
         WHERE id = 1`,
      )
      .run(
        state.status ?? current.status,
        state.host_id ?? current.host_id,
        state.started_at ?? current.started_at,
        state.join_code ?? current.join_code,
        state.vote_message_id ?? current.vote_message_id,
      );
  }

  getVoters(): string[] {
    const rows = this.db
      .query("SELECT user_id FROM session_voters WHERE session_id = 1")
      .all() as { user_id: string }[];
    return rows.map((r) => r.user_id);
  }

  addVoter(userId: string): void {
    this.db
      .query("INSERT OR IGNORE INTO session_voters (session_id, user_id) VALUES (1, ?)")
      .run(userId);
  }

  hasVoter(userId: string): boolean {
    const row = this.db
      .query("SELECT 1 FROM session_voters WHERE session_id = 1 AND user_id = ?")
      .get(userId);
    return Boolean(row);
  }

  clearVoters(): void {
    this.db.query("DELETE FROM session_voters WHERE session_id = 1").run();
  }
}
