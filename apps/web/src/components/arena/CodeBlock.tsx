"use client";

import { useEffect, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "typescript", filename }: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang: language as Parameters<typeof codeToHtml>[1]["lang"],
          theme: "tokyo-night",
        });
        if (!cancelled) setHighlighted(html);
      } catch {
        if (!cancelled) setHighlighted(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    }

    highlight();
    return () => { cancelled = true; };
  }, [code, language]);

  return (
    <div className="rounded border border-agora-border overflow-hidden">
      {filename && (
        <div className="px-3 py-1.5 bg-agora-surface border-b border-agora-border flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">{filename}</span>
          <span className="text-[9px] text-slate-700 ml-auto">{language}</span>
        </div>
      )}
      {highlighted ? (
        <div
          className="text-xs [&>pre]:p-3 [&>pre]:overflow-x-auto [&>pre]:!bg-agora-bg/80"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <pre className="text-xs p-3 bg-agora-bg/80 overflow-x-auto text-slate-400">
          {code}
        </pre>
      )}
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
