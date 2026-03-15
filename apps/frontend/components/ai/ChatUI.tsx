"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: text, chatId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "Erreur IA");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "chat_id" && !chatId) {
              setChatId(data.chatId);
            } else if (data.type === "delta") {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                  isStreaming: true,
                };
                return updated;
              });
            } else if (data.type === "done") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                  isStreaming: false,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Erreur : ${err.message || "L'assistant IA est indisponible."}`,
          isStreaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, chatId, isLoading, accessToken]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Génère un plan pour mon projet de lancement produit",
    "Quelles sont les meilleures pratiques agiles ?",
    "Comment prioriser mes tâches cette semaine ?",
    "Identifie les risques de mon sprint en cours",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">SmartProject AI Assistant</h3>
              <p className="text-slate-400 mt-1">Votre assistant IA spécialisé en gestion de projets</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="card p-3 text-left text-sm text-slate-600 dark:text-slate-400 hover:border-primary-300 hover:text-primary-700 dark:hover:border-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 mb-1 text-primary-500" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white text-sm ${
                msg.role === "user" ? "bg-primary-600" : "bg-gradient-to-br from-primary-500 to-primary-700"
              }`}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-tr-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.isStreaming ? "streaming-cursor" : ""}`}>
                    <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="flex items-end gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question à SmartProject AI… (Entrée pour envoyer)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none max-h-32"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          SmartProject AI peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
