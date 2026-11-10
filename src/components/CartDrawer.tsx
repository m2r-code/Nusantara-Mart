import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { CartItem, LoyaltyProfile } from '../types';
import { formatRupiah, PROMO_VOUCHERS } from '../data/mockData';
import { sound } from '../utils/sound';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onToggleSelect: (productId: string) => void;
  onToggleSelectAll: () => void;
  loyalty: LoyaltyProfile;
  onOpenCheckout: (
    selectedItems: CartItem[],
    subtotal: number,
    discount: number,
    voucherCode: string,
    pointsUsed: number
  ) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelect,
  onToggleSelectAll,
  loyalty,
  onOpenCheckout,
}) => {
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  const selectedItems = items.filter((item) => item.selected);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  // Maximum points usable is limited by points balance and remaining payable subtotal
  const maxPointsAllowed = Math.min(loyalty.pointsBalance, Math.max(0, subtotal - discountAmount));
  const pointsToUse = usePoints ? maxPointsAllowed : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount - pointsToUse);

  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherInput).trim().toUpperCase();
    const found = PROMO_VOUCHERS.find((v) => v.code === code);

    if (!found) {
      setVoucherError('Kode voucher tidak ditemukan atau sudah kadaluarsa.');
      return;
    }

    if (subtotal < found.minSpend) {
      setVoucherError(`Minimal belanja ${formatRupiah(found.minSpend)} untuk voucher ini.`);
      return;
    }

    setAppliedVoucher({ code: found.code, discount: found.discountAmount });
    setVoucherError('');
    sound.playNotification();
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Keranjang Belanja</h3>
              <p className="text-xs text-slate-500 font-medium">
                {items.length} Barang dalam keranjang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Select All Checkbox Bar */}
        {items.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              Pilih Semua ({items.length} Produk)
            </label>
            <span className="text-[11px] text-slate-500">
              {selectedItems.length} terpilih
            </span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-base">Keranjang Kosong</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Jelajahi beragam produk unggulan NusantaraMart dan tambahkan ke keranjang belanja Anda.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className={`p-3.5 rounded-2xl border transition flex gap-3 ${
                  item.selected ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/60 border-slate-200/60 opacity-70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => onToggleSelect(item.product.id)}
                  className="mt-2 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />

                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-18 h-18 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-xs text-slate-900">
                        {formatRupiah(item.product.price)}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatRupiah(item.product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition shadow-xs disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 px-1.5 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition shadow-xs disabled:opacity-40"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Voucher, Points & Checkout Actions */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Loyalty Point Redemption Option */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  disabled={loyalty.pointsBalance === 0 || selectedItems.length === 0}
                  className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Tukar Poin Loyalitas
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      Saldo: {loyalty.pointsBalance.toLocaleString('id-ID')} Poin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {usePoints ? (
                      <span className="text-emerald-700 font-bold">
                        Hemat {formatRupiah(pointsToUse)} langsung di keranjang!
                      </span>
                    ) : (
                      'Gunakan saldo poin untuk memotong tagihan belanja (1 Poin = Rp 1)'
                    )}
                  </p>
                </div>
              </label>
            </div>

            {/* Voucher Code Input */}
            <div>
              {appliedVoucher ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Voucher Aktif: {appliedVoucher.code} (-{formatRupiah(appliedVoucher.discount)})
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => {
                        setVoucherInput(e.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      placeholder="Masukkan kode voucher (e.g. NUSANTARAHEBAT)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-semibold"
                    />
                  </div>
                  <button
                    onClick={() => handleApplyVoucher()}
                    disabled={!voucherInput.trim()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-40"
                  >
                    Terapkan
                  </button>
                </div>
              )}

              {voucherError && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {voucherError}
                </p>
              )}

              {/* Quick voucher buttons suggestion */}
              {!appliedVoucher && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto text-[10px] text-slate-600 scrollbar-none">
                  {PROMO_VOUCHERS.map((v) => (
                    <button
                      key={v.code}
                      onClick={() => handleApplyVoucher(v.code)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 whitespace-nowrap font-medium"
                    >
                      {v.code} ({formatRupiah(v.discountAmount)})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Checkout CTA */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Subtotal ({selectedItems.length} produk):</span>
                <p className="text-lg font-black text-slate-900">{formatRupiah(grandTotal)}</p>
              </div>

              <button
                onClick={() => {
                  if (selectedItems.length === 0) return;
                  onOpenCheckout(
                    selectedItems,
                    subtotal,
                    discountAmount,
                    appliedVoucher ? appliedVoucher.code : '',
                    pointsToUse
                  );
                }}
                disabled={selectedItems.length === 0}
                className="py-3 px-5 rounded-2xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md disabled:opacity-40"
              >
                Lanjut ke Pembayaran
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
