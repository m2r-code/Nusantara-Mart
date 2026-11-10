import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  UserCheck, 
  Send, 
  Sparkles, 
  X, 
  HelpCircle, 
  CheckCheck, 
  RefreshCw, 
  ShoppingBag, 
  Truck, 
  Award, 
  CreditCard 
} from 'lucide-react';
import { sound } from '../utils/sound';

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'agent';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'agent'>('ai');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Halo Kak! Saya NusaBot, asisten belanja cerdas 24/7 NusantaraMart. Ada yang bisa saya bantu terkait produk, rekomendasi belanja, pelacakan pesanan, atau penukaran poin reward hari ini?',
      timestamp: '10:00',
    },
  ]);

  const [agentMessages, setAgentMessages] = useState<Message[]>([
    {
      id: 'ag-1',
      sender: 'agent',
      text: 'Halo Kak! Saya Sarah dari Tim Layanan Pelanggan NusantaraMart. Ada kendala transaksi atau hal yang perlu kami bantu selesaikan?',
      timestamp: '10:02',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, aiMessages, agentMessages, activeTab]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || inputText;
    if (!query.trim() || isLoading) return;

    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: timeNow,
    };

    if (activeTab === 'ai') {
      const updatedAiHistory = [...aiMessages, userMsg];
      setAiMessages(updatedAiHistory);
      setInputText('');
      setIsLoading(true);
      sound.playNotification();

      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query.trim(),
            history: updatedAiHistory.slice(-8).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              content: m.text,
            })),
          }),
        });

        const data = await res.json();
        sound.playNotification();

        setAiMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.reply || 'Ada yang bisa NusaBot bantu lagi Kak?',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            isFallback: data.isFallback,
          },
        ]);
      } catch (err) {
        setAiMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: 'Halo Kak, ada yang bisa saya bantu seputar pencarian produk, promo gratis ongkir, atau info pelacakan rute pengiriman kami?',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Live Human Agent Simulation
      setAgentMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);
      sound.playNotification();

      setTimeout(() => {
        sound.playNotification();
        setIsLoading(false);
        setAgentMessages((prev) => [
          ...prev,
          {
            id: `ag-${Date.now()}`,
            sender: 'agent',
            text: 'Terima kasih informasinya Kak. Tim operasional kami telah memverifikasi data pesanan Anda. Semua pesanan bergaransi 100% uang kembali jika terjadi keterlambatan atau kendala produk.',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1200);
    }
  };

  const quickPrompts = [
    { label: 'Cari gadget terbaik', icon: ShoppingBag, prompt: 'Rekomendasikan gadget atau elektronik terbaik dengan diskon flash sale hari ini.' },
    { label: 'Cara pakai poin loyalitas', icon: Award, prompt: 'Bagaimana cara menukarkan poin loyalitas NusantaraMart untuk potongan belanja checkout?' },
    { label: 'Lacak pengiriman pesanan', icon: Truck, prompt: 'Bagaimana cara melihat posisi kurir di peta langsung untuk pesanan saya?' },
    { label: 'Metode pembayaran apa saja?', icon: CreditCard, prompt: 'Opsi pembayaran apa saja yang didukung oleh NusantaraMart?' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[620px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              {activeTab === 'ai' ? <Sparkles className="w-5 h-5 text-amber-300" /> : <UserCheck className="w-5 h-5 text-emerald-200" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {activeTab === 'ai' ? 'NusaBot AI Assistant 24/7' : 'Live CS NusantaraMart'}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {activeTab === 'ai' ? 'Bertenaga Gemini 3.8 AI • Siap bantu kapan saja' : 'Staf Resmi • Respon Instan'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switch: AI Bot vs Human Live Chat */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            NusaBot (AI 24/7)
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
              Instan
            </span>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'agent'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Live Chat Staf CS
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
              Online
            </span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
          {(activeTab === 'ai' ? aiMessages : agentMessages).map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0 mb-1">
                    {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                )}
                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center animate-spin">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium animate-pulse">
                {activeTab === 'ai' ? 'NusaBot sedang merumuskan jawaban...' : 'Sarah sedang mengetik balasan...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills for AI mode */}
        {activeTab === 'ai' && (
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex gap-2 overflow-x-auto text-[11px] scrollbar-none">
            {quickPrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, item.prompt)}
                  className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition flex items-center gap-1.5 whitespace-nowrap shadow-xs font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeTab === 'ai'
                ? 'Tanyakan apa saja ke NusaBot (misal: rekomendasi kopi gayo, cek poin)...'
                : 'Tulis pesan untuk Staf CS kami...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
