'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Download, Package, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useOrders, useDailySales } from '@/features/orders/hooks';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ContabilidadPage() {
  const { data: ordersResponse } = useOrders();
  const orders = ordersResponse?.data ?? [];
  const { data: dailySales } = useDailySales();
  const [closes, setCloses] = useState<any[]>([]);
  const [loadingCloses, setLoadingCloses] = useState(true);
  const [tab, setTab] = useState<'resumen' | 'cierres' | 'pedidos' | 'productos'>('resumen');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/daily-closes', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCloses(d.data ?? []); })
      .catch(() => {})
      .finally(() => setLoadingCloses(false));

    const startDate = new Date(yearFilter, monthFilter, 1).toISOString().split('T')[0];
    const endDate = new Date(yearFilter, monthFilter + 1, 0).toISOString().split('T')[0];
    fetch(`/api/reports/top-products?start_date=${startDate}&end_date=${endDate}&limit=10`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTopProducts(d.data ?? []); })
      .catch(() => {});
  }, [monthFilter, yearFilter]);

  const exportCSV = () => {
    const startDate = new Date(yearFilter, monthFilter, 1).toISOString().split('T')[0];
    const endDate = new Date(yearFilter, monthFilter + 1, 0).toISOString().split('T')[0];
    window.open(`/api/reports/export?start_date=${startDate}&end_date=${endDate}`, '_blank');
  };

  const allOrders = orders ?? [];
  const completedOrders = allOrders.filter((o: any) => o.status === 'completed');

  const filteredCloses = closes.filter(c => {
    const d = new Date(c.close_date || c.date);
    return d.getMonth() === monthFilter && d.getFullYear() === yearFilter;
  });

  const filteredOrders = allOrders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === monthFilter && d.getFullYear() === yearFilter;
  });

  const ordersMonth = filteredOrders.filter((o: any) => o.status === 'completed');
  const totalManual = filteredCloses.reduce((s: number, c: any) => s + (c.manual_total ?? c.total_amount ?? 0), 0);
  const totalOrdersMonth = ordersMonth.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const grandTotal = totalManual + totalOrdersMonth;

  const chartData = filteredCloses.map((c: any) => ({
    date: new Date(c.close_date || c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    cierre: c.grand_total ?? c.total_amount ?? 0,
    manual: c.manual_total ?? c.total_amount ?? 0,
    online: c.orders_total ?? 0,
  }));

  const monthlyComparison = Array.from({ length: 12 }, (_, i) => ({
    month: months[i],
    cierre: closes.filter((c: any) => {
      const d = new Date(c.close_date || c.date);
      return d.getMonth() === i && d.getFullYear() === yearFilter;
    }).reduce((s: number, c: any) => s + (c.grand_total ?? c.total_amount ?? 0), 0),
    pedidos: (dailySales ?? []).filter((d: any) => {
      const m = new Date(d.date).getMonth();
      const y = new Date(d.date).getFullYear();
      return m === i && y === yearFilter;
    }).reduce((s: number, d: any) => s + (d.revenue || 0), 0),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Contabilidad</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reporte financiero detallado</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <select value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))} style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))} style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total del Período</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>${grandTotal.toFixed(2)}</p>
            </div>
            <DollarSign size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ventas Mostrador</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>${totalManual.toFixed(2)}</p>
            </div>
            <TrendingUp size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>{filteredCloses.length} cierres</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pedidos Online</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>${totalOrdersMonth.toFixed(2)}</p>
            </div>
            <Users size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>{ordersMonth.length} pedidos completados</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ticket Promedio</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>
                ${ordersMonth.length > 0 ? (grandTotal / ordersMonth.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <Calendar size={40} color="#d1d5db" style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Por pedido completado</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
          {(['resumen', 'cierres', 'pedidos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', background: tab === t ? '#d97706' : 'transparent', color: tab === t ? '#fff' : '#6b7280', border: 'none' }}>
              {t === 'resumen' ? 'Resumen' : t === 'cierres' ? 'Cierres' : t === 'pedidos' ? 'Pedidos' : 'Productos'}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {tab === 'resumen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.length > 0 ? chartData : [{ date: 'Sin datos', cierre: 0, manual: 0, online: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(2)}`} />
                  <Bar dataKey="manual" name="Mostrador" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="online" name="Online" fill="#3b82f6" stackId="a" />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>Comparación Mensual ({yearFilter})</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(2)}`} />
                      <Line type="monotone" dataKey="cierre" stroke="#f59e0b" strokeWidth={2} name="Cierres" />
                      <Line type="monotone" dataKey="pedidos" stroke="#3b82f6" strokeWidth={2} name="Pedidos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 style={{ fontWeight: 600, color: '#374151' }}>Detalle del Período</h4>
                  <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280' }}>Cierres de caja</span>
                      <span style={{ fontWeight: 500 }}>${totalManual.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280' }}>Pedidos completados</span>
                      <span style={{ fontWeight: 500 }}>${totalOrdersMonth.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Total</span>
                      <span style={{ color: '#16a34a' }}>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'cierres' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Fecha</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Mostrador</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Online</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Total</th>
                  </tr>
                </thead>
                <tbody style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {filteredCloses.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{new Date(c.close_date || c.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#d97706' }}>${(c.manual_total ?? c.total_amount ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#2563eb' }}>${(c.orders_total ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>${(c.grand_total ?? c.total_amount ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredCloses.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>No hay cierres en este período</td></tr>
                  )}
                </tbody>
                {filteredCloses.length > 0 && (
                  <tfoot>
                    <tr style={{ fontWeight: 600 }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>Total</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#d97706' }}>${totalManual.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#2563eb' }}>${totalOrdersMonth.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#16a34a' }}>${grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {tab === 'pedidos' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Estado</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {ordersMonth.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>#{o.id.slice(0, 8)}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#dcfce7', color: '#16a34a' }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 500 }}>${o.total.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{new Date(o.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                  {ordersMonth.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af' }}>No hay pedidos completados en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'productos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {topProducts.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
                      <h4 style={{ fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>Productos Más Vendidos</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {topProducts.slice(0, 5).map((p: any, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                              {i + 1}
                            </span>
                            <span style={{ flex: 1, fontSize: '0.875rem', color: '#374151' }}>{p.name}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d97706' }}>{p.quantity} uds</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={topProducts.slice(0, 6).map((p: any, i: number) => ({ name: p.name, value: p.quantity, fill: PIE_COLORS[i % PIE_COLORS.length] }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {topProducts.slice(0, 6).map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Producto</th>
                          <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Cantidad Vendida</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontWeight: 500, color: '#6b7280' }}>Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: 20, height: 20, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
                                  {i + 1}
                                </span>
                                {p.name}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 500 }}>
                                {p.quantity} uds
                              </span>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                              ${p.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>No hay datos de productos en este período</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}