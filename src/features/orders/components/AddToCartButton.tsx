'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/store';
import { useUIStore } from '@/store';
import type { Product } from '@/domain/types/database';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { addItem, _hasHydrated } = useCartStore();
  const { openCart } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    if (!_hasHydrated) return;
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
  };

  if (!mounted) {
    return (
      <button
        className={`p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors ${className}`}
        title="Agregar al carrito"
        aria-label={`Agregar ${product.name} al carrito`}
        disabled
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors ${className}`}
      title="Agregar al carrito"
      aria-label={`Agregar ${product.name} al carrito`}
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
