-- reset time: T20:00:00.000Z

INSERT INTO streaks(id, "key", label, "description", active, created_at)
VALUES
  (1, 'doomscroll', 'No Doomscrolling Streak', 'No short-form or social media content scrolling', 1, '2026-08-10T20:00:00.000Z'),
  (2, 'mhm', '[redacted]', '[redac#$/.:3_;)', 1, '2026-08-10T20:00:00.000Z'),
  (3, 'nolate', 'No Late Arrival Streaks', 'No late arrivals in general', 1, '2026-08-10T20:00:00.000Z'),
  (4, 'test', 'Test Streak', 'Test streak for dev.', 1, '2026-08-05T20:00:00.000Z'),
  (5, 'test2', 'Test Streak2', 'Test2 streak for dev.', 1, '2026-08-04T:2000:00.000Z');

INSERT INTO streak_logs(streak_id, user, created_at)
VALUES
  (4, 'chico', '2026-08-05T20:00:00.000Z'),
  (4, 'chico', '2026-08-06T20:00:00.000Z'),
  (4, 'chico', '2026-08-08T20:00:00.000Z'),
  (4, 'chico', '2026-08-09T20:00:00.000Z'),
  (4, 'chico', '2026-08-11T20:00:00.000Z'),
  (4, 'chico', '2026-08-12T20:00:00.000Z'),
  (4, 'chico', '2026-08-13T20:00:00.000Z'),
  (5, 'chico', '2026-08-04T20:00:00.000Z'),
  (5, 'chico', '2026-08-05T20:00:00.000Z'),
  (5, 'chico', '2026-08-07T20:00:00.000Z'),
  (5, 'chico', '2026-08-08T20:00:00.000Z'),
  (5, 'chico', '2026-08-10T20:00:00.000Z'),
  (5, 'chico', '2026-08-12T20:00:00.000Z');

INSERT INTO streak_milestones(streak_id, "description", streak_length)
VALUES
  (4, 'test milestone 1', 3),
  (4, 'test milestone 2', 5),
  (4, 'test milestone 3', 10),
  (5, 'test2 milestone 1', 1),
  (5, 'test2 milestone 2', 10);