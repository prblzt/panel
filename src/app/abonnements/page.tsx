"use client";

import { useEffect, useState } from "react";
import { Card, Field, PrimaryButton, Screen, Sheet } from "@/components/ui";
import { euro } from "@/lib/data";
import { formatShortDate, isoDate, parseAmount, withAccount } from "@/lib/format";
import { usePanel } from "@/lib/store";
import { useNow } from "@/lib/use-now";

export default function AbonnementsPage() {
  const now = useNow();
  const { subscriptions, addSubscription, removeSubscription, account } = usePanel();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const total = subscriptions.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (!now) return;
    setNext((current) => current || isoDate(now));
  }, [now]);

  return (
    <Screen
      title="Abonnements"
      subtitle={withAccount(`${euro(total)} / mois`, account?.appleId)}
      action={
        <PrimaryButton className="mb-1 px-3.5 text-[14px]" onClick={() => setOpen(true)}>
          Ajouter
        </PrimaryButton>
      }
    >
      <Card>
        {subscriptions.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Aucun abonnement.</p> : null}
        {subscriptions.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3.5 ${index === subscriptions.length - 1 ? "" : "border-b border-line"}`}
          >
            <span className="h-10 w-10 shrink-0 rounded-xl" style={{ background: item.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium">{item.name}</p>
              <p className="text-[12px] text-muted">
                {item.cycle} · prochain prélèvement {formatShortDate(item.next)}
              </p>
            </div>
            <p className="tabular-nums text-[15px]">{euro(item.price)}</p>
            <button type="button" onClick={() => removeSubscription(item.id)} className="text-[13px] text-faint">
              Résilier
            </button>
          </div>
        ))}
      </Card>

      <Sheet
        open={open}
        title="Nouvel abonnement"
        onClose={() => {
          setOpen(false);
          setError("");
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const value = parseAmount(price);
            if (!name.trim() || !value || !next) {
              setError("Indique un nom, un prix et une date.");
              return;
            }
            addSubscription({ name, price: value, next });
            setName("");
            setPrice("");
            setError("");
            setOpen(false);
          }}
        >
          <Field label="Nom" value={name} onChange={(event) => setName(event.target.value)} placeholder="Spotify" required />
          <Field label="Prix mensuel" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="9,99" required />
          <Field label="Prochain prélèvement" type="date" value={next} onChange={(event) => setNext(event.target.value)} required />
          {error ? <p className="text-[13px] text-apple-red">{error}</p> : null}
          <PrimaryButton type="submit" className="w-full">
            Ajouter
          </PrimaryButton>
        </form>
      </Sheet>
    </Screen>
  );
}
