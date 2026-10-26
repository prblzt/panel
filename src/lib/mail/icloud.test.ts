/** @vitest-environment node */

import { beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({
  exists: 2,
  created: [] as Array<Record<string, unknown>>,
  connect: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  close: vi.fn(),
  release: vi.fn(),
  getMailboxLock: vi.fn(async () => ({ release() {} })),
  fetch: vi.fn(),
  fetchOne: vi.fn(),
}));

vi.mock("imapflow", () => ({
  ImapFlow: class {
    mailbox: { exists: number; uidValidity?: bigint };
    constructor(options: Record<string, unknown>) {
      state.created.push(options);
      this.mailbox = { exists: state.exists, uidValidity: BigInt(42) };
    }
    connect = state.connect;
    logout = state.logout;
    close = state.close;
    getMailboxLock = state.getMailboxLock;
    fetch = state.fetch;
    fetchOne = state.fetchOne;
  },
}));

const simpleParser = vi.hoisted(() => vi.fn());
vi.mock("mailparser", () => ({ simpleParser }));

import { listMessages, readMessage, testConnection } from "@/lib/mail/icloud";

const email = "ada@icloud.com";
const password = "faux-mot-de-passe-test";

function silenceConsole() {
  return ["log", "info", "debug", "warn", "error"].map((method) =>
    vi.spyOn(console, method as "log").mockImplementation(() => {}),
  );
}

describe("connexion IMAP iCloud", () => {
  beforeEach(() => {
    state.exists = 2;
    state.created.length = 0;
    state.connect.mockReset().mockResolvedValue(undefined);
    state.logout.mockReset().mockResolvedValue(undefined);
    state.close.mockReset();
    state.release.mockReset();
    state.getMailboxLock.mockReset().mockImplementation(async () => ({ release: state.release }));
    state.fetch.mockReset();
    state.fetchOne.mockReset();
    simpleParser.mockReset();
  });

  test("utilise le serveur iCloud sans journal", async () => {
    const spies = silenceConsole();
    const result = await testConnection(email, password);
    expect(result).toEqual({ ok: true });
    expect(state.created[0]).toMatchObject({
      host: "imap.mail.me.com",
      port: 993,
      secure: true,
      logger: false,
      emitLogs: false,
      logRaw: false,
      auth: { user: email, pass: password },
    });
    expect(state.logout).toHaveBeenCalledOnce();
    expect(spies.flatMap((spy) => spy.mock.calls).join("\n")).not.toContain(password);
    spies.forEach((spy) => spy.mockRestore());
  });

  test("une erreur de connexion reste générique et ferme le client", async () => {
    const spies = silenceConsole();
    state.connect.mockRejectedValue(new Error(`AUTH failed ${email} ${password}`));
    state.logout.mockRejectedValue(new Error(`logout ${password}`));
    const result = await testConnection(email, password);
    expect(result).toEqual({ ok: false });
    expect(state.close).toHaveBeenCalledOnce();
    const dumped = spies.flatMap((spy) => spy.mock.calls).join("\n");
    expect(dumped).not.toContain(password);
    expect(dumped).not.toContain(email);
    spies.forEach((spy) => spy.mockRestore());
  });

  test("affiche les 30 messages les plus récents de la boîte de réception", async () => {
    state.exists = 50;
    state.fetch.mockImplementation(async function* () {
      yield {
        uid: 21,
        flags: new Set(["\\Seen"]),
        envelope: {
          subject: "Ancien",
          date: new Date("2026-10-26T18:00:00.000Z"),
          from: [{ name: "Ada", address: "ada@exemple.fr" }],
        },
      };
      yield {
        uid: 50,
        flags: new Set<string>(),
        envelope: {
          subject: "Récent",
          date: new Date("2026-10-26T19:00:00.000Z"),
          from: [{ address: "bob@exemple.fr" }],
        },
      };
    });
    const listed = await listMessages(email, password);
    expect(state.getMailboxLock).toHaveBeenCalledWith("INBOX");
    expect(state.fetch).toHaveBeenCalledWith("21:*", {
      uid: true,
      flags: true,
      envelope: true,
      source: { start: 0, maxLength: 8_000 },
    });
    expect(listed.uidValidity).toBe("42");
    expect(listed.messages).toEqual([
      {
        uid: "50",
        from: "bob@exemple.fr",
        email: "bob@exemple.fr",
        subject: "Récent",
        time: "2026-10-26T19:00:00.000Z",
        unread: true,
        category: "Autres",
      },
      {
        uid: "21",
        from: "Ada",
        email: "ada@exemple.fr",
        subject: "Ancien",
        time: "2026-10-26T18:00:00.000Z",
        unread: false,
        category: "Autres",
      },
    ]);
    expect(state.release).toHaveBeenCalledOnce();
    expect(state.logout).toHaveBeenCalledOnce();
  });

  test("lit le HTML nettoyé et garde le texte brut", async () => {
    state.fetchOne.mockResolvedValue({
      source: Buffer.from("raw"),
      envelope: { subject: "Bonjour" },
    });
    simpleParser.mockResolvedValue({ text: "Version texte", html: "<p>Bonjour</p><script>alert(1)</script>" });
    const message = await readMessage(email, password, "15");
    expect(state.fetchOne).toHaveBeenCalledWith("15", { source: true, envelope: true }, { uid: true });
    expect(message?.subject).toBe("Bonjour");
    expect(message?.text).toBe("Version texte");
    expect(message?.html).toContain("<p>Bonjour</p>");
    expect(message?.category).toBe("Autres");
    expect(JSON.stringify(message)).not.toContain("<script>");
    expect(JSON.stringify(message)).not.toContain("alert");
    expect(state.logout).toHaveBeenCalledOnce();
  });

  test("un message sans HTML reste en texte brut", async () => {
    state.fetchOne.mockResolvedValue({
      source: Buffer.from("raw"),
      envelope: { subject: "Note" },
    });
    simpleParser.mockResolvedValue({ text: "Ligne 1\nLigne 2", html: false });
    const message = await readMessage(email, password, "8");
    expect(message).toEqual({ subject: "Note", text: "Ligne 1\nLigne 2", html: "", category: "Autres" });
  });
});
