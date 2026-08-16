INSERT INTO streaks(id, "key", label, "description", active, created_at)
VALUES
  (1, 'doomscroll', 'No Doomscrolling Streak', 'No short-form or social media content scrolling', 1, '2026-08-15T20:00:00.000Z'),
  (2, 'mhm', '[redacted]', '[redac#$/.:3_;)', 1, '2026-08-10T20:00:00.000Z'),
  (3, 'nolate', 'No Late Arrival Streaks', 'No late arrivals in general', 1, '2026-08-15T20:00:00.000Z');

INSERT INTO streak_logs(streak_id, user, created_at)
VALUES
  (2, 'chico', '2026-08-10T20:00:00.000Z'),
  (2, 'chico', '2026-08-11T20:00:00.000Z'),
  (2, 'chico', '2026-08-12T20:00:00.000Z'),
  (2, 'chico', '2026-08-13T20:00:00.000Z'),
  (2, 'chico', '2026-08-14T20:00:00.000Z'),
  (2, 'chico', '2026-08-15T20:00:00.000Z'),
  (2, 'chico', '2026-08-16T20:00:00.000Z');

INSERT INTO streak_milestones(streak_id, "description", streak_length)
VALUES
  (2, ":3", 31),
  (2, "wtf~", 92);