import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, Bot, User } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

const Chatbot = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your Carbon Coach. How can I help you reduce your emissions today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.post(`https://piyush6363-ecoguide-backend.hf.space/users/${userId}/chat`, { message: userMsg });
      
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "I'm running in offline trial mode, but remember: reducing meat and saving electricity are great ways to lower your footprint!", isBot: true }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden" style={{ height: '500px' }}>
      <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-semibold">Carbon Coach</h3>
        </div>
        <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded-full transition-colors focus:outline-none">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {msg.isBot ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`px-4 py-2 rounded-2xl text-sm ${msg.isBot ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your footprint..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-slate-200"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
          >
            <Send size={16} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
