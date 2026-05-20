'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle, CheckCircle, Clock, Grid3X3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useOrders, useSalesSummary, useDailySales } from '@/features/orders/hooks';

interface Order {
  id: string;
  status: string;
  total: number;
}

interface DailyClose {
  id: string;
  manual_total: number;
  total_amount: number;
}

interface DailySale {
  date: string;
  revenue: number;
  order_count: number;
}

const statusConfig = [
  { status: 'pending', label: 'Pendiente', color: '#854d0e', dot: '#f59e0b' },
  { status: 'confirmed', label: 'Confirmado', color: '#1e40af', dot: '#3b82f6' },
  { status: 'preparing', label: 'Preparando', color: '#9a3412', dot: '#f97316' },
  { status: 'ready', label: 'Listo', color: '#166534', dot: '#22c55e' },
  { status: 'completed', label: 'Completado', color: '#374151', dot: '#6b7280' },
  { status: 'cancelled', label: 'Cancelado', color: '#991b1b', dot: '#ef4444' },
];

export default function AdminDashboard() {
  const { data: ordersResponse } = useOrders();
  const orders: Order[] = ordersResponse?.data ?? [];
  const { data: summary } = useSalesSummary();
  const { data: dailySales } = useDailySales();
  const [closes, setCloses] = useState<DailyClose[]>([]);

  useEffect(() => {
    fetch('/api/daily-closes', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setCloses(d.data ?? []))
      .catch(() => {});
  }, []);

  const totalManual = closes.reduce((s, c) => s + (c.manual_total ?? c.total_amount ?? 0), 0);
  const totalOnline = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const grandTotal = totalManual + totalOnline;

  const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const ready = orders.filter(o => o.status === 'ready');

  const statusCounts = statusConfig.map(cfg => ({
    ...cfg,
    count: orders.filter(o => o.status === cfg.status).length,
  }));

  const chartData: { date: string; ventas: number; pedidos: number }[] = (dailySales ?? []).slice(-14).map((d: DailySale) => ({
    date: new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    ventas: d.revenue,
    pedidos: d.order_count,
  }));

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string; value: string | number; icon: typeof DollarSign; color: string; subtitle?: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon size={40} className="text-gray-300 opacity-30" />
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Resumen general de la cafetería</p>
      </div>

      {pending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">{pending.length} pedidos pendientes</p>
              <p className="text-sm text-yellow-700">Requieren atención inmediata</p>
            </div>
            <Link href="/pedidos?status=pending" className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm font-medium">Ver</Link>
          </div>
          {ready.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">{ready.length} pedidos listos</p>
                <p className="text-sm text-green-700">Listos para recoger</p>
              </div>
              <Link href="/pedidos?status=ready" className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium">Ver</Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos Totales" value={`$${grandTotal.toFixed(2)}`} icon={DollarSign} color="text-green-600" subtitle={<><span className="text-blue-600">Mostrador: ${totalManual.toFixed(2)}</span> <span className="text-purple-600">Online: ${totalOnline.toFixed(2)}</span></>} />
        <StatCard title="Pedidos Completados" value={orders.filter(o => o.status === 'completed').length} icon={CheckCircle} color="text-blue-600" subtitle={`Ticket promedio: $${(summary?.avg_order ?? 0).toFixed(2)}`} />
        <StatCard title="Pedidos Activos" value={orders.filter(o => ['pending','confirmed','preparing','ready'].includes(o.status)).length} icon={Clock} color="text-amber-600" subtitle="En proceso" />
        <StatCard title="Cierres de Caja" value={closes.length} icon={Package} color="text-purple-600" subtitle="Registrados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ventas por Día (últimos 14 días)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Ventas']} />
                <Bar dataKey="ventas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">Sin datos disponibles</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Pedidos por Estado</h3>
          <div className="flex flex-col gap-3">
            {statusCounts.map(item => (
              <div key={item.status} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.dot }} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="font-semibold" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="font-bold text-gray-900">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/admin/productos" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-100 rounded-lg">
            <ShoppingBag size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Productos</h3>
            <p className="text-sm text-gray-500">Gestionar catálogo</p>
          </div>
        </Link>
        <Link href="/admin/categorias" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-pink-100 rounded-lg">
            <Grid3X3 size={24} className="text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Categorías</h3>
            <p className="text-sm text-gray-500">Gestionar categorías</p>
          </div>
        </Link>
        <Link href="/pedidos" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pedidos</h3>
            <p className="text-sm text-gray-500">Ver todos los pedidos</p>
          </div>
        </Link>
        <Link href="/contabilidad" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Contabilidad</h3>
            <p className="text-sm text-gray-500">Reportes detallados</p>
          </div>
        </Link>
        <Link href="/admin/usuarios" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Usuarios</h3>
            <p className="text-sm text-gray-500">Gestionar equipo</p>
          </div>
        </Link>
      </div>
    </div>
  );
}