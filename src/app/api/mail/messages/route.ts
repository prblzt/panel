import { cookies } from "next/headers";
import { inboxFor } from "@/lib/mail/actions";
import { mailJson } from "@/lib/mail/http";
import { COOKIE_NAME, isSessionId } from "@/lib/mail/session";

export async function GET() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  const result = await inboxFor(isSessionId(sessionId) ? sessionId : undefined);
  if (!result.ok) return mailJson({ ok: false, error: result.error }, result.status);
  return mailJson({ ok: true, messages: result.messages, uidValidity: result.uidValidity });
}
