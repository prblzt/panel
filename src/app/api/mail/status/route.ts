import { cookies } from "next/headers";
import { sessionStatus } from "@/lib/mail/actions";
import { mailJson } from "@/lib/mail/http";
import { COOKIE_NAME, isSessionId } from "@/lib/mail/session";

export async function GET() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  return mailJson(await sessionStatus(isSessionId(sessionId) ? sessionId : undefined));
}
