import React, { useState } from 'react';
import { Send, MessageSquareText, Info } from 'lucide-react';
import {
  ASSISTANT_TOPICS,
  getRuleBasedAssistantReply,
} from '../services/assistantEngine';
import { User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';

interface AssistantPageProps {
  user: Omit<User, 'password'>;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

export function AssistantPage({ user }: AssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user.name.split(' ')[0]}! I am the RideMate Rule-Based Assistant. Ask me about offering rides, requesting seats, request statuses, cost-sharing rules, or campus safety guidelines.`,
    },
  ]);
  const [input, setInput] = useState('');

  const sendQuery = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    const reply = getRuleBasedAssistantReply(trimmed, user.id);
    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'assistant',
      text: reply.answer,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div>
      <PageHeader
        title="RideMate Assistant"
        subtitle="Deterministic, rule-based help guide for campus carpooling policies, request workflows, and safety guidelines."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 flex flex-col h-[560px] shadow-[0_1px_3px_rgba(36,75,59,0.04)] overflow-hidden">
          {/* Transparency Header */}
          <div className="px-5 py-3 border-b border-[#244B3B]/10 bg-[#DCE7DC]/35 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#244B3B]">
              <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Rule-Based Help Engine (Offline Deterministic Matching)</span>
            </div>
            <span className="text-xs text-[#5F665F] hidden sm:inline">Not generative AI</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#244B3B] text-[#F7F5EF]'
                      : 'bg-[#F7F5EF] border border-[#244B3B]/10 text-[#292D29]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-[#244B3B]/10 bg-[#FCFBF8] flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about offering rides, fare sharing, phone privacy, or safety..."
              aria-label="Ask RideMate Assistant"
              className="flex-1 rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B3B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>

        {/* Topic Shortcuts */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#292D29]">Quick Help Topics</h2>
            <p className="text-xs text-[#5F665F]">
              Select a topic below to view exact RideMate guidelines or check your live account summary.
            </p>
            <div className="space-y-2 pt-1">
              {ASSISTANT_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => sendQuery(topic)}
                  className="w-full text-left rounded-lg border border-[#244B3B]/15 bg-[#F7F5EF] px-3.5 py-2.5 text-xs font-medium text-[#292D29] hover:bg-[#DCE7DC]/60 hover:text-[#244B3B] transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-4 flex items-start gap-2.5 text-xs text-[#5F665F] leading-relaxed">
            <Info className="h-4 w-4 text-[#244B3B] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              This assistant uses deterministic keyword rules written specifically for RideMate policies and never calls external AI models.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
