import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { WalletTransaction, CustomerWallet } from '@/types';
import { walletTransactions as SAMPLE_TX, customerWallets as SAMPLE_WALLETS } from '@/data/walletTransactions';

const TX_KEY = '@owner_wallet_transactions';
const WALLETS_KEY = '@owner_customer_wallets';
const DEMO_VERSION_KEY = '@demo_wallet_version';
const DEMO_VERSION = 1;

interface WalletContextType {
  transactions: WalletTransaction[];
  customerWallets: CustomerWallet[];
  isLoading: boolean;
  addTransaction: (tx: WalletTransaction) => Promise<void>;
  issueRefund: (customerId: string, amount: number, orderId: string, description: string) => Promise<void>;
  addCredit: (customerId: string, amount: number, title: string) => Promise<void>;
  getCustomerTransactions: (customerId: string) => WalletTransaction[];
  refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  transactions: [], customerWallets: [], isLoading: true,
  addTransaction: async () => {}, issueRefund: async () => {}, addCredit: async () => {},
  getCustomerTransactions: () => [], refreshWallets: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [customerWallets, setCustomerWallets] = useState<CustomerWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(TX_KEY, SAMPLE_TX);
        await setStoredData(WALLETS_KEY, SAMPLE_WALLETS);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setTransactions(SAMPLE_TX);
        setCustomerWallets(SAMPLE_WALLETS);
      } else {
        const tx = await getStoredData<WalletTransaction[]>(TX_KEY, []);
        const w = await getStoredData<CustomerWallet[]>(WALLETS_KEY, []);
        setTransactions(tx.length > 0 ? tx : SAMPLE_TX);
        setCustomerWallets(w.length > 0 ? w : SAMPLE_WALLETS);
        if (tx.length === 0) await setStoredData(TX_KEY, SAMPLE_TX);
        if (w.length === 0) await setStoredData(WALLETS_KEY, SAMPLE_WALLETS);
      }
    } catch { setTransactions(SAMPLE_TX); setCustomerWallets(SAMPLE_WALLETS); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (tx: WalletTransaction[], w: CustomerWallet[]) => {
    setTransactions(tx); setCustomerWallets(w);
    await setStoredData(TX_KEY, tx); await setStoredData(WALLETS_KEY, w);
  }, []);

  const addTransaction = useCallback(async (tx: WalletTransaction) => {
    const updated = [tx, ...transactions];
    const wallet = customerWallets.find(w => w.customerId === tx.customerId);
    let updatedWallets = customerWallets;
    if (wallet) {
      updatedWallets = customerWallets.map(w => w.customerId !== tx.customerId ? w : {
        ...w, balance: tx.balanceAfter, lastTransaction: tx.date,
        totalCredited: tx.type === 'debit' ? w.totalCredited : w.totalCredited + tx.amount,
        totalDebited: tx.type === 'debit' ? w.totalDebited + tx.amount : w.totalDebited,
      });
    }
    await persist(updated, updatedWallets);
  }, [transactions, customerWallets, persist]);

  const issueRefund = useCallback(async (customerId: string, amount: number, orderId: string, description: string) => {
    const wallet = customerWallets.find(w => w.customerId === customerId);
    const newBalance = (wallet?.balance || 0) + amount;
    const tx: WalletTransaction = {
      id: `wt_${Date.now()}`, customerId, customerName: wallet?.customerName || 'Customer',
      type: 'refund', amount, title: 'Refund', description, orderId,
      date: new Date().toISOString(), balanceAfter: newBalance,
    };
    await addTransaction(tx);
  }, [customerWallets, addTransaction]);

  const addCredit = useCallback(async (customerId: string, amount: number, title: string) => {
    const wallet = customerWallets.find(w => w.customerId === customerId);
    const newBalance = (wallet?.balance || 0) + amount;
    const tx: WalletTransaction = {
      id: `wt_${Date.now()}`, customerId, customerName: wallet?.customerName || 'Customer',
      type: 'credit', amount, title, date: new Date().toISOString(), balanceAfter: newBalance,
    };
    await addTransaction(tx);
  }, [customerWallets, addTransaction]);

  const getCustomerTransactions = useCallback((customerId: string) => {
    return transactions.filter(t => t.customerId === customerId);
  }, [transactions]);

  const value = useMemo(() => ({
    transactions, customerWallets, isLoading,
    addTransaction, issueRefund, addCredit, getCustomerTransactions, refreshWallets: load,
  }), [transactions, customerWallets, isLoading, addTransaction, issueRefund, addCredit, getCustomerTransactions, load]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallets = () => useContext(WalletContext);
