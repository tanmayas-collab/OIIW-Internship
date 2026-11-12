import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  User,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { PROGRAM_CONSTANTS } from '../data/content';

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  externalQuery?: { text: string; token: number };
  onApplyClick: () => void;
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: `msg-welcome-${Date.now()}`,
    role: 'model',
    text: 'Hello! I am the OIIW Admissions Counselor. Ask me about our AI Internship + Training Program for Final-Year B.Tech & 2026 graduates—including our 13 tracks, cohort tuition, Gurugram partner collaboration, Agentic AI, and Vibe Coding.',
    timestamp: new Date(),
  };
}

const SUGGESTED_QUESTIONS = [
  'What is the technical scope?',
  'What is Vibe Coding & Agentic AI?',
  'What is the cohort tuition?',
  'Tell me about the Gurugram partner',
  'How does the fee waiver work?',
];

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    const renderedTokens = tokens.map((token, tokIdx) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        return (
          <strong key={tokIdx} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        return (
          <code key={tokIdx} className="px-1 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[11px]">
            {token.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={tokIdx}>{token}</React.Fragment>;
    });

    return (
      <React.Fragment key={lineIdx}>
        {renderedTokens}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  isOpen,
  onToggle,
  externalQuery,
  onApplyClick,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const lastHandledTokenRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onToggle]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    const currentHistory = messagesRef.current.map(m => ({
      role: m.role,
      text: m.text,
    }));

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentHistory,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        typeof data.reply === 'string' && data.reply.trim()
          ? data.reply
          : "I'm ready to answer your questions about the OIIW AI Internship + Training Program.";

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        text: `The OIIW program offers practical AI training and guided client deliverables ${PROGRAM_CONSTANTS.PARTNER_COLLAB.replace(/^In /, 'in ')}. You can submit your 2-step application directly on this page or email **${PROGRAM_CONSTANTS.CONTACT_EMAIL}**.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      externalQuery &&
      externalQuery.text.trim() &&
      externalQuery.token !== lastHandledTokenRef.current
    ) {
      lastHandledTokenRef.current = externalQuery.token;
      handleSendMessage(externalQuery.text);
    }
  }, [externalQuery]);

  const handleResetChat = () => {
    setMessages([createWelcomeMessage()]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-[#090D17]/95 text-white text-xs font-semibold py-2 px-3.5 rounded-full shadow-2xl border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Have questions? Ask AI Counselor</span>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Open AI Admissions Counselor Chat"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 border-2 border-[#080B13] rounded-full" />
          </button>
        </div>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="OIIW AI Admissions Counselor"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 md:w-[400px] max-h-[82vh] h-[580px] flex flex-col bg-[#0B0F1A] rounded-3xl shadow-2xl border border-white/15 overflow-hidden animate-scaleUp text-white"
        >
          {/* Header */}
          <div className="bg-[#090D16] p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-white">OIIW AI Counselor</h3>
                  <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Syllabus, Eligibility &amp; Cohort FAQ</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Reset conversation"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close chat"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Info Chip */}
          <div className="bg-white/[0.03] px-4 py-2 text-[11px] text-slate-300 flex items-center justify-between border-b border-white/10 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-300">₹0 Upfront</span>
              <span className="text-slate-500">•</span>
              <a
                href={PROGRAM_CONSTANTS.CONTACT_MAILTO}
                className="text-slate-200 hover:text-white underline cursor-pointer"
                title={`Email ${PROGRAM_CONSTANTS.CONTACT_EMAIL}`}
              >
                Email Desk
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                onToggle();
                onApplyClick();
              }}
              className="text-cyan-300 hover:text-white font-bold cursor-pointer"
            >
              Apply for Cohort →
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080B13]/60"
            aria-live="polite"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold border border-cyan-500/25">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white/[0.05] text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-white/10 text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold border border-cyan-500/25">
                  AI
                </div>
                <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-none p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 bg-[#090D16] border-t border-white/5 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="shrink-0 text-[11px] bg-white/5 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#090D16] border-t border-white/10 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              aria-label="Ask a question about the OIIW AI Internship program"
              placeholder="Ask a question about the AI program..."
              value={inputValue}
              maxLength={1000}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs text-white placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
