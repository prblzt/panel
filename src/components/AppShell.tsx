"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePanel } from "@/lib/store";
import { SignIn } from "./SignIn";
import { IconGrid, IconHome, IconHouse, IconMail, IconMessage, modules } from "./icons";

const tabs = [
  { href: "/", label: "Accueil", Icon: IconHome, match: (p: string) => p === "/" },
  { href: "/mails", label: "Mails", Icon: IconMail, match: (p: string) => p.startsWith("/mails") },
  {
    href: "/messages",
    label: "Messages",
    Icon: IconMessage,
    match: (p: string) => p.startsWith("/messages"),
  },
  { href: "/maison", label: "Maison", Icon: IconHouse, match: (p: string) => p.startsWith("/maison") },
  { href: "/apps", label: "Apps", Icon: IconGrid, match: (p: string) => p.startsWith("/apps") },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppFrame({ children }: { children: ReactNode }) {
  const { account, ready } = usePanel();
  const showApp = ready && Boolean(account);

  return (
    <>
    {ready && !account ? <SignIn /> : null}
    {!ready ? <div className="fixed inset-0 z-50 bg-canvas" /> : null}
    <div className={showApp ? "flex h-dvh overflow-hidden bg-canvas text-ink" : "hidden"} inert={showApp ? undefined : true}>
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="h-[env(safe-area-inset-top)] shrink-0 md:hidden" />
        <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { account, signOut } = usePanel();
  const name = [account?.firstName, account?.lastName].filter(Boolean).join(" ");

  return (
    <aside className="hidden w-[232px] shrink-0 flex-col border-r border-line bg-sidebar pt-[env(safe-area-inset-top)] md:flex">
      <div className="px-4 pb-2 pt-5">
        <p className="text-[13px] font-semibold tracking-tight">Panel</p>
      </div>
      <nav className="flex flex-1 flex-col gap-px px-2">
        <NavLink href="/" label="Accueil" active={pathname === "/"} icon={<IconHome className="h-4 w-4" />} />
        {modules.map(({ href, label, Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            active={isActive(pathname, href)}
            icon={<Icon className="h-4 w-4" />}
          />
        ))}
      </nav>
      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-apple text-[13px] font-semibold text-white">
            {account?.firstName.slice(0, 1) ?? "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{name}</p>
            <p className="truncate text-[11px] text-muted">{account?.appleId}</p>
          </div>
        </div>
        <button type="button" onClick={signOut} className="mt-2 px-1 text-[13px] text-apple">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-tab fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-30 grid grid-cols-5 rounded-full px-1 py-1 md:hidden">
      {tabs.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium ${active ? "text-apple" : "text-muted"}`}
          >
            <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? "bg-apple/15" : ""}`}>
              <Icon className="h-[22px] w-[22px]" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex h-7 items-center gap-2 rounded-md px-2 text-[13px] ${
        active ? "bg-apple font-medium text-white" : "text-ink hover:bg-fill"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
