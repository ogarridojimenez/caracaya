'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks';
import { Clock, Check, X, AlertCircle, Users, Package, Search, ChevronRight, Bell, Volume2, VolumeX, LayoutGrid, List, RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@/domain/types/database';
import { useCartStore } from '@/store';

const KANBAN_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: any }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-800', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'text-blue-800', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: AlertCircle },
  preparing: { label: 'Preparando', color: 'text-orange-800', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: Clock },
  ready: { label: 'Listo', color: 'text-green-800', bgColor: 'bg-green-50', borderColor: 'border-green-200', icon: Check },
  completed: { label: 'Completado', color: 'text-gray-800', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: Check },
  cancelled: { label: 'Cancelado', color: 'text-red-800', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: X },
};

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

const isStaff = (role: string) => role === 'vendedor' || role === 'manager_admin';

interface OrderTimerProps {
  createdAt: string;
}

function OrderTimer({ createdAt }: OrderTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(createdAt).getTime();
    const update = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 60000));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = elapsed;
  let colorClass = 'text-gray-500';
  if (minutes >= 15) colorClass = 'text-red-600 font-bold';
  else if (minutes >= 10) colorClass = 'text-orange-600 font-semibold';
  else if (minutes >= 5) colorClass = 'text-yellow-600';

  return (
    <span className={`text-xs ${colorClass}`}>
      {minutes}m
    </span>
  );
}

interface OrderCardProps {
  order: any;
  isStaffUser: boolean;
  isClientOwner: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onReorder: (items: any[]) => void;
  isUpdating: boolean;
}

function OrderCard({ order, isStaffUser, isClientOwner, onStatusChange, onReorder, isUpdating }: OrderCardProps) {
  const status = statusConfig[order.status as OrderStatus];
  const nextStatus = nextStatusMap[order.status as OrderStatus];
  const nextStatusLabel = nextStatus ? statusConfig[nextStatus].label : null;
  const items = order.items || order.order_items || [];
  const canCancel = isClientOwner && order.status === 'pending';

  return (
    <div className={`bg-white rounded-lg border ${status.borderColor} shadow-sm hover:shadow-md transition-shadow p-3`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-900 text-sm">{order.order_number}</span>
        <div className="flex items-center gap-2">
          <OrderTimer createdAt={order.created_at} />
          {isStaffUser && order.user?.full_name && (
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              {order.user.full_name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="text-xs text-gray-600 flex justify-between gap-2">
            <span><span className="text-amber-600 font-medium">{item.quantity}x</span> {item.product_name}</span>
            <span className="text-gray-500 whitespace-nowrap">${item.unit_price.toFixed(2)}</span>
          </div>
        ))}
        {items.length > 3 && (
          <span className="text-xs text-gray-400">+{items.length - 3} más</span>
        )}
      </div>

      {order.pickup_time && (
        <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(order.pickup_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <span className="text-sm font-semibold text-amber-600">${order.total.toFixed(2)}</span>
        <div className="flex items-center gap-2">
          {(canCancel || !isStaffUser) && (
            <button
              onClick={() => onStatusChange(order.id, 'cancelled')}
              disabled={isUpdating || (canCancel && order.status !== 'pending')}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              title="Cancelar pedido"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!isStaffUser && (
            <button
              onClick={() => onReorder(items)}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
              title="Repetir pedido"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          {nextStatusLabel && isStaffUser && nextStatus && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              disabled={isUpdating}
              className="px-2 py-1 bg-amber-600 text-white text-xs rounded font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronRight className="h-3 w-3" />
              {nextStatusLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const notificationSound = typeof window !== 'undefined' ? new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6agHFkXGNrbXqGjZmNf2xfdYGMmZSCdmtaaH2CmZmTgHJnYGV2f4mZlIyBdGhdcoGNmJKFgHFpYWx+gI6YkH9wamRzeoSRlZGEdWthbX2DkZWRgHRtZm1+g5GUkYB0bWZtfoORlJGA') : null;

export default function PedidosPage() {
  const { user } = useAuth();
  const isStaffUser = user ? isStaff(user.role) : false;
  const isClientOwner = (orderUserId: string) => user?.id === orderUserId;

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevOrdersRef = useRef<string[]>([]);
  const router = useRouter();
  const loadFromOrder = useCartStore(state => state.loadFromOrder);

  const { data: orders, isLoading, error } = useOrders(isStaffUser ? undefined : user?.id);
  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    if (orders && soundEnabled && isStaffUser) {
      const currentIds = orders.filter(o => o.status === 'pending').map(o => o.id);
      const prevIds = prevOrdersRef.current;
      
      const newPending = currentIds.filter(id => !prevIds.includes(id));
      if (newPending.length > 0) {
        try {
          notificationSound?.play();
        } catch {}
        toast.success(`¡Nuevo pedido recibido! (${newPending.length})`, { duration: 5000 });
      }
      
      prevOrdersRef.current = currentIds;
      setPendingCount(newPending.length);
    }
  }, [orders, soundEnabled, isStaffUser]);

  const title = isStaffUser ? 'Pedidos' : 'Mis Pedidos';
  const emptyMessage = isStaffUser
    ? 'No hay pedidos en este momento'
    : 'Cuando hagas tu primer pedido, aparecerá aquí';

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success(`Pedido actualizado a: ${statusConfig[newStatus].label}`);
    } catch {
      toast.error('Error al actualizar el pedido');
    }
  };

  const handleReorder = (items: any[]) => {
    loadFromOrder(items);
    toast.success('Productos agregados al carrito');
    router.push('/');
  };

  const filteredOrders = orders?.filter((order) => {
    const orderItems = order.items || order.order_items || [];
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderItems.some((item: any) =>
        item.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  }) ?? [];

  const ordersByStatus = KANBAN_STATUSES.reduce((acc, status) => {
    acc[status] = filteredOrders.filter(o => o.status === status);
    return acc;
  }, {} as Record<OrderStatus, typeof filteredOrders>);

  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-12">Error al cargar pedidos: {error.message}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isStaffUser ? <Package className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
            {title}
          </h1>
          {isStaffUser && pendingOrders > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
              {pendingOrders} nuevo{pendingOrders > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStaffUser && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vista Kanban"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Vista Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}
          {isStaffUser && (
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded ${soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {isStaffUser && (
        <div className="bg-white rounded-xl shadow p-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente o producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center flex-1">
          <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage}</h2>
          {searchQuery && (
            <p className="text-gray-500 text-sm mt-2">
              No se encontraron pedidos para "{searchQuery}"
            </p>
          )}
        </div>
      ) : viewMode === 'kanban' && isStaffUser ? (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {KANBAN_STATUSES.map(status => {
              const config = statusConfig[status];
              const statusOrders = ordersByStatus[status];
              const StatusIcon = config.icon;

              return (
                <div key={status} className="w-72 flex-shrink-0">
                  <div className={`${config.bgColor} rounded-t-lg px-3 py-2 border-b ${config.borderColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.bgColor} ${config.color}`}>
                        {statusOrders.length}
                      </span>
                    </div>
                  </div>
                  <div className={`bg-gray-50 rounded-b-lg p-2 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto space-y-2 border border-t-0 ${config.borderColor}`}>
                    {statusOrders.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        Sin pedidos
                      </div>
                    ) : (
                      statusOrders.map(order => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          isStaffUser={isStaffUser}
                          isClientOwner={isClientOwner(order.user_id)}
                          onStatusChange={handleStatusChange}
                          onReorder={handleReorder}
                          isUpdating={updateStatus.isPending}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as OrderStatus];
            const StatusIcon = status.icon;
            const canAdvance = isStaffUser && nextStatusMap[order.status as OrderStatus] !== null;
            const items = order.items || order.order_items || [];
            const isOwner = isClientOwner(order.user_id);
            const canCancel = isOwner && order.status === 'pending';

            return (
              <div key={order.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      {isStaffUser && order.user?.full_name && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {order.user.full_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="font-medium text-amber-600">{item.quantity}x</span> {item.product_name}
                        </span>
                        <span className="text-gray-600">${item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-semibold border-t pt-3 mt-3">
                    <span>Total</span>
                    <span className="text-amber-600 text-lg">${order.total.toFixed(2)}</span>
                  </div>

                  {order.pickup_time && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recoger a las: <span className="font-medium">{new Date(order.pickup_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  )}
                </div>

                <div className="px-4 pb-4 flex gap-2">
                  {canCancel && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancelar
                    </button>
                  )}
                  {!isStaffUser && (
                    <button
                      onClick={() => handleReorder(items)}
                      className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Repetir pedido
                    </button>
                  )}
                  {canAdvance && (
                    <button
                      onClick={() => handleStatusChange(order.id, nextStatusMap[order.status as OrderStatus]!)}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                      Marcar como {statusConfig[nextStatusMap[order.status as OrderStatus]!].label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}