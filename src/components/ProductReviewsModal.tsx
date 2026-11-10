import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle, 
  ThumbsUp, 
  MessageSquarePlus, 
  Sparkles,
  Filter
} from 'lucide-react';
import { Product, Review } from '../types';
import { sound } from '../utils/sound';

interface ProductReviewsModalProps {
  product: Product;
  reviews: Review[];
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (newReview: Review) => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({
  product,
  reviews,
  isOpen,
  onClose,
  onAddReview,
}) => {
  const [filterStar, setFilterStar] = useState<number | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New review form states
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Kualitas Juara', 'Pengiriman Cepat']);

  const availableTags = [
    'Kualitas Juara',
    'Pengiriman Cepat',
    'Sesuai Deskripsi',
    'Bahan Bagus',
    'Pelayanan Ramah',
    'Harga Terjangkau',
    'Rekomendasi Banget',
  ];

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const filteredReviews = filterStar === 'all' 
    ? productReviews 
    : productReviews.filter((r) => r.rating === filterStar);

  // Star counts for bar breakdown
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = productReviews.filter((r) => r.rating === star).length;
    const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
    return { star, count, pct };
  });

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userName: 'Gokil Coffee Burger',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: newRating,
      date: 'Baru saja',
      comment: newComment.trim(),
      helpfulCount: 0,
      verifiedPurchase: true,
      tags: selectedTags,
    };

    onAddReview(newRev);
    sound.playPointsEarned();
    setNewComment('');
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Ulasan & Rating Produk</h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-md">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Rating Summary Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-transparent rounded-2xl p-4 border border-amber-200/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left flex-shrink-0">
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <span className="text-4xl font-black text-slate-900">{product.rating}</span>
                <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 my-1 justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {product.reviewCount} Ulasan Terverifikasi
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 w-full space-y-1.5">
              {starCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right font-bold text-slate-700">{star} ★</span>
                  <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-slate-500 font-medium text-[11px]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action to Write Review */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                onClick={() => setFilterStar('all')}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  filterStar === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({productReviews.length})
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterStar(star)}
                  className={`px-3 py-1 rounded-full font-bold transition flex items-center gap-1 ${
                    filterStar === star
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              {showAddForm ? 'Batal Menulis' : 'Tulis Ulasan'}
            </button>
          </div>

          {/* Form to Write Review */}
          {showAddForm && (
            <form onSubmit={handleSubmitReview} className="bg-slate-50 p-4 rounded-2xl border border-emerald-300 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Beri Nilai & Bagikan Pengalaman Belanja
                </h4>
                <span className="text-[11px] text-amber-600 font-bold bg-amber-100/70 px-2 py-0.5 rounded-full">
                  +500 Poin Loyalitas
                </span>
              </div>

              {/* Star Rating Interactive Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bintang Kepuasan:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(s)}
                      className="p-1 focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || newRating) >= s
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {newRating === 5
                      ? 'Sangat Puas!'
                      : newRating === 4
                      ? 'Puas'
                      : newRating === 3
                      ? 'Cukup'
                      : 'Kurang Puas'}
                  </span>
                </div>
              </div>

              {/* Tags Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Pilih Tag Pengalaman:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Text Area */}
              <div>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda mengenai kualitas barang, kecepatan kurir, dan kemasan paket..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!newComment.trim()}
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-40 shadow-sm"
              >
                Kirim Ulasan & Klaim Poin
              </button>
            </form>
          )}

          {/* List of Reviews */}
          <div className="space-y-3.5">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs">Belum ada ulasan untuk filter bintang ini.</p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5 font-bold border border-emerald-200">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                              Pembeli Terverifikasi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span>• {rev.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  {/* Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end text-[11px] text-slate-400 pt-1">
                    <button
                      onClick={() => sound.playNotification()}
                      className="hover:text-emerald-600 flex items-center gap-1 transition"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      Membantu ({rev.helpfulCount})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
