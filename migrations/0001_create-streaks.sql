-- Migration number: 0001 	 2026-08-11T07:59:20.684Z

CREATE TABLE streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  "key" TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  "description" TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE streak_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streak_id INTEGER NOT NULL,
  user TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user, streak_id, created_at),
  FOREIGN KEY (streak_id) REFERENCES streaks (id) ON DELETE CASCADE
);

CREATE TABLE streak_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streak_id INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  streak_length INTEGER NOT NULL,
  UNIQUE(streak_id, streak_length),
  FOREIGN KEY (streak_id) REFERENCES streaks (id) ON DELETE CASCADE
);

CREATE INDEX idx_streak_logs_streak_id ON streak_logs (streak_id);
CREATE INDEX idx_streak_milestones_streak_id ON streak_milestones (streak_id);