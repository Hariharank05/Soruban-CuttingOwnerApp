import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Pack, PackCategory } from '@/types';
import SAMPLE_PACKS from '@/data/packs';

const PACKS_KEY = '@owner_packs';
const DEMO_PACK_VERSION_KEY = '@demo_pack_version';
const DEMO_PACK_VERSION = 5;

interface PackContextType {
  packs: Pack[];
  isLoading: boolean;
  getPacks: () => Pack[];
  addPack: (pack: Pack) => Promise<void>;
  updatePack: (id: string, updates: Partial<Pack>) => Promise<void>;
  deletePack: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  getPacksByCategory: (category: PackCategory) => Pack[];
  refreshPacks: () => Promise<void>;
}

const PackContext = createContext<PackContextType>({
  packs: [],
  isLoading: true,
  getPacks: () => [],
  addPack: async () => {},
  updatePack: async () => {},
  deletePack: async () => {},
  toggleAvailability: async () => {},
  getPacksByCategory: () => [],
  refreshPacks: async () => {},
});

export function PackProvider({ children }: { children: React.ReactNode }) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPacks = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_PACK_VERSION_KEY, 0);
      if (storedVersion < DEMO_PACK_VERSION) {
        await setStoredData(PACKS_KEY, SAMPLE_PACKS);
        await setStoredData(DEMO_PACK_VERSION_KEY, DEMO_PACK_VERSION);
        setPacks(SAMPLE_PACKS);
      } else {
        const stored = await getStoredData<Pack[]>(PACKS_KEY, []);
        if (stored.length > 0) {
          setPacks(stored);
        } else {
          await setStoredData(PACKS_KEY, SAMPLE_PACKS);
          setPacks(SAMPLE_PACKS);
        }
      }
    } catch {
      setPacks(SAMPLE_PACKS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const persist = useCallback(async (updated: Pack[]) => {
    setPacks(updated);
    await setStoredData(PACKS_KEY, updated);
  }, []);

  const getPacks = useCallback(() => packs, [packs]);

  const addPack = useCallback(async (pack: Pack) => {
    const updated = [...packs, { ...pack, createdAt: pack.createdAt || new Date().toISOString() }];
    await persist(updated);
  }, [packs, persist]);

  const updatePack = useCallback(async (id: string, updates: Partial<Pack>) => {
    const updated = packs.map(p => {
      if (p.id !== id) return p;
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [packs, persist]);

  const deletePack = useCallback(async (id: string) => {
    const updated = packs.filter(p => p.id !== id);
    await persist(updated);
  }, [packs, persist]);

  const toggleAvailability = useCallback(async (id: string) => {
    const updated = packs.map(p => {
      if (p.id !== id) return p;
      return { ...p, isAvailable: !p.isAvailable, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [packs, persist]);

  const getPacksByCategory = useCallback((category: PackCategory) => {
    return packs.filter(p => p.category === category);
  }, [packs]);

  const value = useMemo(
    () => ({
      packs,
      isLoading,
      getPacks,
      addPack,
      updatePack,
      deletePack,
      toggleAvailability,
      getPacksByCategory,
      refreshPacks: loadPacks,
    }),
    [packs, isLoading, getPacks, addPack, updatePack, deletePack, toggleAvailability, getPacksByCategory, loadPacks],
  );

  return <PackContext.Provider value={value}>{children}</PackContext.Provider>;
}

export const usePacks = () => useContext(PackContext);
