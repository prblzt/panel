import { cookies } from "next/headers";
import { disconnectAccount } from "@/lib/mail/actions";
import { mailJson } from "@/lib/mail/http";
import { COOKIE_NAME, cookieOptions } from "@/lib/mail/session";

export async function POST() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  disconnectAccount(sessionId);
  jar.set(COOKIE_NAME, "", { ...cookieOptions(), maxAge: 0 });
  return mailJson({ ok: true });
}
