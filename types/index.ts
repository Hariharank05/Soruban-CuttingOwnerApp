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

// ─── Wallet Transaction (owner view of customer wallets) ───
export type WalletTransactionType = 'credit' | 'debit' | 'refund' | 'cashback' | 'topup';

export interface WalletTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: WalletTransactionType;
  amount: number;
  title: string;
  description?: string;
  orderId?: string;
  date: string;
  balanceAfter: number;
}

export interface CustomerWallet {
  customerId: string;
  customerName: string;
  customerPhone: string;
  balance: number;
  totalCredited: number;
  totalDebited: number;
  lastTransaction?: string;
}

// ─── Reviews & Ratings ───
export type ReviewStatus = 'published' | 'flagged' | 'hidden';

export interface ProductReview {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  productId: string;
  productName: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  ownerReply?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Order Ratings (feedback from customers) ───
export interface OrderRating {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  overallRating: number;
  freshnessRating: number;
  cuttingRating: number;
  deliveryRating: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
}

// ─── Order Issues ───
export type IssueType = 'wrong_item' | 'quality' | 'missing_item' | 'damaged' | 'late_delivery' | 'wrong_cut' | 'other';
export type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface OrderIssue {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: IssueType;
  priority: IssuePriority;
  title: string;
  description: string;
  images?: string[];
  status: IssueStatus;
  resolution?: string;
  refundAmount?: number;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

// ─── Delivery Tracking (owner real-time view) ───
export type DeliveryTrackingStatus = 'assigned' | 'picked_up' | 'in_transit' | 'nearby' | 'delivered';

export interface DeliveryTracking {
  id: string;
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  customerName: string;
  customerAddress: string;
  status: DeliveryTrackingStatus;
  estimatedTime: string;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  distanceKm?: number;
  notes?: string;
}

// ─── Vacation Requests (subscription pauses) ───
export interface VacationRequest {
  id: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  affectedDeliveries: number;
  createdAt: string;
}

// ─── Referral Program ───
export interface ReferralConfig {
  id: string;
  isEnabled: boolean;
  referrerReward: number;
  refereeReward: number;
  rewardType: 'wallet_credit' | 'discount_percent' | 'flat_discount';
  minOrderForReward: number;
  maxReferrals: number;
  updatedAt: string;
}

export type ReferralStatus = 'pending' | 'completed' | 'expired';

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerPhone: string;
  refereeName: string;
  refereePhone: string;
  status: ReferralStatus;
  rewardAmount: number;
  orderId?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Loyalty Tiers ───
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyTierConfig {
  tier: LoyaltyTier;
  name: string;
  minPoints: number;
  discountPercent: number;
  freeDelivery: boolean;
  prioritySupport: boolean;
  exclusiveOffers: boolean;
  color: string;
  icon: string;
}

export interface CheckInConfig {
  isEnabled: boolean;
  dailyPoints: number;
  streakBonus: number;
  streakDays: number;
  maxStreak: number;
  updatedAt: string;
}

export interface CustomerLoyalty {
  customerId: string;
  customerName: string;
  tier: LoyaltyTier;
  totalPoints: number;
  currentPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string;
}

// ─── Community Recipes ───
export type RecipeStatus = 'pending' | 'approved' | 'rejected' | 'featured';

export interface CommunityRecipe {
  id: string;
  title: string;
  image: string;
  authorId: string;
  authorName: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings: number;
  likes: number;
  status: RecipeStatus;
  linkedPackId?: string;
  linkedPackName?: string;
  createdAt: string;
  reviewedAt?: string;
}

// ─── Notification Config ───
export type NotificationType = 'promotional' | 'order_update' | 'subscription_reminder' | 'loyalty' | 'offer';

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationCampaign {
  id: string;
  templateId?: string;
  title: string;
  body: string;
  type: NotificationType;
  targetAudience: 'all' | 'subscribers' | 'inactive' | 'loyal' | 'new';
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  sentCount?: number;
  openCount?: number;
  createdAt: string;
}

// ─── Support Tickets ───
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'order' | 'delivery' | 'payment' | 'subscription' | 'product' | 'app' | 'other';

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'owner' | 'system';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  messages: TicketMessage[];
  orderId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

// ─── Custom Pack Analytics ───
export interface CustomPackTrend {
  id: string;
  name: string;
  items: string[];
  usageCount: number;
  lastUsed: string;
  avgOrderValue: number;
  customerCount: number;
}
