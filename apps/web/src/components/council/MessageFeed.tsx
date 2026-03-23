"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAgoraStore } from "@/lib/store";
import { MessageBubble, StreamingBubble } from "@/components/MessageBubble";

interface MessageFeedProps {
  sessionId: string;
}

export function MessageFeed({ sessionId }: MessageFeedProps) {
  const { messages, streamingAgents } = useAgoraStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingAgents]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.length === 0 && Object.keys(streamingAgents).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-600">
          <div className="text-3xl font-mono text-slate-700">_</div>
          <p className="text-xs text-slate-600">The council awaits your question.</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </AnimatePresence>

      {Object.values(streamingAgents).map((st) => (
        <StreamingBubble
          key={st.agentId}
          agentId={st.agentId}
          agentName={st.agentName}
          content={st.content}
        />
      ))}

      <div ref={endRef} />
    </div>
  );
}
