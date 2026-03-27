import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { CommunityRecipe, RecipeStatus } from '@/types';
import SAMPLE_RECIPES from '@/data/recipes';

const RECIPES_KEY = '@owner_recipes';
const DEMO_VERSION_KEY = '@demo_recipes_version';
const DEMO_VERSION = 1;

interface RecipeContextType {
  recipes: CommunityRecipe[];
  isLoading: boolean;
  updateStatus: (id: string, status: RecipeStatus) => Promise<void>;
  linkToPack: (id: string, packId: string, packName: string) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  refreshRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType>({
  recipes: [], isLoading: true,
  updateStatus: async () => {}, linkToPack: async () => {},
  deleteRecipe: async () => {}, refreshRecipes: async () => {},
});

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(RECIPES_KEY, SAMPLE_RECIPES);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setRecipes(SAMPLE_RECIPES);
      } else {
        const stored = await getStoredData<CommunityRecipe[]>(RECIPES_KEY, []);
        if (stored.length > 0) { setRecipes(stored); }
        else { await setStoredData(RECIPES_KEY, SAMPLE_RECIPES); setRecipes(SAMPLE_RECIPES); }
      }
    } catch { setRecipes(SAMPLE_RECIPES); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (updated: CommunityRecipe[]) => {
    setRecipes(updated); await setStoredData(RECIPES_KEY, updated);
  }, []);

  const updateStatus = useCallback(async (id: string, status: RecipeStatus) => {
    await persist(recipes.map(r => r.id !== id ? r : { ...r, status, reviewedAt: new Date().toISOString() }));
  }, [recipes, persist]);

  const linkToPack = useCallback(async (id: string, packId: string, packName: string) => {
    await persist(recipes.map(r => r.id !== id ? r : { ...r, linkedPackId: packId, linkedPackName: packName }));
  }, [recipes, persist]);

  const deleteRecipe = useCallback(async (id: string) => {
    await persist(recipes.filter(r => r.id !== id));
  }, [recipes, persist]);

  const value = useMemo(() => ({
    recipes, isLoading, updateStatus, linkToPack, deleteRecipe, refreshRecipes: load,
  }), [recipes, isLoading, updateStatus, linkToPack, deleteRecipe, load]);

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export const useRecipes = () => useContext(RecipeContext);
