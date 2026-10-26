/** @vitest-environment node */

import { describe, expect, test } from "vitest";
import { sanitizeMailHtml } from "@/lib/mail/html";

const attacks = [
  "<script>alert(1)</script>",
  "<img src=x onerror=\"alert(1)\">",
  "<iframe src=\"https://exemple.fr\"></iframe>",
  "<object data=\"https://exemple.fr\"></object>",
  "<embed src=\"https://exemple.fr\">",
  "<form action=\"https://exemple.fr\"><input name=\"secret\"></form>",
  "<a href=\"javascript:alert(1)\">lien</a>",
  "<div style=\"background:url(javascript:alert(1))\">x</div>",
];

describe("HTML de courriel", () => {
  test("garde la mise en forme sûre", () => {
    const clean = sanitizeMailHtml("<p>Bonjour <strong>Théo</strong></p><a href=\"https://exemple.fr/a\">site</a>");
    expect(clean).toContain("<p>");
    expect(clean).toContain("<strong>Théo</strong>");
    expect(clean).toContain('href="https://exemple.fr/a"');
    expect(clean).toContain('target="_blank"');
    expect(sanitizeMailHtml('<img src="https://exemple.fr/a.png" alt="photo">')).toContain("<img");
  });

  test("retire les scripts, formulaires, cadres et URL dangereuses", () => {
    const clean = sanitizeMailHtml(`<p>Bonjour</p>${attacks.join("")}`);
    expect(clean).toContain("Bonjour");
    expect(clean.toLowerCase()).not.toContain("<script");
    expect(clean.toLowerCase()).not.toContain("onerror");
    expect(clean.toLowerCase()).not.toContain("<iframe");
    expect(clean.toLowerCase()).not.toContain("<object");
    expect(clean.toLowerCase()).not.toContain("<embed");
    expect(clean.toLowerCase()).not.toContain("<form");
    expect(clean.toLowerCase()).not.toContain("<input");
    expect(clean.toLowerCase()).not.toContain("javascript:");
    expect(clean.toLowerCase()).not.toContain("alert");
  });

  test("un message sans HTML exploitable reste vide", () => {
    expect(sanitizeMailHtml("<script>alert(1)</script>")).toBe("");
    expect(sanitizeMailHtml("<p></p><script>alert(1)</script>")).toBe("");
  });
});
