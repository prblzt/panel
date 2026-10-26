"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallCard() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iphone, setIphone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    setIphone(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (installed) return null;

  return (
    <section className="mt-8 px-1">
      <p className="text-[13px] font-semibold text-ink">Installer comme une app</p>
      {prompt ? (
        <button
          type="button"
          onClick={() => {
            void prompt.prompt();
            setPrompt(null);
          }}
          className="mt-3 h-10 rounded-full bg-apple px-4 text-[14px] font-medium text-white"
        >
          Installer sur Windows
        </button>
      ) : (
        <p className="mt-1 text-[13px] leading-5 text-muted">
          {iphone
            ? "iPhone : Safari → Partager → Sur l’écran d’accueil. L’app s’ouvre ensuite en plein écran."
            : "Windows : Chrome ou Edge → icône d’installation dans la barre d’adresse. iPhone : Safari → Partager → Sur l’écran d’accueil."}
        </p>
      )}
    </section>
  );
}
