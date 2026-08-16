import Prompt from "../../components/Prompt";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import StreakCli from "./streak-cli";
import type {
  Streak as StreakData,
  StreakApiResponse,
  StreakLogs,
} from "../../types/streak";

const RESET_MS = 20 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad2 = (n: number) => String(n).padStart(2, "0");

function streakDayIndex(ms: number): number {
  return Math.ceil((ms - RESET_MS) / DAY_MS);
}

function dayDeadlineMs(index: number): number {
  return index * DAY_MS + RESET_MS;
}

function parseLogDays(logs: StreakLogs[]): Set<number> {
  const days = new Set<number>();
  for (const log of logs) {
    const ms = Date.parse(log.created_at);
    if (Number.isNaN(ms)) {
      console.warn(
        `Skipping streak log #${log.id} with invalid created_at: ${log.created_at}`
      );
      continue;
    }
    days.add(streakDayIndex(ms));
  }
  return days;
}

function computeCount(logDays: Set<number>, todayIndex: number): number {
  let count = 0;
  let day = logDays.has(todayIndex) ? todayIndex : todayIndex - 1;
  while (logDays.has(day)) {
    count++;
    day--;
  }
  return count;
}

type CellState = "logged" | "pending" | "missed" | "na";
type MilestoneState = "done" | "next" | "todo";

type StreakStats = {
  count: number;
  cells: Array<{
    dayIndex: number;
    dateLabel: string;
    state: CellState;
    weekday: string;
    isToday: boolean;
  }>;
  milestones: Array<{
    description: string;
    length: number;
    state: MilestoneState;
  }>;
};

function computeStreakStats(streak: StreakData, todayIndex: number): StreakStats {
  const logDays = parseLogDays(streak.logs);
  const count = computeCount(logDays, todayIndex);

  const createdMs = Date.parse(streak.created_at);
  const lowerBound = Number.isNaN(createdMs)
    ? (logDays.size > 0 ? Math.min(...logDays) : Infinity)
    : streakDayIndex(createdMs);

  const cells: StreakStats["cells"] = [];
  for (let k = 6; k >= 0; k--) {
    const day = todayIndex - k;
    let state: CellState;
    if (logDays.has(day)) {
      state = "logged";
    } else if (k === 0) {
      state = "pending";
    } else if (day < lowerBound) {
      state = "na"; // streak didn't exist yet
    } else {
      state = "missed";
    }
    cells.push({
      dayIndex: day,
      dateLabel: new Date(dayDeadlineMs(day)).toISOString().slice(0, 10),
      state,
      weekday: new Date(dayDeadlineMs(day)).toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
      isToday: k === 0,
    });
  }

  const sorted = [...streak.milestones]
    .filter((m) => m.streak_length >= 1)
    .sort((a, b) => a.streak_length - b.streak_length);
  const nextLength = sorted.find((m) => count < m.streak_length)?.streak_length;
  const milestones: StreakStats["milestones"] = sorted.map((m) => ({
    description: m.description,
    length: m.streak_length,
    state: count >= m.streak_length
      ? "done"
      : m.streak_length === nextLength
        ? "next"
        : "todo",
  }));

  return { count, cells, milestones };
}

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => window.clearTimeout(timer);
  }, []);

  return now;
}

function formatTime(now: Date): string {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

const GLYPH: Record<CellState, string> = {
  logged: "✓",
  pending: "~",
  missed: "✗",
  na: "·",
};

const TONE: Record<CellState, string> = {
  logged: "text-success",
  pending: "text-warning",
  missed: "text-danger",
  na: "text-text-muted",
};

const MS_GLYPH: Record<MilestoneState, string> = {
  done: "✓",
  next: "~",
  todo: " ",
};

const MS_TONE: Record<MilestoneState, string> = {
  done: "text-success",
  next: "text-warning",
  todo: "text-text-muted",
};

const StreakCard = memo(function StreakCard({
  streak,
  todayIndex,
}: {
  streak: StreakData;
  todayIndex: number;
}) {
  const stats = useMemo(
    () => computeStreakStats(streak, todayIndex),
    [streak, todayIndex]
  );

  return (
    <div className="space-y-2">
      <p className="text-text-muted select-none">
        ── <span className="text-text">{streak.label}</span>{" "}
        <span className="text-text-muted">[</span>
        <span className="text-text">{stats.count}d</span>
        <span className="text-text-muted">]</span>{" "}
        <span className={streak.active === 1 ? "text-success" : "text-text-muted"}>
          {streak.active === 1 ? "[on]" : "[off]"}
        </span>{" "}
        ──
      </p>
      <p className="text-text-muted">{streak.description}</p>

      <div className="flex gap-2">
        {stats.cells.map((cell) => (
          <div
            key={cell.dayIndex}
            className="flex-1 text-center"
            title={`${cell.dateLabel} — ${cell.state}`}
          >
            <div className={cell.isToday ? "text-text-bright" : "text-text-muted"}>
              {cell.weekday}
            </div>
            <div className={`${TONE[cell.state]} select-none`}>
              {GLYPH[cell.state]}
            </div>
          </div>
        ))}
      </div>

      {stats.milestones.length > 0 && (
        <div className="space-y-0.5">
          {stats.milestones.map((milestone) => (
            <p key={milestone.length} className="text-text-muted">
              <span className={`${MS_TONE[milestone.state]} select-none`}>
                [{MS_GLYPH[milestone.state]}]
              </span>{" "}
              {milestone.description}
              {milestone.state === "next" && (
                <span className="text-text">
                  {" "}
                  ({stats.count}/{milestone.length})
                </span>
              )}
              {milestone.state === "done" && (
                <span className="text-text-muted"> (achieved)</span>
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

function Streak() {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const now = useNow();
  const todayIndex = streakDayIndex(now.getTime());

  const loadStreaks = useCallback(
    async (ignore: () => boolean = () => false) => {
      try {
        const res = await fetch("/api/streak", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const payload = (await res.json()) as StreakApiResponse<StreakData[]>;

        if (!payload.success) {
          throw new Error(payload.error ?? "Invalid streak payload");
        }

        if (!Array.isArray(payload.result)) {
          throw new Error("Invalid streak payload");
        }

        if (!ignore()) {
          setStreaks(payload.result);
        }
      } catch (err) {
        console.error("Failed to load streaks:", err);
        if (!ignore()) {
          setStreaks([]);
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!ignore()) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;
    loadStreaks(() => ignore);
    return () => {
      ignore = true;
    };
  }, [loadStreaks]);

  if (loading) {
    return (
      <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
        <p>
          <Prompt>
            <span className="text-text">ls</span>{" "}
            <span className="text-text-muted">~/streak/</span>
          </Prompt>
        </p>
        <div className="mt-6 pl-4 border-l-2 border-border text-text-muted space-y-4 max-w-2xl">
          <p className="text-text">Loading streaks...</p>
        </div>
      </main>
    );
  }

  const clock = {
    date: now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    weekday: now.toLocaleDateString("en-US", { weekday: "short" }),
    time: formatTime(now),
  };
  const nextResetMs = dayDeadlineMs(todayIndex);

  return (
    <main className="bg-background flex-auto font-body p-6 sm:p-10 lg:p-14 text-sm leading-relaxed">
      <p>
        <Prompt>
          <span className="text-text">ls</span>{" "}
          <span className="text-text-muted">~/streak/</span>
        </Prompt>
      </p>
      <div className="mt-6 pl-4 border-l-2 border-border text-text-muted space-y-4 max-w-2xl">
        {/* live local clock */}
        <p className="text-text">
          <span className="text-text-bright">
            {clock.date} [{clock.weekday}]
          </span>
          <span className="text-text-muted"> - </span>
          <span className="text-text-bright">{clock.time}</span>
        </p>
        <p className="text-text-muted">
          next reset: {new Date(nextResetMs).toISOString()} (in{" "}
          {formatCountdown(nextResetMs - now.getTime())})
        </p>

        {error ? (
          <p className="text-danger">
            <span className="select-none">[ERR] </span>
            failed to load ~/streak/ ({error})
          </p>
        ) : streaks.length === 0 ? (
          <p>
            <span className="text-warning select-none">[~] </span>
            No streaks yet — check back later!
          </p>
        ) : (
          <>
            <p className="text-text-muted text-xs select-none">
              ── <span className="text-success">[✓]</span> logged&nbsp;
              <span className="text-warning">[~]</span> pending&nbsp;
              <span className="text-danger">[✗]</span> missed&nbsp;
              <span className="text-text-muted">[·]</span> n/a ──
            </p>
            {streaks.map((streak) => (
              <StreakCard
                key={streak.id}
                streak={streak}
                todayIndex={todayIndex}
              />
            ))}
          </>
        )}
      </div>
      <StreakCli onSuccess={() => loadStreaks()} />
    </main>
  );
}

export default Streak;
