/** @vitest-environment node */

import { describe, expect, test } from "vitest";
import { toPlainText } from "@/lib/mail/text";

describe("texte d’un message", () => {
  test("retire le HTML et les scripts", () => {
    const text = toPlainText({ html: "<p>Bonjour</p><script>alert(1)</script><img src=x onerror=alert(1)>" });
    expect(text).toBe("Bonjour");
    expect(text).not.toContain("<");
    expect(text).not.toContain("alert");
  });

  test("conserve le texte brut", () => {
    expect(toPlainText({ text: "Ligne 1\nLigne 2", html: "<b>ignoré</b>" })).toBe("Ligne 1\nLigne 2");
  });
});
