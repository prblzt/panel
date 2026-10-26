import { listMessages, readMessage, testConnection } from "@/lib/mail/icloud";
import { createSession, eraseSession, readSession, remember } from "@/lib/mail/session";
import { isIcloudAddress, isUid } from "@/lib/mail/validate";

export async function connectAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const secret = password.trim();
  if (!isIcloudAddress(normalized) || secret.length < 4 || secret.length > 256 || /[\r\n]/.test(password)) {
    return { ok: false as const, status: 400, error: "Indique une adresse iCloud et un mot de passe pour app." };
  }
  const login = await testConnection(normalized, secret);
  if (!login.ok) {
    return { ok: false as const, status: 401, error: "Connexion refusée." };
  }
  return { ok: true as const, status: 200, email: normalized, sessionId: createSession(normalized, secret) };
}

export async function sessionStatus(sessionId: string | undefined) {
  const session = readSession(sessionId);
  if (!session) return { connected: false as const };
  remember(sessionId!);
  return { connected: true as const, email: session.email };
}

export async function inboxFor(sessionId: string | undefined) {
  const session = readSession(sessionId);
  if (!session) return { ok: false as const, status: 401, error: "Session terminée." };
  remember(sessionId!);
  try {
    const listed = await listMessages(session.email, session.password);
    return { ok: true as const, status: 200, messages: listed.messages, uidValidity: listed.uidValidity };
  } catch {
    return { ok: false as const, status: 502, error: "Lecture impossible." };
  }
}

export async function messageFor(sessionId: string | undefined, uid: string) {
  const session = readSession(sessionId);
  if (!session) return { ok: false as const, status: 401, error: "Session terminée." };
  if (!isUid(uid)) return { ok: false as const, status: 404, error: "Message introuvable." };
  remember(sessionId!);
  try {
    const message = await readMessage(session.email, session.password, uid);
    if (!message) return { ok: false as const, status: 404, error: "Message introuvable." };
    return { ok: true as const, status: 200, message };
  } catch {
    return { ok: false as const, status: 502, error: "Lecture impossible." };
  }
}

export function disconnectAccount(sessionId: string | undefined) {
  eraseSession(sessionId);
}
