CREATE TABLE IF NOT EXISTS session_state (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- singleton rij
  status TEXT NOT NULL DEFAULT 'idle',    -- idle | vote_active | active
  host_id TEXT,
  started_at INTEGER,
  join_code TEXT,
  vote_message_id TEXT
);

CREATE TABLE IF NOT EXISTS session_voters (
  session_id INTEGER NOT NULL REFERENCES session_state(id),
  user_id TEXT NOT NULL,
  PRIMARY KEY (session_id, user_id)
);
