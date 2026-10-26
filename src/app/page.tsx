"use client";

import Link from "next/link";
import { InstallCard } from "@/components/InstallCard";
import { modules, MusicAppIcon } from "@/components/icons";
import { euro, playlistTitle } from "@/lib/data";
import { formatLongDate, isoDate } from "@/lib/format";
import { usePanel } from "@/lib/store";
import { useNow } from "@/lib/use-now";

export default function Home() {
  const now = useNow();
  const { mails, conversations, rooms, accounts, events, subscriptions, tracks, trackId, account } = usePanel();
  const unreadMail = mails.filter((mail) => mail.box === "inbox" && mail.unread).length;
  const unreadMsg = conversations.reduce((total, thread) => total + thread.unread, 0);
  const lightsOn = rooms.flatMap((room) => room.devices).filter((device) => device.kind === "light" && device.on).length;
  const monthlySubs = subscriptions.reduce((total, item) => total + item.price, 0);
  const today = now ? isoDate(now) : "";
  const todays = today
    ? events.filter((event) => event.date === today).sort((a, b) => a.time.localeCompare(b.time))
    : [];
  const shown = todays.length
    ? todays
    : [...events].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 4);
  const track = tracks.find((item) => item.id === trackId) ?? tracks[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-1 md:px-8 md:pt-7">
      <p className="text-[15px] font-medium text-muted">{now ? formatLongDate(now) : "Aujourd’hui"}</p>
      <h1 className="large-title">Bonjour, {account?.firstName}</h1>
      <p className="text-[15px] text-muted">{account?.appleId}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat href="/mails" label="Mails" value={String(unreadMail)} hint="non lus" />
        <Stat href="/messages" label="Messages" value={String(unreadMsg)} hint="nouveaux" />
        <Stat href="/maison" label="Lumières" value={String(lightsOn)} hint="allumées" />
        <Stat href="/banque" label="Courant" value={accounts[0] ? euro(accounts[0].balance) : "—"} hint={accounts[0]?.bank ?? "Banque"} />
      </div>

      <h2 className="section-title">Apps</h2>
      <div className="grid grid-cols-4 gap-y-4 sm:grid-cols-8">
        {modules.map(({ href, label, Art }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1.5 active:opacity-70">
            <span className="app-icon h-[60px] w-[60px]">
              <Art className="h-full w-full" day={now?.getDate()} />
            </span>
            <span className="w-16 text-center text-[11px] font-medium leading-tight text-ink">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <section className="widget">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-[17px] font-semibold tracking-tight">{todays.length ? "Aujourd’hui" : "Agenda"}</h3>
            <Link href="/agenda" className="text-[13px] text-apple">
              Agenda
            </Link>
          </div>
          <ul className="mt-2 pb-2">
            {shown.length === 0 ? (
              <li className="px-4 py-4 text-[14px] text-muted">Rien de prévu.</li>
            ) : (
              shown.map((event) => (
                <li key={event.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="h-9 w-1 rounded-full" style={{ background: event.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{event.title}</p>
                    <p className="text-[12px] text-muted">{event.place}</p>
                  </div>
                  <span className="text-[13px] tabular-nums text-muted">{event.time}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="grid gap-3">
          <Link href="/musique">
            <div className="widget flex items-center gap-4 p-4">
              <div className="app-icon h-14 w-14">
                <MusicAppIcon className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-muted">{playlistTitle}</p>
                <p className="truncate text-[16px] font-medium">{track?.title ?? "Aucun titre"}</p>
                <p className="truncate text-[13px] text-muted">{track?.artist ?? "Ajoute un morceau"}</p>
              </div>
            </div>
          </Link>
          <Link href="/abonnements">
            <div className="widget p-4">
              <p className="text-[12px] text-muted">Abonnements</p>
              <p className="widget-value mt-1">{euro(monthlySubs)}</p>
              <p className="text-[13px] text-muted">par mois · {subscriptions.length} services</p>
            </div>
          </Link>
        </div>
      </div>

      <InstallCard />
    </div>
  );
}

function Stat({ href, label, value, hint }: { href: string; label: string; value: string; hint: string }) {
  return (
    <Link href={href} className="widget block p-4 active:scale-[0.98]">
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <p className="widget-value mt-2">{value}</p>
      <p className="mt-0.5 text-[13px] text-muted">{hint}</p>
    </Link>
  );
}
