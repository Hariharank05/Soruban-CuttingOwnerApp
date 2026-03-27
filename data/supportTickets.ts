import type { SupportTicket } from '@/types';

const supportTickets: SupportTicket[] = [
  {
    id: 'tick_1', customerId: 'cust_1', customerName: 'Priya Sharma', customerPhone: '9876543210',
    category: 'delivery', priority: 'high', status: 'open', subject: 'Delivery person was rude',
    messages: [
      { id: 'msg_1', sender: 'customer', message: 'The delivery person was very rude today. He threw the packet at the door and left without waiting.', timestamp: '2026-03-24T14:00:00.000Z' },
      { id: 'msg_2', sender: 'system', message: 'Ticket created and assigned to support team.', timestamp: '2026-03-24T14:01:00.000Z' },
    ],
    createdAt: '2026-03-24T14:00:00.000Z',
  },
  {
    id: 'tick_2', customerId: 'cust_2', customerName: 'Rahul Verma', customerPhone: '9876543211',
    category: 'payment', priority: 'urgent', status: 'in_progress', subject: 'Double charged for order',
    orderId: 'ord_1018',
    messages: [
      { id: 'msg_3', sender: 'customer', message: 'I was charged twice for order #ORD-1018. ₹350 debited from wallet AND ₹350 from UPI. Please refund one.', timestamp: '2026-03-23T16:00:00.000Z' },
      { id: 'msg_4', sender: 'owner', message: 'Sorry for the inconvenience. We are checking with our payment team. Will update within 24 hours.', timestamp: '2026-03-23T17:00:00.000Z' },
      { id: 'msg_5', sender: 'customer', message: 'Please expedite this. Its been a day already.', timestamp: '2026-03-24T16:00:00.000Z' },
    ],
    assignedTo: 'Billing Staff',
    createdAt: '2026-03-23T16:00:00.000Z', updatedAt: '2026-03-24T16:00:00.000Z',
  },
  {
    id: 'tick_3', customerId: 'cust_3', customerName: 'Anita Desai', customerPhone: '9876543212',
    category: 'subscription', priority: 'medium', status: 'waiting_customer', subject: 'Cannot pause subscription',
    messages: [
      { id: 'msg_6', sender: 'customer', message: 'I tried to pause my daily subscription for next week but the app shows an error. Can you help?', timestamp: '2026-03-22T10:00:00.000Z' },
      { id: 'msg_7', sender: 'owner', message: 'We have paused your subscription from March 25 to March 31. Can you confirm these dates?', timestamp: '2026-03-22T12:00:00.000Z' },
    ],
    createdAt: '2026-03-22T10:00:00.000Z', updatedAt: '2026-03-22T12:00:00.000Z',
  },
  {
    id: 'tick_4', customerId: 'cust_4', customerName: 'Karthik Nair', customerPhone: '9876543213',
    category: 'product', priority: 'low', status: 'resolved', subject: 'Request for new product',
    messages: [
      { id: 'msg_8', sender: 'customer', message: 'Can you add jackfruit to your product list? Would love to order pre-cut jackfruit.', timestamp: '2026-03-20T09:00:00.000Z' },
      { id: 'msg_9', sender: 'owner', message: 'Great suggestion! We are adding jackfruit to our catalog next week. Will notify you when available.', timestamp: '2026-03-20T11:00:00.000Z' },
      { id: 'msg_10', sender: 'customer', message: 'Awesome, thank you!', timestamp: '2026-03-20T11:30:00.000Z' },
    ],
    createdAt: '2026-03-20T09:00:00.000Z', resolvedAt: '2026-03-20T11:00:00.000Z',
  },
  {
    id: 'tick_5', customerId: 'cust_5', customerName: 'Meena Iyer', customerPhone: '9876543214',
    category: 'app', priority: 'medium', status: 'closed', subject: 'App crashes on checkout',
    messages: [
      { id: 'msg_11', sender: 'customer', message: 'App keeps crashing when I try to checkout with wallet payment. Using iPhone 13.', timestamp: '2026-03-18T08:00:00.000Z' },
      { id: 'msg_12', sender: 'owner', message: 'Thank you for reporting. Our dev team has fixed this in the latest update (v1.2.3). Please update your app.', timestamp: '2026-03-19T10:00:00.000Z' },
      { id: 'msg_13', sender: 'customer', message: 'Updated and working now. Thanks!', timestamp: '2026-03-19T14:00:00.000Z' },
    ],
    createdAt: '2026-03-18T08:00:00.000Z', resolvedAt: '2026-03-19T14:00:00.000Z',
  },
  {
    id: 'tick_6', customerId: 'cust_1', customerName: 'Priya Sharma', customerPhone: '9876543210',
    category: 'order', priority: 'high', status: 'open', subject: 'Wrong order delivered',
    orderId: 'ord_1025',
    messages: [
      { id: 'msg_14', sender: 'customer', message: 'I received someone elses order. My order #ORD-1025 has completely wrong items in it.', timestamp: '2026-03-24T18:00:00.000Z' },
    ],
    createdAt: '2026-03-24T18:00:00.000Z',
  },
];

export default supportTickets;
