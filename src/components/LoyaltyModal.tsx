import React from 'react';
import { 
  X, 
  Crown, 
  Award, 
  Sparkles, 
  Gift, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  ShieldCheck, 
  Zap, 
  CreditCard 
} from 'lucide-react';
import { LoyaltyProfile, PointTransaction } from '../types';
import { formatRupiah } from '../data/mockData';
import { sound } from '../utils/sound';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyalty: LoyaltyProfile;
  transactions: PointTransaction[];
  onRedeemReward?: (pointsCost: number, voucherName: string) => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  loyalty,
  transactions,
  onRedeemReward,
}) => {
  if (!isOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((loyalty.totalSpent / loyalty.nextTierThreshold) * 100)
  );

  const neededForNext = Math.max(0, loyalty.nextTierThreshold - loyalty.totalSpent);

  const rewards = [
    { id: 'rw-1', title: 'Voucher Potongan Rp 15.000', cost: 10000, desc: 'Untuk semua produk kuliner & kopi' },
    { id: 'rw-2', title: 'Ekstra Gratis Ongkir Kilat 3x', cost: 12000, desc: 'Bebas ongkir tanpa batas minimum belanja' },
    { id: 'rw-3', title: 'Voucher Belanja Gadget Rp 50.000', cost: 25000, desc: 'Minimal belanja Rp 300.000 kategori elektronik' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pusat Loyalitas & Membership</h3>
              <p className="text-xs text-slate-500 font-medium">Program Reward NusantaraMart VIP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Digital Membership Card */}
          <div className="relative rounded-3xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600">
            {/* Background design elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/10 blur-lg pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-44">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                    Kartu Loyalitas Digital
                  </span>
                  <h4 className="text-lg font-black tracking-tight">NusantaraMart VIP Club</h4>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                    Member {loyalty.tier}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-amber-100 uppercase tracking-widest block font-mono">
                  Nomor Anggota
                </span>
                <p className="text-xs font-mono font-bold tracking-widest text-white/90">
                  NSM-GOLD-8921-2026
                </p>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-white/20">
                <div>
                  <span className="text-[10px] text-amber-100 font-medium block">
                    Saldo Poin Aktif (1 Poin = Rp 1)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black tracking-tight">
                      {loyalty.pointsBalance.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-bold text-amber-200">Poin</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-100 block">Benefit Cashback</span>
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">
                    {(loyalty.cashbackRate * 100).toFixed(0)}% Tiap Belanja
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Progres Menuju Member Platinum
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>
            
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Belanja <strong className="text-slate-900">{formatRupiah(neededForNext)}</strong> lagi untuk membuka keuntungan eksklusif Platinum (Cashback 3%, prioritas 24/7 CS, voucher bulanan).
            </p>
          </div>

          {/* Tier Comparison Privileges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Tingkatan Membership & Keuntungan
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              {[
                { tier: 'Silver', rate: '1%', desc: 'Semua pengguna baru', active: loyalty.tier === 'Silver' },
                { tier: 'Gold', rate: '2%', desc: 'Belanja > Rp 1 Juta', active: loyalty.tier === 'Gold' },
                { tier: 'Platinum', rate: '3%', desc: 'Belanja > Rp 5 Juta + VIP', active: loyalty.tier === 'Platinum' },
              ].map((t) => (
                <div
                  key={t.tier}
                  className={`p-3 rounded-2xl border transition ${
                    t.active
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-xs font-black text-slate-900 block">{t.tier}</span>
                  <span className="text-sm font-black text-amber-600 block my-0.5">
                    Cashback {t.rate}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block">{t.desc}</span>
                  {t.active && (
                    <span className="inline-block mt-1 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                      Level Anda
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Point Mutation History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Riwayat Perolehan & Pemakaian Poin
            </h4>
            <div className="space-y-2.5">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'redeem'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {tx.type === 'redeem' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{tx.description}</h5>
                      <span className="text-[10px] text-slate-400">{tx.date}</span>
                    </div>
                  </div>
                  <span
                    className={`font-black text-xs ${
                      tx.type === 'redeem' ? 'text-red-500' : 'text-emerald-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount.toLocaleString('id-ID')}` : tx.amount.toLocaleString('id-ID')} Poin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
