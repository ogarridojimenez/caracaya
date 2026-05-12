'use client';

import { create } from 'zustand';
import type { OrderStatus } from '@/domain/types/database';

interface UIStore {
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isLoading: boolean;
  
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  isCheckoutOpen: false,
  isLoading: false,
  
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCheckout: () => set({ isCartOpen: false, isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
