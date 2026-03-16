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
