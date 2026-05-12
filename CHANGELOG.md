# Changelog — Cafetería App

All notable changes to this project are documented in this file.

## [Unreleased]

### Fixed

#### Bug: `orders.map is not a function` error
**Affected Files:**
- `src/lib/api/orders.ts`
- `src/lib/api/products.ts`
- `src/lib/api/categories.ts`
- `src/features/products/hooks/use-categories.ts`

**Problem:**
API routes return `{ data: [...] }` but API client functions were returning the full response object directly. React Query hooks (e.g., `useOrders`) expected an array from `.data`, but received `{ data: [...], count: ... }` instead. Calling `.map()` on this object threw `orders.map is not a function`.

**Solution:**
Updated all API client functions to extract `.data` from the response and return the array directly. Added `?? []` fallback for list endpoints to prevent null reference errors.

**Changes per file:**

`src/lib/api/orders.ts`:
- `getOrders()` → `return response.data ?? []`
- `getOrder(id)` → `return response.data`
- `createOrder(input)` → `return response.data`
- `updateOrderStatus(orderId, status)` → `return response.data`
- `getDailySales(startDate, endDate)` → `return response.data ?? []`
- `getSalesSummary()` → unchanged (returns summary object, not array)

`src/lib/api/products.ts`:
- `getProducts()` → `return response.data ?? []`
- `getProduct(id)` → `return response.data`
- `createProduct(product)` → `return response.data`
- `updateProduct(id, product)` → `return response.data`

`src/lib/api/categories.ts`:
- `getCategories()` → `return response.data ?? []`
- `createCategory(category)` → `return response.data`
- `updateCategory(id, category)` → `return response.data`

`src/features/products/hooks/use-categories.ts`:
- Removed `.then(res => res.data)` since the API client now extracts `.data` internally

---

#### Bug: Products page empty after orders fix
**Affected File:**
- `src/app/(dashboard)/carrito/page.tsx`

**Problem:**
After fixing API clients to return `.data` directly, the carrito page still used `data?.data ?? []` instead of `data ?? []`.

**Fix:**
Changed `data?.data ?? []` → `data ?? []` in carrito page.

---

### Known Issues

- ~~Hydration mismatch with Zustand persist~~ — FIXED: `mounted` state pattern applied
- ~~Toast notifications~~ — FIXED: LayoutProviders with Toaster integrated
- ~~`orders.map is not a function`~~ — FIXED
- ~~Products page empty~~ — FIXED: carrito page and ProductsTable now use `data ?? []`

---

## [v0.2.0] — Role-Based Routing

### Feature: Login redirects by role
**Files Modified:**
- `src/features/auth/hooks/use-auth.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/vendedor/page.tsx` (new)

**Changes:**
- Login/Register API ahora retorna `user` con `role` en la respuesta
- `useAuth.signIn()` → hace redirect basado en rol:
  - `cliente` → `/carrito`
  - `vendedor` → `/vendedor` (dashboard completo)
  - `manager_admin` → `/admin`
- Navbar dinámica: cada rol ve solo sus módulos
- Rol shown en navbar (nombre + badge del rol con colores)
- Navbar highlight active page
- Vendedor NO ve menú de cliente

### Feature: Dashboard Vendedor
**New File:**
- `src/app/(dashboard)/vendedor/page.tsx`

**Includes:**
- Resumen: total pedidos, ingresos, ticket promedio, cancelados
- Selector de período: Hoy, Esta semana, Este mes
- Gráfico de barras: pedidos por estado
- Gráfico de donut: distribución de estados
- Alertas: pedidos pendientes, pedidos listos
- Lista de pedidos urgentes con botón "Avanzar"