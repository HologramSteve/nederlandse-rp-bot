CREATE TABLE IF NOT EXISTS stash_changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  change_type TEXT NOT NULL, -- add | remove | update
  amount INTEGER NOT NULL,
  note TEXT,
  changed_by TEXT NOT NULL,
  changed_at INTEGER NOT NULL
);
