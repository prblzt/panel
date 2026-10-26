export function withAccount(service: string, appleId?: string | null) {
  return appleId ? `${service} · ${appleId}` : service;
}

export function isoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatLongDate(date = new Date()) {
  const label = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

export function formatWhen(value: string, now: Date | null = null) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (!now) return formatShortDate(value);
  const today = isoDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (value === today) return "Aujourd’hui";
  if (value === isoDate(yesterday)) return "Hier";
  return formatShortDate(value);
}

export function clock(date = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function weekDays(anchor = new Date()) {
  const day = anchor.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(anchor);
  start.setHours(12, 0, 0, 0);
  start.setDate(anchor.getDate() + diff);
  const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { iso: isoDate(date), day: labels[date.getDay()], n: date.getDate() };
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function parseAmount(raw: string) {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function durationSeconds(label: string) {
  const parts = label.split(":").map((part) => Number(part));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return 180;
  return parts[0] * 60 + parts[1];
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}
