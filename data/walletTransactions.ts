import type { WalletTransaction, CustomerWallet } from '@/types';

export const walletTransactions: WalletTransaction[] = [
  { id: 'wt_1', customerId: 'cust_1', customerName: 'Priya Sharma', type: 'topup', amount: 500, title: 'Wallet Top-up', date: '2026-03-24T10:30:00.000Z', balanceAfter: 500 },
  { id: 'wt_2', customerId: 'cust_1', customerName: 'Priya Sharma', type: 'debit', amount: 180, title: 'Order #ORD-1021 Payment', orderId: 'ord_1', date: '2026-03-24T14:00:00.000Z', balanceAfter: 320 },
  { id: 'wt_3', customerId: 'cust_2', customerName: 'Rahul Verma', type: 'topup', amount: 1000, title: 'Wallet Top-up', date: '2026-03-23T09:00:00.000Z', balanceAfter: 1000 },
  { id: 'wt_4', customerId: 'cust_2', customerName: 'Rahul Verma', type: 'debit', amount: 350, title: 'Order #ORD-1018 Payment', orderId: 'ord_2', date: '2026-03-23T12:30:00.000Z', balanceAfter: 650 },
  { id: 'wt_5', customerId: 'cust_3', customerName: 'Anita Desai', type: 'refund', amount: 120, title: 'Refund for missing items', orderId: 'ord_5', date: '2026-03-22T16:00:00.000Z', balanceAfter: 270 },
  { id: 'wt_6', customerId: 'cust_1', customerName: 'Priya Sharma', type: 'cashback', amount: 25, title: 'Cashback on subscription', date: '2026-03-22T08:00:00.000Z', balanceAfter: 345 },
  { id: 'wt_7', customerId: 'cust_4', customerName: 'Karthik Nair', type: 'topup', amount: 750, title: 'Wallet Top-up', date: '2026-03-21T11:00:00.000Z', balanceAfter: 750 },
  { id: 'wt_8', customerId: 'cust_4', customerName: 'Karthik Nair', type: 'debit', amount: 420, title: 'Order #ORD-1015 Payment', orderId: 'ord_7', date: '2026-03-21T15:00:00.000Z', balanceAfter: 330 },
  { id: 'wt_9', customerId: 'cust_5', customerName: 'Meena Iyer', type: 'credit', amount: 200, title: 'Referral Reward', date: '2026-03-20T10:00:00.000Z', balanceAfter: 200 },
  { id: 'wt_10', customerId: 'cust_3', customerName: 'Anita Desai', type: 'topup', amount: 300, title: 'Wallet Top-up', date: '2026-03-20T09:00:00.000Z', balanceAfter: 150 },
];

export const customerWallets: CustomerWallet[] = [
  { customerId: 'cust_1', customerName: 'Priya Sharma', customerPhone: '9876543210', balance: 345, totalCredited: 525, totalDebited: 180, lastTransaction: '2026-03-24T14:00:00.000Z' },
  { customerId: 'cust_2', customerName: 'Rahul Verma', customerPhone: '9876543211', balance: 650, totalCredited: 1000, totalDebited: 350, lastTransaction: '2026-03-23T12:30:00.000Z' },
  { customerId: 'cust_3', customerName: 'Anita Desai', customerPhone: '9876543212', balance: 270, totalCredited: 420, totalDebited: 150, lastTransaction: '2026-03-22T16:00:00.000Z' },
  { customerId: 'cust_4', customerName: 'Karthik Nair', customerPhone: '9876543213', balance: 330, totalCredited: 750, totalDebited: 420, lastTransaction: '2026-03-21T15:00:00.000Z' },
  { customerId: 'cust_5', customerName: 'Meena Iyer', customerPhone: '9876543214', balance: 200, totalCredited: 200, totalDebited: 0, lastTransaction: '2026-03-20T10:00:00.000Z' },
];

export default { walletTransactions, customerWallets };
