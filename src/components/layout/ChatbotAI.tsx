'use client';

import React from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { endpoints } from '@/lib/api';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function ChatbotAI() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'model', content: "Bonjour ! Je suis l'assistant IA de l'ADL Kairouan. Comment puis-je vous aider dans vos recherches aujourd'hui ?" }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content // The backend will handle the part mapping
      }));

      const response = await api.post(`${endpoints.chatbot}/chat`, {
        message: userMessage,
        history
      });

      setMessages(prev => [...prev, { role: 'model', content: response.data.data }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Désolé, j'ai rencontré une erreur. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] md:w-[450px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="p-6 bg-royal-600 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-tight text-sm">Assistant ADL</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">En ligne</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none bg-slate-50/50 dark:bg-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'user' ? "bg-slate-900 text-white" : "bg-royal-600 text-white"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm overflow-hidden prose prose-slate dark:prose-invert prose-sm",
                  msg.role === 'user' 
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-100 dark:border-white/5 rounded-tr-none" 
                    : "bg-royal-600/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-royal-600/10 dark:border-white/5 rounded-tl-none"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a {...props} className="text-royal-600 font-bold hover:underline" target="_blank" rel="noopener noreferrer" />,
                      p: ({ children }) => <p className="m-0 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mt-2 space-y-1">{children}</ul>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-royal-600/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-royal-600 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-royal-600/5 text-slate-400 text-xs italic">
                  L'IA réfléchit...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 h-12 text-sm focus:outline-none focus:ring-2 focus:ring-royal-600 transition-all dark:text-white"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-2xl bg-royal-600 text-white flex items-center justify-center hover:bg-royal-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-royal-950/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 group",
          isOpen 
            ? "bg-white dark:bg-slate-900 text-royal-600 rotate-90" 
            : "bg-royal-600 text-white hover:scale-110 hover:shadow-royal-500/20"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <div className="relative">
            <MessageSquare className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-royal-600 group-hover:scale-125 transition-transform" />
          </div>
        )}
      </button>
    </div>
  );
}
