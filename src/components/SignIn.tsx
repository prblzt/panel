"use client";

import { useState } from "react";
import { IconApple } from "@/components/icons";
import { Field } from "@/components/ui";
import { usePanel } from "@/lib/store";

export function SignIn() {
  const { signIn } = usePanel();
  const [appleId, setAppleId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-[400px]">
        <IconApple className="mx-auto h-14 w-14 text-ink" />
        <h1 className="large-title mt-5 text-center text-ink">Identifiant Apple</h1>
        <p className="mt-2 text-center text-[15px] leading-6 text-muted">
          iCloud Mail, Maison, Apple Music, Calendrier et iCloud Drive sont rattachés à ce compte.
        </p>
        <form
          className="mt-8 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const email = appleId.trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !firstName.trim()) {
              setError("Indique un identifiant Apple valide et un prénom.");
              return;
            }
            signIn({ appleId: email, firstName, lastName });
          }}
        >
          <Field
            label="Identifiant Apple"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="prenom@icloud.com"
            value={appleId}
            onChange={(event) => setAppleId(event.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
            <Field label="Nom" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </div>
          {error ? <p className="text-[13px] text-apple-red">{error}</p> : null}
          <button type="submit" className="mt-2 h-12 w-full rounded-full bg-apple text-[17px] font-semibold text-white">
            Continuer
          </button>
        </form>
        <p className="mt-5 text-center text-[12px] leading-5 text-faint">
          Le compte reste sur cet appareil et relie les modules entre eux. Aucun mot de passe Apple n’est demandé.
        </p>
      </div>
    </div>
  );
}
