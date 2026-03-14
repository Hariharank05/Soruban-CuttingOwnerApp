import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Coupon } from '@/types';
import SAMPLE_COUPONS from '@/data/coupons';

const COUPONS_KEY = '@owner_coupons';
const DEMO_COUPON_VERSION_KEY = '@demo_coupon_version';
const DEMO_COUPON_VERSION = 2;

interface CouponContextType {
  coupons: Coupon[];
  isLoading: boolean;
  getCoupons: () => Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  getActiveCoupons: () => Coupon[];
  refreshCoupons: () => Promise<void>;
}

const CouponContext = createContext<CouponContextType>({
  coupons: [],
  isLoading: true,
  getCoupons: () => [],
  addCoupon: async () => {},
  updateCoupon: async () => {},
  deleteCoupon: async () => {},
  toggleActive: async () => {},
  getActiveCoupons: () => [],
  refreshCoupons: async () => {},
});

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCoupons = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_COUPON_VERSION_KEY, 0);
      if (storedVersion < DEMO_COUPON_VERSION) {
        await setStoredData(COUPONS_KEY, SAMPLE_COUPONS);
        await setStoredData(DEMO_COUPON_VERSION_KEY, DEMO_COUPON_VERSION);
        setCoupons(SAMPLE_COUPONS);
      } else {
        const stored = await getStoredData<Coupon[]>(COUPONS_KEY, []);
        if (stored.length > 0) {
          setCoupons(stored);
        } else {
          await setStoredData(COUPONS_KEY, SAMPLE_COUPONS);
          setCoupons(SAMPLE_COUPONS);
        }
      }
    } catch {
      setCoupons(SAMPLE_COUPONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const persist = useCallback(async (updated: Coupon[]) => {
    setCoupons(updated);
    await setStoredData(COUPONS_KEY, updated);
  }, []);

  const getCoupons = useCallback(() => coupons, [coupons]);

  const addCoupon = useCallback(async (coupon: Coupon) => {
    const updated = [...coupons, { ...coupon, createdAt: coupon.createdAt || new Date().toISOString() }];
    await persist(updated);
  }, [coupons, persist]);

  const updateCoupon = useCallback(async (id: string, updates: Partial<Coupon>) => {
    const updated = coupons.map(c => {
      if (c.id !== id) return c;
      return { ...c, ...updates, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [coupons, persist]);

  const deleteCoupon = useCallback(async (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    await persist(updated);
  }, [coupons, persist]);

  const toggleActive = useCallback(async (id: string) => {
    const updated = coupons.map(c => {
      if (c.id !== id) return c;
      return { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [coupons, persist]);

  const getActiveCoupons = useCallback(() => {
    return coupons.filter(c => c.isActive);
  }, [coupons]);

  const value = useMemo(
    () => ({
      coupons,
      isLoading,
      getCoupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleActive,
      getActiveCoupons,
      refreshCoupons: loadCoupons,
    }),
    [coupons, isLoading, getCoupons, addCoupon, updateCoupon, deleteCoupon, toggleActive, getActiveCoupons, loadCoupons],
  );

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
}

export const useCoupons = () => useContext(CouponContext);
