import type { Referral, ReferralConfig } from '@/types';

export const referralConfig: ReferralConfig = {
  id: 'ref_config_1',
  isEnabled: true,
  referrerReward: 50,
  refereeReward: 30,
  rewardType: 'wallet_credit',
  minOrderForReward: 150,
  maxReferrals: 20,
  updatedAt: '2026-03-01T08:00:00.000Z',
};

export const referrals: Referral[] = [
  { id: 'ref_1', referrerId: 'cust_1', referrerName: 'Priya Sharma', referrerPhone: '9876543210', refereeName: 'Deepa Menon', refereePhone: '9876543220', status: 'completed', rewardAmount: 50, orderId: 'ord_1030', createdAt: '2026-03-20T10:00:00.000Z', completedAt: '2026-03-22T14:00:00.000Z' },
  { id: 'ref_2', referrerId: 'cust_1', referrerName: 'Priya Sharma', referrerPhone: '9876543210', refereeName: 'Sanjay Gupta', refereePhone: '9876543221', status: 'completed', rewardAmount: 50, orderId: 'ord_1031', createdAt: '2026-03-18T09:00:00.000Z', completedAt: '2026-03-19T11:00:00.000Z' },
  { id: 'ref_3', referrerId: 'cust_2', referrerName: 'Rahul Verma', referrerPhone: '9876543211', refereeName: 'Neha Patel', refereePhone: '9876543222', status: 'pending', rewardAmount: 50, createdAt: '2026-03-24T08:00:00.000Z' },
  { id: 'ref_4', referrerId: 'cust_4', referrerName: 'Karthik Nair', referrerPhone: '9876543213', refereeName: 'Arjun Reddy', refereePhone: '9876543223', status: 'completed', rewardAmount: 50, orderId: 'ord_1032', createdAt: '2026-03-15T12:00:00.000Z', completedAt: '2026-03-17T10:00:00.000Z' },
  { id: 'ref_5', referrerId: 'cust_3', referrerName: 'Anita Desai', referrerPhone: '9876543212', refereeName: 'Rekha Singh', refereePhone: '9876543224', status: 'expired', rewardAmount: 50, createdAt: '2026-02-10T14:00:00.000Z' },
  { id: 'ref_6', referrerId: 'cust_5', referrerName: 'Meena Iyer', referrerPhone: '9876543214', refereeName: 'Lakshmi Das', refereePhone: '9876543225', status: 'pending', rewardAmount: 50, createdAt: '2026-03-23T16:00:00.000Z' },
  { id: 'ref_7', referrerId: 'cust_2', referrerName: 'Rahul Verma', referrerPhone: '9876543211', refereeName: 'Vikram Joshi', refereePhone: '9876543226', status: 'completed', rewardAmount: 50, orderId: 'ord_1033', createdAt: '2026-03-12T10:00:00.000Z', completedAt: '2026-03-14T08:00:00.000Z' },
];

export default { referralConfig, referrals };
