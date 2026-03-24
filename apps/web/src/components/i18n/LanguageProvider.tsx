"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "zh-CN";

const STORAGE_KEY = "agora.locale";

const MESSAGES = {
  en: {
    command: {
      center: "INTELLIGENCE COMMAND CENTER",
      sessionFallback: "Untitled Session",
      council: "COUNCIL",
      arena: "ARENA",
      board: "BOARD",
      evolution: "EVOLUTION",
      sessions: "Sessions",
      workspace: "Workspace",
      graph: "Graph",
    },
    home: {
      online: "ONLINE",
      title: "AGORA",
      subtitle: "Collective Intelligence Terminal",
      quoteA: "In the original Agora, Socrates did not seek answers alone.",
      quoteB: "He convened willing minds and let wisdom emerge through debate, challenge, and collision.",
      wisdomHall: "Hall of Human Wisdom",
      modules: "Core Modules",
      enter: "ENTER WORKSPACE",
      ancientFuture: "Future Tech x Ancient Wisdom",
      moduleStatusActive: "ACTIVE",
      moduleStatusAlpha: "ALPHA",
      systemState: "System State",
    },
    sidebar: {
      sessions: "Sessions",
      newSession: "New session",
      placeholder: "Describe the task for this council session...",
      creating: "Creating...",
      startSession: "Start Session",
      loadError: "Unable to load sessions. Check API connection.",
      createError: "Session creation failed. Verify backend and try again.",
      noSessions: "No sessions yet. Create one and start a multi-agent run.",
      msgs: "msgs",
    },
    council: {
      feed: "COUNCIL FEED",
      deliberating: "DELIBERATING",
      ready: "READY",
      describe: "Describe a hard problem for the council...",
      stop: "Stop",
      send: "Send",
      turns: "Turns",
      streaming: "Council is deliberating...",
      enterHint: "Enter to send, Shift+Enter for newline.",
      empty: "The council is ready. Ask your first question.",
      selectSession: "Select A Session",
      selectDesc: "Choose an existing session from the left panel, or create a new one with +.",
      selectSub: "Each session is a collaborative thread where Claude, Codex, and the Meta-Agent can reason, review, and execute together.",
    },
    arena: {
      title: "ARENA",
      pendingOne: "1 PENDING",
      clear: "CLEAR",
      empty: "No pending actions.",
      tip: "Use /council/{id}/act to generate an action proposal.",
    },
    board: {
      title: "TASK BOARD",
      pending: "PENDING",
      inProgress: "IN PROGRESS",
      done: "DONE",
      empty: "Click DECOMPOSE to generate tasks from the current session context.",
      decompose: "DECOMPOSE",
      decomposing: "DECOMPOSING...",
      decomposeFailed: "Decompose failed",
      start: "START",
      markDone: "DONE",
    },
    vote: {
      title: "COUNCIL VOTE",
      topic: "Vote topic...",
      vote: "VOTE",
      failed: "Vote failed",
    },
    graph: {
      title: "KNOWLEDGE GRAPH",
    },
    status: {
      msgs: "MSGS",
      mem: "MEM",
      prs: "PRS",
      api: "API",
      deliberating: "DELIBERATING...",
      ready: "READY",
      checking: "CHECKING",
      online: "ONLINE",
      offline: "OFFLINE",
    },
  },
  "zh-CN": {
    command: {
      center: "智慧协同中枢",
      sessionFallback: "未命名会话",
      council: "议会",
      arena: "竞技场",
      board: "作战板",
      evolution: "进化",
      sessions: "会话",
      workspace: "工作台",
      graph: "图谱",
    },
    home: {
      online: "在线",
      title: "AGORA",
      subtitle: "集体智能终端",
      quoteA: "在最初的 Agora，苏格拉底并不独自寻找答案。",
      quoteB: "他召集所有愿意思考的人，让智慧在辩论、挑战与碰撞中诞生。",
      wisdomHall: "人类智慧殿堂",
      modules: "核心模块",
      enter: "进入工作台",
      ancientFuture: "未来科技 x 古老智慧",
      moduleStatusActive: "可用",
      moduleStatusAlpha: "内测",
      systemState: "系统状态",
    },
    sidebar: {
      sessions: "会话",
      newSession: "新建会话",
      placeholder: "描述这个议会会话要解决的任务...",
      creating: "创建中...",
      startSession: "启动会话",
      loadError: "会话加载失败，请检查 API 连接。",
      createError: "会话创建失败，请检查后端配置后重试。",
      noSessions: "还没有会话，先创建一个开启多智能体协作。",
      msgs: "条消息",
    },
    council: {
      feed: "议会信息流",
      deliberating: "推理中",
      ready: "就绪",
      describe: "输入要让议会协作攻克的问题...",
      stop: "停止",
      send: "发送",
      turns: "轮次",
      streaming: "议会正在协同推理...",
      enterHint: "回车发送，Shift+Enter 换行。",
      empty: "议会已就绪，请提出你的问题。",
      selectSession: "请选择会话",
      selectDesc: "从左侧选择已有会话，或点击 + 创建新会话。",
      selectSub: "每个会话都是 Claude、Codex 与 Meta-Agent 的协作战场。",
    },
    arena: {
      title: "竞技场",
      pendingOne: "1 个待确认",
      clear: "清空",
      empty: "当前没有待执行动作。",
      tip: "调用 /council/{id}/act 可生成可执行动作提案。",
    },
    board: {
      title: "任务作战板",
      pending: "待开始",
      inProgress: "进行中",
      done: "已完成",
      empty: "点击 DECOMPOSE 可从当前会话自动拆解任务。",
      decompose: "拆解任务",
      decomposing: "拆解中...",
      decomposeFailed: "任务拆解失败",
      start: "开始",
      markDone: "完成",
    },
    vote: {
      title: "议会投票",
      topic: "输入投票议题...",
      vote: "投票",
      failed: "投票失败",
    },
    graph: {
      title: "知识图谱",
    },
    status: {
      msgs: "消息",
      mem: "记忆",
      prs: "PR",
      api: "接口",
      deliberating: "推理中...",
      ready: "就绪",
      checking: "检测中",
      online: "在线",
      offline: "离线",
    },
  },
} as const;

type MessageTree = (typeof MESSAGES)["en"];

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getMessage(locale: Locale, path: string): string {
  const keys = path.split(".");
  let current: unknown = MESSAGES[locale];
  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in (current as Record<string, unknown>))) {
      current = null;
      break;
    }
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === "string") return current;

  // Fallback to English
  current = MESSAGES.en as MessageTree | unknown;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in (current as Record<string, unknown>))) {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "zh-CN") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "zh-CN" : "en");
  }, [locale, setLocale]);

  const t = useCallback((path: string) => getMessage(locale, path), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return ctx;
}
