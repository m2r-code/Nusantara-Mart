export interface Product {
  id: string;
  name: string;
  category: 'Elektronik' | 'Fashion' | 'Kuliner' | 'Rumah Tangga' | 'Kecantikan' | 'Hobi';
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  tags: string[];
  isFlashSale?: boolean;
  soldCount: number;
  brand: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  tags: string[];
  photos?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export type PaymentMethod =
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bri_va'
  | 'bni_va'
  | 'qris'
  | 'credit_card'
  | 'cod';

export interface CourierInfo {
  name: string;
  phone: string;
  photo: string;
  vehiclePlate: string;
  vehicleType: string;
  serviceName: string;
  rating: number;
}

export interface Waypoint {
  x: number; // 0 to 100 percentage coordinates for the interactive map
  y: number;
  label: string;
  detail: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  pointsUsed: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'success' | 'failed';
  status: OrderStatus;
  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  courier: CourierInfo;
  tracking: {
    currentStep: number; // 0: Dipesan, 1: Diproses, 2: Dikirim, 3: Tiba
    currentWaypointIndex: number;
    waypoints: Waypoint[];
    estimatedMinutesRemaining: number;
    distanceRemainingKm: number;
    lastUpdated: string;
  };
  pointsEarned: number;
}

export type MembershipTier = 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyProfile {
  pointsBalance: number;
  tier: MembershipTier;
  totalSpent: number;
  totalEarnedPoints: number;
  nextTierThreshold: number;
  cashbackRate: number; // 0.01 for Silver, 0.02 for Gold, 0.03 for Platinum
  freeShippingVouchers: number;
}

export interface PointTransaction {
  id: string;
  date: string;
  type: 'earn' | 'redeem' | 'bonus';
  amount: number;
  description: string;
  relatedOrderId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'points' | 'seller';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
