/** @vitest-environment node */

import { beforeEach, describe, expect, test, vi } from "vitest";
import { connectAccount, disconnectAccount, inboxFor, messageFor, sessionStatus } from "@/lib/mail/actions";
import { readSession, resetSessionsForTests } from "@/lib/mail/session";

const email = "Ada@icloud.com";
const password = "faux-mot-de-passe-test";

const imap = vi.hoisted(() => ({
  testConnection: vi.fn(),
  listMessages: vi.fn(),
  readMessage: vi.fn(),
}));

vi.mock("@/lib/mail/icloud", () => imap);

describe("actions mail", () => {
  beforeEach(() => {
    resetSessionsForTests();
    imap.testConnection.mockReset();
    imap.listMessages.mockReset();
    imap.readMessage.mockReset();
  });

  test("une connexion réussie ne renvoie pas le mot de passe", async () => {
    imap.testConnection.mockResolvedValue({ ok: true });
    const result = await connectAccount(email, password);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.email).toBe("ada@icloud.com");
    expect(result.sessionId).not.toContain(password);
    expect(result.sessionId).not.toContain("ada@icloud.com");
    expect(JSON.stringify(result)).not.toContain(password);
    expect(result).not.toHaveProperty("password");
    expect(readSession(result.sessionId)?.password).toBe(password);
  });

  test("un échec de connexion n’ouvre pas de session", async () => {
    const spies = ["log", "info", "debug", "warn", "error"].map((method) =>
      vi.spyOn(console, method as "log").mockImplementation(() => {}),
    );
    imap.testConnection.mockResolvedValue({ ok: false });
    const result = await connectAccount(email, `refus ${password}`);
    expect(result).toEqual({ ok: false, status: 401, error: "Connexion refusée." });
    expect(JSON.stringify(result)).not.toContain(password);
    expect(readSession("a".repeat(43))).toBeNull();
    expect(spies.flatMap((spy) => spy.mock.calls).join("\n")).not.toContain(password);
    spies.forEach((spy) => spy.mockRestore());
  });

  test("refuse une adresse qui n’est pas iCloud", async () => {
    const result = await connectAccount("ada@gmail.com", password);
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: "Indique une adresse iCloud et un mot de passe pour app.",
    });
    expect(imap.testConnection).not.toHaveBeenCalled();
  });

  test("accepte me.com et mac.com", async () => {
    imap.testConnection.mockResolvedValue({ ok: true });
    const me = await connectAccount("ada@me.com", password);
    const mac = await connectAccount("ada@mac.com", password);
    expect(me.ok && me.email).toBe("ada@me.com");
    expect(mac.ok && mac.email).toBe("ada@mac.com");
  });

  test("la liste simulée ne contient pas le secret", async () => {
    imap.testConnection.mockResolvedValue({ ok: true });
    imap.listMessages.mockResolvedValue({
      uidValidity: "42",
      messages: [
        {
          uid: "4",
          from: "Ada",
          email: "ada@exemple.fr",
          subject: "Bonjour",
          time: "2026-10-26T19:00:00.000Z",
          unread: true,
          category: "Autres",
        },
      ],
    });
    const connected = await connectAccount(email, password);
    if (!connected.ok) throw new Error("session");
    const status = await sessionStatus(connected.sessionId);
    expect(status).toEqual({ connected: true, email: "ada@icloud.com" });
    const inbox = await inboxFor(connected.sessionId);
    expect(inbox).toMatchObject({ ok: true, status: 200 });
    expect(JSON.stringify(inbox)).not.toContain(password);
    expect(imap.listMessages).toHaveBeenCalledWith("ada@icloud.com", password);
  });

  test("une erreur de lecture reste générique", async () => {
    const spies = ["log", "info", "debug", "warn", "error"].map((method) =>
      vi.spyOn(console, method as "log").mockImplementation(() => {}),
    );
    imap.testConnection.mockResolvedValue({ ok: true });
    imap.listMessages.mockRejectedValue(new Error(`AUTH ${password}`));
    const connected = await connectAccount(email, password);
    if (!connected.ok) throw new Error("session");
    const inbox = await inboxFor(connected.sessionId);
    expect(inbox).toEqual({ ok: false, status: 502, error: "Lecture impossible." });
    expect(JSON.stringify(inbox)).not.toContain(password);
    expect(spies.some((spy) => spy.mock.calls.length > 0)).toBe(false);
    spies.forEach((spy) => spy.mockRestore());
  });

  test("sans session, la lecture est refusée", async () => {
    expect(await inboxFor(undefined)).toEqual({ ok: false, status: 401, error: "Session terminée." });
    expect(await messageFor(undefined, "1")).toEqual({ ok: false, status: 401, error: "Session terminée." });
  });

  test("un UID invalide ne part pas vers IMAP", async () => {
    imap.testConnection.mockResolvedValue({ ok: true });
    const connected = await connectAccount(email, password);
    if (!connected.ok) throw new Error("session");
    const result = await messageFor(connected.sessionId, "../1");
    expect(result).toEqual({ ok: false, status: 404, error: "Message introuvable." });
    expect(imap.readMessage).not.toHaveBeenCalled();
  });

  test("la déconnexion efface la session", async () => {
    imap.testConnection.mockResolvedValue({ ok: true });
    const connected = await connectAccount(email, password);
    if (!connected.ok) throw new Error("session");
    disconnectAccount(connected.sessionId);
    expect(readSession(connected.sessionId)).toBeNull();
    expect(await sessionStatus(connected.sessionId)).toEqual({ connected: false });
  });
});
