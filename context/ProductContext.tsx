import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Product } from '@/types';

const PRODUCTS_KEY = '@owner_products';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  getProducts: () => Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;
  getProductsByCategory: (category: Product['category']) => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  isLoading: true,
  getProducts: () => [],
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  toggleStock: async () => {},
  getProductsByCategory: () => [],
  refreshProducts: async () => {},
});

// Sample products used as initial data
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Fresh Tomatoes',
    price: 40,
    originalPrice: 50,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200',
    discount: '20%',
    category: 'vegetables',
    description: 'Farm-fresh red tomatoes, perfect for curries and salads',
    inStock: true,
    stockQuantity: 50,
    rating: 4.5,
    reviewCount: 128,
    tags: ['fresh', 'organic'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    name: 'Mixed Salad Pack',
    price: 120,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
    category: 'salad_packs',
    description: 'Pre-cut mix of lettuce, cucumber, carrots, and bell peppers',
    inStock: true,
    stockQuantity: 20,
    rating: 4.8,
    reviewCount: 95,
    tags: ['healthy', 'ready-to-eat'],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p3',
    name: 'Beetroot',
    price: 35,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=200',
    category: 'vegetables',
    description: 'Fresh beetroot, great for juices and salads',
    inStock: true,
    stockQuantity: 30,
    rating: 4.3,
    reviewCount: 67,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p4',
    name: 'Onions',
    price: 35,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200',
    category: 'vegetables',
    description: 'Premium quality onions for everyday cooking',
    inStock: true,
    stockQuantity: 100,
    rating: 4.4,
    reviewCount: 210,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p5',
    name: 'Green Chillies',
    price: 20,
    unit: '100g',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=200',
    category: 'vegetables',
    description: 'Spicy green chillies for that extra kick',
    inStock: true,
    stockQuantity: 40,
    rating: 4.2,
    reviewCount: 89,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p6',
    name: 'Coriander Leaves',
    price: 15,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1592928302636-c83cf1e1c887?w=200',
    category: 'vegetables',
    description: 'Fresh coriander leaves for garnishing',
    inStock: false,
    stockQuantity: 0,
    rating: 4.6,
    reviewCount: 156,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p7',
    name: 'Carrots',
    price: 45,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200',
    category: 'vegetables',
    description: 'Crunchy orange carrots, great for salads and cooking',
    inStock: true,
    stockQuantity: 35,
    rating: 4.5,
    reviewCount: 143,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p8',
    name: 'Watermelon Juice',
    price: 60,
    unit: '300ml',
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=200',
    category: 'healthy_drinks',
    description: 'Fresh watermelon juice with no added sugar',
    inStock: true,
    stockQuantity: 15,
    rating: 4.7,
    reviewCount: 78,
    tags: ['fresh', 'no-sugar'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p9',
    name: 'Apple',
    price: 150,
    originalPrice: 180,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200',
    discount: '17%',
    category: 'fruits',
    description: 'Crisp and sweet apples from Shimla',
    inStock: true,
    stockQuantity: 25,
    rating: 4.6,
    reviewCount: 112,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p10',
    name: 'Sambar Pack',
    price: 90,
    unit: '400g',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200',
    category: 'dish_packs',
    description: 'Pre-cut vegetables for sambar: drumstick, brinjal, carrot, beans, onion',
    inStock: true,
    stockQuantity: 18,
    rating: 4.9,
    reviewCount: 201,
    tags: ['combo', 'popular'],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      const stored = await getStoredData<Product[]>(PRODUCTS_KEY, []);
      if (stored.length > 0) {
        setProducts(stored);
      } else {
        await setStoredData(PRODUCTS_KEY, SAMPLE_PRODUCTS);
        setProducts(SAMPLE_PRODUCTS);
      }
    } catch {
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const persist = useCallback(async (updated: Product[]) => {
    setProducts(updated);
    await setStoredData(PRODUCTS_KEY, updated);
  }, []);

  const getProducts = useCallback(() => {
    return products;
  }, [products]);

  const addProduct = useCallback(async (product: Product) => {
    const updated = [...products, { ...product, createdAt: product.createdAt || new Date().toISOString() }];
    await persist(updated);
  }, [products, persist]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [products, persist]);

  const deleteProduct = useCallback(async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    await persist(updated);
  }, [products, persist]);

  const toggleStock = useCallback(async (id: string) => {
    const updated = products.map((p) => {
      if (p.id !== id) return p;
      return { ...p, inStock: !p.inStock, updatedAt: new Date().toISOString() };
    });
    await persist(updated);
  }, [products, persist]);

  const getProductsByCategory = useCallback((category: Product['category']) => {
    return products.filter((p) => p.category === category);
  }, [products]);

  const value = useMemo(
    () => ({
      products,
      isLoading,
      getProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleStock,
      getProductsByCategory,
      refreshProducts: loadProducts,
    }),
    [products, isLoading, getProducts, addProduct, updateProduct, deleteProduct, toggleStock, getProductsByCategory, loadProducts],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export const useProducts = () => useContext(ProductContext);
