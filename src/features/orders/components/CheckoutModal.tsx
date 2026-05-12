'use client';

import { useEffect, useState } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { useCartStore } from '@/store';
import { useUIStore } from '@/store';
import { useCreateOrder } from '@/features/orders/hooks';
import { useAuth } from '@/features/auth/hooks';
import toast from 'react-hot-toast';

export function CheckoutModal() {
  const [mounted, setMounted] = useState(false);
  const { items, getTotal, pickupTime, notes, setPickupTime, setNotes, clearCart } = useCartStore();
  const { isCheckoutOpen, closeCheckout } = useUIStore();
  const { user } = useAuth();
  const createOrder = useCreateOrder();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isCheckoutOpen) return null;

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para hacer un pedido', {
        duration: 4000,
        style: { background: '#dc2626', color: '#fff', fontSize: '14px' },
      });
      return;
    }

    if (!pickupTime) {
      toast.error('Selecciona una hora de recogida', {
        duration: 4000,
        style: { background: '#dc2626', color: '#fff', fontSize: '14px' },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        notes: item.notes,
      }));

      await createOrder.mutateAsync({
        userId: user.id,
        items: orderItems,
        pickupTime,
        notes,
        subtotal: getTotal(),
      });

      toast.success('¡Pedido creado exitosamente!', {
        duration: 5000,
        style: { background: '#16a34a', color: '#fff', fontSize: '16px' },
      });
      
      clearCart();
      closeCheckout();
    } catch (error) {
      toast.error('Error al crear el pedido: ' + (error instanceof Error ? error.message : 'Unknown error'), {
        duration: 6000,
        style: { background: '#dc2626', color: '#fff', fontSize: '14px' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextHours = () => {
    const hours = [];
    const now = new Date();
    for (let i = 1; i <= 4; i++) {
      const time = new Date(now.getTime() + i * 30 * 60 * 1000);
      hours.push(time.toTimeString().slice(0, 5));
    }
    return hours;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeCheckout} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Finalizar Pedido</h2>
          <button onClick={closeCheckout} className="p-2 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-medium text-sm mb-2">Resumen del pedido</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm py-1">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Total</span>
              <span className="text-amber-600">${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4" />
              Hora de recogida
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Selecciona una hora</option>
              {getNextHours().map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4" />
              Notas del pedido (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: Sin azúcar, extra crema..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !pickupTime}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando pedido...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
