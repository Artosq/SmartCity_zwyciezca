import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sąsiedzko — mapa sąsiedzkich wydarzeń",
  description:
    "Mapa Krakowa z wydarzeniami organizowanymi przez mieszkańców. Znajdź wydarzenie w okolicy albo dodaj własne.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Sąsiedzko",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
