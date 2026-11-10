import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Truck, 
  RotateCcw, 
  FastForward, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  ShieldCheck, 
  Star,
  Send,
  X
} from 'lucide-react';
import { Order } from '../types';
import { sound } from '../utils/sound';

interface TrackingMapProps {
  order: Order;
  onUpdateOrderTracking?: (updatedOrder: Order) => void;
  onTriggerNotification?: (title: string, message: string, type: 'order') => void;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  order,
  onUpdateOrderTracking,
  onTriggerNotification,
}) => {
  const waypoints = order.tracking.waypoints;
  const [currentIdx, setCurrentIdx] = useState(order.tracking.currentWaypointIndex);
  const [isSimulating, setIsSimulating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverChatOpen, setDriverChatOpen] = useState(false);
  const [driverMessages, setDriverMessages] = useState<Array<{ sender: 'user' | 'driver'; text: string; time: string }>>([
    { sender: 'driver', text: 'Halo Kak, paket sedang saya bawa dengan hati-hati. Sudah dekat ya!', time: '10:20' }
  ]);
  const [inputChat, setInputChat] = useState('');

  // Current position interpolation between waypoints
  const currentWp = waypoints[currentIdx] || waypoints[0];
  const nextWp = waypoints[Math.min(currentIdx + 1, waypoints.length - 1)];

  // Auto simulation ticker
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev < waypoints.length - 1) {
            const next = prev + 1;
            sound.playNotification();

            const isArrival = next === waypoints.length - 1;
            if (isArrival) {
              setIsSimulating(false);
              sound.playOrderSuccess();
              if (onTriggerNotification) {
                onTriggerNotification(
                  '🎉 Paket Telah Tiba di Lokasi Anda!',
                  `Kurir ${order.courier.name} telah sampai di alamat tujuan: ${order.shippingAddress.address}. Silakan terima paket.`,
                  'order'
                );
              }
            } else if (onTriggerNotification) {
              onTriggerNotification(
                '📍 Pembaruan Lokasi Kurir',
                `Kurir ${order.courier.name} telah melewati ${waypoints[next].label}.`,
                'order'
              );
            }

            if (onUpdateOrderTracking) {
              const updated: Order = {
                ...order,
                status: isArrival ? 'selesai' : 'dikirim',
                tracking: {
                  ...order.tracking,
                  currentWaypointIndex: next,
                  currentStep: isArrival ? 3 : 2,
                  estimatedMinutesRemaining: Math.max(0, 14 - next * 3),
                  distanceRemainingKm: Math.max(0, +(3.2 - next * 0.65).toFixed(1)),
                  lastUpdated: 'Baru saja diperbarui secara otomatis',
                },
              };
              onUpdateOrderTracking(updated);
            }
            return next;
          } else {
            setIsSimulating(false);
            return prev;
          }
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, waypoints, order, onUpdateOrderTracking, onTriggerNotification]);

  const handleStepForward = () => {
    if (currentIdx < waypoints.length - 1) {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      sound.playNotification();
      const isArrival = next === waypoints.length - 1;
      if (isArrival) {
        sound.playOrderSuccess();
      }
      if (onUpdateOrderTracking) {
        onUpdateOrderTracking({
          ...order,
          status: isArrival ? 'selesai' : 'dikirim',
          tracking: {
            ...order.tracking,
            currentWaypointIndex: next,
            currentStep: isArrival ? 3 : 2,
            estimatedMinutesRemaining: Math.max(0, 14 - next * 3),
            distanceRemainingKm: Math.max(0, +(3.2 - next * 0.65).toFixed(1)),
            lastUpdated: 'Baru saja',
          },
        });
      }
    }
  };

  const handleResetRoute = () => {
    setCurrentIdx(0);
    setIsSimulating(false);
    if (onUpdateOrderTracking) {
      onUpdateOrderTracking({
        ...order,
        status: 'dikirim',
        tracking: {
          ...order.tracking,
          currentWaypointIndex: 0,
          currentStep: 2,
          estimatedMinutesRemaining: 18,
          distanceRemainingKm: 4.5,
          lastUpdated: 'Mulai ulang rute gudang',
        },
      });
    }
  };

  const handleSendDriverChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const userText = inputChat.trim();
    const newMsg = { sender: 'user' as const, text: userText, time: 'Sekarang' };
    setDriverMessages((prev) => [...prev, newMsg]);
    setInputChat('');

    setTimeout(() => {
      sound.playNotification();
      setDriverMessages((prev) => [
        ...prev,
        {
          sender: 'driver' as const,
          text: 'Siap Kak! Titik antar sudah sesuai peta aplikasi. Saya segera sampai di depan gerbang ya.',
          time: 'Baru saja',
        },
      ]);
    }, 1500);
  };

  const progressPercent = Math.round((currentIdx / (waypoints.length - 1)) * 100);

  // SVG route path data string
  const pathD = waypoints.reduce((acc, wp, i) => {
    return i === 0 ? `M ${wp.x * 7} ${wp.y * 4.5}` : `${acc} L ${wp.x * 7} ${wp.y * 4.5}`;
  }, '');

  // Calculate rotation angle of vehicle toward next waypoint
  const deltaX = (nextWp.x - currentWp.x);
  const deltaY = (nextWp.y - currentWp.y);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              GPS Radar Pengiriman Aktif
            </span>
            <span className="text-xs text-slate-500 font-medium">
              No. Resi: <strong className="text-slate-800">{order.invoiceNumber}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            Pelacakan Pengiriman Langsung
          </h2>
        </div>

        {/* Action Controls for Map Simulation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              isSimulating
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title={isSimulating ? 'Jeda Simulasi' : 'Jalankan Simulasi Kurir Otomatis'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Jeda Kurir' : 'Simulasi Kurir Bergerak'}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentIdx >= waypoints.length - 1}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1 disabled:opacity-40"
            title="Langkah Berikutnya"
          >
            <FastForward className="w-3.5 h-3.5" />
            Titik Depan
          </button>

          <button
            onClick={handleResetRoute}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Ulangi dari Gudang"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map View & Overlay */}
      <div className="relative w-full h-[400px] md:h-[460px] bg-slate-100 overflow-hidden select-none">
        {/* Interactive Map Canvas Container */}
        <div 
          className="w-full h-full relative transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Detailed Indonesian Metro Map Background via SVG Vector */}
          <svg
            className="w-full h-full"
            viewBox="0 0 700 450"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />
              </pattern>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Base land color */}
            <rect width="100%" height="100%" fill="#f8fafc" />
            <rect width="100%" height="100%" fill="url(#gridPattern)" />

            {/* Parks / Greenery Zones */}
            <path d="M 20 40 Q 90 20 140 70 T 80 180 Z" fill="#dcfce7" opacity="0.7" />
            <path d="M 520 280 Q 610 240 660 320 T 560 410 Z" fill="#dcfce7" opacity="0.7" />
            <path d="M 280 160 Q 360 140 390 210 T 310 260 Z" fill="#d1fae5" opacity="0.5" />

            {/* City Waterway / Sungai Ciliwung Canal simulation */}
            <path
              d="M 120 0 C 180 80, 160 180, 260 250 S 420 340, 500 450"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="16"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M 120 0 C 180 80, 160 180, 260 250 S 420 340, 500 450"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Urban Road Network Lines */}
            {/* Secondary Arterial roads */}
            <path d="M 0 120 L 700 140" stroke="#cbd5e1" strokeWidth="6" />
            <path d="M 0 310 L 700 290" stroke="#cbd5e1" strokeWidth="6" />
            <path d="M 190 0 L 220 450" stroke="#cbd5e1" strokeWidth="6" />
            <path d="M 480 0 L 460 450" stroke="#cbd5e1" strokeWidth="6" />
            
            {/* Toll Highway / Tol Dalam Kota */}
            <path d="M 50 420 C 200 350, 400 250, 650 100" stroke="#fbbf24" strokeWidth="7" strokeDasharray="10 5" opacity="0.85" />

            {/* Connecting neighborhood streets */}
            <path d="M 80 200 L 280 200 L 380 90 L 600 90" stroke="#e2e8f0" strokeWidth="4" />
            <path d="M 320 400 L 320 200 L 440 200 L 440 60" stroke="#e2e8f0" strokeWidth="4" />

            {/* Landmarks labels */}
            <text x="70" y="90" fill="#64748b" fontSize="11" fontWeight="600">Gelora Senayan Hub</text>
            <text x="210" y="270" fill="#64748b" fontSize="11" fontWeight="600">Kanal Barat Slipi</text>
            <text x="370" y="160" fill="#64748b" fontSize="11" fontWeight="600">Sentra Tomang</text>
            <text x="530" y="380" fill="#64748b" fontSize="11" fontWeight="600">Taman Kebon Jeruk</text>

            {/* The Active Delivery Route Polyline */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            {/* Dashed animated path overlay */}
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Waypoints Render */}
            {waypoints.map((wp, idx) => {
              const isPast = idx <= currentIdx;
              const isOrigin = idx === 0;
              const isDest = idx === waypoints.length - 1;

              return (
                <g key={idx} transform={`translate(${wp.x * 7}, ${wp.y * 4.5})`}>
                  {/* Outer circle */}
                  <circle
                    r={isOrigin || isDest ? "12" : "7"}
                    fill={isPast ? (isDest ? '#2563eb' : '#10b981') : '#ffffff'}
                    stroke={isPast ? '#ffffff' : '#94a3b8'}
                    strokeWidth="2.5"
                    className="drop-shadow"
                  />
                  {/* Waypoint Label */}
                  <rect
                    x={-45}
                    y={isDest || isOrigin ? 16 : 10}
                    width={90}
                    height={20}
                    rx={5}
                    fill="#1e293b"
                    opacity="0.85"
                  />
                  <text
                    x={0}
                    y={isDest || isOrigin ? 29 : 23}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {isOrigin ? '🏢 Gudang' : isDest ? '🏡 Tujuan' : `Titik #${idx}`}
                  </text>
                </g>
              );
            })}

            {/* Animated Courier Marker at Current Waypoint Position */}
            <g
              transform={`translate(${currentWp.x * 7}, ${currentWp.y * 4.5})`}
              className="transition-all duration-700 ease-out"
            >
              {/* Radar pulse ripples */}
              <circle r="24" fill="#10b981" opacity="0.2" className="animate-ping" />
              <circle r="16" fill="#10b981" opacity="0.4" />
              <circle r="12" fill="#059669" stroke="#ffffff" strokeWidth="2.5" className="drop-shadow-lg" />
              
              {/* Orientation pointer indicator */}
              <g transform={`rotate(${angle})`}>
                <polygon points="0,-16 6,-8 -6,-8" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
              </g>

              {/* Courier badge tag */}
              <rect
                x="-55"
                y="-38"
                width="110"
                height="22"
                rx="6"
                fill="#0f172a"
                className="drop-shadow-md"
              />
              <text
                x="0"
                y="-24"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
              >
                🏍️ {order.courier.name}
              </text>
            </g>
          </svg>
        </div>

        {/* Map Control Buttons Floating on Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
            title="Perbesar Peta"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
            title="Perkecil Peta"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2.5 h-9 rounded-xl bg-white/95 backdrop-blur shadow-md border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="Reset Posisi Peta"
          >
            Tengah
          </button>
        </div>

        {/* ETA & Distance Floating Pill on Top Left */}
        <div className="absolute top-4 left-4 z-10 max-w-[280px]">
          <div className="bg-slate-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {currentIdx >= waypoints.length - 1 ? 'Pesanan Sampai!' : 'Estimasi Waktu Tiba'}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                {currentIdx >= waypoints.length - 1 ? 'Terkirim' : `${order.tracking.estimatedMinutesRemaining} Menit`}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                {currentIdx >= waypoints.length - 1 ? 'Tiba di Alamat' : `${order.tracking.distanceRemainingKm} KM Lagi`}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
              {currentWp.label} - {currentWp.detail}
            </p>

            {/* Route progress bar */}
            <div className="w-full bg-slate-700/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Gudang Senayan</span>
              <span>{progressPercent}% Tercapai</span>
              <span>Rumah Tujuan</span>
            </div>
          </div>
        </div>

        {/* Live Courier Profile Card Floating at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={order.courier.photo}
                  alt={order.courier.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{order.courier.name}</h4>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {order.courier.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {order.courier.serviceName} • <strong className="text-slate-700">{order.courier.vehiclePlate}</strong>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  {order.courier.vehicleType}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons: Call & Chat with Courier */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDriverChatOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Chat Kurir
              </button>

              <button
                onClick={() => setIsDriverModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                Hubungi Telepon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Steps Timeline Bar */}
      <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Tahapan Status Pengiriman
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: 0, title: 'Pesanan Dikonfirmasi', desc: 'Pembayaran Lunas', time: '10:00 WIB' },
            { step: 1, title: 'Diproses Gudang', desc: 'Quality Check & Packing', time: '10:10 WIB' },
            { step: 2, title: 'Dalam Perjalanan', desc: 'Kurir Menuju Alamat', time: '10:15 WIB' },
            { step: 3, title: 'Paket Diterima', desc: 'Serah Terima Pelanggan', time: currentIdx >= waypoints.length - 1 ? 'Sekarang' : 'Estimasi 10:35' },
          ].map((item, idx) => {
            const isCompleted = currentIdx >= waypoints.length - 1 ? true : idx <= order.tracking.currentStep;
            const isCurrent = idx === order.tracking.currentStep && currentIdx < waypoints.length - 1;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : isCompleted
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <h5 className="font-bold text-xs text-slate-800">{item.title}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Direct Phone Call Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsDriverModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={order.courier.photo}
              alt={order.courier.name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-emerald-500 shadow-lg mb-3"
            />
            <h3 className="font-bold text-lg text-slate-900">{order.courier.name}</h3>
            <p className="text-xs text-emerald-600 font-semibold mb-1">
              Kurir SiCepat Ekspedisi • Verified Partner
            </p>
            <p className="text-sm font-bold text-slate-700 bg-slate-100 py-2 rounded-xl mb-4">
              Nomor: {order.courier.phone}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playNotification();
                  setIsDriverModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                Panggil Sekarang
              </button>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Direct Chat Sheet Modal */}
      {driverChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={order.courier.photo}
                  alt={order.courier.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h4 className="font-bold text-sm">{order.courier.name}</h4>
                  <p className="text-xs text-emerald-100">Sedang berkendara • Balas cepat</p>
                </div>
              </div>
              <button
                onClick={() => setDriverChatOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              <div className="text-center">
                <span className="text-[11px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                  Obrolan Terenkripsi Langsung dengan Kurir
                </span>
              </div>
              {driverMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-medium ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick response chips */}
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-2 overflow-x-auto text-[11px] text-slate-700">
              <button
                onClick={() => setInputChat('Titip di pos satpam depan gerbang ya Mas')}
                className="bg-white px-2.5 py-1 rounded-full border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
              >
                Titip di pos satpam
              </button>
              <button
                onClick={() => setInputChat('Rumah saya pagar hitam nomor 42')}
                className="bg-white px-2.5 py-1 rounded-full border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
              >
                Pagar hitam No. 42
              </button>
              <button
                onClick={() => setInputChat('Hati-hati di jalan Mas Budi')}
                className="bg-white px-2.5 py-1 rounded-full border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
              >
                Hati-hati di jalan
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendDriverChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Tulis pesan untuk kurir..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
