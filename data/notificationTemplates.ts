import type { NotificationTemplate, NotificationCampaign } from '@/types';

export const notificationTemplates: NotificationTemplate[] = [
  { id: 'tmpl_1', type: 'order_update', title: 'Order Confirmed', body: 'Your order #{orderId} has been confirmed and is being prepared!', isActive: true, createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'tmpl_2', type: 'order_update', title: 'Out for Delivery', body: 'Your order #{orderId} is on its way! Estimated arrival: {eta}', isActive: true, createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'tmpl_3', type: 'order_update', title: 'Order Delivered', body: 'Your order #{orderId} has been delivered. Enjoy your fresh produce!', isActive: true, createdAt: '2026-01-01T08:00:00.000Z' },
  { id: 'tmpl_4', type: 'subscription_reminder', title: 'Delivery Tomorrow', body: 'Your subscription delivery is scheduled for tomorrow at {time}. Any changes?', isActive: true, createdAt: '2026-01-15T08:00:00.000Z' },
  { id: 'tmpl_5', type: 'promotional', title: 'Weekend Special!', body: 'Get {discount}% off on all orders this weekend. Use code: {code}', isActive: true, createdAt: '2026-02-01T08:00:00.000Z' },
  { id: 'tmpl_6', type: 'loyalty', title: 'Points Earned!', body: 'You earned {points} loyalty points! Your balance: {balance} points.', isActive: true, createdAt: '2026-02-15T08:00:00.000Z' },
  { id: 'tmpl_7', type: 'offer', title: 'New Coupon Available', body: 'We have a special coupon just for you! {couponDetails}', isActive: false, createdAt: '2026-03-01T08:00:00.000Z' },
];

export const notificationCampaigns: NotificationCampaign[] = [
  { id: 'camp_1', templateId: 'tmpl_5', title: 'March Weekend Sale', body: 'Get 25% off on all orders this weekend! Use code: MARCH25', type: 'promotional', targetAudience: 'all', scheduledAt: '2026-03-28T09:00:00.000Z', status: 'scheduled', createdAt: '2026-03-24T10:00:00.000Z' },
  { id: 'camp_2', title: 'Win Back Inactive Users', body: 'We miss you! Come back and get ₹50 off your next order.', type: 'promotional', targetAudience: 'inactive', scheduledAt: '2026-03-25T10:00:00.000Z', status: 'scheduled', createdAt: '2026-03-22T14:00:00.000Z' },
  { id: 'camp_3', title: 'Loyalty Tier Update', body: 'Congratulations! You have been upgraded to Gold tier. Enjoy exclusive benefits!', type: 'loyalty', targetAudience: 'loyal', scheduledAt: '2026-03-20T08:00:00.000Z', status: 'sent', sentCount: 45, openCount: 32, createdAt: '2026-03-19T10:00:00.000Z' },
  { id: 'camp_4', title: 'New Subscription Plans', body: 'Check out our new weekly subscription plans with 15% extra savings!', type: 'offer', targetAudience: 'subscribers', scheduledAt: '2026-03-15T09:00:00.000Z', status: 'sent', sentCount: 120, openCount: 78, createdAt: '2026-03-14T08:00:00.000Z' },
  { id: 'camp_5', title: 'Welcome Offer', body: 'Welcome to Chopify! Get 50% off on your first order with code FIRST50.', type: 'promotional', targetAudience: 'new', scheduledAt: '2026-03-26T08:00:00.000Z', status: 'draft', createdAt: '2026-03-24T16:00:00.000Z' },
];

export default { notificationTemplates, notificationCampaigns };
