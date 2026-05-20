import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart-store';
import type { Product } from '@/domain/types/database';

const mockProduct: Product = {
  id: '1',
  name: 'Café Americano',
  price: 45.50,
  description: 'Café negro',
  category_id: 'cat-1',
  image_url: null,
  is_available: true,
  is_featured: false,
  stock_quantity: 100,
  preparation_time_minutes: 5,
  cost: 15,
  low_stock_threshold: 5,
  slug: 'cafe-americano',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockProduct2: Product = {
  ...mockProduct,
  id: '2',
  name: 'Capuccino',
  price: 55.00,
  slug: 'capuccino',
};

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], pickupTime: '', notes: '' });
  });

  it('starts with empty cart', () => {
    const { items, getItemCount, getTotal } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(getItemCount()).toBe(0);
    expect(getTotal()).toBe(0);
  });

  it('adds item to cart', () => {
    useCartStore.getState().addItem(mockProduct);
    const { items, getItemCount } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('1');
    expect(items[0].quantity).toBe(1);
    expect(getItemCount()).toBe(1);
  });

  it('increments quantity when adding same product', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('adds different products separately', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct2);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });

  it('removes item from cart', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().removeItem('1');
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(0);
  });

  it('updates quantity', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity('1', 5);
    const { items } = useCartStore.getState();
    expect(items[0].quantity).toBe(5);
  });

  it('removes item when quantity is 0', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity('1', 0);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    useCartStore.getState().addItem(mockProduct, 2);    // 45.50 * 2 = 91
    useCartStore.getState().addItem(mockProduct2, 1);   // 55.00 * 1 = 55
    expect(useCartStore.getState().getTotal()).toBe(146);
  });

  it('calculates item count correctly', () => {
    useCartStore.getState().addItem(mockProduct, 3);
    useCartStore.getState().addItem(mockProduct2, 2);
    expect(useCartStore.getState().getItemCount()).toBe(5);
  });

  it('clears cart', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().setPickupTime('14:00');
    useCartStore.getState().setNotes('Sin azúcar');
    useCartStore.getState().clearCart();
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.pickupTime).toBe('');
    expect(state.notes).toBe('');
  });

  it('sets pickup time and notes', () => {
    useCartStore.getState().setPickupTime('15:30');
    useCartStore.getState().setNotes('Para llevar');
    const state = useCartStore.getState();
    expect(state.pickupTime).toBe('15:30');
    expect(state.notes).toBe('Para llevar');
  });
});
