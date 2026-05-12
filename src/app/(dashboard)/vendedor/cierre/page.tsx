'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { useProducts } from '@/features/products/hooks';
import { DollarSign, Plus, Trash2, Save, Calendar, Package, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/domain/types/database';

interface CloseItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: number;
}

interface DailyClose {
  id: string;
  user_id: string;
  close_date: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  user?: { full_name: string };
  items?: CloseItem[];
  orders?: Array<{ id: string; order_number: string; total: number; items: OrderItem[] }>;
  orders_total: number;
  manual_total: number;
  grand_total: number;
}

export default function CierreCajaPage() {
  const { user } = useAuth();
  const { data: products } = useProducts();

  const [activeTab, setActiveTab] = useState<'nuevo' | 'historial'>('nuevo');
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: number }>>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayClosed, setTodayClosed] = useState(false);
  const [closes, setCloses] = useState<DailyClose[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedClose, setExpandedClose] = useState<string | null>(null);

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasClosedToday = closes.some(c => c.close_date === today && c.user_id === user?.id);
    setTodayClosed(hasClosedToday);
  }, [closes, user?.id]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/daily-closes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCloses(data.data ?? []);
      }
    } catch (error) { console.error('Error loading history:', error); }
    finally { setLoadingHistory(false); }
  };

  const addItem = () => { setItems([...items, { productName: '', quantity: 1, unitPrice: 0 }]); };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'productName') {
      const product = products?.find((p: Product) => p.name === value);
      if (product) { newItems[index].unitPrice = product.price; }
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => { setItems(items.filter((_, i) => i !== index)); };
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Agrega al menos un producto'); return; }
    const filledItems = items.filter(i => i.productName && i.quantity > 0);
    if (filledItems.length === 0) { toast.error('Completa los datos de los productos'); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/daily-closes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closeDate: new Date().toISOString().split('T')[0],
          items: filledItems,
          notes,
        }),
      });
      if (!response.ok) { const error = await response.json(); throw new Error(error.error); }
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`close_${today}_${user?.id}`, 'true');
      setTodayClosed(true);
      toast.success('Cierre de caja guardado');
      setItems([]);
      setNotes('');
      loadHistory();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Error al guardar'); }
    finally { setIsSubmitting(false); }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Cierre de Caja
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('nuevo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'nuevo' ? 'bg-white shadow text-amber-600' : 'text-gray-600'}`}>
            Nuevo Cierre
          </button>
          <button onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'historial' ? 'bg-white shadow text-amber-600' : 'text-gray-600'}`}>
            Historial
          </button>
        </div>
      </div>

      {todayClosed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">Ya cerraste la caja hoy</p>
        </div>
      )}

      {activeTab === 'nuevo' ? (
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Productos Vendidos</h3>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm">
              <Plus className="h-4 w-4" />Agregar producto
            </button>
          </div>
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay productos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 px-2">
                  <div className="col-span-5">Producto</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-2">Precio Unit.</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input type="text" list={`products_${index}`} value={item.productName}
                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                        placeholder="Nombre del producto" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      <datalist id={`products_${index}`}>
                        {products?.map((p: Product) => (<option key={p.id} value={p.name} />))}
                      </datalist>
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1" className="w-full px-3 py-2 border rounded-lg text-sm text-center" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={item.unitPrice || ''}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        step="0.01" min="0" placeholder="0.00"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-right" />
                    </div>
                    <div className="col-span-2 text-right font-medium text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeItem(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-gray-50 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notas (opcional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones del cierre..." rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total del cierre</p>
                <p className="text-3xl font-bold text-amber-600">${totalAmount.toFixed(2)}</p>
              </div>
              <button onClick={handleSubmit} disabled={isSubmitting || items.length === 0 || todayClosed}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Guardando...' : todayClosed ? 'Ya cerrado' : 'Confirmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Historial de Cierres</h3>
            <p className="text-sm text-gray-500 mt-1">{closes.length} cierres registrados</p>
          </div>
          {loadingHistory ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto" />
              <p className="text-gray-500 mt-3">Cargando historial...</p>
            </div>
          ) : closes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay cierres registrados aún</p>
            </div>
          ) : (
            <div className="divide-y">
              {closes.map((close) => {
                const isExpanded = expandedClose === close.id;
                return (
                  <div key={close.id}>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedClose(isExpanded ? null : close.id)}>
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(close.close_date)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {close.user?.full_name && <span className="text-sm text-gray-500">Vendedor: {close.user.full_name}</span>}
                          <span className="text-sm text-gray-500">{close.items?.length ?? 0} prod. mostrador</span>
                          <span className="text-sm text-gray-500">{close.orders?.length ?? 0} pedidos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-green-600">${close.grand_total?.toFixed(2) ?? '0.00'}</span>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-600 font-medium">Ventas Mostrador</p>
                            <p className="text-lg font-bold text-blue-700">${close.manual_total?.toFixed(2) ?? '0.00'}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-purple-600 font-medium">Pedidos Entregados</p>
                            <p className="text-lg font-bold text-purple-700">${close.orders_total?.toFixed(2) ?? '0.00'}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-green-600 font-medium">Total del Día</p>
                            <p className="text-lg font-bold text-green-700">${close.grand_total?.toFixed(2) ?? '0.00'}</p>
                          </div>
                        </div>
                        {close.items && close.items.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-700 mb-2">Ventas Mostrador</h4>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 border-b">
                                  <th className="pb-2">Producto</th>
                                  <th className="pb-2 text-center">Cantidad</th>
                                  <th className="pb-2 text-right">Precio Unit.</th>
                                  <th className="pb-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {close.items.map((item, idx) => (
                                  <tr key={idx} className="border-b last:border-0">
                                    <td className="py-2">{item.product_name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                    <td className="py-2 text-right font-medium">${Number(item.total_price).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {close.orders && close.orders.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-700 mb-2">Pedidos Entregados ({close.orders.length})</h4>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-blue-600 border-b">
                                  <th className="pb-2">Pedido</th>
                                  <th className="pb-2 text-center">Items</th>
                                  <th className="pb-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {close.orders.map((order) => (
                                  <tr key={order.id} className="border-b last:border-0">
                                    <td className="py-2 font-medium">{order.order_number}</td>
                                    <td className="py-2 text-center">{order.items?.length ?? 0}</td>
                                    <td className="py-2 text-right font-medium">${Number(order.total).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {close.notes && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 font-medium">Notas:</p>
                            <p className="text-sm text-gray-700 mt-1">{close.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}