"use client";

import { useState } from "react";
import { Card, Field, PrimaryButton, Screen, Sheet } from "@/components/ui";
import { formatLongDate, isoDate, weekDays, withAccount } from "@/lib/format";
import { usePanel } from "@/lib/store";
import { useNow } from "@/lib/use-now";

function dateFromIso(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function AgendaPage() {
  const now = useNow();
  const { events, addEvent, removeEvent, account } = usePanel();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [place, setPlace] = useState("");
  const today = now ? isoDate(now) : null;
  const active = selected ?? today;
  const days = now ? weekDays(now) : [];
  const dayEvents = active
    ? events.filter((event) => event.date === active).sort((a, b) => a.time.localeCompare(b.time))
    : [];
  const heading = active ? formatLongDate(dateFromIso(active)) : "Cette semaine";

  return (
    <Screen
      title="Agenda"
      subtitle={withAccount(heading, account?.appleId)}
      action={
        <PrimaryButton className="mb-1 px-3.5 text-[14px]" onClick={() => setOpen(true)}>
          Ajouter
        </PrimaryButton>
      }
    >
      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {days.map((item) => (
          <button
            key={item.iso}
            type="button"
            onClick={() => setSelected(item.iso)}
            className="flex flex-col items-center gap-1 py-1"
          >
            <p className={`text-[11px] font-semibold ${item.iso === today ? "text-apple-red" : "text-muted"}`}>{item.day}</p>
            <p
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[17px] font-medium ${
                active === item.iso ? "bg-apple-red text-white" : item.iso === today ? "text-apple-red" : "text-ink"
              }`}
            >
              {item.n}
            </p>
          </button>
        ))}
      </div>
      <Card>
        {dayEvents.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Rien de prévu.</p> : null}
        {dayEvents.map((event, index) => (
          <div
            key={event.id}
            className={`flex items-center gap-3 px-4 py-3.5 ${index === dayEvents.length - 1 ? "" : "border-b border-line"}`}
          >
            <span className="w-12 text-[13px] tabular-nums text-muted">{event.time}</span>
            <span className="h-10 w-1 rounded-full" style={{ background: event.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium">{event.title}</p>
              <p className="truncate text-[13px] text-muted">{event.place}</p>
            </div>
            <button type="button" onClick={() => removeEvent(event.id)} className="text-[13px] text-faint">
              Suppr.
            </button>
          </div>
        ))}
      </Card>

      <Sheet open={open} title="Nouvel événement" onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            if (!active) return;
            addEvent({ title, time, place, date: active });
            setTitle("");
            setPlace("");
            setTime("09:00");
            setOpen(false);
          }}
        >
          <Field label="Titre" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Field label="Heure" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          <Field label="Lieu" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Meet, maison…" />
          <PrimaryButton type="submit" className="w-full">
            Ajouter
          </PrimaryButton>
        </form>
      </Sheet>
    </Screen>
  );
}
