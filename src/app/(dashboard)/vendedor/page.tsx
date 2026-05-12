'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { useOrders, useUpdateOrderStatus, useSalesSummary } from '@/features/orders/hooks';
import {
  Package, Users, TrendingUp, TrendingDown, AlertCircle, Check,
  Clock, X, DollarSign, Filter, BarChart3, Calendar, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import Link from 'next/link';
import type { OrderStatus } from '@/domain/types/database';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  confirmed: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  preparing: { label: 'Preparando', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  ready: { label: 'Listo', color: 'text-green-800', bgColor: 'bg-green-100' },
  completed: { label: 'Completado', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-100' },
};

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#f97316', '#22c55e', '#6b7280', '#ef4444'];

const isStaff = (role: string) => role === 'vendedor' || role === 'manager_admin';

const timeRanges = [
  { label: 'Hoy', days: 0 },
  { label: 'Esta semana', days: 7 },
  { label: 'Este mes', days: 30 },
];

export default function DashboardVendedor() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState(7);

  const { data: orders, isLoading } = useOrders();
  const { data: summary } = useSalesSummary();
  const updateStatus = useUpdateOrderStatus();

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (timeRange === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return orders.filter(o => new Date(o.created_at) >= today);
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    return orders.filter(o => new Date(o.created_at) >= startDate);
  }, [orders, timeRange]);

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(statusConfig).forEach(s => { counts[s] = 0; });
    filteredOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: statusConfig[status as OrderStatus].label,
      value: count,
      color: STATUS_COLORS[Object.keys(statusConfig).indexOf(status)],
    })).filter(d => d.value > 0);
  }, [filteredOrders]);

  const totalRevenue = useMemo(() =>
    filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)
  , [filteredOrders]);

  const pendingCount = filteredOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const readyCount = filteredOrders.filter(o => o.status === 'ready').length;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success(`Pedido actualizado a: ${statusConfig[newStatus].label}`);
    } catch {
      toast.error('Error al actualizar el pedido');
    }
  };

  const urgentOrders = filteredOrders
    .filter(o => o.status === 'pending' || o.status === 'confirmed')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Pedidos</h1>
          <p className="text-sm text-gray-500">Resumen de actividad reciente</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              onClick={() => setTimeRange(range.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.days
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">{pendingCount} pedidos pendientes de procesar</p>
            <p className="text-sm text-yellow-600">Revisa la lista y confirma o prepara los pedidos.</p>
          </div>
          <Link
            href="/pedidos?status=pending"
            className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
          >
            Ver pedidos
          </Link>
        </div>
      )}

      {readyCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">{readyCount} pedidos listos para recoger</p>
            <p className="text-sm text-green-600">Notifica a los clientes que sus pedidos están listos.</p>
          </div>
          <Link
            href="/pedidos?status=ready"
            className="ml-auto px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Ver pedidos
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{filteredOrders.length}</p>
            </div>
            <Package className="h-10 w-10 text-amber-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ticket promedio</p>
              <p className="text-3xl font-bold text-blue-600">
                ${filteredOrders.length > 0 ? (totalRevenue / filteredOrders.filter(o => o.status === 'completed').length).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cancelados</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredOrders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
            <X className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pedidos por Estado
          </h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Sin datos en este período
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Distribución de Estados
          </h3>
          {ordersByStatus.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {ordersByStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Sin datos en este período
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pedidos Pendientes Recientes
          </h3>
          <Link href="/pedidos" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y">
          {urgentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No hay pedidos pendientes
            </div>
          ) : (
            urgentOrders.map((order) => {
              const status = statusConfig[order.status as OrderStatus];
              const nextStatus = order.status === 'pending' ? 'confirmed' : order.status === 'confirmed' ? 'preparing' : null;
              return (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.user?.full_name || 'Cliente'} • ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                    {nextStatus && (
                      <button
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                        disabled={updateStatus.isPending}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50"
                      >
                        Avanzar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}