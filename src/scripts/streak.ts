/// <reference path="../../worker-configuration.d.ts" />
/// <reference path="../types/env.d.ts" />
import { authorize } from "./passkey";
import { StreakActions } from "../types/streak";
import type {
  StreakAction,
  StreakApiResponse,
  Streak,
  StreakLogs,
  StreakMilestones,
  Payload,
} from "../types/streak";

const DEFAULT_USER = "chico";

// ---- shared helpers ------------------------------------------------------

function ok(now: string): Response {
  const body: StreakApiResponse<null> = {
    success: true,
    datetime: now,
    result: null,
  };
  return Response.json(body, { status: 200 });
}

function fail(now: string, error: string, status: number): Response {
  const body: StreakApiResponse<null> = { success: false, datetime: now, error };
  return Response.json(body, { status });
}

// read a required non-empty string out of the metadata bag
function metaString(metadata: Payload["metadata"], key: string): string | undefined {
  const value = metadata[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

// read an optional positive integer out of the metadata bag
function metaPositiveInt(metadata: Payload["metadata"], key: string): number | null {
  const value = metadata[key];
  return typeof value === "number" && Number.isInteger(value) && value >= 1
    ? value
    : null;
}

async function getStreakId(env: Env, key: string): Promise<number | null> {
  const row = await env.streak_db
    .prepare(`SELECT id FROM streaks WHERE "key" = ?`)
    .bind(key)
    .first<{ id: number }>();
  return row ? row.id : null;
}

const handlers = {
  [StreakActions.LogStreak]: logStreak,
  [StreakActions.CreateStreak]: createStreak,
  [StreakActions.CreateMilestone]: createMilestone,
  [StreakActions.ActivateStreak]: activateStreak,
  [StreakActions.DeactivateStreak]: deactivateStreak,
  [StreakActions.DeleteStreak]: deleteStreak,
  [StreakActions.DeleteMilestone]: deleteMilestone,
} satisfies Record<StreakAction, (data: Payload, env: Env) => Promise<Response>>;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/streak") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method === "GET") {
      return getStreaks(env);
    }

    if (!["POST", "PATCH", "DELETE"].includes(request.method)) {
      return new Response("Not found", { status: 405 });
    }

    return handleStreakMutation(request, env);
  },
};

async function handleStreakMutation(
  request: Request,
  env: Env
): Promise<Response> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return new Response("Expected JSON content-type", { status: 415 });
  }

  let data: Payload;

  try {
    data = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const handler = handlers[data.action];
  if (!handler) return new Response("Unknown Action", { status: 400 });

  if (!authorize(env, data.passkey)) {
    const now = new Date().toISOString();
    return fail(now, "Invalid passkey", 401);
  }

  return handler(data, env);
}

async function getStreaks(env: Env): Promise<Response> {
  const now = new Date().toISOString();
  try {
    const db_streaks = await env.streak_db
    .prepare(`
      SELECT *
      from streaks
      ORDER BY created_at ASC
      `)
    .all<Streak>();
    console.log(db_streaks);

    const db_logs = await env.streak_db
    .prepare(`
      SELECT *
      from streak_logs
      ORDER BY created_at DESC
      `)
    .all<StreakLogs>();
    console.log(db_logs);

    const db_milestones = await env.streak_db
    .prepare(`
      SELECT *
      from streak_milestones
      ORDER BY streak_length ASC
      `)
    .all<StreakMilestones>();
    console.log(db_milestones);

    const streaks = new Map<number, Streak>();
    for (const item of db_streaks.results) {
      streaks.set(item.id, {
        id: item.id,
        key: item.key,
        label: item.label,
        description: item.description,
        active: item.active,
        created_at: item.created_at,
        logs: [],
        milestones: [],
      });
    }

    for (const log of db_logs.results) {
      const streak = streaks.get(log.streak_id);
      if (!streak) continue;
      streak.logs?.push({
        id: log.id,
        streak_id: log.streak_id,
        user: log.user,
        created_at: log.created_at
      });
    }

    for (const milestone of db_milestones.results) {
      const streak = streaks.get(milestone.streak_id);
      if (!streak) continue;
      streak.milestones?.push({
        id: milestone.id,
        streak_id: milestone.streak_id,
        description: milestone.description,
        streak_length: milestone.streak_length
      });
    }

    const result = Array.from(streaks.values());

    const body: StreakApiResponse<Streak[]> = {
      success: true,
      datetime: now,
      result,
    }
    return Response.json(body, { status: 200 });

  } catch (error) {
    const body: StreakApiResponse<Streak[]> = {
      success: false,
      datetime: now,
      error: error instanceof Error ? error.message : String(error),
    };
    
    return Response.json(body, { status: 500 });
  }
}

async function logStreak(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const username = data.user || DEFAULT_USER;
  const key = metaString(data.metadata, "key");
  if (!key) return fail(now, "Missing streak key", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  const result = await env.streak_db
    .prepare(`
      INSERT OR IGNORE INTO streak_logs(streak_id, user, created_at)
      VALUES (?, ?, ?)
      `)
    .bind(id, username, now)
    .run();

  if (!result.success) return fail(now, "Failed to log streak", 500);
  return ok(now);
}

async function createStreak(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  const label = metaString(data.metadata, "label");
  const description = metaString(data.metadata, "description") ?? "";
  if (!key) return fail(now, "Missing streak key", 400);
  if (!label) return fail(now, "Missing streak label", 400);

  try {
    await env.streak_db
      .prepare(`
        INSERT INTO streaks("key", label, "description", active, created_at)
        VALUES (?, ?, ?, 1, ?)
        `)
      .bind(key, label, description, now)
      .run();
  } catch {
    return fail(now, `Streak '${key}' already exists`, 409);
  }

  return ok(now);
}

async function activateStreak(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  if (!key) return fail(now, "Missing streak key", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  await env.streak_db
    .prepare(`UPDATE streaks SET active = 1 WHERE id = ?`)
    .bind(id)
    .run();

  return ok(now);
}

async function deactivateStreak(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  if (!key) return fail(now, "Missing streak key", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  await env.streak_db
    .prepare(`UPDATE streaks SET active = 0 WHERE id = ?`)
    .bind(id)
    .run();

  return ok(now);
}

async function deleteStreak(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  if (!key) return fail(now, "Missing streak key", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  await env.streak_db
    .prepare(`DELETE FROM streaks WHERE id = ?`)
    .bind(id)
    .run();

  return ok(now);
}

async function createMilestone(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  const length = metaPositiveInt(data.metadata, "length");
  const description = metaString(data.metadata, "description") ?? "";
  if (!key) return fail(now, "Missing streak key", 400);
  if (length === null) return fail(now, "Milestone length must be a positive integer", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  try {
    await env.streak_db
      .prepare(`
        INSERT INTO streak_milestones(streak_id, "description", streak_length)
        VALUES (?, ?, ?)
        `)
      .bind(id, description, length)
      .run();
  } catch {
    return fail(now, `Milestone (length ${length}) already exists for '${key}'`, 409);
  }

  return ok(now);
}

async function deleteMilestone(data: Payload, env: Env): Promise<Response> {
  const now = new Date().toISOString();
  const key = metaString(data.metadata, "key");
  const length = metaPositiveInt(data.metadata, "length");
  if (!key) return fail(now, "Missing streak key", 400);
  if (length === null) return fail(now, "Milestone length must be a positive integer", 400);

  const id = await getStreakId(env, key);
  if (id === null) return fail(now, `Streak '${key}' not found`, 404);

  await env.streak_db
    .prepare(`DELETE FROM streak_milestones WHERE streak_id = ? AND streak_length = ?`)
    .bind(id, length)
    .run();

  return ok(now);
}
