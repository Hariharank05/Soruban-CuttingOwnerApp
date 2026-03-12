import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Order, OwnerOrderStatus } from '@/types';

const ORDERS_KEY = '@owner_orders';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  getOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, newStatus: OwnerOrderStatus) => Promise<void>;
  assignDriver: (orderId: string, driverName: string, driverPhone: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  isLoading: true,
  getOrders: () => [],
  getOrderById: () => undefined,
  updateOrderStatus: async () => {},
  assignDriver: async () => {},
  refreshOrders: async () => {},
});

// Sample orders used as initial data
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ORD1001',
    customerId: 'cust_001',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    items: [
      { id: 'item_1', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 2, unit: '500g', cutType: 'small_pieces' },
      { id: 'item_2', productId: 'p4', name: 'Onions', price: 35, quantity: 1, unit: '1 kg', cutType: 'slices' },
    ],
    status: 'pending',
    total: 145,
    subtotal: 115,
    cuttingCharges: 10,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '7:00 AM - 8:00 AM',
    deliveryAddress: '42, Anna Nagar, Coimbatore',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    estimatedDelivery: '30-45 min',
    paymentMethod: 'upi',
    timeline: [
      { status: 'Order Placed', time: '6:30 AM', description: 'Customer placed the order', completed: true },
    ],
  },
  {
    id: 'ORD1002',
    customerId: 'cust_002',
    customerName: 'Rajesh Kumar',
    customerPhone: '9876543211',
    items: [
      { id: 'item_3', productId: 'p7', name: 'Carrots', price: 45, quantity: 1, unit: '500g', cutType: 'cubes' },
      { id: 'item_4', productId: 'p13', name: 'Capsicum', price: 60, quantity: 1, unit: '250g', cutType: 'slices' },
    ],
    status: 'preparing',
    total: 135,
    subtotal: 105,
    cuttingCharges: 15,
    deliveryFee: 15,
    discount: 0,
    deliverySlot: '8:00 AM - 9:00 AM',
    deliveryAddress: '15, RS Puram, Coimbatore',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    estimatedDelivery: '20-30 min',
    paymentMethod: 'cod',
    assignedDriver: 'Suresh M',
    driverPhone: '9988776655',
    timeline: [
      { status: 'Order Placed', time: '5:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:35 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:40 AM', description: 'Cutting and packing in progress', completed: true },
    ],
  },
  {
    id: 'ORD1003',
    customerId: 'cust_003',
    customerName: 'Lakshmi Devi',
    customerPhone: '9876543212',
    items: [
      { id: 'item_5', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 1, unit: '500g' },
    ],
    status: 'ready',
    total: 155,
    subtotal: 120,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '9:00 AM - 10:00 AM',
    deliveryAddress: '8, Gandhipuram, Coimbatore',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: '10-15 min',
    paymentMethod: 'upi',
    timeline: [
      { status: 'Order Placed', time: '4:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '4:32 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '4:40 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:15 AM', description: 'Order ready for delivery', completed: true },
    ],
  },
  {
    id: 'ORD1004',
    customerId: 'cust_004',
    customerName: 'Anand Babu',
    customerPhone: '9876543213',
    items: [
      { id: 'item_6', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 1, unit: '100g' },
      { id: 'item_7', productId: 'p6', name: 'Coriander Leaves', price: 15, quantity: 2, unit: 'bunch' },
    ],
    status: 'delivered',
    total: 80,
    subtotal: 50,
    cuttingCharges: 10,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '6:00 AM - 7:00 AM',
    deliveryAddress: '22, Peelamedu, Coimbatore',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'cod',
    assignedDriver: 'Karthik R',
    driverPhone: '9988776644',
    timeline: [
      { status: 'Order Placed', time: '2:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:00 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:10 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:30 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '5:45 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '6:15 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1005',
    customerId: 'cust_005',
    customerName: 'Meena Rajan',
    customerPhone: '9876543214',
    items: [
      { id: 'item_8', productId: 'p3', name: 'Beetroot', price: 35, quantity: 1, unit: '500g', cutType: 'grated' },
      { id: 'item_9', productId: 'p8', name: 'Beans', price: 50, quantity: 1, unit: '250g', cutType: 'small_pieces' },
      { id: 'item_10', productId: 'p9', name: 'Drumstick', price: 40, quantity: 1, unit: '250g', cutType: 'long_cuts' },
    ],
    status: 'out_for_delivery',
    total: 175,
    subtotal: 125,
    cuttingCharges: 20,
    deliveryFee: 30,
    discount: 0,
    deliverySlot: '8:00 AM - 9:00 AM',
    deliveryAddress: '5, Saibaba Colony, Coimbatore',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    estimatedDelivery: '5-10 min',
    paymentMethod: 'wallet',
    walletAmountUsed: 175,
    assignedDriver: 'Suresh M',
    driverPhone: '9988776655',
    timeline: [
      { status: 'Order Placed', time: '5:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:05 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:15 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:45 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '6:00 AM', description: 'Driver picked up the order', completed: true },
    ],
  },
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const stored = await getStoredData<Order[]>(ORDERS_KEY, []);
      if (stored.length > 0) {
        setOrders(stored);
      } else {
        // Load sample orders on first run
        await setStoredData(ORDERS_KEY, SAMPLE_ORDERS);
        setOrders(SAMPLE_ORDERS);
      }
    } catch {
      setOrders(SAMPLE_ORDERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const persist = useCallback(async (updated: Order[]) => {
    setOrders(updated);
    await setStoredData(ORDERS_KEY, updated);
  }, []);

  const getOrders = useCallback(() => {
    return orders;
  }, [orders]);

  const getOrderById = useCallback((id: string) => {
    return orders.find((o) => o.id === id);
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OwnerOrderStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

    const statusLabels: Record<OwnerOrderStatus, string> = {
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready for Delivery',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    const statusDescriptions: Record<OwnerOrderStatus, string> = {
      pending: 'Order is pending confirmation',
      preparing: 'Cutting and packing in progress',
      ready: 'Order ready for delivery',
      out_for_delivery: 'Driver picked up the order',
      delivered: 'Order delivered successfully',
      cancelled: 'Order has been cancelled',
    };

    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;

      const newTimeline = [
        ...(o.timeline || []),
        {
          status: statusLabels[newStatus],
          time: timeStr,
          description: statusDescriptions[newStatus],
          completed: true,
        },
      ];

      return { ...o, status: newStatus, timeline: newTimeline };
    });

    await persist(updated);
  }, [orders, persist]);

  const assignDriver = useCallback(async (orderId: string, driverName: string, driverPhone: string) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, assignedDriver: driverName, driverPhone };
    });

    await persist(updated);
  }, [orders, persist]);

  const value = useMemo(
    () => ({
      orders,
      isLoading,
      getOrders,
      getOrderById,
      updateOrderStatus,
      assignDriver,
      refreshOrders: loadOrders,
    }),
    [orders, isLoading, getOrders, getOrderById, updateOrderStatus, assignDriver, loadOrders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export const useOrders = () => useContext(OrderContext);
