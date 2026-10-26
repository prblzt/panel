/** @vitest-environment node */
import { describe, expect, test } from "vitest";
import { classifyMail } from "@/lib/mail/classify";
import {
  deleteSenderRule,
  omitCorrections,
  readSenderRules,
  resolveCategory,
  senderAddress,
  writeCorrection,
  writeSenderRule,
} from "@/lib/mail/corrections";

type Listed = { uid: string; email: string; autoCategory: ReturnType<typeof classifyMail> };

function memory() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

function shown(messages: Listed[], storage: ReturnType<typeof memory>, account: string, validity: string) {
  const corrections = storage.getItem(`panel-mail-categories:${account}:${validity}`);
  const rules = readSenderRules(storage, account);
  const parsed = corrections ? (JSON.parse(corrections) as Record<string, Listed["autoCategory"]>) : {};
  return messages.map((mail) =>
    resolveCategory({
      auto: mail.autoCategory,
      uid: mail.uid,
      sender: mail.email,
      messageCorrections: parsed,
      senderRules: rules,
    }),
  );
}

describe("règles d’expéditeur", () => {
  const bank = {
    from: "Bankin",
    email: "alertes@bankin.com",
    subject: "Solde",
    text: "Virement reçu",
  };

  test("une règle s’applique aux mails déjà présents et à un mail futur", () => {
    const storage = memory();
    const present: Listed[] = [
      { uid: "8", email: "alertes@bankin.com", autoCategory: classifyMail(bank) },
      { uid: "9", email: "shop@amazon.fr", autoCategory: "Achats" },
    ];
    expect(present[0].autoCategory).toBe("Finances");
    writeCorrection(storage, "ada@icloud.com", "42", "8", "Travail");

    writeSenderRule(storage, "Ada@icloud.com", "Alertes@bankin.com", "Personnel");
    const uids = present.filter((mail) => senderAddress(mail.email) === "alertes@bankin.com").map((mail) => mail.uid);
    omitCorrections(storage, "ada@icloud.com", "42", uids);

    expect(shown(present, storage, "ada@icloud.com", "42")).toEqual(["Personnel", "Achats"]);

    const future: Listed = { uid: "30", email: "alertes@bankin.com", autoCategory: classifyMail(bank) };
    expect(shown([future], storage, "ada@icloud.com", "42")[0]).toBe("Personnel");
    expect(readSenderRules(storage, "ada@icloud.com")).toEqual({ "alertes@bankin.com": "Personnel" });
  });

  test("la règle prime sur le classement automatique et reste après relecture", () => {
    const storage = memory();
    writeSenderRule(storage, "ada@icloud.com", "alertes@bankin.com", "Personnel");
    const reloaded = readSenderRules(storage, "ada@icloud.com");
    expect(
      resolveCategory({
        auto: classifyMail(bank),
        uid: "99",
        sender: "alertes@bankin.com",
        senderRules: reloaded,
      }),
    ).toBe("Personnel");
    expect(classifyMail(bank)).toBe("Finances");
  });

  test("un mail seul ne crée pas de règle, et une correction précise reste prioritaire", () => {
    const storage = memory();
    writeCorrection(storage, "ada@icloud.com", "42", "8", "Travail");
    expect(readSenderRules(storage, "ada@icloud.com")).toEqual({});
    writeSenderRule(storage, "ada@icloud.com", "alertes@bankin.com", "Personnel");
    expect(
      resolveCategory({
        auto: "Finances",
        uid: "8",
        sender: "alertes@bankin.com",
        messageCorrections: { "8": "Travail" },
        senderRules: readSenderRules(storage, "ada@icloud.com"),
      }),
    ).toBe("Travail");
  });

  test("supprimer la règle rend le classement automatique", () => {
    const storage = memory();
    writeSenderRule(storage, "ada@icloud.com", "alertes@bankin.com", "Personnel");
    deleteSenderRule(storage, "ada@icloud.com", "alertes@bankin.com");
    expect(readSenderRules(storage, "ada@icloud.com")).toEqual({});
    expect(resolveCategory({ auto: classifyMail(bank), sender: "alertes@bankin.com", senderRules: {} })).toBe("Finances");
  });
});
