import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Referral, ReferralConfig } from '@/types';
import { referrals as SAMPLE_REFS, referralConfig as SAMPLE_CONFIG } from '@/data/referrals';

const REFS_KEY = '@owner_referrals';
const CONFIG_KEY = '@owner_referral_config';
const DEMO_VERSION_KEY = '@demo_referral_version';
const DEMO_VERSION = 1;

interface ReferralContextType {
  referrals: Referral[];
  config: ReferralConfig | null;
  isLoading: boolean;
  updateConfig: (config: ReferralConfig) => Promise<void>;
  refreshReferrals: () => Promise<void>;
}

const ReferralContext = createContext<ReferralContextType>({
  referrals: [], config: null, isLoading: true,
  updateConfig: async () => {}, refreshReferrals: async () => {},
});

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(REFS_KEY, SAMPLE_REFS);
        await setStoredData(CONFIG_KEY, SAMPLE_CONFIG);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setReferrals(SAMPLE_REFS); setConfig(SAMPLE_CONFIG);
      } else {
        const refs = await getStoredData<Referral[]>(REFS_KEY, []);
        const cfg = await getStoredData<ReferralConfig | null>(CONFIG_KEY, null);
        setReferrals(refs.length > 0 ? refs : SAMPLE_REFS);
        setConfig(cfg || SAMPLE_CONFIG);
        if (refs.length === 0) await setStoredData(REFS_KEY, SAMPLE_REFS);
        if (!cfg) await setStoredData(CONFIG_KEY, SAMPLE_CONFIG);
      }
    } catch { setReferrals(SAMPLE_REFS); setConfig(SAMPLE_CONFIG); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateConfig = useCallback(async (updated: ReferralConfig) => {
    setConfig(updated); await setStoredData(CONFIG_KEY, updated);
  }, []);

  const value = useMemo(() => ({
    referrals, config, isLoading, updateConfig, refreshReferrals: load,
  }), [referrals, config, isLoading, updateConfig, load]);

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export const useReferrals = () => useContext(ReferralContext);
