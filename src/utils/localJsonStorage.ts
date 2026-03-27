import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStoredData<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

export async function removeStoredData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('Storage remove failed:', e);
  }
}

// ─── Loyalty Config ───
import type { LoyaltyConfig } from '@/types';
const LOYALTY_KEY = '@owner_loyalty_config';
export async function loadLoyaltyConfig(): Promise<LoyaltyConfig | null> {
  return getStoredData<LoyaltyConfig | null>(LOYALTY_KEY, null);
}
export async function saveLoyaltyConfig(config: LoyaltyConfig): Promise<void> {
  return setStoredData(LOYALTY_KEY, config);
}

// ─── Promotions ───
import type { Promotion } from '@/types';
const PROMOTIONS_KEY = '@owner_promotions';
export async function loadPromotions(): Promise<Promotion[]> {
  return getStoredData<Promotion[]>(PROMOTIONS_KEY, []);
}
export async function savePromotions(data: Promotion[]): Promise<void> {
  return setStoredData(PROMOTIONS_KEY, data);
}

// ─── Settlements ───
import type { Settlement } from '@/types';
const SETTLEMENTS_KEY = '@owner_settlements';
export async function loadSettlements(): Promise<Settlement[]> {
  return getStoredData<Settlement[]>(SETTLEMENTS_KEY, []);
}

// ─── Staff ───
import type { Staff } from '@/types';
const STAFF_KEY = '@owner_staff';
export async function loadStaff(): Promise<Staff[]> {
  return getStoredData<Staff[]>(STAFF_KEY, []);
}
export async function saveStaff(data: Staff[]): Promise<void> {
  return setStoredData(STAFF_KEY, data);
}

// ─── Wallet ───
import type { WalletTransaction, CustomerWallet } from '@/types';
const WALLET_TX_KEY = '@owner_wallet_transactions';
const WALLET_CUSTOMERS_KEY = '@owner_customer_wallets';
export async function loadWalletTransactions(): Promise<WalletTransaction[]> {
  return getStoredData<WalletTransaction[]>(WALLET_TX_KEY, []);
}
export async function saveWalletTransactions(data: WalletTransaction[]): Promise<void> {
  return setStoredData(WALLET_TX_KEY, data);
}
export async function loadCustomerWallets(): Promise<CustomerWallet[]> {
  return getStoredData<CustomerWallet[]>(WALLET_CUSTOMERS_KEY, []);
}
export async function saveCustomerWallets(data: CustomerWallet[]): Promise<void> {
  return setStoredData(WALLET_CUSTOMERS_KEY, data);
}

// ─── Reviews ───
import type { ProductReview } from '@/types';
const REVIEWS_KEY = '@owner_reviews';
export async function loadReviews(): Promise<ProductReview[]> {
  return getStoredData<ProductReview[]>(REVIEWS_KEY, []);
}
export async function saveReviews(data: ProductReview[]): Promise<void> {
  return setStoredData(REVIEWS_KEY, data);
}

// ─── Issues ───
import type { OrderIssue } from '@/types';
const ISSUES_KEY = '@owner_issues';
export async function loadIssues(): Promise<OrderIssue[]> {
  return getStoredData<OrderIssue[]>(ISSUES_KEY, []);
}
export async function saveIssues(data: OrderIssue[]): Promise<void> {
  return setStoredData(ISSUES_KEY, data);
}

// ─── Referrals ───
import type { Referral, ReferralConfig } from '@/types';
const REFERRALS_KEY = '@owner_referrals';
const REFERRAL_CONFIG_KEY = '@owner_referral_config';
export async function loadReferrals(): Promise<Referral[]> {
  return getStoredData<Referral[]>(REFERRALS_KEY, []);
}
export async function saveReferrals(data: Referral[]): Promise<void> {
  return setStoredData(REFERRALS_KEY, data);
}
export async function loadReferralConfig(): Promise<ReferralConfig | null> {
  return getStoredData<ReferralConfig | null>(REFERRAL_CONFIG_KEY, null);
}
export async function saveReferralConfig(data: ReferralConfig): Promise<void> {
  return setStoredData(REFERRAL_CONFIG_KEY, data);
}

// ─── Recipes ───
import type { CommunityRecipe } from '@/types';
const RECIPES_KEY = '@owner_recipes';
export async function loadRecipes(): Promise<CommunityRecipe[]> {
  return getStoredData<CommunityRecipe[]>(RECIPES_KEY, []);
}
export async function saveRecipes(data: CommunityRecipe[]): Promise<void> {
  return setStoredData(RECIPES_KEY, data);
}

// ─── Support Tickets ───
import type { SupportTicket } from '@/types';
const TICKETS_KEY = '@owner_support_tickets';
export async function loadTickets(): Promise<SupportTicket[]> {
  return getStoredData<SupportTicket[]>(TICKETS_KEY, []);
}
export async function saveTickets(data: SupportTicket[]): Promise<void> {
  return setStoredData(TICKETS_KEY, data);
}

// ─── Notification Config ───
import type { NotificationTemplate, NotificationCampaign } from '@/types';
const NOTIF_TEMPLATES_KEY = '@owner_notif_templates';
const NOTIF_CAMPAIGNS_KEY = '@owner_notif_campaigns';
export async function loadNotifTemplates(): Promise<NotificationTemplate[]> {
  return getStoredData<NotificationTemplate[]>(NOTIF_TEMPLATES_KEY, []);
}
export async function saveNotifTemplates(data: NotificationTemplate[]): Promise<void> {
  return setStoredData(NOTIF_TEMPLATES_KEY, data);
}
export async function loadNotifCampaigns(): Promise<NotificationCampaign[]> {
  return getStoredData<NotificationCampaign[]>(NOTIF_CAMPAIGNS_KEY, []);
}
export async function saveNotifCampaigns(data: NotificationCampaign[]): Promise<void> {
  return setStoredData(NOTIF_CAMPAIGNS_KEY, data);
}
