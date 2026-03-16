// ─── Owner / Admin ───
export interface OwnerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'owner' | 'admin' | 'staff';
  avatar?: string;
}

// ─── Customer (from Cutting App) ───
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate?: string;
}

// ─── Product ───
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  discount?: string;
  category: 'vegetables' | 'fruits' | 'salad_packs' | 'healthy_drinks' | 'dish_packs';
  subcategory?: string;
  description?: string;
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  healthBenefits?: string[];
  cuttingVideoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Cut Types ───
export type CutType = 'small_pieces' | 'slices' | 'cubes' | 'long_cuts' | 'grated';

// ─── Order Item ───
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  unit: string;
  selectedWeight?: number;
  cutType?: CutType;
  specialInstructions?: string;
}

// ─── Order Status ───
export type OrderStatus = 'placed' | 'confirmed' | 'cutting' | 'quality_check' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';

// ─── Owner Order Status (for managing) ───
export type OwnerOrderStatus = 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

// ─── Order Timeline ───
export interface OrderTimeline {
  status: string;
  time: string;
  description: string;
  completed: boolean;
}

// ─── Subscription Types ───
export type SubFrequency = 'daily' | 'weekly' | 'monthly';

export interface SkippedDelivery {
  date: string;
  reason?: string;
  skippedAt: string;
  status: 'skipped' | 'too_late';
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  frequency: SubFrequency;
  preferredTime: string;
  startDate: string;
  weeklyDay?: string;
  monthlyDates?: number[];
  status: 'active' | 'paused' | 'cancelled';
  skippedDeliveries?: SkippedDelivery[];
  pausedFrom?: string;
  pausedUntil?: string;
  items: OrderItem[];
  totalAmount: number;
}

// ─── Payment ───
export type PaymentMethod = 'cod' | 'upi' | 'wallet' | 'wallet_partial';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  method: PaymentMethod;
  amount: number;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  date: string;
  walletAmountUsed?: number;
  refundAmount?: number;
}

// ─── Order ───
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: OwnerOrderStatus;
  total: number;
  subtotal: number;
  cuttingCharges: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  deliverySlot: string;
  deliveryAddress: string;
  createdAt: string;
  estimatedDelivery?: string;
  timeline?: OrderTimeline[];
  specialNote?: string;
  subscription?: {
    id: string;
    frequency: SubFrequency;
  };
  paymentMethod: PaymentMethod;
  walletAmountUsed?: number;
  assignedDriver?: string;
  driverPhone?: string;
}

// ─── Delivery Person ───
export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isAvailable: boolean;
  activeDeliveries: number;
  totalDeliveries: number;
}

// ─── Dashboard Stats ───
export interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredToday: number;
  todayRevenue: number;
  activeSubscriptions: number;
  lowStockProducts: number;
}

// ─── Cutting Instruction (for display) ───
export interface CuttingInstruction {
  productName: string;
  cutType: CutType;
  quantity: number;
  unit: string;
  weight?: number;
  specialInstructions?: string;
}

// ─── Pack Item (ingredient in a pack) ───
export interface PackItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  productId?: string;
  image?: string;
}

// ─── Pack Size Option ───
export interface PackSize {
  id: string;
  label: string;
  serves: string;
  weightGrams: number;
  weightLabel: string;
}

// ─── Regional Variant ───
export interface RegionalVariant {
  id: string;
  name: string;
  description: string;
  spiceLevel: 'mild' | 'medium' | 'spicy';
  extraIngredients?: string[];
}

// ─── Pack (Dish Pack / Salad Pack / Fruit Pack / Festival Pack) ───
export type PackCategory = 'dish_pack' | 'salad_pack' | 'fruit_pack' | 'juice_pack' | 'festival_pack';

export interface Pack {
  id: string;
  name: string;
  description: string;
  image: string;
  category: PackCategory;
  price: number;
  serves: string;
  color: string;
  tag?: string;
  items: PackItem[];
  preparationSteps?: string[];
  cookingVideoUrl?: string;
  regionalVariants?: RegionalVariant[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Coupon / Offer ───
export type DiscountType = 'percentage' | 'flat';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Cut Type Pricing ───
export interface CutTypePricing {
  id: CutType;
  label: string;
  fee: number;
  description: string;
  image?: string;
}

// ─── Loyalty Program ───
export type LoyaltyType = 'order_count' | 'spend_value';
export type RewardType = 'discount_percent' | 'flat_discount' | 'free_delivery';

export interface LoyaltyConfig {
  id: string;
  isEnabled: boolean;
  loyaltyType: LoyaltyType;
  threshold: number;
  rewardType: RewardType;
  rewardValue: number;
  updatedAt: string;
}

// ─── Promotions ───
export type PromotionType = 'discount' | 'min_order' | 'new_arrival' | 'seasonal_banner';

export interface Promotion {
  id: string;
  type: PromotionType;
  title: string;
  description: string;
  discountValue?: number;
  discountType?: 'flat' | 'percent';
  minOrder?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ─── Settlements ───
export interface Settlement {
  id: string;
  date: string;
  status: 'pending' | 'processed' | 'paid';
  totalSales: number;
  totalDeductions: number;
  commissionRate?: number;
  commissionAmount?: number;
  netAmount: number;
  orders: string[];
  transactionId?: string;
}

// ─── Staff ───
export type StaffRole = 'order_manager' | 'delivery_person' | 'billing_staff' | 'viewer';
export type StaffPermission =
  | 'view_orders' | 'manage_orders'
  | 'fill_prices' | 'manage_catalog'
  | 'view_billing' | 'manage_billing'
  | 'delivery_updates' | 'view_reports';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  permissions: StaffPermission[];
  isActive: boolean;
  joinedAt: string;
}
