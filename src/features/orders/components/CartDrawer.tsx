'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store';
import { useUIStore } from '@/store';

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { isCartOpen, closeCart, openCheckout } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isCartOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;
    openCheckout();
  };

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={closeCart} />
        
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Tu Carrito</h2>
              <span className="text-sm text-gray-500">({items.length} productos)</span>
            </div>
            <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400 mt-2">Agrega productos para hacer tu pedido</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.product.image_url && (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-amber-600 font-semibold">${item.product.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                          aria-label={`Eliminar ${item.product.name} del carrito`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-amber-600">${getTotal().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
              >
                Continuar con el pedido
              </button>
              
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
