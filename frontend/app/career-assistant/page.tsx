'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, User, Wrench, CheckCircle2, 
  HelpCircle, ArrowRight, CornerDownLeft, RefreshCw 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ChatMessage } from '@/types';

export default function CareerAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: "Hello Alex! I am your JobPilot Career Assistant powered by LangGraph. I have full context on your verified resume, target preferences, and active job listings. How can I help with your search today?",
      timestamp: '10:00 AM',
      suggested_actions: [
        "Find jobs matching my resume",
        "Explain why Stripe is a good fit",
        "Compare Stripe and Figma roles",
        "Summarize my application pipeline"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await apiClient.sendAgentMessage(text);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tool_calls: res.tool_calls,
        suggested_actions: res.suggested_actions
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: "I encountered an error executing this tool call, but I'm standing by to help with another question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-2xl bg-[#0c1222] border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Assistant Header */}
      <div className="p-4 px-6 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-950">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              JobPilot Career Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                LangGraph Connected
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              RAG-grounded with candidate evidence and active job database
            </p>
          </div>
        </div>

        {/* Available tools count badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          <span>8 Tool Endpoints Active</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>

              {/* Tool Execution Card (if tool was invoked) */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="space-y-2 w-full">
                  {msg.tool_calls.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-indigo-400 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          Tool Execution: <code className="text-white">{tool.tool_name}</code>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                        Params: {JSON.stringify(tool.parameters)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Next Prompts */}
              {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggested_actions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(sug)}
                      className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                    >
                      {sug} →
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-500 block px-1">
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0 mt-1 text-xs font-bold">
                AM
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="animate-pulse">Reasoning over RAG context & running tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything: 'Find jobs matching my resume', 'Compare Stripe and Figma', 'Draft outreach message'..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
