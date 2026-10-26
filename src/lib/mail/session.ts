import { randomBytes } from "node:crypto";

export const COOKIE_NAME = "panel-mail-session";
const TTL_MS = 20 * 60 * 1000;

type MailSession = {
  email: string;
  password: string;
  expiresAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __panelMailSessions?: Map<string, MailSession>;
};
const sessions = globalStore.__panelMailSessions ?? new Map<string, MailSession>();
globalStore.__panelMailSessions = sessions;

export function isSessionId(value: string | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  };
}

export function createSession(email: string, password: string) {
  const id = randomBytes(32).toString("base64url");
  sessions.set(id, { email, password, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function readSession(id: string | undefined) {
  if (!isSessionId(id)) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    eraseSession(id);
    return null;
  }
  return session;
}

export function remember(id: string) {
  const session = sessions.get(id);
  if (!session) return;
  session.expiresAt = Date.now() + TTL_MS;
}

export function eraseSession(id: string | undefined) {
  if (!id) return;
  const session = sessions.get(id);
  if (session) {
    session.email = "";
    session.password = "";
  }
  sessions.delete(id);
}

export function resetSessionsForTests() {
  for (const id of [...sessions.keys()]) eraseSession(id);
}
