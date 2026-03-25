"use client";

import { Palette } from "lucide-react";
import { CouncilChat } from "@/components/CouncilChat";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CreativeModeProps {
  sessionId: string;
}

export function CreativeMode({ sessionId }: CreativeModeProps) {
  const { locale } = useI18n();
  const { messages } = useAgoraStore();
  const recent = messages.slice(-8).reverse();

  return (
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="bg-zinc-900/50 backdrop-blur-3xl border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Palette className="w-4 h-4 text-orange-400 shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(251,146,60,0.8))" }} />
        <div>
          <p className="font-mono text-xs tracking-[2px] text-orange-400 uppercase">
            {locale === "zh-CN" ? "创作模式" : "CREATIVE MODE"}
          </p>
          <p className="text-[11px] text-slate-300/80 mt-1">
            {locale === "zh-CN"
              ? "Prompt 画布 + Artifact 预览 + 迭代历史"
              : "Prompt canvas + artifact preview + iteration history"}
          </p>
        </div>
      </div>

      <div className="min-h-0 grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-3 p-3">
        <div className="min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>

        <aside className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col min-h-[220px] xl:min-h-0">
          <p className="font-mono text-[10px] tracking-[2px] text-orange-400 uppercase">
            {locale === "zh-CN" ? "ARTIFACT PREVIEW" : "ARTIFACT PREVIEW"}
          </p>
          <div className="mt-3 bg-black/40 rounded-3xl border border-white/10 h-36 flex items-center justify-center text-[11px] text-slate-300 text-center px-3">
            {locale === "zh-CN"
              ? "实时预览区（网页 / 文档 / 创作产物）"
              : "Live preview area (web/doc/artifact output)"}
          </div>

          <p className="mt-4 font-mono text-[10px] tracking-[2px] text-orange-400 uppercase">
            {locale === "zh-CN" ? "ITERATION HISTORY" : "ITERATION HISTORY"}
          </p>
          <div className="mt-2 flex-1 min-h-0 bg-white/5 rounded-2xl border border-white/5 p-2 overflow-y-auto space-y-1.5">
            {recent.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                {locale === "zh-CN" ? "尚无迭代记录。" : "No iteration records yet."}
              </p>
            ) : (
              recent.map((m) => (
                <div key={m.id} className="text-[11px] text-slate-200/90 leading-relaxed">
                  <span className="font-mono text-orange-300/95 mr-1">{m.agent_name}:</span>
                  {m.content.slice(0, 72)}
                  {m.content.length > 72 ? "..." : ""}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
