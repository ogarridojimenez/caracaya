# Cafetería App - Estado del Proyecto

**Última actualización:** 9 de mayo de 2026
**Stack:** Next.js 14, Supabase, TypeScript, Tailwind CSS, React Query, Recharts

---

## Estructura General

```
src/app/
├── (auth)/                 # Login, register
│   ├── login/
│   └── register/
├── (dashboard)/             # Rutas protegidas con navbar por rol
│   ├── layout.tsx           # Navbar dinámico según rol
│   ├── admin/               # manager_admin
│   │   ├── page.tsx         # Dashboard con gráficos
│   │   ├── orders/          # Gestión de pedidos
│   │   ├── productos/       # CRUD de productos
│   │   └── usuarios/        # Gestión de usuarios (CRUD)
│   ├── vendedor/            # vendedor
│   │   ├── page.tsx         # Dashboard con stats y alertas
│   │   └── cierre/          # Cierre de caja
│   ├── contabilidad/        # manager_admin + vendedor
│   │   └── page.tsx         # Reportes financieros
│   ├── carrito/             # cliente
│   └── pedidos/             # cliente + staff
├── api/                     # Rutas API (backend)
│   ├── auth/                # Login, logout, register, usuarios
│   ├── orders/             # CRUD pedidos, summary, daily
│   ├── products/            # CRUD productos
│   ├── daily-closes/        # Cierres de caja
│   └── categories/         # Categorías
└── middleware.ts            # Protección de rutas por rol
```

---

## Roles y Acceso

| Rol | Dashboard | Rutas permitidas |
|-----|-----------|-----------------|
| `cliente` | `/carrito` | carrito, pedidos propios |
| `vendedor` | `/vendedor` | vendedor dashboard, pedidos, cierre caja, contabilidad |
| `manager_admin` | `/admin` | todas las rutas admin, contabilidad |

- **Middleware** (`src/middleware.ts`) protege `/admin/*` y redirige según rol
- **Navbar** (`src/app/(dashboard)/layout.tsx`) muestra items según rol del usuario

---

## Páginas Completadas

### Admin (`/admin`)
- **Dashboard** (`admin/page.tsx`): Cards de métricas (ingresos totales, pedidos completados, activos, cierres), gráfico de barras (últimos 14 días), breakdown por estado, alertas de pedidos pendientes/listos, quick links
- **Orders** (`admin/orders/page.tsx`): Tabla con búsqueda, filtros por estado, contadores
- **Productos** (`admin/productos/page.tsx`): Tabla con CRUD completo, modal de crear/editar, búsqueda, imagen preview
- **Usuarios** (`admin/usuarios/page.tsx`): Tabla con búsqueda, edición inline de rol, eliminar, crear nuevo usuario

### Vendedor (`/vendedor`)
- **Dashboard** (`vendedor/page.tsx`): Stats, gráficos, filtros de tiempo, alertas, avanzar estado de pedidos
- **Cierre de Caja** (`vendedor/cierre/page.tsx`): Dos tabs - Nuevo Cierre y Historial

### Contabilidad (`/contabilidad`)
- Filtro por mes/año
- Cards resumen: total período, ventas mostrador, pedidos online, ticket promedio
- Gráfico de barras (ventas diarias) y línea (comparación mensual)
- Tabs: Resumen / Cierres de Caja / Pedidos

---

## API Routes

| Ruta | Métodos | Descripción |
|------|---------|-------------|
| `/api/auth/login` | POST | Login con email/password |
| `/api/auth/register` | POST | Registro |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Usuario actual |
| `/api/auth/users` | GET/POST | Listar/crear usuarios (admin) |
| `/api/auth/users/[id]` | PATCH/DELETE | Editar/eliminar usuario (admin) |
| `/api/orders` | GET/POST | Listar/crear pedidos |
| `/api/orders/[id]` | GET/PATCH/DELETE | Pedido individual |
| `/api/orders/summary` | GET | Resumen de ventas con filtros |
| `/api/orders/daily` | GET | Ventas diarias agrupadas |
| `/api/products` | GET/POST | Listar/crear productos |
| `/api/products/[id]` | GET/PATCH/DELETE | Producto individual |
| `/api/daily-closes` | GET/POST | Cierres de caja (incluye pedidos completados) |
| `/api/categories` | GET/POST | Categorías |

---

## Base de Datos (Supabase)

### Tablas principales
- `users` — id, email, full_name, role (cliente/vendedor/manager_admin), created_at
- `products` — id, name, description, price, category, image_url, is_available
- `categories` — id, name, is_active
- `orders` — id, order_number, user_id, status, subtotal, tax_amount, discount_amount, total, notes, pickup_time, completed_at, created_at
- `order_items` — id, order_id, product_id, product_name, quantity, unit_price, total_price

### Tablas de cierre de caja
- `daily_closes` — id, user_id, close_date, total_amount, subtotal, notes
- `daily_close_items` — id, daily_close_id, product_name, quantity, unit_price, total_price

### Funciones SQL (005_accounting_functions.sql)
- `get_daily_sales(start_date, end_date)` — ventas por día
- `get_sales_summary(start_date, end_date)` — resumen con promedio
- `get_top_products(limit_count)` — productos más vendidos

### RLS Policies (003_rls_policies.sql)
- `users` — público leer, admin gestionar todo
- `products` — todos leer disponibles, staff gestionar
- `orders` — cliente ve los suyos, vendedor/admin ve todos
- `daily_closes` — vendedor/admin ve/crea, admin edita/elimina

---

## Hooks de React Query

**Orders** (`src/features/orders/hooks/`):
- `useOrders(userId?)` — lista de pedidos (GET /api/orders con credentials)
- `useOrder(id)` — pedido individual
- `useCreateOrder()` — crear pedido
- `useUpdateOrderStatus()` — actualizar estado
- `useSalesSummary(startDate?, endDate?)` — resumen de ventas
- `useDailySales(startDate?, endDate?)` — ventas diarias

**Products** (`src/features/products/hooks/`):
- `useProducts()` — lista de productos
- `useProduct(id)` — producto individual
- `useCreateProduct()` — crear
- `useUpdateProduct()` — actualizar
- `useDeleteProduct()` — eliminar

---

## Clientes de API

- `src/lib/api/orders.ts` — todas las funciones incluyen `credentials: 'include'`
- `src/lib/api/products.ts` — todas las funciones incluyen `credentials: 'include'`

---

## Problemas Resueltos

### Contabilidad en cero
**Causa:** Se usaba `useState` en vez de `useEffect` para cargar los cierres de caja. El fetch nunca se ejecutaba.
**Solución:** Cambiar a `useEffect` para el fetch de `/api/daily-closes`. Ahora contabilidad usa los mismos hooks que el dashboard: `useOrders()` + `useDailySales()` + `useEffect` para cierres. Los pedidos del mes se calculan filtrando `orders` por `status='completed'` y fecha, sin depender del matching con cierres.

### Usuarios error `.toLowerCase`
**Causa:** La API de usuarios devuelve `full_name` pero la UI usaba `u.name`.
**Solución:** Cambiar a `(u.name || u.full_name || 'N/A')`, tipo cambió a `any[]`.

### Campos incorrectos en cierres
**Causa:** Contabilidad esperaba `c.date`, `c.manual_total`, `c.closed_by` pero la API devuelve `c.close_date`, `c.total_amount`, `c.user`.
**Solución:** Usar fallbacks `c.close_date || c.date`, `c.manual_total || c.total_amount`, `c.user?.full_name`.

### Productos 404
**Causa:** Archivo duplicado en `/admin/productos` vs `/(dashboard)/admin/productos`. Next.js rechaza rutas paralelas.
**Solución:** Eliminar el archivo en `/admin/productos/page.tsx`. Solo existe en `/(dashboard)/admin/`.

---

## Usuarios de Prueba

- **Admin:** admin@micafeteria.com — rol: `manager_admin`
- **Vendedor:** vendedor@micafeteria.com — rol: `vendedor`

---

## Siguientes Pasos

1. **Productos** — agregar categorías, subir imágenes (actualmente solo URL)

2. **Testing completo** — probar flujo: login → carrito → checkout → pedidos → status advancement → cierre caja → contabilidad

3. **Navegación móvil** — mejorar navbar en móvil (hamburger menu en vez de select)

4. **Perfil de usuario** — página de perfil para cambiar nombre, contraseña

5. **Notificaciones** — alertas en tiempo real para pedidos nuevos (vendedor/admin)

---

## Archivos Clave

- `src/features/auth/hooks/use-auth.tsx` — autenticación, roles, redirect
- `src/middleware.ts` — protección de rutas por rol
- `src/app/(dashboard)/layout.tsx` — navbar por rol
- `src/lib/api/` — clientes de API (products.ts, orders.ts)
- `supabase/migrations/` — estructura de BD y RLS
- `src/domain/types/database.ts` — tipos TypeScript
- `PROGRESS.md` — este archivo