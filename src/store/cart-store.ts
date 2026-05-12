'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Order } from '@/domain/types/database';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartStore {
  items: CartItem[];
  pickupTime: string;
  notes: string;
  
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setPickupTime: (time: string) => void;
  setNotes: (notes: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  loadFromOrder: (items: any[]) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      pickupTime: '',
      notes: '',
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(item => item.product.id === product.id);
        
        if (existing) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product.id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [], pickupTime: '', notes: '' });
      },
      
      setPickupTime: (time) => set({ pickupTime: time }),
      setNotes: (notes) => set({ notes }),
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      loadFromOrder: (items: any[]) => {
        const cartItems: CartItem[] = items.map(item => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.unit_price,
            image_url: item.product?.image_url,
          } as Product,
          quantity: item.quantity,
        }));
        set({ items: cartItems, pickupTime: '', notes: '' });
      },
    }),
    {
      name: 'caracaya-cart',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
