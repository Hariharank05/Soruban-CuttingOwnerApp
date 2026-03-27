import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { OrderIssue, IssueStatus } from '@/types';
import SAMPLE_ISSUES from '@/data/issues';

const ISSUES_KEY = '@owner_issues';
const DEMO_VERSION_KEY = '@demo_issues_version';
const DEMO_VERSION = 1;

interface IssueContextType {
  issues: OrderIssue[];
  isLoading: boolean;
  updateIssueStatus: (id: string, status: IssueStatus, resolution?: string) => Promise<void>;
  updateIssue: (id: string, updates: Partial<OrderIssue>) => Promise<void>;
  assignIssue: (id: string, assignedTo: string) => Promise<void>;
  resolveIssue: (id: string, resolution: string, refundAmount?: number) => Promise<void>;
  refreshIssues: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType>({
  issues: [], isLoading: true,
  updateIssueStatus: async () => {}, updateIssue: async () => {},
  assignIssue: async () => {}, resolveIssue: async () => {},
  refreshIssues: async () => {},
});

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(ISSUES_KEY, SAMPLE_ISSUES);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setIssues(SAMPLE_ISSUES);
      } else {
        const stored = await getStoredData<OrderIssue[]>(ISSUES_KEY, []);
        if (stored.length > 0) { setIssues(stored); }
        else { await setStoredData(ISSUES_KEY, SAMPLE_ISSUES); setIssues(SAMPLE_ISSUES); }
      }
    } catch { setIssues(SAMPLE_ISSUES); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (updated: OrderIssue[]) => {
    setIssues(updated); await setStoredData(ISSUES_KEY, updated);
  }, []);

  const updateIssueStatus = useCallback(async (id: string, status: IssueStatus, resolution?: string) => {
    await persist(issues.map(i => i.id !== id ? i : {
      ...i, status, resolution: resolution || i.resolution,
      updatedAt: new Date().toISOString(),
      resolvedAt: (status === 'resolved' || status === 'closed') ? new Date().toISOString() : i.resolvedAt,
    }));
  }, [issues, persist]);

  const updateIssue = useCallback(async (id: string, updates: Partial<OrderIssue>) => {
    await persist(issues.map(i => i.id !== id ? i : { ...i, ...updates, updatedAt: new Date().toISOString() }));
  }, [issues, persist]);

  const assignIssue = useCallback(async (id: string, assignedTo: string) => {
    await persist(issues.map(i => i.id !== id ? i : {
      ...i, assignedTo, status: 'investigating' as IssueStatus, updatedAt: new Date().toISOString(),
    }));
  }, [issues, persist]);

  const resolveIssue = useCallback(async (id: string, resolution: string, refundAmount?: number) => {
    await persist(issues.map(i => i.id !== id ? i : {
      ...i, status: 'resolved' as IssueStatus, resolution, refundAmount: refundAmount ?? i.refundAmount,
      updatedAt: new Date().toISOString(), resolvedAt: new Date().toISOString(),
    }));
  }, [issues, persist]);

  const value = useMemo(() => ({
    issues, isLoading, updateIssueStatus, updateIssue, assignIssue, resolveIssue, refreshIssues: load,
  }), [issues, isLoading, updateIssueStatus, updateIssue, assignIssue, resolveIssue, load]);

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
}

export const useIssues = () => useContext(IssueContext);
