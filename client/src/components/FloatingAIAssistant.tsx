import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Flame, Dumbbell, RefreshCw, MessageSquare, ChevronDown } from 'lucide-react';
import { SavedMeal } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface FloatingAIAssistantProps {
  dailyGoalCalories: number;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;
  savedMeals: SavedMeal[];
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  dailyGoalCalories,
  todayCalories,
  todayProtein,
  todayCarbs,
  todayFat,
  savedMeals,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! 👋 I'm your Smart Bite AI Assistant. Ask me anything about your meals today, remaining calorie targets, or macro recommendations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const remainingCalories = Math.max(0, dailyGoalCalories - todayCalories);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = savedMeals.filter((m) => m.date === todayStr);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          dailyGoalCalories,
          todayCalories,
          todayProtein,
          todayCarbs,
          todayFat,
          recentMeals: todayMeals,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I couldn't process that. Please try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please check your network and try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    `How many calories & protein do I have left today?`,
    `Suggest a ${Math.min(600, remainingCalories || 400)} kcal high-protein meal`,
    `Is my macro balance good for my ${dailyGoalCalories} kcal goal?`,
    `Quick 200 kcal healthy snack ideas`,
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!isOpen && (
          <div className="bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask AI about your meals & targets!</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full font-bold shadow-xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 ring-2 ring-slate-700'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:shadow-emerald-900/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5" />
              <span className="text-xs">Close AI Chat</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-700 animate-ping" />
              </div>
              <span className="text-sm font-extrabold tracking-wide">AI Nutrition Coach</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[520px] max-h-[80vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                  Smart Bite AI Assistant
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300 flex items-center gap-2">
                  <span>Goal: {dailyGoalCalories} kcal</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">Left: {remainingCalories} kcal</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Context Summary Strip */}
          <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-emerald-900">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-600" /> Today: {todayCalories} kcal
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" /> P: {Math.round(todayProtein)}g | C: {Math.round(todayCarbs)}g | F: {Math.round(todayFat)}g
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 px-1 mt-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-2xl rounded-bl-none px-4 py-3 text-xs w-fit">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>AI is analyzing your nutrition & targets...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[10px] font-semibold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200 shrink-0"
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your meals, target calories..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
