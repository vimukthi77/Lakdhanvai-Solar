"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Loader2, 
  Zap, 
  Sun, 
  Battery, 
  Activity,
  Sparkles,
  ChevronDown,
  Cpu,
  BarChart3,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface ChatBotProps {
  dashboardData: {
    totalEnergy: number;
    totalSavings: number;
    co2Saved: number;
    efficiency: number;
  } | null;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

// Quick suggestion buttons
const quickSuggestions = [
  { icon: Zap, text: "Today's energy?", query: "What's my energy production today?" },
  { icon: TrendingUp, text: "Savings", query: "How much have I saved?" },
  { icon: Battery, text: "Efficiency", query: "What's my system efficiency?" },
  { icon: Sun, text: "Tips", query: "Give me energy saving tips" },
];

export default function ChatBot({ dashboardData }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: 'Welcome to SolarPro Engineering Console! ⚡ I\'m your AI-powered energy analyst. How can I assist you with your solar system today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === 'bot') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  // Reset unread when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const userMsg = messageText || input;
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          dashboardData: dashboardData 
        }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "⚠️ System connection interrupted. Please verify network status and retry.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="relative">
          {/* Pulse Ring Animation */}
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-25" />
          <div className="absolute inset-0 bg-orange-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
          
          {/* Orbiting Particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
            <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-orange-300 rounded-full" />
          </div>
          
          {/* Main Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 text-white p-4 rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-110 hover:rotate-3 flex items-center justify-center group"
          >
            {/* Inner Glow */}
            <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
            
            {/* Icon Container */}
            <div className="relative">
              <Sun className="w-7 h-7 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-spin" style={{ animationDuration: '3s' }} />
              <MessageSquare className="w-7 h-7 group-hover:opacity-0 transition-opacity" />
            </div>
            
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce shadow-lg">
                {unreadCount}
              </div>
            )}
          </button>
          
          {/* Floating Label */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-950 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity shadow-xl">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-orange-400" />
              AI Assistant
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-950 rotate-45" />
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-white dark:bg-slate-900 w-[380px] sm:w-[440px] rounded-3xl shadow-2xl shadow-blue-950/20 border-2 border-blue-100 dark:border-blue-900 flex flex-col overflow-hidden transition-all duration-500 ease-out ${
            isMinimized ? 'h-[80px]' : 'h-[600px]'
          }`}
          style={{
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 p-4 flex justify-between items-center text-white relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-32 h-32 border border-orange-500/30 rounded-full"
                    style={{
                      left: `${i * 25}%`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      animation: `pulse 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              {/* Animated Bot Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 rounded-xl text-white shadow-lg">
                  <Bot size={24} className="animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-blue-950 animate-pulse" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base tracking-tight">SolarPro AI Console</p>
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded-full">
                    <Cpu className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] text-orange-400 font-semibold">v2.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-green-400 animate-pulse" />
                    <p className="text-[11px] text-green-400 font-medium">System Active</p>
                  </div>
                  <span className="text-blue-600">•</span>
                  <p className="text-[11px] text-blue-400">Neural Engine Ready</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 relative z-10">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="hover:bg-blue-800/50 p-2 rounded-xl transition-all hover:scale-105"
              >
                <ChevronDown size={18} className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition-all hover:scale-105 hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* System Stats Bar */}
              {dashboardData && (
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 px-4 py-3 border-b border-blue-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 group cursor-pointer">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Energy</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{dashboardData.totalEnergy} kWh</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 group cursor-pointer">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Savings</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">Rs.{dashboardData.totalSavings}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 group cursor-pointer">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Efficiency</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{dashboardData.efficiency}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.03) 0%, transparent 50%)`
                }}
              >
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{
                      animation: 'fadeSlideIn 0.3s ease-out',
                      animationDelay: `${i * 0.05}s`
                    }}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div className="flex flex-col">
                      <div className={`max-w-[280px] p-4 text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-md border border-slate-100 dark:border-slate-700'
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left ml-2'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center ml-2 flex-shrink-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start" style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-md shadow-lg border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-slate-400 ml-2">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Suggestions */}
                {showSuggestions && messages.length <= 1 && (
                  <div className="pt-4" style={{ animation: 'fadeSlideIn 0.5s ease-out' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-500 font-medium">Quick Actions</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(suggestion.query)}
                          className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all hover:scale-[1.02] hover:shadow-lg group"
                          style={{
                            animation: 'fadeSlideIn 0.3s ease-out',
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <suggestion.icon className="w-4 h-4 text-orange-500" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{suggestion.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about your solar system..."
                      className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-orange-400 rounded-xl px-4 py-3.5 text-sm focus:ring-0 outline-none dark:text-white placeholder:text-slate-400 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 rounded">
                        Enter ↵
                      </kbd>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-400 text-white p-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-orange-900/30 active:scale-95 disabled:shadow-none disabled:cursor-not-allowed group"
                  >
                    {isTyping ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </button>
                </div>
                
                {/* Footer Info */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400">Powered by AI</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">Lakdhanvi Engineering</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}