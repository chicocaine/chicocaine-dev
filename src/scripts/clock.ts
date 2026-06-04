let sessionStart: number = Date.now();

export function initSession(): void {
  sessionStart = Date.now();
}

export function getLocalTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const offsetHours = Math.floor(abs / 60);
  const offsetMins = abs % 60;

  const utc = offsetMins === 0
    ? `UTC${sign}${offsetHours}`
    : `UTC${sign}${offsetHours}:${offsetMins.toString().padStart(2, "0")}`;

  return `${hours}:${minutes}:${seconds} ${utc}`;
}

export function getSessionUptime(): string {
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);

  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}
