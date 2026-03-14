import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Subscription } from '@/types';

const SUBSCRIPTIONS_KEY = '@owner_subscriptions';
const DEMO_SUB_VERSION_KEY = '@demo_sub_version';
const DEMO_SUB_VERSION = 2;

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

// Sample subscriptions used as initial data — comprehensive demo set
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
    skippedDeliveries: [
      { date: '2026-03-05', reason: 'Out of town', skippedAt: '2026-03-04T18:00:00.000Z', status: 'skipped' },
      { date: '2026-03-06', reason: 'Out of town', skippedAt: '2026-03-04T18:00:00.000Z', status: 'skipped' },
    ],
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
    skippedDeliveries: [
      { date: '2026-03-08', reason: 'Festival holiday', skippedAt: '2026-03-07T20:00:00.000Z', status: 'skipped' },
    ],
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
  {
    id: 'sub_006',
    customerId: 'cust_007',
    customerName: 'Arun Balaji',
    frequency: 'daily',
    preferredTime: '6:30 AM - 7:30 AM',
    startDate: '2026-02-20',
    status: 'active',
    items: [
      { id: 'si_11', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 2, unit: '500g', cutType: 'cubes' },
      { id: 'si_12', productId: 'p3', name: 'Beetroot', price: 35, quantity: 1, unit: '500g', cutType: 'grated' },
      { id: 'si_13', productId: 'p7', name: 'Carrots', price: 45, quantity: 1, unit: '500g', cutType: 'long_cuts' },
    ],
    totalAmount: 160,
    skippedDeliveries: [
      { date: '2026-03-01', reason: 'Not needed', skippedAt: '2026-02-28T22:00:00.000Z', status: 'skipped' },
    ],
  },
  {
    id: 'sub_007',
    customerId: 'cust_008',
    customerName: 'Nithya Prakash',
    frequency: 'weekly',
    preferredTime: '7:00 AM - 8:00 AM',
    startDate: '2026-01-10',
    weeklyDay: 'Wed',
    status: 'active',
    items: [
      { id: 'si_14', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 1, unit: '500g' },
      { id: 'si_15', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 2, unit: '300ml' },
    ],
    totalAmount: 240,
  },
  {
    id: 'sub_008',
    customerId: 'cust_009',
    customerName: 'Suresh Babu',
    frequency: 'daily',
    preferredTime: '5:30 AM - 6:30 AM',
    startDate: '2026-03-01',
    status: 'active',
    items: [
      { id: 'si_16', productId: 'p4', name: 'Onions', price: 35, quantity: 1, unit: '1 kg', cutType: 'slices' },
      { id: 'si_17', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 1, unit: '100g' },
      { id: 'si_18', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 1, unit: '500g', cutType: 'small_pieces' },
    ],
    totalAmount: 95,
  },
  {
    id: 'sub_009',
    customerId: 'cust_010',
    customerName: 'Divya Krishnamurthy',
    frequency: 'weekly',
    preferredTime: '8:00 AM - 9:00 AM',
    startDate: '2026-02-15',
    weeklyDay: 'Fri',
    status: 'paused',
    pausedFrom: '2026-03-12',
    pausedUntil: '2026-03-25',
    items: [
      { id: 'si_19', productId: 'p9', name: 'Apple', price: 150, quantity: 1, unit: '1 kg', cutType: 'slices' },
      { id: 'si_20', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 1, unit: '500g' },
    ],
    totalAmount: 270,
  },
  {
    id: 'sub_010',
    customerId: 'cust_013',
    customerName: 'Deepa Rajan',
    frequency: 'monthly',
    preferredTime: '10:00 AM - 11:00 AM',
    startDate: '2026-01-05',
    monthlyDates: [5, 20],
    status: 'active',
    items: [
      { id: 'si_21', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 3, unit: '400g' },
      { id: 'si_22', productId: 'p4', name: 'Onions', price: 35, quantity: 2, unit: '1 kg', cutType: 'cubes' },
      { id: 'si_23', productId: 'p7', name: 'Carrots', price: 45, quantity: 2, unit: '500g', cutType: 'long_cuts' },
    ],
    totalAmount: 430,
  },
  {
    id: 'sub_011',
    customerId: 'cust_014',
    customerName: 'Revathi Krishnan',
    frequency: 'daily',
    preferredTime: '6:00 AM - 7:00 AM',
    startDate: '2026-02-01',
    status: 'cancelled',
    items: [
      { id: 'si_24', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 1, unit: '500g', cutType: 'slices' },
    ],
    totalAmount: 40,
  },
  {
    id: 'sub_012',
    customerId: 'cust_015',
    customerName: 'Ganesh Iyer',
    frequency: 'weekly',
    preferredTime: '9:00 AM - 10:00 AM',
    startDate: '2026-03-01',
    weeklyDay: 'Sat',
    status: 'active',
    items: [
      { id: 'si_25', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 2, unit: '500g' },
      { id: 'si_26', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 1, unit: '300ml' },
    ],
    totalAmount: 300,
  },
];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_SUB_VERSION_KEY, 0);
      if (storedVersion < DEMO_SUB_VERSION) {
        await setStoredData(SUBSCRIPTIONS_KEY, SAMPLE_SUBSCRIPTIONS);
        await setStoredData(DEMO_SUB_VERSION_KEY, DEMO_SUB_VERSION);
        setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      } else {
        const stored = await getStoredData<Subscription[]>(SUBSCRIPTIONS_KEY, []);
        if (stored.length > 0) {
          setSubscriptions(stored);
        } else {
          await setStoredData(SUBSCRIPTIONS_KEY, SAMPLE_SUBSCRIPTIONS);
          setSubscriptions(SAMPLE_SUBSCRIPTIONS);
        }
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
