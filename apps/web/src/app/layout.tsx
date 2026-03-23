import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGORA — Collective Intelligence Terminal",
  description:
    "Multi-agent council: Claude, Codex, and Meta-Agent collaborating on hard problems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-agora-bg text-slate-200 font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
