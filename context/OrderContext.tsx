import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Order, OwnerOrderStatus } from '@/types';

const ORDERS_KEY = '@owner_orders';
const DEMO_DATA_VERSION_KEY = '@demo_data_version';
const DEMO_DATA_VERSION = 2; // Bump this to force-reseed demo data

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

// Sample orders used as initial data — comprehensive demo set
const SAMPLE_ORDERS: Order[] = [
  // ── Today's Pending Orders ──
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
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedDelivery: '30-45 min',
    paymentMethod: 'upi',
    timeline: [
      { status: 'Order Placed', time: '6:45 AM', description: 'Customer placed the order', completed: true },
    ],
  },
  {
    id: 'ORD1015',
    customerId: 'cust_011',
    customerName: 'Kavitha Mohan',
    customerPhone: '9876543220',
    items: [
      { id: 'item_30', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 2, unit: '400g' },
      { id: 'item_31', productId: 'p7', name: 'Carrots', price: 45, quantity: 1, unit: '500g', cutType: 'cubes' },
    ],
    status: 'pending',
    total: 255,
    subtotal: 225,
    cuttingCharges: 10,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '10:00 AM - 11:00 AM',
    deliveryAddress: '78, Vadavalli, Coimbatore',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    estimatedDelivery: '45-60 min',
    paymentMethod: 'upi',
    specialNote: 'Extra sambar powder if available',
    timeline: [
      { status: 'Order Placed', time: '6:50 AM', description: 'Customer placed the order', completed: true },
    ],
  },
  {
    id: 'ORD1016',
    customerId: 'cust_012',
    customerName: 'Santhosh Narayanan',
    customerPhone: '9876543221',
    items: [
      { id: 'item_32', productId: 'p9', name: 'Apple', price: 150, quantity: 2, unit: '1 kg', cutType: 'slices' },
      { id: 'item_33', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 2, unit: '300ml' },
    ],
    status: 'pending',
    total: 370,
    subtotal: 420,
    cuttingCharges: 0,
    deliveryFee: 20,
    discount: 70,
    couponCode: 'FRUIT40',
    deliverySlot: '9:00 AM - 10:00 AM',
    deliveryAddress: '23, Race Course, Coimbatore',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    paymentMethod: 'wallet',
    walletAmountUsed: 370,
    timeline: [
      { status: 'Order Placed', time: '6:55 AM', description: 'Customer placed the order', completed: true },
    ],
  },

  // ── Today's Preparing Orders ──
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
    subscription: { id: 'sub_002', frequency: 'weekly' },
    timeline: [
      { status: 'Order Placed', time: '5:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:35 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:40 AM', description: 'Cutting and packing in progress', completed: true },
    ],
  },
  {
    id: 'ORD1017',
    customerId: 'cust_013',
    customerName: 'Deepa Rajan',
    customerPhone: '9876543222',
    items: [
      { id: 'item_34', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 3, unit: '500g', cutType: 'small_pieces' },
      { id: 'item_35', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 1, unit: '100g' },
      { id: 'item_36', productId: 'p3', name: 'Beetroot', price: 35, quantity: 1, unit: '500g', cutType: 'grated' },
    ],
    status: 'preparing',
    total: 210,
    subtotal: 175,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '8:00 AM - 9:00 AM',
    deliveryAddress: '56, Saibaba Colony, Coimbatore',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    estimatedDelivery: '25-35 min',
    paymentMethod: 'upi',
    timeline: [
      { status: 'Order Placed', time: '6:15 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '6:18 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '6:25 AM', description: 'Cutting and packing in progress', completed: true },
    ],
  },

  // ── Today's Ready Orders ──
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
    id: 'ORD1018',
    customerId: 'cust_014',
    customerName: 'Revathi Krishnan',
    customerPhone: '9876543223',
    items: [
      { id: 'item_37', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 1, unit: '400g' },
      { id: 'item_38', productId: 'p4', name: 'Onions', price: 35, quantity: 2, unit: '1 kg', cutType: 'slices' },
      { id: 'item_39', productId: 'p6', name: 'Coriander Leaves', price: 15, quantity: 1, unit: 'bunch' },
    ],
    status: 'ready',
    total: 195,
    subtotal: 160,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '9:00 AM - 10:00 AM',
    deliveryAddress: '11, Singanallur, Coimbatore',
    createdAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    estimatedDelivery: '15-20 min',
    paymentMethod: 'cod',
    assignedDriver: 'Manoj K',
    driverPhone: '9988776633',
    timeline: [
      { status: 'Order Placed', time: '5:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:05 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:10 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:50 AM', description: 'Order ready for delivery', completed: true },
    ],
  },

  // ── Today's Out for Delivery ──
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
  {
    id: 'ORD1019',
    customerId: 'cust_015',
    customerName: 'Ganesh Iyer',
    customerPhone: '9876543224',
    items: [
      { id: 'item_40', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 2, unit: '500g' },
      { id: 'item_41', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 1, unit: '300ml' },
    ],
    status: 'out_for_delivery',
    total: 325,
    subtotal: 300,
    cuttingCharges: 0,
    deliveryFee: 25,
    discount: 0,
    deliverySlot: '7:00 AM - 8:00 AM',
    deliveryAddress: '67, Peelamedu, Coimbatore',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    estimatedDelivery: '5-10 min',
    paymentMethod: 'upi',
    assignedDriver: 'Karthik R',
    driverPhone: '9988776644',
    timeline: [
      { status: 'Order Placed', time: '4:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '4:35 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '4:45 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:30 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '5:50 AM', description: 'Driver picked up the order', completed: true },
    ],
  },

  // ── Today's Delivered Orders (for revenue) ──
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
    id: 'ORD1006',
    customerId: 'cust_006',
    customerName: 'Venkat Subramanian',
    customerPhone: '9876543215',
    items: [
      { id: 'item_11', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 3, unit: '500g', cutType: 'small_pieces' },
      { id: 'item_12', productId: 'p4', name: 'Onions', price: 35, quantity: 2, unit: '1 kg', cutType: 'cubes' },
      { id: 'item_13', productId: 'p7', name: 'Carrots', price: 45, quantity: 1, unit: '500g', cutType: 'long_cuts' },
    ],
    status: 'delivered',
    total: 280,
    subtotal: 235,
    cuttingCharges: 20,
    deliveryFee: 25,
    discount: 0,
    deliverySlot: '5:30 AM - 6:30 AM',
    deliveryAddress: '33, Ganapathy, Coimbatore',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi',
    assignedDriver: 'Ravi S',
    driverPhone: '9988776611',
    subscription: { id: 'sub_001', frequency: 'daily' },
    timeline: [
      { status: 'Order Placed', time: '1:30 AM', description: 'Subscription order auto-placed', completed: true },
      { status: 'Confirmed', time: '4:30 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '4:40 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:10 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '5:20 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '5:45 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1007',
    customerId: 'cust_007',
    customerName: 'Arun Balaji',
    customerPhone: '9876543216',
    items: [
      { id: 'item_14', productId: 'p9', name: 'Apple', price: 150, quantity: 1, unit: '1 kg', cutType: 'slices' },
      { id: 'item_15', productId: 'p2', name: 'Mixed Salad Pack', price: 120, quantity: 1, unit: '500g' },
    ],
    status: 'delivered',
    total: 305,
    subtotal: 270,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '6:00 AM - 7:00 AM',
    deliveryAddress: '14, Podanur, Coimbatore',
    createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'wallet',
    walletAmountUsed: 305,
    assignedDriver: 'Suresh M',
    driverPhone: '9988776655',
    timeline: [
      { status: 'Order Placed', time: '3:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:00 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:15 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '5:40 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '5:50 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '6:20 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1008',
    customerId: 'cust_008',
    customerName: 'Nithya Prakash',
    customerPhone: '9876543217',
    items: [
      { id: 'item_16', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 1, unit: '400g' },
    ],
    status: 'delivered',
    total: 125,
    subtotal: 90,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '6:30 AM - 7:30 AM',
    deliveryAddress: '9, Kovaipudur, Coimbatore',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'cod',
    assignedDriver: 'Manoj K',
    driverPhone: '9988776633',
    timeline: [
      { status: 'Order Placed', time: '3:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:15 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:30 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '6:00 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '6:10 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '6:40 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1009',
    customerId: 'cust_009',
    customerName: 'Suresh Babu',
    customerPhone: '9876543218',
    items: [
      { id: 'item_17', productId: 'p3', name: 'Beetroot', price: 35, quantity: 2, unit: '500g', cutType: 'cubes' },
      { id: 'item_18', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 1, unit: '100g' },
      { id: 'item_19', productId: 'p4', name: 'Onions', price: 35, quantity: 1, unit: '1 kg', cutType: 'slices' },
    ],
    status: 'delivered',
    total: 165,
    subtotal: 125,
    cuttingCharges: 15,
    deliveryFee: 25,
    discount: 0,
    deliverySlot: '5:00 AM - 6:00 AM',
    deliveryAddress: '45, Thudiyalur, Coimbatore',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi',
    assignedDriver: 'Ravi S',
    driverPhone: '9988776611',
    timeline: [
      { status: 'Order Placed', time: '12:30 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '4:00 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '4:10 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '4:30 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '4:45 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '5:15 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1010',
    customerId: 'cust_010',
    customerName: 'Divya Krishnamurthy',
    customerPhone: '9876543219',
    items: [
      { id: 'item_20', productId: 'p8', name: 'Watermelon Juice', price: 60, quantity: 2, unit: '300ml' },
      { id: 'item_21', productId: 'p9', name: 'Apple', price: 150, quantity: 1, unit: '1 kg' },
    ],
    status: 'delivered',
    total: 295,
    subtotal: 270,
    cuttingCharges: 0,
    deliveryFee: 25,
    discount: 0,
    deliverySlot: '7:00 AM - 8:00 AM',
    deliveryAddress: '88, Ondipudur, Coimbatore',
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'wallet_partial',
    walletAmountUsed: 200,
    assignedDriver: 'Karthik R',
    driverPhone: '9988776644',
    couponCode: 'FRESH20',
    timeline: [
      { status: 'Order Placed', time: '4:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Confirmed', time: '5:30 AM', description: 'Order confirmed by store', completed: true },
      { status: 'Preparing', time: '5:40 AM', description: 'Cutting and packing in progress', completed: true },
      { status: 'Ready', time: '6:10 AM', description: 'Order ready for delivery', completed: true },
      { status: 'Out for Delivery', time: '6:20 AM', description: 'Driver picked up the order', completed: true },
      { status: 'Delivered', time: '6:50 AM', description: 'Order delivered successfully', completed: true },
    ],
  },

  // ── Yesterday's Orders (for history) ──
  {
    id: 'ORD1011',
    customerId: 'cust_001',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    items: [
      { id: 'item_22', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 2, unit: '500g', cutType: 'small_pieces' },
      { id: 'item_23', productId: 'p6', name: 'Coriander Leaves', price: 15, quantity: 1, unit: 'bunch' },
    ],
    status: 'delivered',
    total: 120,
    subtotal: 95,
    cuttingCharges: 10,
    deliveryFee: 15,
    discount: 0,
    deliverySlot: '7:00 AM - 8:00 AM',
    deliveryAddress: '42, Anna Nagar, Coimbatore',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi',
    assignedDriver: 'Suresh M',
    driverPhone: '9988776655',
    subscription: { id: 'sub_001', frequency: 'daily' },
    timeline: [
      { status: 'Order Placed', time: '6:00 AM', description: 'Subscription order auto-placed', completed: true },
      { status: 'Delivered', time: '7:30 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1012',
    customerId: 'cust_003',
    customerName: 'Lakshmi Devi',
    customerPhone: '9876543212',
    items: [
      { id: 'item_24', productId: 'p7', name: 'Carrots', price: 45, quantity: 2, unit: '500g', cutType: 'cubes' },
      { id: 'item_25', productId: 'p3', name: 'Beetroot', price: 35, quantity: 1, unit: '500g', cutType: 'grated' },
    ],
    status: 'delivered',
    total: 155,
    subtotal: 125,
    cuttingCharges: 15,
    deliveryFee: 15,
    discount: 0,
    deliverySlot: '8:00 AM - 9:00 AM',
    deliveryAddress: '8, Gandhipuram, Coimbatore',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'cod',
    assignedDriver: 'Karthik R',
    driverPhone: '9988776644',
    timeline: [
      { status: 'Order Placed', time: '7:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Delivered', time: '8:45 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1013',
    customerId: 'cust_005',
    customerName: 'Meena Rajan',
    customerPhone: '9876543214',
    items: [
      { id: 'item_26', productId: 'p10', name: 'Sambar Pack', price: 90, quantity: 2, unit: '400g' },
      { id: 'item_27', productId: 'p1', name: 'Fresh Tomatoes', price: 40, quantity: 1, unit: '500g', cutType: 'small_pieces' },
    ],
    status: 'delivered',
    total: 255,
    subtotal: 220,
    cuttingCharges: 15,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '9:00 AM - 10:00 AM',
    deliveryAddress: '5, Saibaba Colony, Coimbatore',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'wallet',
    walletAmountUsed: 255,
    assignedDriver: 'Manoj K',
    driverPhone: '9988776633',
    timeline: [
      { status: 'Order Placed', time: '8:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Delivered', time: '9:30 AM', description: 'Order delivered successfully', completed: true },
    ],
  },
  {
    id: 'ORD1014',
    customerId: 'cust_010',
    customerName: 'Divya Krishnamurthy',
    customerPhone: '9876543219',
    items: [
      { id: 'item_28', productId: 'p4', name: 'Onions', price: 35, quantity: 3, unit: '1 kg', cutType: 'slices' },
      { id: 'item_29', productId: 'p5', name: 'Green Chillies', price: 20, quantity: 2, unit: '100g' },
    ],
    status: 'cancelled',
    total: 175,
    subtotal: 145,
    cuttingCharges: 10,
    deliveryFee: 20,
    discount: 0,
    deliverySlot: '10:00 AM - 11:00 AM',
    deliveryAddress: '88, Ondipudur, Coimbatore',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'upi',
    timeline: [
      { status: 'Order Placed', time: '9:00 AM', description: 'Customer placed the order', completed: true },
      { status: 'Cancelled', time: '9:15 AM', description: 'Customer cancelled the order', completed: true },
    ],
  },
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_DATA_VERSION_KEY, 0);
      if (storedVersion < DEMO_DATA_VERSION) {
        // Force reseed with updated demo data
        await setStoredData(ORDERS_KEY, SAMPLE_ORDERS);
        await setStoredData(DEMO_DATA_VERSION_KEY, DEMO_DATA_VERSION);
        setOrders(SAMPLE_ORDERS);
      } else {
        const stored = await getStoredData<Order[]>(ORDERS_KEY, []);
        if (stored.length > 0) {
          setOrders(stored);
        } else {
          await setStoredData(ORDERS_KEY, SAMPLE_ORDERS);
          setOrders(SAMPLE_ORDERS);
        }
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
