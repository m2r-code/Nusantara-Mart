import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  Smartphone, 
  Building2, 
  Banknote, 
  Copy, 
  Award,
  Sparkles,
  Lock
} from 'lucide-react';
import { CartItem, PaymentMethod, Order, LoyaltyProfile } from '../types';
import { formatRupiah, JAKARTA_DELIVERY_WAYPOINTS } from '../data/mockData';
import { sound } from '../utils/sound';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  voucherCode: string;
  pointsToUse: number;
  loyalty: LoyaltyProfile;
  onCheckoutSuccess: (newOrder: Order, pointsEarned: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  voucherCode,
  pointsToUse,
  loyalty,
  onCheckoutSuccess,
}) => {
  const [selectedCourier, setSelectedCourier] = useState<'sicepat' | 'jnt' | 'grab'>('sicepat');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gopay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  const [copiedVA, setCopiedVA] = useState(false);

  // Address state
  const [address, setAddress] = useState({
    recipientName: 'Gokil Coffee Burger',
    phone: '0812-3456-7890',
    address: 'Jl. Merpati Putih No. 42, RT 04 / RW 03',
    city: 'Kebon Jeruk, Jakarta Barat',
    postalCode: '11530',
  });

  const shippingFee = voucherCode === 'GRATISONGKIR' ? 0 : 15000;
  const total = Math.max(0, subtotal + shippingFee - discount - pointsToUse);
  
  // Calculate cashback points based on membership tier
  const pointsEarned = Math.round(total * loyalty.cashbackRate);

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      sound.playOrderSuccess();
      sound.playPointsEarned();

      const newOrderNum = `INV/2026/03/NSR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        invoiceNumber: newOrderNum,
        date: 'Baru Saja',
        items: [...items],
        subtotal,
        shippingFee,
        discount,
        pointsUsed: pointsToUse,
        total,
        paymentMethod,
        paymentStatus: 'success',
        status: 'dikirim',
        shippingAddress: { ...address },
        courier: {
          name: 'Budi Santoso',
          phone: '0813-8821-9034',
          photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          vehiclePlate: 'B 4821 KZZ',
          vehicleType: 'Honda Vario 160cc (Box Khusus Logistik)',
          serviceName: selectedCourier === 'grab' ? 'GrabExpress Instant' : 'SiCepat Sameday Express',
          rating: 4.96,
        },
        tracking: {
          currentStep: 2,
          currentWaypointIndex: 1,
          waypoints: JAKARTA_DELIVERY_WAYPOINTS,
          estimatedMinutesRemaining: 18,
          distanceRemainingKm: 4.2,
          lastUpdated: 'Kurir baru saja menerima paket dari Gudang Nusantara',
        },
        pointsEarned,
      };

      setOrderComplete(newOrder);
      onCheckoutSuccess(newOrder, pointsEarned);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {orderComplete ? (
          // Success Confirmation Screen
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Pembayaran Berhasil Diverifikasi
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Pesanan Berhasil Dibuat!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Nomor Pesanan: <strong className="text-slate-900">{orderComplete.invoiceNumber}</strong>
            </p>

            {/* Loyalty point celebratory badge */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border border-amber-300 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    +{pointsEarned.toLocaleString('id-ID')} Poin Loyalitas Masuk!
                  </h4>
                  <p className="text-xs text-slate-600">
                    Reward cashback Member {loyalty.tier} telah ditambahkan ke saldo akun Anda.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                1 Poin = Rp 1
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 mb-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-slate-800 uppercase">{orderComplete.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Dibayar:</span>
                <span className="font-black text-emerald-600 text-sm">{formatRupiah(orderComplete.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Alamat Pengiriman:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                  {orderComplete.shippingAddress.address}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Kurir Pengantar:</span>
                <span className="font-semibold text-slate-800">
                  {orderComplete.courier.name} ({orderComplete.courier.vehiclePlate})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  // Direct to tracking view handled in App
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                Lacak Kurir di Peta Langsung
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Kembali Belanja
              </button>
            </div>
          </div>
        ) : (
          // Main Checkout Form
          <div>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Pembayaran & Checkout Aman</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Shipping Address Section */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Alamat Pengiriman Utama
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Rumah Terverifikasi
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {address.recipientName} ({address.phone})
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {address.address}, {address.city} - {address.postalCode}
                </p>
              </div>

              {/* Delivery Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  Pilih Layanan Kurir Ekspedisi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'sicepat', name: 'SiCepat Sameday', eta: 'Tiba 1-2 Jam', fee: 15000, tag: 'Rekomendasi' },
                    { id: 'jnt', name: 'J&T Kilat Express', eta: 'Tiba Hari Ini', fee: 15000 },
                    { id: 'grab', name: 'GrabExpress Instan', eta: 'Tiba 45 Menit', fee: 20000, tag: 'Super Cepat' },
                  ].map((cur) => (
                    <button
                      key={cur.id}
                      type="button"
                      onClick={() => setSelectedCourier(cur.id as any)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        selectedCourier === cur.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{cur.name}</span>
                        {cur.tag && (
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                            {cur.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{cur.eta}</span>
                      <span className="text-xs font-bold text-slate-800 mt-1">
                        {voucherCode === 'GRATISONGKIR' ? (
                          <span className="text-emerald-600">Gratis (Voucher)</span>
                        ) : (
                          formatRupiah(cur.fee)
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multiple Diverse Payment Methods */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pilih Metode Pembayaran
                  </label>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    Enkripsi SSL 256-Bit
                  </span>
                </div>

                <div className="space-y-2">
                  {/* E-Wallets */}
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2 mb-1">
                    E-Wallet & Dompet Digital
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'gopay', name: 'GoPay', badge: 'Instan' },
                      { id: 'ovo', name: 'OVO', badge: 'Poin OVO' },
                      { id: 'dana', name: 'DANA', badge: 'Bebas Biaya' },
                      { id: 'shopeepay', name: 'ShopeePay', badge: 'Cashback' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setPaymentMethod(w.id as any)}
                        className={`p-3 rounded-xl border text-center transition ${
                          paymentMethod === w.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                        <span className="text-xs block font-bold">{w.name}</span>
                        <span className="text-[10px] text-slate-500">{w.badge}</span>
                      </button>
                    ))}
                  </div>

                  {/* QRIS Instan */}
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1">
                    QRIS Real-Time
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition ${
                      paymentMethod === 'qris'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">QRIS All Payment</span>
                          <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">
                            Bebas Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Scan via BCA, GoPay, OVO, Livin Mandiri, dll</p>
                      </div>
                    </div>
                    {paymentMethod === 'qris' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </button>

                  {/* Virtual Account / Bank Transfer */}
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1">
                    Transfer Bank Lokal & Virtual Account
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bca_va', name: 'BCA VA' },
                      { id: 'mandiri_va', name: 'Mandiri VA' },
                      { id: 'bri_va', name: 'BRI VA' },
                      { id: 'bni_va', name: 'BNI VA' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPaymentMethod(b.id as any)}
                        className={`p-3 rounded-xl border text-center transition ${
                          paymentMethod === b.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                        <span className="text-xs font-bold block">{b.name}</span>
                        <span className="text-[10px] text-slate-500">Verifikasi Otomatis</span>
                      </button>
                    ))}
                  </div>

                  {/* Kartu Kredit & COD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                        paymentMethod === 'credit_card'
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-slate-700" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-900 block">Kartu Kredit / Debit</span>
                        <span className="text-[10px] text-slate-500">Visa, Mastercard, JCB</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-900 block">Bayar di Tempat (COD)</span>
                        <span className="text-[10px] text-slate-500">Bayar tunai ke kurir</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Details Preview */}
              {paymentMethod === 'qris' && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-xl shadow-md my-2">
                    {/* Visual QR Code simulation with SVG */}
                    <svg className="w-36 h-36" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Corner markers */}
                      <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                      <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                      <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                      <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                      <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                      <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                      <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                      <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                      <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                      {/* Random data squares */}
                      <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                      <rect x="42" y="28" width="8" height="8" fill="#0f172a" />
                      <rect x="12" y="44" width="8" height="8" fill="#0f172a" />
                      <rect x="28" y="44" width="8" height="8" fill="#0f172a" />
                      <rect x="42" y="42" width="16" height="16" fill="#10b981" />
                      <rect x="64" y="46" width="8" height="8" fill="#0f172a" />
                      <rect x="80" y="44" width="6" height="6" fill="#0f172a" />
                      <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
                      <rect x="54" y="74" width="10" height="10" fill="#0f172a" />
                      <rect x="70" y="66" width="8" height="8" fill="#0f172a" />
                      <rect x="82" y="80" width="8" height="8" fill="#0f172a" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">QRIS Standar Bank Indonesia</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Scan menggunakan aplikasi mobile banking atau e-wallet apa saja
                  </p>
                </div>
              )}

              {(paymentMethod.includes('va')) && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Nomor Virtual Account {paymentMethod.replace('_va', '').toUpperCase()}
                    </span>
                    <p className="font-mono font-black text-slate-900 text-base mt-0.5">
                      8808 0812 3456 7890
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Otomatis diverifikasi dalam 5 detik
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCopiedVA(true);
                      setTimeout(() => setCopiedVA(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedVA ? 'Disalin!' : 'Salin'}
                  </button>
                </div>
              )}

              {/* Price Breakdown Calculation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal ({items.length} Produk):</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Ongkos Kirim:</span>
                  <span>{voucherCode === 'GRATISONGKIR' ? 'Rp 0 (Gratis)' : formatRupiah(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                    <span>Diskon Voucher ({voucherCode}):</span>
                    <span>-{formatRupiah(discount)}</span>
                  </div>
                )}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-xs text-amber-600 font-semibold">
                    <span>Potongan Poin Loyalitas:</span>
                    <span>-{formatRupiah(pointsToUse)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Total Pembayaran:</span>
                    <span className="text-[11px] text-amber-600 block font-semibold">
                      Dapatkan +{pointsEarned.toLocaleString('id-ID')} Poin Loyalitas
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900">
                    {formatRupiah(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Pay Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Total Tagihan:</span>
                <p className="font-black text-lg text-slate-900">{formatRupiah(total)}</p>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="py-3 px-6 rounded-2xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi Pembayaran...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Bayar & Konfirmasi Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
