import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Bell, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Sparkles,
  Edit2
} from 'lucide-react';
import { Product, Order } from '../types';
import { formatRupiah } from '../data/mockData';
import { sound } from '../utils/sound';

interface SellerDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onTriggerNotification?: (title: string, message: string, type: 'seller') => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  products,
  orders,
  onUpdateStock,
  onUpdateOrderStatus,
  onTriggerNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders'>('overview');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalPointsGiven = orders.reduce((acc, o) => acc + o.pointsEarned, 0);

  // Filter products by stock
  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'low') return p.stock > 0 && p.stock <= 15;
    if (stockFilter === 'out') return p.stock === 0;
    return true;
  });

  // Export to Excel (CSV Format)
  const handleExportExcel = () => {
    sound.playNotification();

    const headers = [
      'No. Invoice',
      'Tanggal Transaksi',
      'Nama Pembeli',
      'No. Telepon',
      'Alamat Tujuan',
      'Daftar Produk',
      'Subtotal (IDR)',
      'Ongkir (IDR)',
      'Diskon (IDR)',
      'Poin Digunakan (IDR)',
      'Total Akhir (IDR)',
      'Metode Pembayaran',
      'Status Pesanan',
    ];

    const rows = orders.map((o) => [
      `"${o.invoiceNumber}"`,
      `"${o.date}"`,
      `"${o.shippingAddress.recipientName}"`,
      `"${o.shippingAddress.phone}"`,
      `"${o.shippingAddress.address}, ${o.shippingAddress.city}"`,
      `"${o.items.map((it) => `${it.quantity}x ${it.product.name}`).join('; ')}"`,
      o.subtotal,
      o.shippingFee,
      o.discount,
      o.pointsUsed,
      o.total,
      `"${o.paymentMethod.toUpperCase()}"`,
      `"${o.status.toUpperCase()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_NusantaraMart_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onTriggerNotification) {
      onTriggerNotification(
        '📊 Laporan Excel Berhasil Diekspor',
        'File laporan keuangan CSV/Excel siap dibuka di Microsoft Excel atau Google Sheets.',
        'seller'
      );
    }
  };

  const handleSimulateNewOrder = () => {
    sound.playSellerOrderAlert();
    if (onTriggerNotification) {
      onTriggerNotification(
        '🔔 Pesanan Baru Masuk!',
        'Pesanan senilai Rp 299.000 menunggu konfirmasi dan pemrosesan dari gudang.',
        'seller'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Operational Staff */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">
                Dasbor Staf Operasional & Manajemen Inventaris
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pantau performa penjualan, otomatisasi stok real-time, dan ekspor laporan keuangan.
            </p>
          </div>
        </div>

        {/* Action Buttons: Export Excel, Export PDF, and Test Alert */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel (.csv)
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Laporan PDF Resmi
          </button>

          <button
            onClick={handleSimulateNewOrder}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 transition border border-slate-700"
            title="Simulasikan Notifikasi Pesanan Masuk Real-Time"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Ringkasan Performa Penjualan
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          Manajemen Inventaris Stok ({products.length} Produk)
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Pesanan Masuk & Proses Kirim ({orders.length})
        </button>
      </div>

      {/* Tab: Overview Performa Penjualan */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatRupiah(totalRevenue)}</p>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +24.8% vs bulan lalu
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pesanan Masuk</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalOrdersCount} Pesanan</p>
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Semua terverifikasi
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Keranjang (AOV)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatRupiah(aov)}</p>
              <span className="text-xs text-slate-500 mt-1 block">Tingkat konversi tinggi</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Poin Loyalitas Terdistribusi</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {totalPointsGiven.toLocaleString('id-ID')}
              </p>
              <span className="text-xs text-purple-600 font-semibold mt-1 block">
                Mendorong repeat purchase 82%
              </span>
            </div>
          </div>

          {/* Interactive Sales Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Grafik Penjualan 7 Hari Terakhir</h3>
                <p className="text-xs text-slate-500">Nilai transaksi bersih setelah potongan diskon</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                Maret 2026
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
              {[
                { day: 'Sen', amount: 350000, h: '35%' },
                { day: 'Sel', amount: 520000, h: '55%' },
                { day: 'Rab', amount: 480000, h: '50%' },
                { day: 'Kam', amount: 720000, h: '75%' },
                { day: 'Jum', amount: 640000, h: '65%' },
                { day: 'Sab', amount: 980000, h: '95%' },
                { day: 'Min (Hari Ini)', amount: totalRevenue, h: '100%', highlight: true },
              ].map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600 hidden sm:block">
                    {formatRupiah(d.amount)}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                      d.highlight
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    style={{ height: d.h }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 text-center">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Manajemen Inventaris Produk Real-Time */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Status Stok Inventaris Produk</h3>
              <p className="text-xs text-slate-500">
                Stok otomatis berkurang secara real-time saat transaksi pembeli dikonfirmasi.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  stockFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                Semua Produk ({products.length})
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  stockFilter === 'low'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border border-slate-200 text-amber-700'
                }`}
              >
                Menipis (&le; 15)
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  stockFilter === 'out'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-slate-200 text-red-600'
                }`}
              >
                Habis (0)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga Satuan</th>
                  <th className="py-3 px-4">Terjual</th>
                  <th className="py-3 px-4">Sisa Stok</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Atur Stok Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 15;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="max-w-[220px]">
                            <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatRupiah(p.price)}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.soldCount} pcs</td>
                      <td className="py-3 px-4">
                        <span className="font-black text-slate-900 text-sm">{p.stock}</span> unit
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Stok Habis
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Stok Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 5))}
                            disabled={p.stock <= 0}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition disabled:opacity-40"
                            title="Kurangi 5 Unit"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 10)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition border border-emerald-200"
                            title="Restock +10 Unit"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 50)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition border border-indigo-200"
                            title="Restock Besar +50 Unit"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pesanan Masuk & Proses Kirim */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{ord.invoiceNumber}</span>
                  <span className="text-xs text-slate-400">• {ord.date}</span>
                  <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {ord.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Penerima: <strong className="text-slate-800">{ord.shippingAddress.recipientName}</strong> ({ord.shippingAddress.phone})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ord.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Transaksi</span>
                  <span className="font-black text-sm text-slate-900">{formatRupiah(ord.total)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {ord.status === 'diproses' && (
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'dikirim')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Serahkan ke Kurir
                    </button>
                  )}
                  {ord.status === 'dikirim' && (
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'selesai')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Tandai Terkirim
                    </button>
                  )}
                  {ord.status === 'selesai' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official PDF Report Viewer Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-300 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Report Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  LAPORAN KEUANGAN & PERFORMA PENJUALAN RESMI
                </h2>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  PT Nusantara Niaga Mandiri Indonesia • NusantaraMart E-Commerce Platform
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Periode: Kuartal 1 (Sampai {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })})
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                DOC-NSR-FIN-2026
              </span>
            </div>

            {/* Financial Summary Table */}
            <div className="space-y-4 mb-6 text-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                I. Ringkasan Eksekutif Keuangan
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Total Omset Kotor (Gross Sales)</span>
                  <span className="text-base font-black text-slate-900">{formatRupiah(totalRevenue)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Total Transaksi Selesai</span>
                  <span className="text-base font-black text-slate-900">{totalOrdersCount} Pesanan</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Nilai Rata-rata Keranjang (AOV)</span>
                  <span className="text-base font-black text-slate-900">{formatRupiah(aov)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Liabilitas Poin Loyalitas</span>
                  <span className="text-base font-black text-slate-900">
                    {formatRupiah(totalPointsGiven)} ({totalPointsGiven.toLocaleString('id-ID')} Poin)
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 pt-3">
                II. Log Transaksi Masuk Terakhir
              </h4>
              <table className="w-full text-left border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-2 border">No. Faktur</th>
                    <th className="p-2 border">Pembeli</th>
                    <th className="p-2 border">Metode</th>
                    <th className="p-2 border text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b">
                      <td className="p-2 border font-mono font-semibold">{o.invoiceNumber}</td>
                      <td className="p-2 border">{o.shippingAddress.recipientName}</td>
                      <td className="p-2 border uppercase">{o.paymentMethod}</td>
                      <td className="p-2 border text-right font-bold">{formatRupiah(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signature and Watermark */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="text-[10px] text-slate-400">
                  Dokumen terenkripsi SHA-256 dibuat otomatis oleh sistem analitik NusantaraMart.
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 mb-8">Disahkan secara digital,</p>
                <p className="font-bold text-slate-900">Direktur Operasional NusantaraMart</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan Sebagai PDF
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-5 py-3 rounded-xl font-semibold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
