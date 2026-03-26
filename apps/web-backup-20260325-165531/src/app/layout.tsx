import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGORA - Collective Intelligence Terminal",
  description:
    "Collaborative multi-agent workspace where Claude, Codex, and a meta-agent solve hard problems together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-agora-bg text-slate-200 font-mono antialiased">
        {children}
      </body>
    </html>
  );
}