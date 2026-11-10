import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus,
  MessageSquare,
  Award
} from 'lucide-react';
import { Product, LoyaltyProfile } from '../types';
import { formatRupiah } from '../data/mockData';
import { sound } from '../utils/sound';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onOpenReviews: (product: Product) => void;
  loyalty: LoyaltyProfile;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenReviews,
  loyalty,
}) => {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const pointsEarned = Math.round(product.price * qty * loyalty.cashbackRate);

  const handleAddToCart = () => {
    onAddToCart(product, qty);
    sound.playNotification();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleBuyNow = () => {
    onBuyNow(product, qty);
    sound.playNotification();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {product.category} • {product.brand}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Image display */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isFlashSale && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                  ⚡ Flash Sale {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Details and pricing */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                  {product.name}
                </h3>

                {/* Rating and Reviews clickable */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onOpenReviews(product)}
                    className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {product.rating}
                    <span className="text-slate-400 font-normal">
                      ({product.reviewCount} ulasan)
                    </span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Terjual {product.soldCount}+ unit
                  </span>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">
                      {formatRupiah(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatRupiah(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Loyalty Points Preview */}
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-amber-900 font-medium">
                      Dapatkan <strong>+{pointsEarned.toLocaleString('id-ID')} Poin Loyalitas</strong> (Member {loyalty.tier})
                    </span>
                  </div>
                </div>

                {/* Stock Indicator */}
                <div className="mt-3 text-xs">
                  <span className="text-slate-500">Ketersediaan Stok: </span>
                  <strong className={product.stock <= 15 ? 'text-amber-600' : 'text-emerald-600'}>
                    {product.stock} unit tersedia {product.stock <= 15 && '(Segera Habis)'}
                  </strong>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Jumlah Beli:</span>
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-slate-900 px-3">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Deskripsi Produk
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Spesifikasi Lengkap
            </h4>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 divide-y divide-slate-200/60 text-xs">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="py-1.5 flex justify-between">
                  <span className="text-slate-500 font-medium">{k}</span>
                  <span className="text-slate-800 font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-medium flex items-center gap-2 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Original & Garansi Resmi
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 font-medium flex items-center gap-2 border border-blue-200">
              <Truck className="w-4 h-4 text-blue-600" />
              Pelacakan GPS Peta Langsung
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 border ${
              isAdded
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isAdded ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4" />}
            {isAdded ? 'Dimasukkan ke Keranjang!' : 'Tambah ke Keranjang'}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
          >
            Beli Sekarang ({formatRupiah(product.price * qty)})
          </button>
        </div>
      </div>
    </div>
  );
};
