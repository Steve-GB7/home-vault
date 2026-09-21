"use client";

import { Sparkles } from "lucide-react";

export interface AssistantFabProps {
  onClick: () => void;
}

export function AssistantFab({ onClick }: AssistantFabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200 group border border-indigo-400/30"
      aria-label="Open AI Assistant"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <span className="text-sm tracking-tight font-bold">Ask AI Vault</span>
    </button>
  );
}
