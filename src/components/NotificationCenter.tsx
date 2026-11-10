import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Truck, 
  Sparkles, 
  Award, 
  Store, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../types';
import { sound } from '../utils/sound';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  onTriggerTestPush: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onSelectNotification,
  onTriggerTestPush,
}) => {
  const [filter, setFilter] = useState<'all' | 'order' | 'promo' | 'points'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pusat Notifikasi Real-Time</h3>
              <p className="text-[11px] text-slate-500">{unreadCount} pesan belum dibaca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Filter and Push Trigger */}
        <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 text-[11px]">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'order', label: 'Pesanan' },
              { id: 'promo', label: 'Promo' },
              { id: 'points', label: 'Poin' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filter === f.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Dibaca
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/40">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bell className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Tidak ada notifikasi saat ini</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon =
                item.type === 'order'
                  ? Truck
                  : item.type === 'promo'
                  ? Sparkles
                  : item.type === 'points'
                  ? Award
                  : Store;

              const iconBg =
                item.type === 'order'
                  ? 'bg-blue-100 text-blue-600'
                  : item.type === 'promo'
                  ? 'bg-amber-100 text-amber-600'
                  : item.type === 'points'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-emerald-100 text-emerald-600';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification(item)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex gap-3 ${
                    !item.read
                      ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                      : 'bg-white/70 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h5>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Push Simulation Button */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Notifikasi Push Browser Aktif</span>
          <button
            onClick={onTriggerTestPush}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
          >
            Uji Notifikasi Push
          </button>
        </div>
      </div>
    </div>
  );
};
