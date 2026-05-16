import type { Order, OrderItem } from '@/domain/types/database';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface OrderInput {
  items: CartItem[];
  pickupTime?: string;
  notes?: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
}

export interface OrderWithRelations extends Order {
  order_items: OrderItem[];
  user?: { full_name: string | null };
}

export type { Order, OrderItem, OrderStatus } from '@/domain/types/database';