'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { CartDrawer, CheckoutModal } from '@/features/orders/components';
import Link from 'next/link';
import { Cake, ShoppingBag, LogOut, Package, LayoutDashboard, Users, Tags, DollarSign, BarChart3, Grid3X3, Menu, X, User, ChevronDown } from 'lucide-react';
import type { UserRole } from '@/domain/types/database';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  cliente: [
    { href: '/carrito', label: 'Menú', icon: ShoppingBag },
    { href: '/pedidos', label: 'Mis Pedidos', icon: Package },
  ],
  vendedor: [
    { href: '/vendedor', label: 'Dashboard', icon: BarChart3 },
    { href: '/pedidos', label: 'Pedidos', icon: Package },
    { href: '/vendedor/cierre', label: 'Cierre Caja', icon: DollarSign },
  ],
  manager_admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Productos', icon: ShoppingBag },
    { href: '/admin/categorias', label: 'Categorías', icon: Grid3X3 },
    { href: '/pedidos', label: 'Pedidos', icon: Package },
    { href: '/contabilidad', label: 'Contabilidad', icon: DollarSign },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ],
};

export default function DashboardLayout({ children }: { children }) {
  return (
    <>
      <CartDrawer />
      <CheckoutModal />
      <DashboardNav>{children}</DashboardNav>
    </>
  );
}

function DashboardNav({ children }: { children: React.ReactNode }) {
  const { user, signOut, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const trigger = document.getElementById('mobile-menu-trigger');
        if (trigger && !trigger.contains(e.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const navItems = navItemsByRole[user.role] ?? navItemsByRole.cliente;
  const activeItem = navItems.find(item => pathname.startsWith(item.href));

  const roleBadge = (role: string) => ({
    backgroundColor: role === 'manager_admin' ? '#F3E8FF' : role === 'vendedor' ? '#DCFCE7' : '#DBEAFE',
    color: role === 'manager_admin' ? '#6B21A8' : role === 'vendedor' ? '#166534' : '#1E40AF',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
    display: 'inline-block',
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cake className="h-6 w-6 text-amber-600" />
                <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Caracaya</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                        color: isActive ? '#92400E' : '#6B7280',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-user">
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user.full_name || user.email}</p>
                  <span style={roleBadge(user.role)}>{user.role.replace('_', ' ')}</span>
                </div>
                <Link href="/perfil" style={{ padding: 8, color: '#9CA3AF', display: 'flex' }} title="Mi Perfil">
                  <User className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => signOut()}
                  style={{ padding: 8, color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <button
                id="mobile-menu-trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-btn"
                style={{ padding: 8, color: '#6B7280', cursor: 'pointer', display: 'none' }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            width: '100%',
            height: 'calc(100vh - 64px)',
            backgroundColor: 'white',
            zIndex: 40,
            overflowY: 'auto',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{user.full_name || user.email}</p>
                <span style={roleBadge(user.role)}>{user.role.replace('_', ' ')}</span>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 500,
                      backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                      color: isActive ? '#92400E' : '#374151',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/perfil"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  backgroundColor: pathname === '/perfil' ? '#FEF3C7' : 'transparent',
                  color: pathname === '/perfil' ? '#92400E' : '#374151',
                }}
              >
                <User className="h-5 w-5" />
                Mi Perfil
              </Link>
            </nav>

            <div style={{ marginTop: 24, borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
              <button
                onClick={() => signOut()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#EF4444',
                  backgroundColor: 'transparent',
                  width: '100%',
                }}
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-user { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}