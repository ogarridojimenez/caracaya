export interface StockCheckItem {
  productId: string;
  quantity: number;
}

export interface StockCheckResult {
  productId: string;
  productName: string;
  available: boolean;
  requested: number;
  availableStock: number;
}

export type { Product, Category, ProductWithCategory } from '@/domain/types/database';