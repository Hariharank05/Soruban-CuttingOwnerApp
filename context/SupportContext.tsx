import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { SupportTicket, TicketStatus, TicketMessage } from '@/types';
import SAMPLE_TICKETS from '@/data/supportTickets';

const TICKETS_KEY = '@owner_support_tickets';
const DEMO_VERSION_KEY = '@demo_tickets_version';
const DEMO_VERSION = 1;

interface SupportContextType {
  tickets: SupportTicket[];
  isLoading: boolean;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<void>;
  addMessage: (id: string, message: string) => Promise<void>;
  assignTicket: (id: string, assignedTo: string) => Promise<void>;
  refreshTickets: () => Promise<void>;
}

const SupportContext = createContext<SupportContextType>({
  tickets: [], isLoading: true,
  updateTicketStatus: async () => {}, addMessage: async () => {},
  assignTicket: async () => {}, refreshTickets: async () => {},
});

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(TICKETS_KEY, SAMPLE_TICKETS);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setTickets(SAMPLE_TICKETS);
      } else {
        const stored = await getStoredData<SupportTicket[]>(TICKETS_KEY, []);
        if (stored.length > 0) { setTickets(stored); }
        else { await setStoredData(TICKETS_KEY, SAMPLE_TICKETS); setTickets(SAMPLE_TICKETS); }
      }
    } catch { setTickets(SAMPLE_TICKETS); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (updated: SupportTicket[]) => {
    setTickets(updated); await setStoredData(TICKETS_KEY, updated);
  }, []);

  const updateTicketStatus = useCallback(async (id: string, status: TicketStatus) => {
    await persist(tickets.map(t => t.id !== id ? t : {
      ...t, status, updatedAt: new Date().toISOString(),
      resolvedAt: (status === 'resolved' || status === 'closed') ? new Date().toISOString() : t.resolvedAt,
    }));
  }, [tickets, persist]);

  const addMessage = useCallback(async (id: string, message: string) => {
    const msg: TicketMessage = {
      id: `msg_${Date.now()}`, sender: 'owner', message, timestamp: new Date().toISOString(),
    };
    await persist(tickets.map(t => t.id !== id ? t : {
      ...t, messages: [...t.messages, msg], updatedAt: new Date().toISOString(),
    }));
  }, [tickets, persist]);

  const assignTicket = useCallback(async (id: string, assignedTo: string) => {
    await persist(tickets.map(t => t.id !== id ? t : {
      ...t, assignedTo, status: 'in_progress' as TicketStatus, updatedAt: new Date().toISOString(),
    }));
  }, [tickets, persist]);

  const value = useMemo(() => ({
    tickets, isLoading, updateTicketStatus, addMessage, assignTicket, refreshTickets: load,
  }), [tickets, isLoading, updateTicketStatus, addMessage, assignTicket, load]);

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export const useSupport = () => useContext(SupportContext);
