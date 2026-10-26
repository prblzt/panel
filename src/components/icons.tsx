"use client";

import { useId, type ReactNode } from "react";

type IconProps = { className?: string };
type ArtProps = { className?: string; day?: number };

function symbol({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {children}
    </svg>
  );
}

function useGid(prefix: string) {
  return `${prefix}${useId().replace(/:/g, "")}`;
}

export function IconHome(p: IconProps) {
  return symbol({
    ...p,
    children: <path d="M12 3.2 3 11h2.2v8.4c0 .6.5 1.1 1.1 1.1H10v-5h4v5h3.7c.6 0 1.1-.5 1.1-1.1V11H21L12 3.2Z" />,
  });
}

export function IconMail(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path
        fillRule="evenodd"
        d="M5.2 4.6h13.6c1.3 0 2.4 1.1 2.4 2.4v10c0 1.3-1.1 2.4-2.4 2.4H5.2c-1.3 0-2.4-1.1-2.4-2.4v-10c0-1.3 1.1-2.4 2.4-2.4Zm.4 2.2 6.4 4.8 6.4-4.8-1-.8L12 10.2 6.6 6l-1 .8Z"
      />
    ),
  });
}

export function IconMessage(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path d="M12 3.4c4.9 0 8.8 3.4 8.8 7.6S16.9 18.6 12 18.6c-1 0-2-.1-2.9-.4L5.2 20.4l1.2-3.4C4.6 15.6 3.2 13.5 3.2 11 3.2 6.8 7.1 3.4 12 3.4Z" />
    ),
  });
}

export function IconHouse(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path
        fillRule="evenodd"
        d="M12 3.1 3.2 11h2.3v9.2h5v-4.6h3v4.6h5V11h2.3L12 3.1Zm1.2 12.5h-2.4V20h2.4v-4.4Z"
      />
    ),
  });
}

const appleMusicNote =
  "M17.571 10.114v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z";

export function IconMusic(p: IconProps) {
  return symbol({ ...p, children: <path d={appleMusicNote} /> });
}

export function IconBank(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path
        fillRule="evenodd"
        d="M4.2 7.2c0-1.2 1-2.2 2.2-2.2h11.2c1.2 0 2.2 1 2.2 2.2v9.4c0 1.2-1 2.2-2.2 2.2H6.4c-1.2 0-2.2-1-2.2-2.2V7.2Zm2.4 6.6h3.8v1.6H6.6v-1.6Z"
      />
    ),
  });
}

export function IconCalendar(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path
        fillRule="evenodd"
        d="M8 3.2h1.6V5h4.8V3.2H16V5h1.6c1.1 0 2 .9 2 2v11.4c0 1.1-.9 2-2 2H6.4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2H8V3.2Zm-2 6.2h12v8.6c0 .2-.2.4-.4.4H6.4c-.2 0-.4-.2-.4-.4V9.4Z"
      />
    ),
  });
}

export function IconCard(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <>
        <rect x="6.2" y="4.4" width="11.6" height="8" rx="1.7" />
        <rect x="4" y="11.2" width="16" height="8.4" rx="1.9" />
      </>
    ),
  });
}

export function IconFiles(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <path d="M4.4 9.2V7.6c0-.9.7-1.6 1.6-1.6h4.8l1.7 1.8h5.5c.9 0 1.6.7 1.6 1.6v8.6c0 .9-.7 1.6-1.6 1.6H6c-.9 0-1.6-.7-1.6-1.6V9.2Z" />
    ),
  });
}

export function IconGrid(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <>
        <rect x="3.6" y="3.6" width="7" height="7" rx="1.7" />
        <rect x="13.4" y="3.6" width="7" height="7" rx="1.7" />
        <rect x="3.6" y="13.4" width="7" height="7" rx="1.7" />
        <rect x="13.4" y="13.4" width="7" height="7" rx="1.7" />
      </>
    ),
  });
}

export function IconPlay(p: IconProps) {
  return symbol({ ...p, children: <path d="M8.2 5.4v13.2L19 12 8.2 5.4Z" /> });
}

export function IconPause(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <>
        <rect x="6.2" y="5" width="3.8" height="14" rx="1" />
        <rect x="14" y="5" width="3.8" height="14" rx="1" />
      </>
    ),
  });
}

export function IconSkip(p: IconProps) {
  return symbol({
    ...p,
    children: (
      <>
        <path d="M5.2 6.2v11.6L15 12 5.2 6.2Z" />
        <rect x="16.2" y="6.2" width="2.6" height="11.6" rx="0.7" />
      </>
    ),
  });
}

export function IconApple(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} aria-hidden>
      <path d="M16.37 12.72c-.03-2.35 1.92-3.48 2-3.53-1.1-1.6-2.8-1.82-3.4-1.84-1.45-.15-2.83.85-3.56.85-.74 0-1.88-.83-3.09-.81-1.59.03-3.06.93-3.88 2.35-1.66 2.87-.42 7.11 1.19 9.44.79 1.14 1.73 2.42 2.96 2.37 1.19-.05 1.64-.76 3.08-.76 1.43 0 1.84.76 3.09.74 1.28-.02 2.09-1.16 2.87-2.3.9-1.32 1.27-2.6 1.29-2.66-.03-.01-2.48-.95-2.51-3.77ZM14.6 6.3c.65-.79 1.09-1.89.97-2.98-.94.04-2.08.63-2.75 1.41-.6.7-1.13 1.82-.99 2.89 1.05.08 2.12-.53 2.77-1.32Z" />
    </svg>
  );
}

export function MailAppIcon({ className }: ArtProps) {
  const id = useGid("mail");
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#64D2FF" />
          <stop offset="0.42" stopColor="#0A84FF" />
          <stop offset="1" stopColor="#0066E0" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill={`url(#${id})`} />
      <rect x="9" y="17.5" width="42" height="27" rx="4" fill="#fff" />
      <path fill="#d7ebff" d="M10.2 20.2 30 35.6 49.8 20.2v3.4L30 39.2 10.2 23.6v-3.4Z" />
    </svg>
  );
}

export function MessagesAppIcon({ className }: ArtProps) {
  const id = useGid("msg");
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5EED7A" />
          <stop offset="1" stopColor="#28C445" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill={`url(#${id})`} />
      <path
        fill="#fff"
        d="M30 12.5c9.7 0 17.5 6.7 17.5 15s-7.8 15-17.5 15c-1.7 0-3.3-.2-4.8-.7L15.2 47.2l1.8-6.4C13.6 38.2 12.5 35.1 12.5 27.5c0-8.3 7.8-15 17.5-15Z"
      />
    </svg>
  );
}

export function HomeAppIcon({ className }: ArtProps) {
  const id = useGid("home");
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC14D" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill={`url(#${id})`} />
      <path fill="#fff" d="M30 11 9 29.5h6.2V50h10.2V36.5h9.2V50H45V29.5H51L30 11Z" />
    </svg>
  );
}

export function MusicAppIcon({ className }: ArtProps) {
  const id = useGid("music");
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="3" y1="0" x2="21" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF5D73" />
          <stop offset="0.48" stopColor="#FA243C" />
          <stop offset="1" stopColor="#E11636" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" fill={`url(#${id})`} />
      <path fill="#fff" d={appleMusicNote} />
    </svg>
  );
}

export function WalletAppIcon({ className }: ArtProps) {
  const green = useGid("walG");
  const blue = useGid("walB");
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id={green} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DFFB0" />
          <stop offset="1" stopColor="#1DB954" />
        </linearGradient>
        <linearGradient id={blue} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#64D2FF" />
          <stop offset="1" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill="#1c1c1e" />
      <g transform="translate(30 40)">
        <g transform="rotate(-16)">
          <rect x="-16" y="-28" width="34" height="22" rx="3.2" fill={`url(#${green})`} />
        </g>
        <g transform="rotate(2)">
          <rect x="-17" y="-18" width="34" height="22" rx="3.2" fill="#f5f5f7" />
        </g>
        <g transform="rotate(18)">
          <rect x="-17" y="-8" width="34" height="22" rx="3.2" fill={`url(#${blue})`} />
          <rect x="-11" y="-2" width="7" height="5.5" rx="1" fill="#FFD60A" />
        </g>
      </g>
    </svg>
  );
}

export function CalendarAppIcon({ className, day }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <rect width="60" height="60" fill="#fff" />
      <rect width="60" height="16" fill="#FF3B30" />
      <rect x="15" y="5" width="5" height="14" rx="2.5" fill="#d8d8dc" />
      <rect x="40" y="5" width="5" height="14" rx="2.5" fill="#d8d8dc" />
      {day ? (
        <text
          x="30"
          y="46"
          textAnchor="middle"
          fill="#1d1d1f"
          fontFamily="ui-rounded, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="26"
          fontWeight="700"
        >
          {day}
        </text>
      ) : null}
    </svg>
  );
}

export function FilesAppIcon({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <rect width="60" height="60" fill="#f4f5f7" />
      <path fill="#7AD7FF" d="M10 20h16l4 4h20a4 4 0 0 1 4 4v2H10V20Z" />
      <path fill="#0A84FF" d="M8 28h44a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4Z" />
      <path fill="#64D2FF" d="M8 28h44v3.2H8V28Z" />
    </svg>
  );
}

export function SubscriptionsAppIcon({ className }: ArtProps) {
  const id = useGid("sub");
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="30" y1="0" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#DA8FFF" />
          <stop offset="1" stopColor="#7D4DFF" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" fill={`url(#${id})`} />
      <rect x="11" y="18" width="38" height="24" rx="4" fill="#fff" />
      <rect x="11" y="23" width="38" height="6" fill="#E9D7FF" />
      <rect x="16" y="33" width="10" height="3.2" rx="1.6" fill="#C9A6FF" />
    </svg>
  );
}

export const modules = [
  { href: "/mails", label: "Mails", service: "iCloud Mail", Icon: IconMail, Art: MailAppIcon, color: "#007AFF" },
  { href: "/messages", label: "Messages", service: "iMessage", Icon: IconMessage, Art: MessagesAppIcon, color: "#34C759" },
  { href: "/maison", label: "Maison", service: "Maison", Icon: IconHouse, Art: HomeAppIcon, color: "#FF9500" },
  { href: "/musique", label: "Musique", service: "Apple Music", Icon: IconMusic, Art: MusicAppIcon, color: "#FA2D48" },
  { href: "/banque", label: "Banque", service: "Wallet", Icon: IconBank, Art: WalletAppIcon, color: "#1c1c1e" },
  { href: "/agenda", label: "Agenda", service: "Calendrier", Icon: IconCalendar, Art: CalendarAppIcon, color: "#FF3B30" },
  { href: "/abonnements", label: "Abonnements", service: "Abonnements", Icon: IconCard, Art: SubscriptionsAppIcon, color: "#AF52DE" },
  { href: "/documents", label: "Documents", service: "iCloud Drive", Icon: IconFiles, Art: FilesAppIcon, color: "#0A84FF" },
] as const;
