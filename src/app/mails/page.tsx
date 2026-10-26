"use client";

import { useMemo, useState } from "react";
import { Card, Field, PrimaryButton, Sheet, TextArea } from "@/components/ui";
import type { MailBox } from "@/lib/data";
import { usePanel } from "@/lib/store";

const boxes: { id: MailBox; label: string }[] = [
  { id: "inbox", label: "Réception" },
  { id: "sent", label: "Envoyés" },
  { id: "archive", label: "Archives" },
];

export default function MailsPage() {
  const { mails, openMail, toggleMailRead, moveMail, sendMail, account } = usePanel();
  const [box, setBox] = useState<MailBox>("inbox");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mails.filter((mail) => {
      if (mail.box !== box) return false;
      if (!needle) return true;
      return [mail.from, mail.subject, mail.preview, mail.email].some((part) => part.toLowerCase().includes(needle));
    });
  }, [mails, box, query]);

  const current = mails.find((mail) => mail.id === open) ?? null;
  const showDetail = Boolean(current && current.box === box);

  function select(id: string) {
    setOpen(id);
    openMail(id);
  }

  return (
    <div className="mx-auto w-full md:grid md:h-full md:grid-cols-[minmax(320px,400px)_1fr]">
      <div className={`${showDetail ? "max-md:hidden" : ""} px-4 pt-1 md:border-r md:border-line md:px-5 md:pt-7`}>
        <div className="flex items-end justify-between gap-3">
          <h1 className="large-title">Mails</h1>
          <PrimaryButton className="mb-1 h-9 px-3.5 text-[14px]" onClick={() => setCompose(true)}>
            Écrire
          </PrimaryButton>
        </div>
        <p className="mb-3 text-[15px] text-muted">
          iCloud Mail · {account?.appleId} · {mails.filter((mail) => mail.box === "inbox" && mail.unread).length} non lus
        </p>
        <div className="segmented mb-3" role="tablist">
          {boxes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={box === item.id}
              onClick={() => setBox(item.id)}
              className="segment"
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher"
          className="search-field mb-3"
        />
        <Card>
          {visible.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Aucun message.</p> : null}
          {visible.map((mail, index) => (
            <button
              key={mail.id}
              type="button"
              onClick={() => select(mail.id)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left ${
                index === visible.length - 1 ? "" : "border-b border-line"
              } ${open === mail.id ? "bg-fill" : ""}`}
            >
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${mail.unread ? "bg-apple" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate ${mail.unread ? "font-semibold" : "font-medium"}`}>{mail.from}</p>
                  <span className="shrink-0 text-[12px] text-muted">{mail.time}</span>
                </div>
                <p className="truncate text-[14px]">{mail.subject}</p>
                <p className="truncate text-[13px] text-muted">{mail.preview}</p>
              </div>
            </button>
          ))}
        </Card>
      </div>

      <div className={`px-5 pt-2 md:px-10 md:pt-8 ${showDetail ? "" : "max-md:hidden"}`}>
        {showDetail && current ? (
          <article>
            <button type="button" className="mb-3 text-[15px] text-apple md:hidden" onClick={() => setOpen(null)}>
              Retour
            </button>
            <p className="text-[13px] font-medium text-apple">{current.tag}</p>
            <h2 className="mt-2 text-[26px] font-semibold leading-tight">{current.subject}</h2>
            <p className="mt-3 text-[14px] text-muted">
              {current.from} · {current.email}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-[16px] leading-7 text-ink">{current.body}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleMailRead(current.id)}
                className="h-9 rounded-full bg-raised px-3 text-[13px]"
              >
                {current.unread ? "Marquer lu" : "Marquer non lu"}
              </button>
              {current.box === "archive" ? (
                <button type="button" onClick={() => moveMail(current.id, "inbox")} className="h-9 rounded-full bg-raised px-3 text-[13px]">
                  Désarchiver
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    moveMail(current.id, "archive");
                    setOpen(null);
                  }}
                  className="h-9 rounded-full bg-raised px-3 text-[13px]"
                >
                  Archiver
                </button>
              )}
            </div>
          </article>
        ) : (
          <p className="hidden min-h-[420px] items-center justify-center text-[17px] text-muted md:flex">
            Sélectionne un mail.
          </p>
        )}
      </div>

      <Sheet open={compose} title="Nouveau mail" onClose={() => setCompose(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!to.trim() || !body.trim()) return;
            sendMail({ to, subject, body });
            setTo("");
            setSubject("");
            setBody("");
            setCompose(false);
            setBox("sent");
            setOpen(null);
          }}
        >
          <Field label="À" value={to} onChange={(event) => setTo(event.target.value)} placeholder="nom@mail.com" required />
          <Field label="Objet" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <TextArea label="Message" value={body} onChange={(event) => setBody(event.target.value)} required />
          <PrimaryButton type="submit" className="mt-1 w-full">
            Envoyer
          </PrimaryButton>
        </form>
      </Sheet>
    </div>
  );
}
