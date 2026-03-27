import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { ProductReview, ReviewStatus, OrderRating } from '@/types';
import SAMPLE_REVIEWS from '@/data/reviews';
import SAMPLE_ORDER_RATINGS from '@/data/orderRatings';

const REVIEWS_KEY = '@owner_reviews';
const ORDER_RATINGS_KEY = '@owner_order_ratings';
const DEMO_VERSION_KEY = '@demo_reviews_version';
const DEMO_VERSION = 2;

interface ReviewContextType {
  reviews: ProductReview[];
  orderRatings: OrderRating[];
  isLoading: boolean;
  updateStatus: (id: string, status: ReviewStatus) => Promise<void>;
  replyToReview: (id: string, reply: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getProductReviews: (productId: string) => ProductReview[];
  refreshReviews: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType>({
  reviews: [], orderRatings: [], isLoading: true,
  updateStatus: async () => {}, replyToReview: async () => {},
  deleteReview: async () => {}, getProductReviews: () => [],
  refreshReviews: async () => {},
});

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [orderRatings, setOrderRatings] = useState<OrderRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const ver = await getStoredData<number>(DEMO_VERSION_KEY, 0);
      if (ver < DEMO_VERSION) {
        await setStoredData(REVIEWS_KEY, SAMPLE_REVIEWS);
        await setStoredData(ORDER_RATINGS_KEY, SAMPLE_ORDER_RATINGS);
        await setStoredData(DEMO_VERSION_KEY, DEMO_VERSION);
        setReviews(SAMPLE_REVIEWS);
        setOrderRatings(SAMPLE_ORDER_RATINGS);
      } else {
        const stored = await getStoredData<ProductReview[]>(REVIEWS_KEY, []);
        if (stored.length > 0) { setReviews(stored); }
        else { await setStoredData(REVIEWS_KEY, SAMPLE_REVIEWS); setReviews(SAMPLE_REVIEWS); }

        const storedRatings = await getStoredData<OrderRating[]>(ORDER_RATINGS_KEY, []);
        if (storedRatings.length > 0) { setOrderRatings(storedRatings); }
        else { await setStoredData(ORDER_RATINGS_KEY, SAMPLE_ORDER_RATINGS); setOrderRatings(SAMPLE_ORDER_RATINGS); }
      }
    } catch {
      setReviews(SAMPLE_REVIEWS);
      setOrderRatings(SAMPLE_ORDER_RATINGS);
    }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (updated: ProductReview[]) => {
    setReviews(updated); await setStoredData(REVIEWS_KEY, updated);
  }, []);

  const updateStatus = useCallback(async (id: string, status: ReviewStatus) => {
    await persist(reviews.map(r => r.id !== id ? r : { ...r, status, updatedAt: new Date().toISOString() }));
  }, [reviews, persist]);

  const replyToReview = useCallback(async (id: string, reply: string) => {
    await persist(reviews.map(r => r.id !== id ? r : { ...r, ownerReply: reply, updatedAt: new Date().toISOString() }));
  }, [reviews, persist]);

  const deleteReview = useCallback(async (id: string) => {
    await persist(reviews.filter(r => r.id !== id));
  }, [reviews, persist]);

  const getProductReviews = useCallback((productId: string) => {
    return reviews.filter(r => r.productId === productId);
  }, [reviews]);

  const value = useMemo(() => ({
    reviews, orderRatings, isLoading, updateStatus, replyToReview, deleteReview, getProductReviews, refreshReviews: load,
  }), [reviews, orderRatings, isLoading, updateStatus, replyToReview, deleteReview, getProductReviews, load]);

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export const useReviews = () => useContext(ReviewContext);
