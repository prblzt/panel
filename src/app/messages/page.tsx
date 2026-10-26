"use client";

import { useEffect, useState } from "react";
import { Field, PrimaryButton, Sheet } from "@/components/ui";
import { usePanel } from "@/lib/store";

export default function MessagesPage() {
  const { conversations, openConversation, sendMessage, createConversation, account } = usePanel();
  const [id, setId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const current = conversations.find((thread) => thread.id === id) ?? null;

  useEffect(() => {
    if (id || !conversations[0]) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      setId(conversations[0].id);
      openConversation(conversations[0].id);
    }
  }, [conversations, id, openConversation]);

  function select(next: string) {
    setId(next);
    openConversation(next);
  }

  return (
    <div className="mx-auto grid min-h-full w-full md:h-full md:grid-cols-[minmax(280px,340px)_1fr]">
      <div className={`${current ? "max-md:hidden" : ""} px-4 pt-1 md:border-r md:border-line md:px-5 md:pt-7`}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="large-title">Messages</h1>
            <p className="text-[15px] text-muted">iMessage · {account?.appleId}</p>
          </div>
          <PrimaryButton className="mb-1 h-9 px-3.5 text-[14px]" onClick={() => setCreating(true)}>
            Nouveau
          </PrimaryButton>
        </div>
        <div className="mt-4 overflow-hidden rounded-[10px] bg-surface">
          {conversations.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Aucune conversation.</p> : null}
          {conversations.map((thread, index) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => select(thread.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                index === conversations.length - 1 ? "" : "border-b border-line"
              } ${id === thread.id ? "bg-fill" : ""}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-raised text-[15px] font-semibold">
                {thread.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <p className="truncate font-medium">{thread.name}</p>
                  <span className="text-[12px] text-muted">{thread.time}</span>
                </div>
                <p className="truncate text-[13px] text-muted">{thread.last}</p>
              </div>
              {thread.unread > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-apple px-1.5 text-[12px] font-semibold text-white">
                  {thread.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex min-h-[70dvh] flex-col md:min-h-0 ${current ? "" : "max-md:hidden"}`}>
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 md:bg-surface">
          <button type="button" className="text-apple md:hidden" onClick={() => setId(null)}>
            Retour
          </button>
          <p className="text-[17px] font-semibold">{current?.name ?? "Choisis une conversation"}</p>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 px-4 py-3">
          {(current?.messages ?? []).map((message, index) => (
            <div
              key={`${current?.id ?? "none"}-${index}`}
              className={`max-w-[78%] rounded-[18px] px-3 py-1.5 text-[17px] leading-snug ${
                message.fromMe ? "bubble-out" : "bubble-in"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 px-4 pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            const text = draft.trim();
            if (!text || !current) return;
            sendMessage(current.id, text);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message"
            disabled={!current}
            className="message-field disabled:opacity-40"
          />
          <button
            type="submit"
            aria-label="Envoyer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-apple text-[18px] font-semibold text-white disabled:opacity-40"
            disabled={!current}
          >
            ↑
          </button>
        </form>
      </div>

      <Sheet open={creating} title="Nouvelle conversation" onClose={() => setCreating(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            const created = createConversation(name);
            setName("");
            setCreating(false);
            setId(created);
          }}
        >
          <Field label="Nom" value={name} onChange={(event) => setName(event.target.value)} placeholder="Léa" required />
          <PrimaryButton type="submit" className="w-full">
            Créer
          </PrimaryButton>
        </form>
      </Sheet>
    </div>
  );
}
