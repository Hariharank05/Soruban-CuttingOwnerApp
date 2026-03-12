import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Subscription } from '@/types';

const SUBSCRIPTIONS_KEY = '@owner_subscriptions';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  isLoading: boolean;
  getSubscriptions: () => Subscription[];
  getSubscriptionsByStatus: (status: Subscription['status']) => Subscription[];
  getSubscriptionById: (id: string) => Subscription | undefined;
  updateSubscriptionStatus: (id: string, status: Subscription['status']) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptions: [],
  isLoading: true,
  getSubscriptions: () => [],
  getSubscriptionsByStatus: () => [],
  getSubscriptionById: () => undefined,
  updateSubscriptionStatus: async () => {},
  refreshSubscriptions: async () => {},
});

// Sample subscriptions used as initial data
const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_001',
    customerId: 'cust_001',
    customerName: 'Priya Sharma',
    frequency: 'daily',
    preferredTime: '7:00 AM - 8:00 AM',
    startDate: '2026-01-15',
    status: 'active',
    items: [
      { id: 'si_1', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 1, unit: '500g', cutType: 'small_pieces' },
      { id: 'si_2', productId: 'p4', name: 'Onions', price: 35, quantity: 1, unit: '500g', cutType: 'slices' },
      { id: 'si_3', productId: 'p6', name: 'Coriander Leaves', price: 15, quantity: 1, unit: 'bunch' },
    ],
    totalAmount: 90,
  },
  {
    id: 'sub_002',
    customerId: 'cust_002',
    customerName: 'Rajesh Kumar',
    frequency: 'weekly',
    preferredTime: '8:00 AM - 9:00 AM',
    startDate: '2026-02-01',
    weeklyDay: 'Mon',
    status: 'active',
    items: [
      { id: 'si_4', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 2, unit: '400g' },
      { id: 'si_5', productId: 'p7', name: 'Carrots', price: 45, quantity: 1, unit: '500g', cutType: 'cubes' },
    ],
    totalAmount: 225,
  },
  {
    id: 'sub_003',
    customerId: 'cust_003',
    customerName: 'Lakshmi Devi',
    frequency: 'daily',
    preferredTime: '6:00 AM - 7:00 AM',
    startDate: '2026-02-10',
    status: 'paused',
    pausedFrom: '2026-03-10',
    pausedUntil: '2026-03-20',
    items: [
      { id: 'si_6', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 1, unit: '500g' },
    ],
    totalAmount: 120,
  },
  {
    id: 'sub_004',
    customerId: 'cust_005',
    customerName: 'Meena Rajan',
    frequency: 'monthly',
    preferredTime: '9:00 AM - 10:00 AM',
    startDate: '2026-01-01',
    monthlyDates: [1, 15],
    status: 'active',
    items: [
      { id: 'si_7', productId: 'p9', name: 'Apple', price: 150, quantity: 2, unit: '1 kg' },
      { id: 'si_8', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 3, unit: '300ml' },
    ],
    totalAmount: 480,
  },
  {
    id: 'sub_005',
    customerId: 'cust_006',
    customerName: 'Venkat Subramanian',
    frequency: 'daily',
    preferredTime: '7:00 AM - 8:00 AM',
    startDate: '2025-12-01',
    status: 'cancelled',
    items: [
      { id: 'si_9', productId: 'p3', name: 'Beetroot', price: 35, quantity: 1, unit: '500g', cutType: 'grated' },
      { id: 'si_10', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 1, unit: '100g' },
    ],
    totalAmount: 55,
  },
];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    try {
      const stored = await getStoredData<Subscription[]>(SUBSCRIPTIONS_KEY, []);
      if (stored.length > 0) {
        setSubscriptions(stored);
      } else {
        await setStoredData(SUBSCRIPTIONS_KEY, SAMPLE_SUBSCRIPTIONS);
        setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      }
    } catch {
      setSubscriptions(SAMPLE_SUBSCRIPTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const persist = useCallback(async (updated: Subscription[]) => {
    setSubscriptions(updated);
    await setStoredData(SUBSCRIPTIONS_KEY, updated);
  }, []);

  const getSubscriptions = useCallback(() => {
    return subscriptions;
  }, [subscriptions]);

  const getSubscriptionsByStatus = useCallback((status: Subscription['status']) => {
    return subscriptions.filter((s) => s.status === status);
  }, [subscriptions]);

  const getSubscriptionById = useCallback((id: string) => {
    return subscriptions.find((s) => s.id === id);
  }, [subscriptions]);

  const updateSubscriptionStatus = useCallback(async (id: string, status: Subscription['status']) => {
    const updated = subscriptions.map((s) => {
      if (s.id !== id) return s;
      return { ...s, status };
    });
    await persist(updated);
  }, [subscriptions, persist]);

  const value = useMemo(
    () => ({
      subscriptions,
      isLoading,
      getSubscriptions,
      getSubscriptionsByStatus,
      getSubscriptionById,
      updateSubscriptionStatus,
      refreshSubscriptions: loadSubscriptions,
    }),
    [subscriptions, isLoading, getSubscriptions, getSubscriptionsByStatus, getSubscriptionById, updateSubscriptionStatus, loadSubscriptions],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscriptions = () => useContext(SubscriptionContext);
