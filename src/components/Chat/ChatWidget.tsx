import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askGemini } from '@/services/geminiService';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const reply = await askGemini(input);
    const aiMessage: Message = { role: 'ai', text: reply };
    
    setIsTyping(false);
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="fixed bottom-36 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="w-72 sm:w-80 glass rounded-3xl overflow-hidden mb-4 flex flex-col h-[400px] shadow-2xl border-hud-cyan/20"
          >
            {/* Header */}
            <div className="bg-hud-cyan/10 p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-hud-cyan shadow-[0_0_8px_#00f2ff]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hud-cyan">AI Navigator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded text-hud-cyan border border-hud-cyan/30">ONLINE</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20"
            >
              {messages.length === 0 && (
                <div className="text-center py-8 opacity-40">
                  <Bot className="w-10 h-10 text-hud-cyan mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-hud-cyan">
                    System awaiting input...
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-[11px] leading-relaxed",
                      m.role === 'user' 
                        ? "bg-white/5 text-white/90 rounded-tr-none border border-white/10" 
                        : "bg-hud-cyan/5 text-hud-cyan border border-hud-cyan/20 rounded-tl-none"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-1 items-center p-2 bg-hud-cyan/10 rounded-lg w-fit border border-hud-cyan/20">
                  <span className="w-1 h-1 bg-hud-cyan rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-hud-cyan rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-hud-cyan rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/10">
              <div className="w-full h-10 bg-white/5 rounded-full flex items-center px-4 gap-2 border border-white/5 focus-within:border-hud-cyan/30 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Query system..."
                  className="flex-1 bg-transparent border-none text-[11px] text-hud-cyan placeholder:text-slate-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="text-hud-cyan hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        id="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-lg glass border border-hud-cyan/30 shadow-lg hover:bg-hud-cyan/10 transition-all duration-300 group"
      >
        <MessageSquare className="w-5 h-5 text-hud-cyan group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
