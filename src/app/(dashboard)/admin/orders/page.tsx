'use client';

import { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks';
import { Package, Search, Clock, Check, X, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@/domain/types/database';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; nextStatus: OrderStatus | null }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-800', bgColor: 'bg-yellow-100', nextStatus: 'confirmed' },
  confirmed: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-100', nextStatus: 'preparing' },
  preparing: { label: 'Preparando', color: 'text-orange-800', bgColor: 'bg-orange-100', nextStatus: 'ready' },
  ready: { label: 'Listo', color: 'text-green-800', bgColor: 'bg-green-100', nextStatus: 'completed' },
  completed: { label: 'Completado', color: 'text-gray-800', bgColor: 'bg-gray-100', nextStatus: null },
  cancelled: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100', nextStatus: null },
};

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success(`Pedido actualizado a: ${statusConfig[newStatus].label}`);
    } catch {
      toast.error('Error al actualizar el pedido');
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const ordersByStatus = {
    pending: orders?.filter(o => o.status === 'pending').length ?? 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length ?? 0,
    preparing: orders?.filter(o => o.status === 'preparing').length ?? 0,
    ready: orders?.filter(o => o.status === 'ready').length ?? 0,
    completed: orders?.filter(o => o.status === 'completed').length ?? 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6" />
          Gestión de Pedidos
        </h1>
        <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} pedidos en total</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status}
            className={`rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${config.bgColor}`}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
            <p className={`text-xs font-medium ${config.color}`}>{config.label}</p>
            <p className={`text-2xl font-bold ${config.color}`}>
              {status === 'pending' ? ordersByStatus.pending :
               status === 'confirmed' ? ordersByStatus.confirmed :
               status === 'preparing' ? ordersByStatus.preparing :
               status === 'ready' ? ordersByStatus.ready :
               status === 'completed' ? ordersByStatus.completed :
               ordersByStatus.cancelled}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por pedido o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Preparando</option>
            <option value="ready">Listo</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay pedidos{statusFilter !== 'all' ? ' con este estado' : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Pedido</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status as OrderStatus];
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{order.order_number}</td>
                      <td className="py-3 text-gray-600">{order.user?.full_name || 'Cliente'}</td>
                      <td className="py-3 text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-amber-600">${order.total.toFixed(2)}</td>
                      <td className="py-3">
                        {status.nextStatus && (
                          <button
                            onClick={() => handleStatusChange(order.id, status.nextStatus!)}
                            disabled={updateStatus.isPending}
                            className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50">
                            <ChevronRight className="h-4 w-4" />
                            {statusConfig[status.nextStatus].label}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}