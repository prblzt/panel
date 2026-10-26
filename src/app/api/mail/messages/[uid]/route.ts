import { cookies } from "next/headers";
import { messageFor } from "@/lib/mail/actions";
import { mailJson } from "@/lib/mail/http";
import { COOKIE_NAME, isSessionId } from "@/lib/mail/session";

export async function GET(_request: Request, context: { params: Promise<{ uid: string }> }) {
  const { uid } = await context.params;
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  const result = await messageFor(isSessionId(sessionId) ? sessionId : undefined, uid);
  if (!result.ok) return mailJson({ ok: false, error: result.error }, result.status);
  return mailJson({ ok: true, message: result.message });
}
