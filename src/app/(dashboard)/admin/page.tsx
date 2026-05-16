'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle, CheckCircle, Clock, Grid3X3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useOrders, useSalesSummary, useDailySales } from '@/features/orders/hooks';

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
  const orders = ordersResponse?.data ?? [];
  const { data: summary } = useSalesSummary();
  const { data: dailySales } = useDailySales();
  const [closes, setCloses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/daily-closes', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setCloses(d.data ?? []))
      .catch(() => {});
  }, []);

  const totalManual = closes.reduce((s, c) => s + (c.manual_total ?? c.total_amount ?? 0), 0);
  const totalOnline = (orders ?? []).filter((o: any) => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const grandTotal = totalManual + totalOnline;

  const pending = (orders ?? []).filter((o: any) => o.status === 'pending' || o.status === 'confirmed');
  const ready = (orders ?? []).filter((o: any) => o.status === 'ready');

  const statusCounts = statusConfig.map(cfg => ({
    ...cfg,
    count: (orders ?? []).filter((o: any) => o.status === cfg.status).length,
  }));

  const chartData = (dailySales ?? []).slice(-14).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    ventas: d.revenue,
    pedidos: d.order_count,
  }));

  const cardLink = (href: string, bgColor: string, iconBg: string, Icon: any, iconColor: string, title: string, desc: string) => (
    <Link href={href} style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
      <div style={{ padding: '0.75rem', background: iconBg, borderRadius: '0.75rem' }}>
        <Icon size={24} color={iconColor} />
      </div>
      <div>
        <h3 style={{ fontWeight: 600, color: '#111827' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{desc}</p>
      </div>
    </Link>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Dashboard</h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Resumen general de la cafetería</p>
      </div>

      {pending.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#ca8a04" />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, color: '#713f12' }}>{pending.length} pedidos pendientes</p>
              <p style={{ fontSize: '0.875rem', color: '#a16207' }}>Requieren atención inmediata</p>
            </div>
            <Link href="/pedidos?status=pending" style={{ padding: '0.25rem 0.75rem', background: '#ca8a04', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Ver</Link>
          </div>
          {ready.length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={24} color="#16a34a" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, color: '#14532d' }}>{ready.length} pedidos listos</p>
                <p style={{ fontSize: '0.875rem', color: '#15803d' }}>Listos para recoger</p>
              </div>
              <Link href="/pedidos?status=ready" style={{ padding: '0.25rem 0.75rem', background: '#16a34a', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Ver</Link>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ingresos Totales</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>${grandTotal.toFixed(2)}</p>
            </div>
            <DollarSign size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#2563eb' }}>Mostrador: ${totalManual.toFixed(2)}</span>
            <span style={{ color: '#7c3aed' }}>Online: ${totalOnline.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pedidos Completados</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{(orders ?? []).filter((o: any) => o.status === 'completed').length}</p>
            </div>
            <CheckCircle size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Ticket promedio: ${(summary?.avg_order ?? 0).toFixed(2)}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pedidos Activos</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{(orders ?? []).filter((o: any) => ['pending','confirmed','preparing','ready'].includes(o.status)).length}</p>
            </div>
            <Clock size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>En proceso</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cierres de Caja</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{closes.length}</p>
            </div>
            <Package size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Registrados</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Ventas por Día (últimos 14 días)</h3>
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
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Sin datos disponibles</div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Pedidos por Estado</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {statusCounts.map(item => (
              <div key={item.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.dot }} />
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 600, color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{(orders ?? []).length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {cardLink('/admin/productos', '#fff', '#fef3c7', ShoppingBag, '#d97706', 'Productos', 'Gestionar catálogo')}
        {cardLink('/admin/categorias', '#fff', '#fce7f3', Grid3X3, '#db2777', 'Categorías', 'Gestionar categorías')}
        {cardLink('/pedidos', '#fff', '#dbeafe', Package, '#2563eb', 'Pedidos', 'Ver todos los pedidos')}
        {cardLink('/contabilidad', '#fff', '#dcfce7', DollarSign, '#16a34a', 'Contabilidad', 'Reportes detallados')}
        {cardLink('/admin/usuarios', '#fff', '#f3e8ff', Users, '#7c3aed', 'Usuarios', 'Gestionar equipo')}
      </div>
    </div>
  );
}