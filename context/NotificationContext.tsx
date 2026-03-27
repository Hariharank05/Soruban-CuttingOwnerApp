import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { NotificationTemplate, NotificationCampaign } from '@/types';
import { notificationTemplates as SAMPLE_TEMPLATES, notificationCampaigns as SAMPLE_CAMPAIGNS } from '@/data/notificationTemplates';

const TEMPLATES_KEY = '@owner_notif_templates';
const CAMPAIGNS_KEY = '@owner_notif_campaigns';
const DEMO_VERSION_KEY = '@demo_notif_version';
const DEMO_VERSION = 1;

interface NotificationContextType {
  templates: NotificationTemplate[];
  campaigns: NotificationCampaign[];
  isLoading: boolean;
  addTemplate: (t: NotificationTemplate) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<NotificationTemplate>) => Promise<void>;
  toggleTemplate: (id: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addCampaign: (c: NotificationCampaign) => Promise<void>;
  updateCampaignStatus: (id: string, status: NotificationCampaign['status']) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationConfigContext = createContext<NotificationContextType>({
  templates: [], campaigns: [], isLoading: true,
  addTemplate: async () => {}, updateTemplate: async () => {},
  toggleTemplate: async () => {}, deleteTemplate: async () => {},
  addCampaign: async () => {}, updateCampaignStatus: async () => {},
  refreshNotifications: async () => {},
});

export function NotificationConfigProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(TEMPLATES_KEY, SAMPLE_TEMPLATES);
        await setStoredData(CAMPAIGNS_KEY, SAMPLE_CAMPAIGNS);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setTemplates(SAMPLE_TEMPLATES); setCampaigns(SAMPLE_CAMPAIGNS);
      } else {
        const t = await getStoredData<NotificationTemplate[]>(TEMPLATES_KEY, []);
        const c = await getStoredData<NotificationCampaign[]>(CAMPAIGNS_KEY, []);
        setTemplates(t.length > 0 ? t : SAMPLE_TEMPLATES);
        setCampaigns(c.length > 0 ? c : SAMPLE_CAMPAIGNS);
        if (t.length === 0) await setStoredData(TEMPLATES_KEY, SAMPLE_TEMPLATES);
        if (c.length === 0) await setStoredData(CAMPAIGNS_KEY, SAMPLE_CAMPAIGNS);
      }
    } catch { setTemplates(SAMPLE_TEMPLATES); setCampaigns(SAMPLE_CAMPAIGNS); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persistTemplates = useCallback(async (updated: NotificationTemplate[]) => {
    setTemplates(updated); await setStoredData(TEMPLATES_KEY, updated);
  }, []);

  const persistCampaigns = useCallback(async (updated: NotificationCampaign[]) => {
    setCampaigns(updated); await setStoredData(CAMPAIGNS_KEY, updated);
  }, []);

  const addTemplate = useCallback(async (t: NotificationTemplate) => {
    await persistTemplates([...templates, t]);
  }, [templates, persistTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<NotificationTemplate>) => {
    await persistTemplates(templates.map(t => t.id !== id ? t : { ...t, ...updates }));
  }, [templates, persistTemplates]);

  const toggleTemplate = useCallback(async (id: string) => {
    await persistTemplates(templates.map(t => t.id !== id ? t : { ...t, isActive: !t.isActive }));
  }, [templates, persistTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    await persistTemplates(templates.filter(t => t.id !== id));
  }, [templates, persistTemplates]);

  const addCampaign = useCallback(async (c: NotificationCampaign) => {
    await persistCampaigns([...campaigns, c]);
  }, [campaigns, persistCampaigns]);

  const updateCampaignStatus = useCallback(async (id: string, status: NotificationCampaign['status']) => {
    await persistCampaigns(campaigns.map(c => c.id !== id ? c : { ...c, status }));
  }, [campaigns, persistCampaigns]);

  const value = useMemo(() => ({
    templates, campaigns, isLoading,
    addTemplate, updateTemplate, toggleTemplate, deleteTemplate,
    addCampaign, updateCampaignStatus, refreshNotifications: load,
  }), [templates, campaigns, isLoading, addTemplate, updateTemplate, toggleTemplate, deleteTemplate, addCampaign, updateCampaignStatus, load]);

  return <NotificationConfigContext.Provider value={value}>{children}</NotificationConfigContext.Provider>;
}

export const useNotificationConfig = () => useContext(NotificationConfigContext);
