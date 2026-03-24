"use client";

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
    <div className="h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-[#0e0719] via-[#080d1f] to-[#120919]">
      <div className="border-b border-orange-300/20 px-4 py-3">
        <p className="font-tech text-xs tracking-[0.18em] text-orange-100">
          {locale === "zh-CN" ? "创作模式" : "CREATIVE MODE"}
        </p>
        <p className="text-[11px] text-slate-300/80 mt-1">
          {locale === "zh-CN"
            ? "Prompt 画布 + Artifact 预览 + 迭代历史"
            : "Prompt canvas + artifact preview + iteration history"}
        </p>
      </div>

      <div className="min-h-0 grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-3 p-3">
        <div className="min-h-0 rounded-xl border border-orange-300/25 bg-black/35 backdrop-blur-xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </div>

        <aside className="rounded-xl border border-orange-300/25 bg-orange-500/5 backdrop-blur-xl p-3 flex flex-col min-h-[220px] xl:min-h-0">
          <p className="font-tech text-[10px] tracking-[0.16em] text-orange-200/90">
            {locale === "zh-CN" ? "ARTIFACT PREVIEW" : "ARTIFACT PREVIEW"}
          </p>
          <div className="mt-3 rounded-lg border border-orange-300/20 bg-[#100a19] h-36 flex items-center justify-center text-[11px] text-slate-300 text-center px-3">
            {locale === "zh-CN"
              ? "实时预览区（网页 / 文档 / 创作产物）"
              : "Live preview area (web/doc/artifact output)"}
          </div>

          <p className="mt-3 font-tech text-[10px] tracking-[0.16em] text-orange-200/90">
            {locale === "zh-CN" ? "ITERATION HISTORY" : "ITERATION HISTORY"}
          </p>
          <div className="mt-2 flex-1 min-h-0 rounded-lg border border-slate-600/40 bg-slate-950/45 p-2 overflow-y-auto space-y-1.5">
            {recent.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                {locale === "zh-CN" ? "尚无迭代记录。" : "No iteration records yet."}
              </p>
            ) : (
              recent.map((m) => (
                <div key={m.id} className="text-[11px] text-slate-200/90 leading-relaxed">
                  <span className="font-tech text-orange-200/95 mr-1">{m.agent_name}:</span>
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
