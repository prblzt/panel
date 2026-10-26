"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Card, Field, PrimaryButton, SelectField, Sheet } from "@/components/ui";
import { MailFrame } from "@/app/mails/mail-frame";
import { mailCategories, type MailCategory } from "@/lib/mail/classify";
import {
  deleteSenderRule,
  omitCorrections,
  readCorrections,
  readSenderRules,
  resolveCategory,
  senderAddress,
  writeCorrection,
  writeSenderRule,
  type SenderRules,
} from "@/lib/mail/corrections";
import type { MailSummary } from "@/lib/mail/types";
import { isIcloudAddress } from "@/lib/mail/validate";
import { usePanel } from "@/lib/store";

type MailBody = { subject: string; text: string; html: string; category: MailCategory };
type ListedMail = MailSummary & { autoCategory: MailCategory };

const categoryColor: Record<MailCategory, string> = {
  Finances: "#34C759",
  Travail: "#007AFF",
  Publicités: "#FF9500",
  Achats: "#AF52DE",
  "Réseaux sociaux": "#5AC8FA",
  Personnel: "#FF2D55",
  Autres: "#8E8E93",
};

function paint(mails: ListedMail[], corrections: Record<string, MailCategory>, rules: SenderRules) {
  return mails.map((mail) => ({
    ...mail,
    category: resolveCategory({
      auto: mail.autoCategory,
      uid: mail.uid,
      sender: mail.email,
      messageCorrections: corrections,
      senderRules: rules,
    }),
  }));
}

function CategoryMark({ category, note }: { category: MailCategory; note?: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-fill px-2.5 py-1 text-[12px] font-medium leading-4 text-ink">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: categoryColor[category] }} />
      <span className="truncate">
        {category}
        {note ? ` · ${note}` : ""}
      </span>
    </span>
  );
}

function formatMailTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MailsPage() {
  const { account } = usePanel();
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ListedMail[]>([]);
  const [uidValidity, setUidValidity] = useState("0");
  const [overrides, setOverrides] = useState<Record<string, MailCategory>>({});
  const [senderRules, setSenderRules] = useState<SenderRules>({});
  const [rulesOpen, setRulesOpen] = useState(false);
  const [choice, setChoice] = useState<MailCategory | null>(null);
  const [filter, setFilter] = useState<"Toutes" | MailCategory>("Toutes");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [body, setBody] = useState<MailBody | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);

  const suggestedEmail = account?.appleId && isIcloudAddress(account.appleId) ? account.appleId : "";
  const shownEmail = email ?? suggestedEmail;

  const loadInbox = useCallback(async (owner: string) => {
    const response = await fetch("/api/mail/messages", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      messages?: MailSummary[];
      uidValidity?: string;
    } | null;
    if (response.status === 401) {
      setConnected(false);
      setMessages([]);
      setOpen(null);
      setBody(null);
      return;
    }
    if (!response.ok || !payload?.ok || !payload.messages) {
      setError("Lecture impossible.");
      return;
    }
    const validity = payload.uidValidity || "0";
    const saved = owner ? readCorrections(localStorage, owner, validity) : {};
    const rules = owner ? readSenderRules(localStorage, owner) : {};
    setUidValidity(validity);
    setOverrides(saved);
    setSenderRules(rules);
    setMessages(
      payload.messages.map((mail) => ({
        ...mail,
        autoCategory: mail.category,
        category: resolveCategory({
          auto: mail.category,
          uid: mail.uid,
          sender: mail.email,
          messageCorrections: saved,
          senderRules: rules,
        }),
      })),
    );
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/mail/status", { cache: "no-store" });
        const payload = (await response.json()) as { connected?: boolean; email?: string };
        if (!active) return;
        if (payload.connected && payload.email) {
          setConnected(true);
          setAccountEmail(payload.email);
          await loadInbox(payload.email);
        }
      } catch {
        if (active) setError("Lecture impossible.");
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadInbox]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((mail) => {
      if (filter !== "Toutes" && mail.category !== filter) return false;
      if (!needle) return true;
      return [mail.from, mail.email, mail.subject].some((part) => part.toLowerCase().includes(needle));
    });
  }, [messages, query, filter]);

  const current = messages.find((mail) => mail.uid === open) ?? null;
  const showDetail = Boolean(current);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const secret = password;
    setPassword("");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/mail/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: shownEmail, password: secret }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; email?: string } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Connexion refusée.");
        return;
      }
      const owner = payload.email || shownEmail.trim().toLowerCase();
      setConnected(true);
      setAccountEmail(owner);
      await loadInbox(owner);
    } catch {
      setError("Connexion refusée.");
    } finally {
      setPending(false);
    }
  }

  async function select(uid: string) {
    setOpen(uid);
    setChoice(null);
    setBody(null);
    setLoadingBody(true);
    setError("");
    try {
      const response = await fetch(`/api/mail/messages/${uid}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; message?: MailBody } | null;
      if (response.status === 401) {
        setConnected(false);
        setMessages([]);
        setOpen(null);
        return;
      }
      if (!response.ok || !payload?.ok || !payload.message) {
        setError("Lecture impossible.");
        return;
      }
      const message = payload.message;
      setBody(message);
      setChoice(null);
      const saved = readCorrections(localStorage, accountEmail, uidValidity);
      const rules = readSenderRules(localStorage, accountEmail);
      setMessages((prev) =>
        prev.map((mail) => {
          if (mail.uid !== uid) return mail;
          const next = { ...mail, autoCategory: message.category };
          return {
            ...next,
            category: resolveCategory({
              auto: next.autoCategory,
              uid,
              sender: mail.email,
              messageCorrections: saved,
              senderRules: rules,
            }),
          };
        }),
      );
    } catch {
      setError("Lecture impossible.");
    } finally {
      setLoadingBody(false);
    }
  }

  async function disconnect() {
    setPending(true);
    setError("");
    try {
      await fetch("/api/mail/disconnect", { method: "POST" });
    } catch {
      setError("Lecture impossible.");
    } finally {
      setConnected(false);
      setAccountEmail("");
      setMessages([]);
      setOverrides({});
      setSenderRules({});
      setRulesOpen(false);
      setChoice(null);
      setUidValidity("0");
      setFilter("Toutes");
      setOpen(null);
      setBody(null);
      setPassword("");
      setPending(false);
    }
  }

  function applyOne(category: MailCategory) {
    if (!current || !accountEmail) return;
    const saved = writeCorrection(localStorage, accountEmail, uidValidity, current.uid, category);
    setOverrides(saved);
    setMessages((prev) => paint(prev, saved, senderRules));
    setChoice(null);
  }

  function applySender(category: MailCategory) {
    if (!current || !accountEmail || !senderAddress(current.email)) return;
    const rules = writeSenderRule(localStorage, accountEmail, current.email, category);
    const same = messages.filter((mail) => senderAddress(mail.email) === senderAddress(current.email)).map((mail) => mail.uid);
    const saved = omitCorrections(localStorage, accountEmail, uidValidity, same);
    setSenderRules(rules);
    setOverrides(saved);
    setMessages((prev) => paint(prev, saved, rules));
    setChoice(null);
  }

  function changeRule(sender: string, category: MailCategory) {
    if (!accountEmail) return;
    const rules = writeSenderRule(localStorage, accountEmail, sender, category);
    setSenderRules(rules);
    setMessages((prev) => paint(prev, overrides, rules));
  }

  function removeRule(sender: string) {
    if (!accountEmail) return;
    const rules = deleteSenderRule(localStorage, accountEmail, sender);
    setSenderRules(rules);
    setMessages((prev) => paint(prev, overrides, rules));
  }

  const ruleEntries = Object.entries(senderRules);

  return (
    <div className="mx-auto w-full md:grid md:h-full md:grid-cols-[minmax(320px,400px)_1fr]">
      <div className={`${showDetail ? "max-md:hidden" : ""} px-4 pt-1 md:border-r md:border-line md:px-5 md:pt-7`}>
        <div className="flex items-end justify-between gap-3">
          <h1 className="large-title">Mails</h1>
          <PrimaryButton className="mb-1 h-9 px-3.5 text-[14px]" disabled>
            Écrire
          </PrimaryButton>
        </div>
        <p className="mb-3 text-[15px] text-muted">L’envoi de courriel n’est pas activé.</p>
        <p className="mb-3 text-[13px] leading-5 text-muted">
          Le mot de passe pour app reste dans la mémoire de ce serveur jusqu’à la déconnexion, 20 minutes sans activité,
          ou l’arrêt du serveur. Il n’est pas enregistré dans un fichier, un cookie ou le navigateur.
        </p>

        {error ? <p className="mb-3 text-[14px] text-apple-red">{error}</p> : null}

        {!ready ? <p className="text-[15px] text-muted">Chargement…</p> : null}

        {ready && !connected ? (
          <form className="grid max-w-md gap-3" autoComplete="off" onSubmit={submit}>
            <Field
              label="Adresse iCloud"
              type="email"
              inputMode="email"
              autoComplete="off"
              value={shownEmail}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@icloud.com"
              required
            />
            <Field
              label="Mot de passe pour app"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Connexion…" : "Tester la connexion"}
            </PrimaryButton>
          </form>
        ) : null}

        {ready && connected ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[15px] text-muted">iCloud Mail · {accountEmail}</p>
              <button type="button" onClick={() => void disconnect()} className="shrink-0 text-[15px] text-apple" disabled={pending}>
                Déconnecter
              </button>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium uppercase tracking-wide text-muted">Filtres</p>
              <button type="button" onClick={() => setRulesOpen(true)} className="shrink-0 text-[15px] text-apple">
                Règles{ruleEntries.length ? ` (${ruleEntries.length})` : ""}
              </button>
            </div>
            <div
              className="mb-4 flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Catégories"
            >
              {(["Toutes", ...mailCategories] as const).map((item) => {
                const selected = filter === item;
                const tint = item === "Toutes" ? "#007AFF" : categoryColor[item];
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(item)}
                    className={`inline-flex h-9 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium ${
                      selected ? "text-white" : "bg-raised text-ink"
                    }`}
                    style={selected ? { background: tint } : undefined}
                  >
                    {item !== "Toutes" ? (
                      <span className="h-2 w-2 rounded-full" style={{ background: selected ? "#fff" : tint }} />
                    ) : null}
                    {item}
                  </button>
                );
              })}
            </div>
            <p className="mb-4 text-[13px] leading-5 text-muted">
              Le classement reste dans l’application. Aucun message n’est déplacé ni modifié sur iCloud.
            </p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher"
              className="search-field mb-4"
            />
            <Card>
              {visible.length === 0 ? <p className="px-4 py-8 text-[15px] text-muted">Aucun message.</p> : null}
              {visible.map((mail, index) => {
                const note = overrides[mail.uid] ? "corrigée" : senderRules[senderAddress(mail.email)] ? "règle" : "";
                return (
                  <button
                    key={mail.uid}
                    type="button"
                    onClick={() => void select(mail.uid)}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left ${
                      index === visible.length - 1 ? "" : "border-b border-line"
                    } ${open === mail.uid ? "bg-fill" : ""}`}
                  >
                    <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${mail.unread ? "bg-apple" : "bg-transparent"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`truncate text-[16px] leading-5 ${mail.unread ? "font-semibold" : "font-medium"}`}>{mail.from}</p>
                        <span className="shrink-0 text-[12px] tabular-nums text-muted">{formatMailTime(mail.time)}</span>
                      </div>
                      <p className="mt-1 truncate text-[15px] leading-5 text-ink">{mail.subject}</p>
                      <div className="mt-2">
                        <CategoryMark category={mail.category} note={note} />
                      </div>
                      <p className="mt-1.5 truncate text-[13px] leading-5 text-muted">{mail.email}</p>
                    </div>
                  </button>
                );
              })}
            </Card>
          </>
        ) : null}
      </div>

      <div className={`px-5 pt-2 md:px-10 md:pt-8 ${showDetail ? "" : "max-md:hidden"}`}>
        {showDetail && current ? (
          <article>
            <button type="button" className="mb-3 text-[15px] text-apple md:hidden" onClick={() => setOpen(null)}>
              Retour
            </button>
            <div className="mt-1">
              <CategoryMark
                category={current.category}
                note={overrides[current.uid] ? "corrigée" : senderRules[senderAddress(current.email)] ? "règle" : ""}
              />
            </div>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight sm:text-[28px]">
              {body?.subject || current.subject}
            </h2>
            <p className="mt-3 break-words text-[15px] leading-6 text-ink">
              {current.from}
              <span className="text-muted"> · {current.email}</span>
            </p>
            <p className="mt-1 text-[13px] text-muted">{formatMailTime(current.time)}</p>
            <div className="mt-5 max-w-md rounded-[14px] bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <SelectField
                label="Catégorie"
                value={choice ?? current.category}
                onChange={(event) => {
                  const next = event.target.value as MailCategory;
                  setChoice(next === current.category ? null : next);
                }}
              >
                {mailCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              {choice ? (
                <div className="mt-3 grid gap-2">
                  <p className="text-[13px] leading-5 text-muted">Appliquer « {choice} » à…</p>
                  <button
                    type="button"
                    onClick={() => applyOne(choice)}
                    className="h-11 rounded-full bg-fill px-4 text-[15px] font-medium text-ink"
                  >
                    Ce mail uniquement
                  </button>
                  <button
                    type="button"
                    onClick={() => applySender(choice)}
                    disabled={!senderAddress(current.email)}
                    className="h-11 rounded-full bg-apple px-4 text-[15px] font-medium text-white disabled:opacity-40"
                  >
                    Tous les mails de cet expéditeur
                  </button>
                  <button type="button" onClick={() => setChoice(null)} className="h-10 text-[15px] text-apple">
                    Annuler
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-[13px] leading-5 text-muted">
                  {overrides[current.uid]
                    ? "Correction enregistrée pour ce mail. Elle reste sur cet appareil."
                    : senderRules[senderAddress(current.email)]
                      ? "Une règle d’expéditeur s’applique. Elle prime sur le classement automatique."
                      : "Tu peux corriger ce mail ou tous ceux de cet expéditeur."}
                </p>
              )}
            </div>
            {loadingBody ? <p className="mt-6 text-[16px] text-muted">Chargement…</p> : null}
            {body?.html ? <MailFrame html={body.html} /> : null}
            {body && !body.html ? (
              <p className="mt-6 whitespace-pre-wrap text-[16px] leading-7 text-ink">
                {body.text || "Ce message n’a pas de texte."}
              </p>
            ) : null}
          </article>
        ) : (
          <p className="hidden min-h-[420px] items-center justify-center text-[17px] text-muted md:flex">
            {connected ? "Sélectionne un mail." : "Connecte ta boîte iCloud."}
          </p>
        )}
      </div>
      <Sheet open={rulesOpen} title="Règles d’expéditeur" onClose={() => setRulesOpen(false)}>
        <p className="text-[13px] leading-5 text-muted">
          Ces règles restent sur cet appareil après une actualisation ou une reconnexion. Elles ne modifient pas iCloud.
        </p>
        {ruleEntries.length === 0 ? <p className="mt-4 text-[15px] text-muted">Aucune règle.</p> : null}
        <div className="mt-4 grid gap-3">
          {ruleEntries.map(([sender, category]) => (
            <div key={sender} className="rounded-[14px] bg-fill p-3">
              <p className="truncate text-[15px] font-medium">{sender}</p>
              <div className="mt-2">
                <CategoryMark category={category} />
              </div>
              <div className="mt-3">
                <SelectField label="Catégorie" value={category} onChange={(event) => changeRule(sender, event.target.value as MailCategory)}>
                  {mailCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </SelectField>
              </div>
              <button type="button" onClick={() => removeRule(sender)} className="mt-2 text-[15px] text-apple-red">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
