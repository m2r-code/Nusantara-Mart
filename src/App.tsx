import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Truck, 
  Sparkles, 
  Crown, 
  Bell, 
  MessageSquare, 
  BarChart3, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Filter, 
  Store, 
  TrendingUp, 
  X, 
  Plus, 
  Check, 
  Flame,
  Clock,
  Compass
} from 'lucide-react';
import { 
  Product, 
  CartItem, 
  Order, 
  Review, 
  LoyaltyProfile, 
  NotificationItem, 
  PointTransaction 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_REVIEWS, 
  INITIAL_LOYALTY, 
  INITIAL_POINT_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS, 
  formatRupiah 
} from './data/mockData';
import { sound } from './utils/sound';

import { TrackingMap } from './components/TrackingMap';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductReviewsModal } from './components/ProductReviewsModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { UserAnalyticsModal } from './components/UserAnalyticsModal';
import { SellerDashboard } from './components/SellerDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { ProductDetailModal } from './components/ProductDetailModal';

export default function App() {
  // Global State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nsm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nsm_cart');
    return saved ? JSON.parse(saved) : [
      { product: INITIAL_PRODUCTS[0], quantity: 1, selected: true },
      { product: INITIAL_PRODUCTS[3], quantity: 1, selected: true }
    ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nsm_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('nsm_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(() => {
    const saved = localStorage.getItem('nsm_loyalty');
    return saved ? JSON.parse(saved) : INITIAL_LOYALTY;
  });

  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem('nsm_point_tx');
    return saved ? JSON.parse(saved) : INITIAL_POINT_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('nsm_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // App UI Navigation
  const [activeTab, setActiveTab] = useState<'catalog' | 'tracking' | 'recommended' | 'seller'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order>(orders[0]);

  // Modal Visibilities
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutParams, setCheckoutParams] = useState<{
    items: CartItem[];
    subtotal: number;
    discount: number;
    voucherCode: string;
    pointsUsed: number;
  }>({
    items: [],
    subtotal: 0,
    discount: 0,
    voucherCode: '',
    pointsUsed: 0,
  });

  const [isCsOpen, setIsCsOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);

  // Active Realtime Toast Alert
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string; type: string } | null>(null);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('nsm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nsm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nsm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('nsm_loyalty', JSON.stringify(loyalty));
  }, [loyalty]);

  useEffect(() => {
    localStorage.setItem('nsm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // Trigger realtime notification with sound
  const handleTriggerNotification = (title: string, message: string, type: 'order' | 'promo' | 'points' | 'seller') => {
    sound.playNotification();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Baru saja',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setToastAlert({ title, message, type });
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity, selected: true }];
    });
    sound.playNotification();
    handleTriggerNotification(
      '🛒 Produk Ditambahkan ke Keranjang',
      `${quantity}x ${product.name} telah masuk ke keranjang belanja Anda.`,
      'order'
    );
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleSelect = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = cart.every((it) => it.selected);
    setCart((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  // Open Checkout from Cart
  const handleOpenCheckout = (
    selectedItems: CartItem[],
    subtotal: number,
    discount: number,
    voucherCode: string,
    pointsUsed: number
  ) => {
    setCheckoutParams({
      items: selectedItems,
      subtotal,
      discount,
      voucherCode,
      pointsUsed,
    });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Checkout Success Event Handler
  const handleCheckoutSuccess = (newOrder: Order, pointsEarned: number) => {
    // Deduct stock automatically from inventory
    setProducts((prev) =>
      prev.map((p) => {
        const boughtItem = newOrder.items.find((it) => it.product.id === p.id);
        if (boughtItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - boughtItem.quantity),
            soldCount: p.soldCount + boughtItem.quantity,
          };
        }
        return p;
      })
    );

    // Remove bought items from cart
    setCart((prev) => prev.filter((it) => !newOrder.items.some((b) => b.product.id === it.product.id)));

    // Update orders list & set as active tracking
    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);

    // Update Loyalty Points & Spent Total
    setLoyalty((prev) => {
      const newBalance = prev.pointsBalance - newOrder.pointsUsed + pointsEarned;
      const newTotalSpent = prev.totalSpent + newOrder.total;
      const newTier = newTotalSpent >= 5000000 ? 'Platinum' : newTotalSpent >= 1000000 ? 'Gold' : 'Silver';
      const cashbackRate = newTier === 'Platinum' ? 0.03 : newTier === 'Gold' ? 0.02 : 0.01;

      return {
        ...prev,
        pointsBalance: newBalance,
        totalSpent: newTotalSpent,
        totalEarnedPoints: prev.totalEarnedPoints + pointsEarned,
        tier: newTier,
        cashbackRate,
      };
    });

    // Add point transactions
    const newTxList: PointTransaction[] = [];
    if (newOrder.pointsUsed > 0) {
      newTxList.push({
        id: `pt-${Date.now()}-1`,
        date: 'Hari ini',
        type: 'redeem',
        amount: -newOrder.pointsUsed,
        description: `Potongan diskon pesanan ${newOrder.invoiceNumber}`,
        relatedOrderId: newOrder.id,
      });
    }
    newTxList.push({
      id: `pt-${Date.now()}-2`,
      date: 'Hari ini',
      type: 'earn',
      amount: +pointsEarned,
      description: `Cashback poin loyalitas pesanan ${newOrder.invoiceNumber}`,
      relatedOrderId: newOrder.id,
    });
    setPointTransactions((prev) => [...newTxList, ...prev]);

    // Push notification
    handleTriggerNotification(
      '🎉 Pesanan Berhasil Dikonfirmasi & Sedang Dikirim',
      `Pesanan ${newOrder.invoiceNumber} senilai ${formatRupiah(newOrder.total)} sedang diantar kurir. Lacak langsung di peta!`,
      'order'
    );
  };

  // Stock update from Seller Dashboard
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    sound.playNotification();
  };

  // Order status update from Seller Dashboard
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    sound.playNotification();
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['Semua', 'Elektronik', 'Kuliner', 'Fashion', 'Rumah Tangga', 'Kecantikan'];

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const cartTotalItems = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Banner Alert Toast Floating */}
      {toastAlert && (
        <div className="fixed top-4 right-4 z-60 max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs text-emerald-400">{toastAlert.title}</h5>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toastAlert.message}</p>
          </div>
          <button
            onClick={() => setToastAlert(null)}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            {/* Logo */}
            <div
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                    Nusantara<span className="text-emerald-600">Mart</span>
                  </h1>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded border border-red-200">
                    🇮🇩 ID
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                  Belanja Nyaman & Lacak Kurir Real-Time
                </p>
              </div>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 max-w-lg relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kopi gayo, air fryer, sneakers, rendang, atau gadget..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Actions (Loyalty, Notifs, Cart, Mode Toggle) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Loyalty Points Pill */}
              <button
                onClick={() => setIsLoyaltyOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition shadow-xs"
                title="Buka Pusat Poin & Loyalitas"
              >
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black">
                  {loyalty.pointsBalance.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-200/70 px-1 rounded">
                  {loyalty.tier}
                </span>
              </button>

              {/* Mode Toggle: Buyer vs Seller / Operations */}
              <button
                onClick={() => setActiveTab(activeTab === 'seller' ? 'catalog' : 'seller')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTab === 'seller'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Ganti ke Dasbor Staf Operasional / Penjual"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {activeTab === 'seller' ? 'Mode Pembeli' : 'Mode Toko/Admin'}
                </span>
              </button>

              {/* Notification Center Trigger */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                title="Pusat Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm font-bold text-xs"
                title="Keranjang Belanja"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Keranjang</span>
                {cartTotalItems > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-emerald-800 rounded-full text-[10px] font-black">
                    {cartTotalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Navigation Bar (Tabs) */}
          <div className="flex items-center justify-between border-t border-slate-100 py-2.5 overflow-x-auto text-xs font-semibold scrollbar-none">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                Katalog Belanja
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'tracking'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                Lacak Pengiriman Langsung
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>

              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'recommended'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Rekomendasi Cerdas
              </button>

              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Analisis Belanja & Faktur
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCsOpen(true)}
                className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                CS AI & Live Chat 24/7
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* VIEW: SELLER OPERATIONAL DASHBOARD */}
        {activeTab === 'seller' ? (
          <SellerDashboard
            products={products}
            orders={orders}
            onUpdateStock={handleUpdateStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onTriggerNotification={handleTriggerNotification}
          />
        ) : activeTab === 'tracking' ? (
          /* VIEW: LIVE INTERACTIVE DELIVERY TRACKING */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pantau Pengiriman Pesanan Anda Secara Real-Time
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Radar GPS interaktif langsung menampilkan pergerakan kurir di jalan raya menuju alamat Anda.
                </p>
              </div>

              {/* Order selector for tracking */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Pilih Pesanan:</span>
                <select
                  value={activeTrackingOrder.id}
                  onChange={(e) => {
                    const found = orders.find((o) => o.id === e.target.value);
                    if (found) setActiveTrackingOrder(found);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.invoiceNumber} ({o.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TrackingMap
              order={activeTrackingOrder}
              onUpdateOrderTracking={(updated) => {
                setActiveTrackingOrder(updated);
                setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
              }}
              onTriggerNotification={handleTriggerNotification}
            />
          </div>
        ) : (
          /* VIEW: CATALOG OR PERSONALIZED RECOMMENDATIONS */
          <div className="space-y-6">
            {/* Hero Flash Sale Banner */}
            {activeTab === 'catalog' && (
              <div className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900">
                <div className="relative z-10 max-w-xl space-y-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Pesta Diskon Flash Sale Nusantara 2026
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                    Belanja Produk Unggulan Indonesia, Dapatkan Cashback Poin 2x Lipat!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                    Nikmati gratis ongkir se-Indonesia, garansi original 100%, dan pelacakan kurir interaktif langsung di ponsel Anda.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setSelectedCategory('Elektronik')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition shadow-md flex items-center gap-1.5"
                    >
                      Jelajahi Gadget & Elektronik
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedCategory('Kuliner')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/20 transition border border-white/20"
                    >
                      Kopi & Kuliner Asli
                    </button>
                  </div>
                </div>

                {/* Decorative floating stats */}
                <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                    <span className="text-2xl font-black block text-amber-300">48 Jam</span>
                    <span className="text-[11px] text-emerald-100 font-medium">Garansi Ganti Baru</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                    <span className="text-2xl font-black block text-emerald-300">1-2 Jam</span>
                    <span className="text-[11px] text-emerald-100 font-medium">Sameday Express</span>
                  </div>
                </div>
              </div>
            )}

            {/* Personalized Recommendations Header for 'recommended' tab */}
            {activeTab === 'recommended' && (
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 p-6 rounded-3xl border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Rekomendasi Cerdas Khusus Untuk Anda
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Algoritma AI menganalisis minat Anda pada kopi specialty, gadget ANC, dan kuliner siap saji.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAnalyticsOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  Lihat Profil Analitik Belanja
                </button>
              </div>
            )}

            {/* Category Filter Chips Bar */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                Menampilkan <strong>{filteredProducts.length}</strong> produk
              </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => {
                const pointsReward = Math.round(product.price * loyalty.cashbackRate);

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail Container */}
                      <div
                        onClick={() => setSelectedProductDetail(product)}
                        className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.isFlashSale && (
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      </div>

                      {/* Content Card Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="font-semibold text-emerald-700">{product.brand}</span>
                          <span className="text-[11px]">Terjual {product.soldCount}</span>
                        </div>

                        <h3
                          onClick={() => setSelectedProductDetail(product)}
                          className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-600 transition"
                        >
                          {product.name}
                        </h3>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setReviewModalProduct(product)}
                            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline"
                            title="Lihat Ulasan"
                          >
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {product.rating}
                            <span className="text-slate-400 font-normal">
                              ({product.reviewCount})
                            </span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Stok: {product.stock}
                          </span>
                        </div>

                        {/* Price Breakdown */}
                        <div className="mt-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              {formatRupiah(product.price)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatRupiah(product.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Loyalty Point Incentive */}
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 mt-1">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>+{pointsReward.toLocaleString('id-ID')} Poin Cashback</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => setSelectedProductDetail(product)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleAddToCart(product, 1)}
                        className="py-2 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm"
                        title="Tambah ke Keranjang"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Beli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating 24/7 AI Shopping Assistant Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsCsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/30"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span className="text-xs font-bold hidden sm:inline">
            Tanya NusaBot AI 24/7
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      </div>

      {/* MODALS */}
      {/* 1. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        loyalty={loyalty}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* 2. Integrated Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutParams.items}
        subtotal={checkoutParams.subtotal}
        discount={checkoutParams.discount}
        voucherCode={checkoutParams.voucherCode}
        pointsToUse={checkoutParams.pointsUsed}
        loyalty={loyalty}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* 3. Customer Service AI 24/7 & Live Chat Modal */}
      <CustomerServiceModal
        isOpen={isCsOpen}
        onClose={() => setIsCsOpen(false)}
        onNavigateToTab={(tab) => {
          if (tab === 'tracking') setActiveTab('tracking');
          setIsCsOpen(false);
        }}
      />

      {/* 4. Product Reviews & Community Rating Modal */}
      {reviewModalProduct && (
        <ProductReviewsModal
          product={reviewModalProduct}
          reviews={reviews}
          isOpen={!!reviewModalProduct}
          onClose={() => setReviewModalProduct(null)}
          onAddReview={(newRev) => {
            setReviews((prev) => [newRev, ...prev]);
            handleTriggerNotification(
              '⭐ Ulasan Terkirim & +500 Poin Didapat!',
              `Terima kasih telah mengulas ${reviewModalProduct.name}. Koin ulasan telah ditambahkan.`,
              'points'
            );
          }}
        />
      )}

      {/* 5. Loyalty Points & Membership Tier Center */}
      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        loyalty={loyalty}
        transactions={pointTransactions}
      />

      {/* 6. User Analytics & Purchase History Modal */}
      <UserAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        orders={orders}
        products={products}
        onTrackOrder={(ord) => {
          setActiveTrackingOrder(ord);
          setActiveTab('tracking');
        }}
      />

      {/* 7. Notification Center */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          sound.playNotification();
        }}
        onSelectNotification={(item) => {
          if (item.actionUrl === 'tracking') setActiveTab('tracking');
          if (item.actionUrl === 'loyalty') setIsLoyaltyOpen(true);
          if (item.actionUrl === 'orders') setIsAnalyticsOpen(true);
          setIsNotifOpen(false);
        }}
        onTriggerTestPush={() => {
          handleTriggerNotification(
            '🎁 Penawaran Eksklusif Terbatas',
            'Flash sale jam makan siang: Beli Kopi Gayo dapat voucher diskon 25% untuk koleksi batik!',
            'promo'
          );
        }}
      />

      {/* 8. Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          isOpen={!!selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={(prod, q) => {
            handleAddToCart(prod, q);
            setSelectedProductDetail(null);
            setIsCartOpen(true);
          }}
          onOpenReviews={(prod) => {
            setReviewModalProduct(prod);
          }}
          loyalty={loyalty}
        />
      )}
    </div>
  );
}
