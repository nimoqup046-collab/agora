"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useAgoraStore } from "@/lib/store";
import { sessionsApi, templatesApi, SessionTemplate } from "@/lib/api";
import { useI18n } from "@/components/i18n/LanguageProvider";

const CATEGORY_KEY: Record<string, string> = {
  scientific: "sidebar.categoryScientific",
  engineering: "sidebar.categoryEngineering",
  review: "sidebar.categoryReview",
};

export function SessionSidebar() {
  const { t } = useI18n();
  const router = useRouter();
  const {
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionId,
    isCreatingSession,
    setIsCreatingSession,
  } = useAgoraStore();

  const [newTask, setNewTask] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    sessionsApi
      .list()
      .then((items) => {
        setSessions(items);
        setLoadError(null);
      })
      .catch((err) => {
        console.error(err);
        setLoadError(t("sidebar.loadError"));
      });

    templatesApi.list().then(setTemplates).catch(() => {
      // Templates are optional — fail silently
    });
  }, [setSessions, t]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    if (id && !newTask.trim()) {
      const tmpl = templates.find((t) => t.id === id);
      if (tmpl?.suggested_first_message) setNewTask(tmpl.suggested_first_message);
    }
    if (!id) setNewTask("");
  };

  const canCreate =
    !isCreatingSession && (newTask.trim().length > 0 || selectedTemplateId !== "");

  const createSession = async () => {
    if (!canCreate) return;
    setIsCreatingSession(true);
    try {
      const session = await sessionsApi.create({
        title: newTask.trim() ? newTask.slice(0, 80) : selectedTemplate?.name,
        task: newTask.trim(),
        template_id: selectedTemplateId || undefined,
      });
      setSessions([...sessions, session]);
      setCurrentSessionId(session.id);

      const target = `/council/${session.id}`;
      const hint = (session as { template?: { suggested_first_message?: string | null } })
        .template?.suggested_first_message;
      router.push(hint ? `${target}?hint=${encodeURIComponent(hint)}` : target);

      setNewTask("");
      setSelectedTemplateId("");
      setShowForm(false);
      setLoadError(null);
    } catch (err) {
      console.error("Failed to create session:", err);
      setLoadError(t("sidebar.createError"));
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-agora-border/70 module-divider flex items-center justify-between shrink-0">
        <h2 className="font-tech text-xs font-semibold text-cyan-100 uppercase tracking-[0.18em]">
          {t("sidebar.sessions")}
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-cyan-200 hover:text-cyan-100 text-lg leading-none"
          title={t("sidebar.newSession")}
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="p-3 border-b border-agora-border/70 module-divider space-y-2 shrink-0">
          {/* Template selector — shown only when templates are available */}
          {templates.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] text-cyan-300/60 uppercase tracking-[0.15em]">
                {t("sidebar.template")}
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-[#090f1f] border border-agora-border rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-300/60"
              >
                <option value="">{t("sidebar.noTemplate")}</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{t(CATEGORY_KEY[tmpl.category] ?? "sidebar.template")}] {tmpl.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-[10px] text-slate-400 leading-snug">
                  {selectedTemplate.description}
                </p>
              )}
            </div>
          )}

          <textarea
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={
              selectedTemplate ? t("sidebar.placeholderOverride") : t("sidebar.placeholder")
            }
            rows={3}
            className="w-full bg-[#090f1f] border border-agora-border rounded px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-300/60"
          />
          <button
            onClick={createSession}
            disabled={!canCreate}
            className="w-full py-1.5 rounded bg-cyan-500/20 border border-cyan-300/50 text-cyan-100 text-xs hover:bg-cyan-500/30 disabled:opacity-40 transition-colors"
          >
            {isCreatingSession ? t("sidebar.creating") : t("sidebar.startSession")}
          </button>
        </div>
      )}

      {loadError && (
        <div className="px-3 py-2 border-b border-agora-border text-[11px] text-rose-300 bg-rose-950/20 shrink-0">
          {loadError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 && !loadError && (
          <p className="text-center text-xs text-slate-400 py-6 px-4">
            {t("sidebar.noSessions")}
          </p>
        )}

        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => {
              setCurrentSessionId(session.id);
              router.push(`/council/${session.id}`);
            }}
            className={clsx(
              "w-full text-left px-3 py-2.5 hover:bg-[#0f1a37]/70 transition-colors border-l-2",
              currentSessionId === session.id
                ? "border-cyan-300 bg-cyan-500/10"
                : "border-transparent"
            )}
          >
            <p className="text-xs text-slate-200 truncate font-wisdom">{session.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={clsx(
                  "text-[10px] px-1.5 rounded-full",
                  session.status === "active"
                    ? "text-emerald-300 bg-emerald-400/10"
                    : "text-slate-400 bg-slate-700/30"
                )}
              >
                {session.status}
              </span>
              <span className="text-[10px] text-slate-500">
                {session.message_count} {t("sidebar.msgs")}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
