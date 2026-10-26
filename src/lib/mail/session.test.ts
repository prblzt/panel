/** @vitest-environment node */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { COOKIE_NAME, cookieOptions, createSession, eraseSession, readSession, remember, resetSessionsForTests } from "@/lib/mail/session";

const email = "ada@icloud.com";
const password = "faux-mot-de-passe-test";

describe("session mail en mémoire", () => {
  beforeEach(() => {
    resetSessionsForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-26T12:00:00.000Z"));
  });

  afterEach(() => {
    resetSessionsForTests();
    vi.useRealTimers();
  });

  test("le cookie ne contient que l’identifiant aléatoire", () => {
    const id = createSession(email, password);
    const cookie = { name: COOKIE_NAME, value: id, ...cookieOptions() };
    expect(id).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(JSON.stringify(cookie)).not.toContain(password);
    expect(JSON.stringify(cookie)).not.toContain(email);
    expect(cookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 1200,
      secure: process.env.NODE_ENV === "production",
    });
  });

  test("le mot de passe reste en mémoire puis est effacé", () => {
    const id = createSession(email, password);
    const live = readSession(id);
    expect(live?.password).toBe(password);
    eraseSession(id);
    expect(live?.password).toBe("");
    expect(readSession(id)).toBeNull();
  });

  test("la session expire après 20 minutes", () => {
    const id = createSession(email, password);
    vi.setSystemTime(new Date("2026-10-26T12:20:00.000Z"));
    expect(readSession(id)).toBeNull();
  });

  test("une lecture repousse l’expiration", () => {
    const id = createSession(email, password);
    vi.setSystemTime(new Date("2026-10-26T12:19:00.000Z"));
    remember(id);
    vi.setSystemTime(new Date("2026-10-26T12:20:00.000Z"));
    expect(readSession(id)?.email).toBe(email);
  });
});
