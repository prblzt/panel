import { isMailCategory, type MailCategory } from "@/lib/mail/classify";
import { isUid } from "@/lib/mail/validate";

type Store = Pick<Storage, "getItem" | "setItem">;
export type SenderRules = Record<string, MailCategory>;

export function correctionsKey(email: string, uidValidity: string) {
  return `panel-mail-categories:${email.trim().toLowerCase()}:${uidValidity}`;
}

export function senderRulesKey(email: string) {
  return `panel-mail-sender-rules:${email.trim().toLowerCase()}`;
}

export function senderAddress(email: string) {
  const value = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : "";
}

function readCategoryMap(raw: string | null, acceptKey: (key: string) => boolean) {
  try {
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const saved: Record<string, MailCategory> = {};
    for (const [key, category] of Object.entries(parsed)) {
      if (acceptKey(key) && isMailCategory(category)) saved[key] = category;
    }
    return saved;
  } catch {
    return {};
  }
}

export function readCorrections(storage: Pick<Storage, "getItem">, email: string, uidValidity: string) {
  return readCategoryMap(storage.getItem(correctionsKey(email, uidValidity)), isUid);
}

export function writeCorrection(storage: Store, email: string, uidValidity: string, uid: string, category: MailCategory) {
  if (!isUid(uid) || !isMailCategory(category)) return readCorrections(storage, email, uidValidity);
  const saved = readCorrections(storage, email, uidValidity);
  saved[uid] = category;
  storage.setItem(correctionsKey(email, uidValidity), JSON.stringify(saved));
  return saved;
}

export function omitCorrections(storage: Store, email: string, uidValidity: string, uids: string[]) {
  const saved = readCorrections(storage, email, uidValidity);
  for (const uid of uids) delete saved[uid];
  storage.setItem(correctionsKey(email, uidValidity), JSON.stringify(saved));
  return saved;
}

export function readSenderRules(storage: Pick<Storage, "getItem">, email: string) {
  return readCategoryMap(storage.getItem(senderRulesKey(email)), (key) => Boolean(senderAddress(key)));
}

export function writeSenderRule(storage: Store, email: string, sender: string, category: MailCategory) {
  const address = senderAddress(sender);
  const saved = readSenderRules(storage, email);
  if (!address || !isMailCategory(category)) return saved;
  saved[address] = category;
  storage.setItem(senderRulesKey(email), JSON.stringify(saved));
  return saved;
}

export function deleteSenderRule(storage: Store, email: string, sender: string) {
  const saved = readSenderRules(storage, email);
  delete saved[senderAddress(sender)];
  storage.setItem(senderRulesKey(email), JSON.stringify(saved));
  return saved;
}

export function resolveCategory(input: {
  auto: MailCategory;
  uid?: string;
  sender?: string;
  messageCorrections?: Record<string, MailCategory>;
  senderRules?: SenderRules;
}) {
  const personal = input.uid ? input.messageCorrections?.[input.uid] : undefined;
  if (personal) return personal;
  const sender = senderAddress(input.sender ?? "");
  const ruled = sender ? input.senderRules?.[sender] : undefined;
  return ruled ?? input.auto;
}

export function categoryFor(auto: MailCategory, saved: MailCategory | undefined) {
  return saved ?? auto;
}
