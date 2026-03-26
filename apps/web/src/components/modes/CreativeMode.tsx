"use client";

import { Film, ImageIcon, Layers, Sparkles } from "lucide-react";
import { CouncilChat } from "@/components/CouncilChat";
import { useAgoraStore } from "@/lib/store";
import { useI18n } from "@/components/i18n/LanguageProvider";

interface CreativeModeProps {
  sessionId: string;
}

export function CreativeMode({ sessionId }: CreativeModeProps) {
  const { locale } = useI18n();
  const { messages } = useAgoraStore();
  const recent = messages.slice(-10).reverse();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#12071c] via-[#070a19] to-[#13091a] text-white">
      <div className="h-11 px-4 border-b border-white/10 bg-black/45 backdrop-blur-xl flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-pink-100">
          {locale === "zh-CN" ? "创作模式" : "Creation Mode"}
        </p>
        <span className="text-[10px] px-2 py-1 rounded border border-pink-400/35 text-pink-200 uppercase font-mono">Artifacts</span>
      </div>

      <div className="flex-1 min-h-0 p-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_320px] gap-3">
        <section className="min-h-0 rounded-2xl border border-pink-300/24 bg-black/35 backdrop-blur-xl overflow-hidden">
          <CouncilChat sessionId={sessionId} />
        </section>

        <aside className="rounded-2xl border border-pink-300/24 bg-pink-500/8 backdrop-blur-2xl p-3 flex flex-col min-h-[220px] xl:min-h-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-mono text-pink-100/95">
            {locale === "zh-CN" ? "创作工坊" : "Creation Forge"}
          </p>

          <div className="mt-3 rounded-xl border border-pink-300/25 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-xs font-mono text-pink-100 uppercase tracking-[0.12em]">
              <Film className="w-4 h-4" />
              {locale === "zh-CN" ? "实时预览" : "Live Preview"}
            </div>
            <div className="mt-2 h-28 rounded-lg border border-white/10 bg-zinc-950/80 flex items-center justify-center text-center text-[11px] text-slate-300/85 px-3">
              {locale === "zh-CN"
                ? "网页 / 文档 / 可视化产物将在此实时呈现"
                : "Web / docs / visual artifacts render here in real time."}
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-cyan-300/25 bg-cyan-500/8 p-3 text-[11px] text-slate-200/90">
            <div className="flex items-center gap-2 text-cyan-200 font-mono uppercase tracking-[0.12em]">
              <Layers className="w-4 h-4" />
              {locale === "zh-CN" ? "创意层" : "Creative Layers"}
            </div>
            <ul className="mt-2 space-y-1">
              <li>• Prompt expansion</li>
              <li>• Multi-agent drafting</li>
              <li>• Iterative refinement</li>
            </ul>
          </div>

          <div className="mt-2 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-[11px]">
            <div className="flex items-center gap-2 text-amber-200 font-mono uppercase tracking-[0.12em]">
              <ImageIcon className="w-4 h-4" />
              {locale === "zh-CN" ? "迭代历史" : "Iteration History"}
            </div>
            <div className="mt-2 max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {recent.length === 0 ? (
                <p className="text-slate-300/80">{locale === "zh-CN" ? "暂无历史记录" : "No history yet."}</p>
              ) : (
                recent.map((message) => (
                  <div key={message.id} className="rounded-md border border-white/10 bg-black/35 px-2 py-1.5">
                    <p className="text-[10px] font-mono text-pink-200/95">{message.agent_name}</p>
                    <p className="text-[11px] text-slate-200/90 leading-relaxed">
                      {message.content.slice(0, 72)}
                      {message.content.length > 72 ? "..." : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="mt-auto w-full rounded-xl border border-pink-300/40 bg-pink-500/18 text-pink-100 py-2 text-xs font-mono uppercase tracking-[0.14em] hover:bg-pink-500/26 transition-colors flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {locale === "zh-CN" ? "启动创作迭代" : "Run Creative Iteration"}
          </button>
        </aside>
      </div>
    </div>
  );
}
