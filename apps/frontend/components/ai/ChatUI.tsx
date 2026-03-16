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

    setMessages((prev) => [...prev, { role: "user", content: text }]);
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
    "Génère un run de 8km à Tokyo 🗺️",
    "Quels plats locaux pour la récup à Lisbonne ? 🍽️",
    "Analyse ma semaine : 3 runs, 18km total 📊",
    "Programme HIIT pour voyageur sans salle 💪",
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAF8ED' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ padding: '16px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,#EA580C,#047857)', boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>
              <Bot className="h-8 w-8" style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif', margin: '0 0 6px' }}>Coach IA 🤖</h3>
              <p style={{ color: '#A8A29E', fontSize: '14px', margin: 0 }}>Votre coach fitness et voyage disponible 24/7</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '480px', width: '100%' }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '12px', padding: '12px 14px', textAlign: 'left', fontSize: '13px', color: '#57534E', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(28,25,23,0.05)' }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(234,88,12,0.3)'; b.style.color = '#EA580C'; b.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E5E1D0'; b.style.color = '#57534E'; b.style.transform = 'none'; }}
                >
                  <Sparkles style={{ width: '14px', height: '14px', marginBottom: '4px', display: 'block', color: '#EA580C' }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{ display: 'flex', gap: '12px', flexDirection: msg.role === "user" ? 'row-reverse' : 'row', alignItems: 'flex-start' }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === "user" ? '#EA580C' : 'linear-gradient(135deg,#EA580C,#047857)',
                color: 'white', fontSize: '14px',
              }}>
                {msg.role === "user" ? <User style={{ width: '16px', height: '16px' }} /> : <Bot style={{ width: '16px', height: '16px' }} />}
              </div>
              <div style={{
                maxWidth: '80%', borderRadius: '16px', padding: '12px 16px', fontSize: '14px',
                background: msg.role === "user" ? '#EA580C' : 'white',
                color: msg.role === "user" ? 'white' : '#1C1917',
                border: msg.role === "user" ? 'none' : '1px solid #E5E1D0',
                borderTopRightRadius: msg.role === "user" ? '4px' : '16px',
                borderTopLeftRadius: msg.role === "user" ? '16px' : '4px',
                boxShadow: msg.role === "user" ? '0 4px 14px rgba(234,88,12,0.3)' : '0 1px 4px rgba(28,25,23,0.06)',
                lineHeight: 1.7,
              }}>
                {msg.role === "assistant" ? (
                  <div className={`prose prose-sm max-w-none ${msg.isStreaming ? "streaming-cursor" : ""}`} style={{ color: '#1C1917' }}>
                    <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p style={{ margin: 0 }}>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #E5E1D0', background: '#FAF8ED' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', background: 'white', border: '1px solid #D6CDB8', borderRadius: '16px', padding: '12px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', transition: 'all 0.2s ease' }}
          onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#EA580C'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(234,88,12,0.12)'; }}
          onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#D6CDB8'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demande un parcours à Rome, des conseils récup, un plan semaine... (Entrée pour envoyer)"
            rows={1}
            style={{ flex: 1, resize: 'none', background: 'transparent', fontSize: '14px', color: '#1C1917', outline: 'none', maxHeight: '128px', minHeight: '24px', border: 'none', fontFamily: '"Inter",sans-serif', lineHeight: 1.5 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: (!input.trim() || isLoading) ? '#E5E1D0' : '#EA580C',
              border: 'none', cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease', color: 'white',
            }}
          >
            {isLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '16px', height: '16px' }} />}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#A8A29E', marginTop: '8px', margin: '8px 0 0' }}>
          Élan Coach IA peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
}
