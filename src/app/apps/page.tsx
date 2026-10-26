"use client";

import Link from "next/link";
import { modules } from "@/components/icons";
import { Screen } from "@/components/ui";
import { usePanel } from "@/lib/store";
import { useNow } from "@/lib/use-now";

export default function AppsPage() {
  const now = useNow();
  const { reset, signOut, account } = usePanel();

  return (
    <Screen title="Apps" subtitle={account?.appleId}>
      <div className="grid grid-cols-2 gap-3">
        {modules.map(({ href, label, service, Art }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-[14px] bg-surface p-3 active:bg-fill"
          >
            <span className="app-icon h-12 w-12 shrink-0">
              <Art className="h-full w-full" day={now?.getDate()} />
            </span>
            <span>
              <span className="block text-[16px] font-medium">{label}</span>
              <span className="block text-[12px] text-muted">{service}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex gap-4">
        <button type="button" onClick={signOut} className="text-[15px] text-apple">
          Se déconnecter
        </button>
        <button type="button" onClick={reset} className="text-[13px] text-faint">
          Réinitialiser les données
        </button>
      </div>
    </Screen>
  );
}
