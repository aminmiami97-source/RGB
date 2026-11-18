import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ScriptRelease } from '../types/script';

import { formatVersionDisplay } from '../utils/scriptData';

interface ScriptChatbotDrawerProps {
  releases: ScriptRelease[];
  latestVersion: string;
}

interface UiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

const STARTER_PROMPTS = [
  'What features are in RGB SCRIPTS?',
  'Which executors are supported?',
  'How do I get and run the script?',
  'Who built RGB?',
];

export function ScriptChatbotDrawer({
  releases,
  latestVersion,
}: ScriptChatbotDrawerProps) {
  const versionLabel = formatVersionDisplay(latestVersion);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Ask me anything about RGB SCRIPTS (${versionLabel}) — ESP features, Plan Selection UI, Solara & Xeno support, and live updates.`,
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMsg: UiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releases,
          latestVersion,
          messages: nextHistory
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || !payload.reply) {
        setErrorMsg(
          payload.error ?? 'Unable to reach the RGB Script Guide right now. Please try again.'
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: payload.reply as string,
          model: payload.model,
        },
      ]);
    } catch {
      setErrorMsg('Network error contacting the RGB Script Guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {/* Floating Side-Screen Toggle Button */}
      {!open && (
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Open RGB Script Guide chatbot"
          className="fixed bottom-4 right-4 z-40 liquid-glass-elevated inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[#1a2238] hover:text-[#3b5bfe] min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
        >
          <MessageSquare className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
          <span>Script Guide</span>
        </motion.button>
      )}

      {/* Side-Screen Chatbot Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="rgb-chatbot-drawer"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="RGB Script Guide Chatbot"
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] p-3 sm:p-4 flex flex-col pointer-events-none"
          >
            <div className="liquid-glass-elevated pointer-events-auto flex flex-col h-full rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/80 bg-white/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-[#4d6bfe] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-semibold text-[#1a2238] truncate">
                    RGB Script Guide
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    Answers only RGB script &amp; feature questions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close RGB Script Guide chatbot"
                className="rounded-full p-2 text-slate-500 hover:text-slate-900 hover:bg-white/70 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              data-testid="chatbot-messages"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#4d6bfe] text-white'
                        : 'bg-white/80 border border-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && msg.model && (
                    <span className="mt-1 px-1 text-[10px] font-mono-tabular text-slate-400">
                      {msg.model}
                    </span>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start">
                  <div className="rounded-2xl px-3.5 py-2.5 text-xs text-slate-500 bg-white/75 border border-white">
                    Checking RGB script details...
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-2xl px-3.5 py-2.5 text-xs text-red-700 bg-red-50/90 border border-red-200"
                >
                  {errorMsg}
                </div>
              )}

              {/* Quick Starter Prompts */}
              {messages.length <= 2 && !loading && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[11px] font-medium text-slate-500 px-1">
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="text-left rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white/75 hover:bg-white border border-white transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-white/80 bg-white/45 flex items-center gap-2"
            >
              <label htmlFor="rgb-chatbot-input" className="sr-only">
                Ask about RGB script features
              </label>
              <input
                id="rgb-chatbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about RGB features, Solara, or Xeno..."
                maxLength={1000}
                className="flex-1 rounded-2xl bg-white/85 border border-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-[#4d6bfe] hover:bg-[#3a59f7] disabled:opacity-50 text-white shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
