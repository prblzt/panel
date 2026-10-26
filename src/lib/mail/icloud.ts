import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { classifyMail } from "@/lib/mail/classify";
import { sanitizeMailHtml } from "@/lib/mail/html";
import { cleanHeader, toPlainText } from "@/lib/mail/text";
import type { MailSummary } from "@/lib/mail/types";

export type { MailSummary };

const INBOX = "INBOX";

function clientFor(email: string, password: string) {
  return new ImapFlow({
    host: "imap.mail.me.com",
    port: 993,
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
    emitLogs: false,
    logRaw: false,
    disableAutoIdle: true,
  });
}

async function closeClient(client: ImapFlow) {
  try {
    await client.logout();
  } catch {
    try {
      client.close();
    } catch {
      // La connexion est déjà fermée.
    }
  }
}

function mailTime(value: Date | string | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export async function testConnection(email: string, password: string) {
  const client = clientFor(email, password);
  try {
    await client.connect();
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  } finally {
    await closeClient(client);
  }
}

async function excerpt(source: Buffer | undefined) {
  if (!source?.length) return "";
  try {
    const parsed = await simpleParser(source, { skipTextToHtml: true, maxHtmlLengthToParse: 20_000 });
    return toPlainText({ text: parsed.text, html: parsed.html }).slice(0, 2_000);
  } catch {
    return "";
  }
}

export async function listMessages(email: string, password: string) {
  const client = clientFor(email, password);
  let lock: { release(): void } | undefined;
  try {
    await client.connect();
    lock = await client.getMailboxLock(INBOX);
    const mailbox = client.mailbox;
    if (!mailbox || mailbox.exists < 1) return { messages: [] as MailSummary[], uidValidity: "0" };
    const uidValidity = mailbox.uidValidity != null ? String(mailbox.uidValidity) : "0";
    const start = Math.max(1, mailbox.exists - 29);
    const rows: MailSummary[] = [];
    for await (const message of client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      envelope: true,
      source: { start: 0, maxLength: 8_000 },
    })) {
      const from = message.envelope?.from?.[0];
      const name = cleanHeader(from?.name || "");
      const address = cleanHeader(from?.address || "");
      const subject = cleanHeader(message.envelope?.subject || "") || "(sans objet)";
      const text = await excerpt(message.source);
      rows.push({
        uid: String(message.uid),
        from: name || address || "Inconnu",
        email: address,
        subject,
        time: mailTime(message.envelope?.date),
        unread: !message.flags?.has("\\Seen"),
        category: classifyMail({ from: name, email: address, subject, text }),
      });
    }
    return { messages: rows.reverse().slice(0, 30), uidValidity };
  } finally {
    try {
      lock?.release();
    } finally {
      await closeClient(client);
    }
  }
}

export async function readMessage(email: string, password: string, uid: string) {
  const client = clientFor(email, password);
  let lock: { release(): void } | undefined;
  try {
    await client.connect();
    lock = await client.getMailboxLock(INBOX);
    const message = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
    if (!message || !message.source) return null;
    const parsed = await simpleParser(message.source, { skipTextToHtml: true, maxHtmlLengthToParse: 100_000 });
    const subject = cleanHeader(message.envelope?.subject || parsed.subject || "") || "(sans objet)";
    const sender = message.envelope?.from?.[0];
    const name = cleanHeader(sender?.name || "");
    const address = cleanHeader(sender?.address || "");
    const rawHtml = typeof parsed.html === "string" ? parsed.html : "";
    const text = toPlainText({ text: parsed.text, html: parsed.html });
    return {
      subject,
      text,
      html: rawHtml.trim() ? sanitizeMailHtml(rawHtml) : "",
      category: classifyMail({ from: name, email: address, subject, text }),
    };
  } finally {
    try {
      lock?.release();
    } finally {
      await closeClient(client);
    }
  }
}
