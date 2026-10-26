/** @vitest-environment node */

import { describe, expect, test } from "vitest";
import { classifyMail } from "@/lib/mail/classify";
import { categoryFor, readCorrections, writeCorrection } from "@/lib/mail/corrections";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("classement des courriels", () => {
  test("reconnaît une banque même si le message parle d’offre", () => {
    expect(
      classifyMail({
        from: "Bankin",
        email: "ne-pas-repondre@bankin.com",
        subject: "Offre exclusive",
        text: "Votre solde",
      }),
    ).toBe("Finances");
  });

  test("reconnaît le travail, les achats, les publicités et les réseaux", () => {
    expect(classifyMail({ from: "Hellowork", email: "news@emails.hellowork.com", subject: "Candidature", text: "" })).toBe("Travail");
    expect(classifyMail({ from: "Amazon", email: "auto@amazon.fr", subject: "Votre commande", text: "Colis expédié" })).toBe("Achats");
    expect(classifyMail({ from: "Boutique", email: "news@exemple.fr", subject: "Newsletter soldes", text: "Désabonnement" })).toBe("Publicités");
    expect(classifyMail({ from: "LinkedIn", email: "notifications@linkedin.com", subject: "Invitation", text: "" })).toBe("Réseaux sociaux");
    expect(
      classifyMail({
        from: "Showroomprive.com",
        email: "masque@privaterelay.appleid.com",
        subject: "Nouvelles ventes",
        text: "",
      }),
    ).toBe("Achats");
  });

  test("reconnaît un message personnel sans signal commercial", () => {
    expect(classifyMail({ from: "Maman", email: "maman@exemple.fr", subject: "Ce week-end", text: "Bisous" })).toBe("Personnel");
  });

  test("classe dans Autres quand aucun signal n’est clair", () => {
    expect(classifyMail({ from: "Ada", email: "ada@exemple.fr", subject: "Bonjour", text: "À demain" })).toBe("Autres");
  });

  test("classe dans Autres quand deux catégories se contredisent", () => {
    expect(
      classifyMail({
        from: "Camille",
        email: "camille@exemple.fr",
        subject: "Pour toi",
        text: "Bisous, voici ta facture et le prélèvement",
      }),
    ).toBe("Autres");
    expect(
      classifyMail({
        from: "Service",
        email: "service@exemple.fr",
        subject: "Info",
        text: "Votre commande et le prélèvement partent demain",
      }),
    ).toBe("Autres");
  });

  test("une correction manuelle n’est pas remplacée par le classement", () => {
    const storage = memory();
    const again = classifyMail({ from: "Bankin", email: "a@bankin.com", subject: "Solde", text: "Virement" });
    expect(again).toBe("Finances");
    writeCorrection(storage, "Ada@icloud.com", "42", "15", "Personnel");
    const saved = readCorrections(storage, "ada@icloud.com", "42");
    expect(categoryFor(classifyMail({ from: "Bankin", email: "a@bankin.com", subject: "Solde", text: "Virement" }), saved["15"])).toBe(
      "Personnel",
    );
    expect(saved["15"]).toBe("Personnel");
  });

  test("ignore une correction illisible", () => {
    const storage = memory();
    storage.setItem("panel-mail-categories:ada@icloud.com:42", JSON.stringify({ "15": "Secret", "../1": "Finances", "4": "Achats" }));
    expect(readCorrections(storage, "ada@icloud.com", "42")).toEqual({ "4": "Achats" });
  });
});
