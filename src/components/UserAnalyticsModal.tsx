import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  PieChart, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Truck, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Calendar,
  Layers
} from 'lucide-react';
import { Order, Product } from '../types';
import { formatRupiah } from '../data/mockData';
import { sound } from '../utils/sound';

interface UserAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  products: Product[];
}

export const UserAnalyticsModal: React.FC<UserAnalyticsModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');
  const [aiInsight, setAiInsight] = useState<string>('Memuat analisis data belanja personal...');
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Compute analytics
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  // Monthly spending breakdown simulation
  const monthlyData = [
    { month: 'Jan', amount: 850000, height: '40%' },
    { month: 'Feb', amount: 1250000, height: '60%' },
    { month: 'Mar (Ini)', amount: totalSpent, height: '85%' },
  ];

  // Request AI Recommendation Insight
  useEffect(() => {
    if (isOpen) {
      setLoadingAi(true);
      fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInterests: ['Kopi Specialty', 'Gadget ANC', 'Kuliner Rendang'],
          recentViews: products.slice(0, 3).map((p) => p.name),
          budget: 'Rp 200.000 - Rp 600.000',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setAiInsight(data.insight);
          setLoadingAi(false);
        })
        .catch(() => {
          setAiInsight(
            'Pola belanja Anda menunjukkan apresiasi tinggi terhadap cita rasa kuliner otentik Indonesia dan efisiensi teknologi rumah tangga hemat energi.'
          );
          setLoadingAi(false);
        });
    }
  }, [isOpen, products]);

  const handlePrintInvoice = (ord: Order) => {
    setSelectedInvoice(ord);
    sound.playNotification();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Analisis Belanja & Riwayat Transaksi</h3>
              <p className="text-xs text-slate-500 font-medium">Laporan Pengeluaran & Rekomendasi Personal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <PieChart className="w-4 h-4 text-indigo-600" />
            Dasbor Analitik Belanja
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            Semua Riwayat Transaksi ({orders.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {activeTab === 'analytics' ? (
            <>
              {/* Top Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                    Total Pengeluaran
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {formatRupiah(totalSpent)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Bulan berjalan</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                    Total Pesanan Selesai
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">{totalOrders} Pesanan</p>
                  <span className="text-[10px] text-emerald-600 font-medium">100% Terverifikasi</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                    Rata-rata Keranjang
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {formatRupiah(avgOrderValue)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Per transaksi</span>
                </div>
              </div>

              {/* AI Personal Recommendation Insight */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-indigo-200/80 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">
                      Analisis Kecerdasan Belanja AI (Gemini 3.8)
                    </h4>
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      Personalized
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1 font-medium">
                    {loadingAi ? 'Menganalisis riwayat transaksi dan preferensi kategori Anda...' : aiInsight}
                  </p>
                </div>
              </div>

              {/* Monthly Spending Chart Graphic */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
                  <span>Tren Pengeluaran Belanja (Kuartal 1)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Diperbarui real-time</span>
                </h4>

                <div className="h-32 flex items-end justify-around gap-4 pt-4 border-b border-slate-200">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold text-slate-700">
                        {formatRupiah(d.amount)}
                      </span>
                      <div
                        className="w-12 bg-indigo-600 rounded-t-lg transition-all duration-500 hover:bg-indigo-700"
                        style={{ height: d.height }}
                      />
                      <span className="text-xs font-semibold text-slate-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Categories Distribution */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Distribusi Kategori Favorit Anda
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Kuliner & Kopi Nusantara', pct: 45, color: 'bg-amber-500' },
                    { name: 'Elektronik & Gadget Canggih', pct: 35, color: 'bg-indigo-600' },
                    { name: 'Fashion & Aksesori Lokal', pct: 20, color: 'bg-emerald-500' },
                  ].map((cat) => (
                    <div key={cat.name} className="text-xs">
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>{cat.name}</span>
                        <span>{cat.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${cat.color} h-full rounded-full`}
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Full Transaction History
            <div className="space-y-3.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{ord.invoiceNumber}</span>
                      <span className="text-[11px] text-slate-400">• {ord.date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ord.status === 'dikirim'
                          ? 'bg-blue-100 text-blue-700'
                          : ord.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ord.status === 'dikirim'
                        ? 'Dalam Pengiriman'
                        : ord.status === 'selesai'
                        ? 'Pesanan Selesai'
                        : 'Diproses'}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium">
                          {it.quantity}x {it.product.name}
                        </span>
                        <span className="text-slate-500">
                          {formatRupiah(it.product.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Transaksi:</span>
                      <span className="font-black text-sm text-slate-900">{formatRupiah(ord.total)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintInvoice(ord)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Invoice PDF
                      </button>

                      {ord.status === 'dikirim' && (
                        <button
                          onClick={() => {
                            onTrackOrder(ord);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Lacak di Peta
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Viewer & Print Format Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Invoice Layout */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-lg text-slate-900">NusantaraMart</h3>
                  <p className="text-[11px] text-slate-500">
                    PT Nusantara Niaga Mandiri Indonesia
                  </p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                  LUNAS / PAID
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-600 flex justify-between">
                <div>
                  <span>No. Faktur: </span>
                  <strong className="text-slate-900">{selectedInvoice.invoiceNumber}</strong>
                </div>
                <div>{selectedInvoice.date}</div>
              </div>
            </div>

            {/* Invoice Line items */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="font-bold text-slate-700 border-b border-slate-100 pb-1 flex justify-between">
                <span>Rincian Barang</span>
                <span>Jumlah</span>
              </div>
              {selectedInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>{it.quantity}x {it.product.name}</span>
                  <span>{formatRupiah(it.product.price * it.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkir:</span>
                  <span>{formatRupiah(selectedInvoice.shippingFee)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(selectedInvoice.discount)}</span>
                  </div>
                )}
                {selectedInvoice.pointsUsed > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Poin Digunakan:</span>
                    <span>-{formatRupiah(selectedInvoice.pointsUsed)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Tagihan:</span>
                  <span>{formatRupiah(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 mb-4 border border-slate-200">
              Dokumen ini sah dan diterbitkan secara digital oleh sistem pembayaran terenkripsi NusantaraMart.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
