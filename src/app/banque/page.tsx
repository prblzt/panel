"use client";

import { useState } from "react";
import { Card, Field, PrimaryButton, Screen, SelectField, Sheet } from "@/components/ui";
import { euro } from "@/lib/data";
import { formatWhen, parseAmount, withAccount } from "@/lib/format";
import { usePanel } from "@/lib/store";
import { useNow } from "@/lib/use-now";

const categories = ["Courses", "Maison", "Abonnements", "Transfert", "Revenus", "Santé", "Loisirs", "Autre"];

export default function BanquePage() {
  const now = useNow();
  const { accounts, transactions, addTransaction, transfer, account: appleAccount } = usePanel();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"expense" | "income" | "transfer">("expense");
  const [source, setSource] = useState(accounts[0]?.id ?? "");
  const [target, setTarget] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState("");

  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const visible = transactions.filter((tx) => !accountId || tx.accountId === accountId);

  return (
    <Screen
      title="Banque"
      subtitle={withAccount(`Patrimoine ${euro(total)}`, appleAccount?.appleId)}
      action={
        <PrimaryButton className="mb-1 px-3.5 text-[14px]" onClick={() => setOpen(true)}>
          Opération
        </PrimaryButton>
      }
    >
      <div className="flex gap-3 overflow-x-auto pb-1">
        {accounts.map((account, index) => (
          <button
            key={account.id}
            type="button"
            onClick={() => setAccountId((current) => (current === account.id ? null : account.id))}
            className={`min-w-[240px] flex-1 rounded-[16px] bg-gradient-to-br p-5 text-left text-white shadow-lg ${
              index % 2 === 0 ? "from-[#1c1c1e] to-[#3a3a3c]" : "from-[#0a2540] to-[#1473c6]"
            } ${accountId === account.id ? "outline outline-2 outline-offset-2 outline-apple" : ""}`}
          >
            <p className="text-[12px] text-white/60">{account.bank}</p>
            <p className="mt-6 text-[13px] text-white/70">{account.name}</p>
            <p className="text-[26px] font-semibold tabular-nums">{euro(account.balance)}</p>
            <p className="mt-3 text-[12px] tracking-wide text-white/50">{account.iban}</p>
          </button>
        ))}
      </div>

      <h2 className="section-title">
        {accountId ? accounts.find((account) => account.id === accountId)?.name : "Opérations"}
      </h2>
      <Card>
        {visible.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Aucune opération.</p> : null}
        {visible.map((tx, index) => (
          <div
            key={tx.id}
            className={`flex items-center justify-between px-4 py-3 ${index === visible.length - 1 ? "" : "border-b border-line"}`}
          >
            <div>
              <p className="text-[15px] font-medium">{tx.label}</p>
              <p className="text-[12px] text-muted">
                {tx.category} · {formatWhen(tx.date, now)}
                {accountId ? "" : ` · ${accounts.find((account) => account.id === tx.accountId)?.name ?? ""}`}
              </p>
            </div>
            <p className={`tabular-nums ${tx.amount > 0 ? "text-apple-green" : "text-ink"}`}>
              {tx.amount > 0 ? "+" : ""}
              {euro(tx.amount)}
            </p>
          </div>
        ))}
      </Card>
      <p className="mt-3 px-1 text-[12px] text-faint">
        Aucune connexion bancaire. Les montants restent sur cet appareil.
      </p>

      <Sheet
        open={open}
        title="Nouvelle opération"
        onClose={() => {
          setOpen(false);
          setError("");
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const value = parseAmount(amount);
            if (!label.trim() || !value) {
              setError("Indique un libellé et un montant supérieur à 0.");
              return;
            }
            if (kind === "transfer") {
              if (source === target) {
                setError("Choisis deux comptes différents.");
                return;
              }
              transfer({ fromId: source, toId: target, amount: value, label });
            } else {
              addTransaction({
                accountId: source,
                label,
                amount: value,
                category: kind === "income" ? "Revenus" : category,
                income: kind === "income",
              });
            }
            setLabel("");
            setAmount("");
            setError("");
            setOpen(false);
          }}
        >
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-raised p-1">
            {(
              [
                ["expense", "Dépense"],
                ["income", "Revenu"],
                ["transfer", "Virement"],
              ] as const
            ).map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className={`h-9 rounded-xl text-[13px] ${kind === id ? "bg-apple font-medium text-white" : "text-muted"}`}
              >
                {name}
              </button>
            ))}
          </div>
          <SelectField label={kind === "transfer" ? "Depuis" : "Compte"} value={source} onChange={(event) => setSource(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </SelectField>
          {kind === "transfer" ? (
            <SelectField label="Vers" value={target} onChange={(event) => setTarget(event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </SelectField>
          ) : null}
          <Field label="Libellé" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Monoprix" required />
          <Field label="Montant" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="12,50" required />
          {kind === "expense" ? (
            <SelectField label="Catégorie" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
          ) : null}
          {error ? <p className="text-[13px] text-apple-red">{error}</p> : null}
          <PrimaryButton type="submit" className="w-full">
            Enregistrer
          </PrimaryButton>
        </form>
      </Sheet>
    </Screen>
  );
}
