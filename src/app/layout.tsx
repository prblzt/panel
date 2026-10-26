import type { Metadata, Viewport } from "next";
import { AppFrame } from "@/components/AppShell";
import { RegisterSW } from "@/components/RegisterSW";
import { PanelProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel",
  description: "Panel Apple : iCloud Mail, Messages, Maison, Apple Music, Wallet, Calendrier, abonnements et iCloud Drive.",
  applicationName: "Panel",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Panel",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-canvas font-sans text-ink">
        <RegisterSW />
        <PanelProvider>
          <AppFrame>{children}</AppFrame>
        </PanelProvider>
      </body>
    </html>
  );
}
