'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar, Download, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useOrders, useDailySales } from '@/features/orders/hooks';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

interface DailyClose {
  id: string;
  close_date: string;
  date: string;
  manual_total: number;
  total_amount: number;
  orders_total: number;
  grand_total: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface DailySale {
  date: string;
  revenue: number;
  order_count: number;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ContabilidadPage() {
  const { data: ordersResponse } = useOrders();
  const orders: Order[] = ordersResponse?.data ?? [];
  const { data: dailySales } = useDailySales();
  const [closes, setCloses] = useState<DailyClose[]>([]);
  const [loadingCloses, setLoadingCloses] = useState(true);
  const [tab, setTab] = useState<'resumen' | 'cierres' | 'pedidos' | 'productos'>('resumen');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

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
  const completedOrders = allOrders.filter((o) => o.status === 'completed');

  const filteredCloses = closes.filter(c => {
    const d = new Date(c.close_date || c.date);
    return d.getMonth() === monthFilter && d.getFullYear() === yearFilter;
  });

  const filteredOrders = allOrders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === monthFilter && d.getFullYear() === yearFilter;
  });

  const ordersMonth = filteredOrders.filter((o) => o.status === 'completed');
  const totalManual = filteredCloses.reduce((s: number, c) => s + (c.manual_total ?? c.total_amount ?? 0), 0);
  const totalOrdersMonth = ordersMonth.reduce((s, o) => s + (o.total || 0), 0);
  const grandTotal = totalManual + totalOrdersMonth;

  const chartData = filteredCloses.map((c) => ({
    date: new Date(c.close_date || c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    cierre: c.grand_total ?? c.total_amount ?? 0,
    manual: c.manual_total ?? c.total_amount ?? 0,
    online: c.orders_total ?? 0,
  }));

  const monthlyComparison = Array.from({ length: 12 }, (_, i) => ({
    month: months[i],
    cierre: closes.filter((c) => {
      const d = new Date(c.close_date || c.date);
      return d.getMonth() === i && d.getFullYear() === yearFilter;
    }).reduce((s: number, c: DailyClose) => s + (c.grand_total ?? c.total_amount ?? 0), 0),
    pedidos: (dailySales ?? []).filter((d: DailySale) => {
      const m = new Date(d.date).getMonth();
      const y = new Date(d.date).getFullYear();
      return m === i && y === yearFilter;
    }).reduce((s: number, d: DailySale) => s + (d.revenue || 0), 0),
  }));

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string; value: string; icon: typeof DollarSign; color: string; subtitle?: string }) => (
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
          <p className="text-sm text-gray-500">Reporte financiero detallado</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <select value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total del Período" value={`$${grandTotal.toFixed(2)}`} icon={DollarSign} color="text-green-600" />
        <StatCard title="Ventas Mostrador" value={`$${totalManual.toFixed(2)}`} icon={TrendingUp} color="text-amber-600" subtitle={`${filteredCloses.length} cierres`} />
        <StatCard title="Pedidos Online" value={`$${totalOrdersMonth.toFixed(2)}`} icon={Users} color="text-blue-600" subtitle={`${ordersMonth.length} pedidos completados`} />
        <StatCard title="Ticket Promedio" value={`$${ordersMonth.length > 0 ? (grandTotal / ordersMonth.length).toFixed(2) : '0.00'}`} icon={Calendar} color="text-purple-600" subtitle="Por pedido completado" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b p-4 flex gap-2">
          {(['resumen', 'cierres', 'pedidos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-amber-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t === 'resumen' ? 'Resumen' : t === 'cierres' ? 'Cierres' : t === 'pedidos' ? 'Pedidos' : 'Productos'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'resumen' && (
            <div className="flex flex-col gap-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Comparación Mensual ({yearFilter})</h4>
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

                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-gray-700">Detalle del Período</h4>
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cierres de caja</span>
                      <span className="font-medium">${totalManual.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pedidos completados</span>
                      <span className="font-medium">${totalOrdersMonth.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'cierres' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Fecha</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Mostrador</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Online</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="border-b">
                  {filteredCloses.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 px-3">{new Date(c.close_date || c.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="py-2 px-3 text-right text-amber-600">${(c.manual_total ?? c.total_amount ?? 0).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-blue-600">${(c.orders_total ?? 0).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-semibold">${(c.grand_total ?? c.total_amount ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredCloses.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">No hay cierres en este período</td></tr>
                  )}
                </tbody>
                {filteredCloses.length > 0 && (
                  <tfoot>
                    <tr className="font-semibold">
                      <td className="py-2 px-3">Total</td>
                      <td className="py-2 px-3 text-right text-amber-600">${totalManual.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-blue-600">${totalOrdersMonth.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-green-600">${grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {tab === 'pedidos' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Estado</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Total</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="border-b">
                  {ordersMonth.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2 px-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{o.status}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">${o.total.toFixed(2)}</td>
                      <td className="py-2 px-3">{new Date(o.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                  {ordersMonth.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">No hay pedidos completados en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'productos' && (
            <div className="flex flex-col gap-6">
              {topProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-4">Productos Más Vendidos</h4>
                      <div className="flex flex-col gap-3">
                        {topProducts.slice(0, 5).map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                              {i + 1}
                            </span>
                            <span className="flex-1 text-sm text-gray-700">{p.name}</span>
                            <span className="text-sm font-semibold text-amber-600">{p.quantity} uds</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={topProducts.slice(0, 6).map((p, i) => ({ name: p.name, value: p.quantity, fill: PIE_COLORS[i % PIE_COLORS.length] }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {topProducts.slice(0, 6).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-gray-500">Producto</th>
                          <th className="text-center py-2 px-3 font-medium text-gray-500">Cantidad Vendida</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-500">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}>
                                  {i + 1}
                                </span>
                                {p.name}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="bg-yellow-50 text-amber-800 px-2 py-1 rounded font-medium">
                                {p.quantity} uds
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-green-600">
                              ${p.revenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
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