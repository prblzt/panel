import { cookies } from "next/headers";
import { connectAccount } from "@/lib/mail/actions";
import { mailJson } from "@/lib/mail/http";
import { COOKIE_NAME, cookieOptions } from "@/lib/mail/session";

export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      if (typeof body.email === "string") email = body.email;
      if (typeof body.password === "string") password = body.password;
    }
  } catch {
    return mailJson({ ok: false, error: "Indique une adresse iCloud et un mot de passe pour app." }, 400);
  }

  const result = await connectAccount(email, password);
  if (!result.ok) return mailJson({ ok: false, error: result.error }, result.status);

  const jar = await cookies();
  jar.set(COOKIE_NAME, result.sessionId, cookieOptions());
  return mailJson({ ok: true, email: result.email });
}
