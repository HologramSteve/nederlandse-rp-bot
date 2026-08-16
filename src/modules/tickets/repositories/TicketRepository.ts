import type { Database } from "bun:sqlite";

export type TicketStatus = "open" | "claimed" | "closed";

export interface Ticket {
  ticket_id: number;
  owner_id: string;
  channel_id: string;
  category: string;
  status: TicketStatus;
  claimed_by: string | null;
  opened_at: number;
  closed_at: number | null;
}

export class TicketRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  create(opts: { ownerId: string; channelId: string; category: string }): number {
    const now = Date.now();
    const result = this.db
      .query(
        `INSERT INTO tickets (owner_id, channel_id, category, status, opened_at)
         VALUES (?, ?, ?, 'open', ?)`,
      )
      .run(opts.ownerId, opts.channelId, opts.category, now);
    return Number(result.lastInsertRowid);
  }

  findOpenByOwner(ownerId: string): Ticket | null {
    const row = this.db
      .query("SELECT * FROM tickets WHERE owner_id = ? AND status != 'closed'")
      .get(ownerId) as Ticket | null;
    return row ?? null;
  }

  findByChannel(channelId: string): Ticket | null {
    const row = this.db
      .query("SELECT * FROM tickets WHERE channel_id = ?")
      .get(channelId) as Ticket | null;
    return row ?? null;
  }

  claim(channelId: string, moderatorId: string): void {
    this.db
      .query("UPDATE tickets SET status = 'claimed', claimed_by = ? WHERE channel_id = ?")
      .run(moderatorId, channelId);
  }

  close(channelId: string): void {
    this.db
      .query("UPDATE tickets SET status = 'closed', closed_at = ? WHERE channel_id = ?")
      .run(Date.now(), channelId);
  }
}
