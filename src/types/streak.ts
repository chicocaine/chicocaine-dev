export const StreakActions = {
  LogStreak: "log-streak",
  CreateStreak: "create-streak",
  ActivateStreak: "activate-streak",
  DeactivateStreak: "deactivate-streak",
  DeleteStreak: "delete-streak",
  CreateMilestone: "create-milestone",
  DeleteMilestone: "delete-milestone"
} as const;

export type StreakAction = typeof StreakActions[keyof typeof StreakActions];

export type StreakApiResponse<T> = {
  success: true;
  datetime: string;
  result: T;
} | {
  success: false;
  datetime: string;
  error: string;
};

export interface Streak {
  id: number;
  key: string;
  label: string;
  description: string;
  active: 0 | 1; // D1 stores booleans as integers
  created_at: string;
  logs: StreakLogs[];
  milestones: StreakMilestones[];
}

export interface StreakLogs {
  id: number;
  streak_id: number;
  user: string;
  created_at: string;
}

export interface StreakMilestones {
  id: number;
  streak_id: number;
  description: string;
  streak_length: number;
}

export interface Payload {
  user: string;
  action: StreakAction;
  passkey: string; // -p value; verified server-side before dispatch
  metadata: Record<string, unknown>;
}