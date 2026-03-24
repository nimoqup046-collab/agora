import type { Metadata } from "next";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-agora-bg text-slate-200 antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
