import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getStoredData, setStoredData } from '@/src/utils/localJsonStorage';
import type { Product } from '@/types';

const PRODUCTS_KEY = '@owner_products';
const DEMO_PROD_VERSION_KEY = '@demo_prod_version';
const DEMO_PROD_VERSION = 2;

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
  addProduct: async () => { },
  updateProduct: async () => { },
  deleteProduct: async () => { },
  toggleStock: async () => { },
  getProductsByCategory: () => [],
  refreshProducts: async () => { },
});

// Sample products used as initial data
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Fresh Tomatoes',
    price: 40,
    originalPrice: 50,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1467020323552-36f7bf0e30e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRvbWF0b2VzfGVufDB8fDB8fHww',
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
    image: 'https://images.unsplash.com/photo-1693664132235-1b7050b45da5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3JlZW4lMjBjaGlsbGVzfGVufDB8fDB8fHww',
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
    image: 'https://images.unsplash.com/photo-1535189487909-a262ad10c165?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29yaWFuZGVyJTIwbGVhdmVzfGVufDB8fDB8fHww',
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
    image: 'https://images.unsplash.com/photo-1589448700841-3c194a095a0e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdhdGVybWVsb24lMjBqdWljZXxlbnwwfHwwfHx8MA%3D%3D',
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
    image: 'https://media.istockphoto.com/id/1169102817/photo/kerala-sambar-dish.webp?a=1&b=1&s=612x612&w=0&k=20&c=q_n9KW0cKgv-HptzzlM1aNENz9Bn4jUVBBnmgN8XImc=',
    category: 'dish_packs',
    description: 'Pre-cut vegetables for sambar: drumstick, brinjal, carrot, beans, onion',
    inStock: true,
    stockQuantity: 18,
    rating: 4.9,
    reviewCount: 201,
    tags: ['combo', 'popular'],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p11',
    name: 'Capsicum',
    price: 60,
    unit: '250g',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200',
    category: 'vegetables',
    description: 'Fresh green capsicum, ideal for stir-fry and stuffing',
    inStock: true,
    stockQuantity: 22,
    rating: 4.4,
    reviewCount: 76,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p12',
    name: 'Potato',
    price: 30,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cG90YXRvfGVufDB8fDB8fHww',
    category: 'vegetables',
    description: 'Farm-fresh potatoes for everyday cooking',
    inStock: true,
    stockQuantity: 80,
    rating: 4.3,
    reviewCount: 185,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p13',
    name: 'Banana',
    price: 40,
    unit: '6 pcs',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200',
    category: 'fruits',
    description: 'Ripe yellow bananas, perfect for smoothies and snacking',
    inStock: true,
    stockQuantity: 45,
    rating: 4.6,
    reviewCount: 134,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p14',
    name: 'Cucumber',
    price: 25,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=200',
    category: 'vegetables',
    description: 'Cool and crunchy cucumbers for salads and raita',
    inStock: true,
    stockQuantity: 30,
    rating: 4.5,
    reviewCount: 98,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p15',
    name: 'Biryani Pack',
    price: 110,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
    category: 'dish_packs',
    description: 'Pre-cut vegetables for biryani: onion, tomato, carrot, potato, capsicum',
    inStock: true,
    stockQuantity: 12,
    rating: 4.8,
    reviewCount: 167,
    tags: ['combo', 'best-seller'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p16',
    name: 'Orange Juice',
    price: 55,
    unit: '300ml',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200',
    category: 'healthy_drinks',
    description: 'Freshly squeezed orange juice with no preservatives',
    inStock: true,
    stockQuantity: 10,
    rating: 4.7,
    reviewCount: 62,
    tags: ['fresh', 'vitamin-c'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p17',
    name: 'Drumstick',
    price: 40,
    unit: '250g',
    image: 'https://media.istockphoto.com/id/1163094175/photo/moringa-fruit-and-leaves.webp?a=1&b=1&s=612x612&w=0&k=20&c=WBtzEwNf8rgBQzsP5VUN9xYZOI3Yq2H_mt2ZeuNN4H8=',
    category: 'vegetables',
    description: 'Fresh drumsticks for sambar and curry',
    inStock: false,
    stockQuantity: 0,
    rating: 4.4,
    reviewCount: 88,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p18',
    name: 'Garden Salad Pack',
    price: 75,
    unit: '350g',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
    category: 'salad_packs',
    description: 'Mix of lettuce, cucumber, tomato, carrot, and onion rings',
    inStock: true,
    stockQuantity: 15,
    rating: 4.7,
    reviewCount: 110,
    tags: ['healthy', 'low-calorie'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      const storedVersion = await getStoredData<number>(DEMO_PROD_VERSION_KEY, 0);
      if (storedVersion < DEMO_PROD_VERSION) {
        await setStoredData(PRODUCTS_KEY, SAMPLE_PRODUCTS);
        await setStoredData(DEMO_PROD_VERSION_KEY, DEMO_PROD_VERSION);
        setProducts(SAMPLE_PRODUCTS);
      } else {
        const stored = await getStoredData<Product[]>(PRODUCTS_KEY, []);
        if (stored.length > 0) {
          // Sync sample product images with latest defaults
          const sampleMap = new Map(SAMPLE_PRODUCTS.map(p => [p.id, p]));
          const synced = stored.map(p => {
            const sample = sampleMap.get(p.id);
            if (sample && p.image !== sample.image) {
              return { ...p, image: sample.image };
            }
            return p;
          });
          const changed = synced.some((p, i) => p.image !== stored[i].image);
          if (changed) await setStoredData(PRODUCTS_KEY, synced);
          setProducts(synced);
        } else {
          await setStoredData(PRODUCTS_KEY, SAMPLE_PRODUCTS);
          setProducts(SAMPLE_PRODUCTS);
        }
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
