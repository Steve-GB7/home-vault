"use client";

import { Sparkles, User, ShieldCheck } from "lucide-react";
import type { ChatMessage } from "@/types/domain";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-gradient-to-tr from-indigo-600 to-violet-500 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-xs"
            : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.timestamp && (
          <span
            className={`block text-[10px] mt-1 text-right ${
              isUser ? "text-indigo-200" : "text-slate-400"
            }`}
          >
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
