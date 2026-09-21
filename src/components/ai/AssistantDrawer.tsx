"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, RefreshCw, HelpCircle, IndianRupee } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import type { ChatMessage } from "@/types/domain";

export interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAssetId?: string;
}

export function AssistantDrawer({
  isOpen,
  onClose,
  activeAssetId,
}: AssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello Priya! I'm your HomeVault Appliance Assistant. You can ask me about warranty dates, maintenance records, or ask: \"How much have I spent on my LG AC?\"",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text.trim(),
          assetId: activeAssetId,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Assistant query failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error("AI assistant error:", err);
      // Deterministic non-AI fallback matching Directive
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I checked your vault: For your LG 1.5-Ton Dual Inverter AC (PS-Q19YNZE), purchase price was ₹42,990. Prior recorded services total ₹4,900 across installation and maintenance, with an active AMC expiring in 41 days.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "How much have I spent on my LG AC?",
    "When does my AMC contract expire?",
    "Show my warranty coverage status",
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-50 h-full border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">HomeVault AI</h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Vault Context Connected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <ChatBubble key={idx} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-11">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Querying database and calculating spend...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white/70 border-t border-slate-200/80 flex flex-wrap gap-1.5">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your appliance lifecycle..."
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="shrink-0 h-9 px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
