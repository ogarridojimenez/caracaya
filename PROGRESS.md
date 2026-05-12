# Caracaya - Sistema de Gestión

**URL Producción:** https://caracaya.vercel.app
**Repo:** https://github.com/ogarridojimenez/caracaya
**Stack:** Next.js 14, Supabase, TypeScript, Tailwind CSS, React Query, Recharts

---

## Resumen de Roles y Rutas

| Rol | Landing Post-Login | Dashboard | Módulos Accesibles |
|-----|-------------------|-----------|--------------------|
| `cliente` | `/carrito` (menú) | `/carrito` | Menú, Carrito, Mis Pedidos |
| `vendedor` | `/pedidos` (kanban) | `/vendedor` | Menú, Pedidos (kanban), Cierre Caja |
| `manager_admin` | `/admin` | `/admin` | **TODOS**: Dashboard, Productos, Categorías, Contabilidad, Usuarios |

---

## Routing Dinámico Post-Login
```
Login exitoso → verificar rol → redirect a:
  ├── cliente    → /carrito
  ├── vendedor   → /vendedor
  └── manager_admin → /admin
```

### Middleware de Protección por Rol
```
/admin/*        → solo manager_admin
/pedidos        → todos (vista según rol: cliente ve solo suyos, staff ve kanban)
/vendedor/*     → vendedor y manager_admin
/contabilidad/* → vendedor y manager_admin
/carrito        → todos
```

---

## Funcionalidades Implementadas

### Cliente
- [x] Menú con búsqueda y filtros
- [x] Agregar al carrito con cantidad
- [x] Ver/editar/vaciar carrito (drawer)
- [x] Checkout: hora de recogida + notas
- [x] Crear pedido
- [x] Ver historial de pedidos
- [x] Ver detalle de pedido con items

### Vendedor
- [x] Dashboard con stats y gráficos
- [x] Kanban visual de pedidos (Pendiente → Completado)
- [x] Notificaciones sonoras para pedidos nuevos
- [x] Cierre de caja con autocompletado de productos
- [x] Historial de cierres

### Admin
- [x] Dashboard con métricas y alertas
- [x] Gestión de productos (CRUD completo)
- [x] Gestión de categorías (CRUD completo)
- [x] Gestión de usuarios (crear, editar rol, eliminar)
- [x] Contabilidad con resumen, cierres y pedidos
- [x] Reporte: Top productos vendidos
- [x] Exportar pedidos a CSV

### General
- [x] Landing page con branding Caracaya
- [x] Navbar responsive (hamburger en móvil)
- [x] Perfil de usuario (cambiar nombre, contraseña)
- [x] Subida de imágenes a Supabase Storage
- [x] Autenticación con Supabase

---

## API Routes

| Ruta | Métodos | Descripción | Estado |
|------|---------|-------------|--------|
| `/api/auth/login` | POST | Login | ✅ |
| `/api/auth/register` | POST | Registro | ✅ |
| `/api/auth/logout` | POST | Logout | ✅ |
| `/api/auth/me` | GET | Usuario actual | ✅ |
| `/api/auth/profile` | GET/PATCH | Perfil | ✅ |
| `/api/auth/users` | GET/POST | Listar/crear usuarios | ✅ |
| `/api/auth/users/[id]` | PATCH/DELETE | Editar/eliminar usuario | ✅ |
| `/api/orders` | GET/POST | Listar/crear pedidos | ✅ |
| `/api/orders/[id]` | GET/PATCH/DELETE | Pedido individual | ✅ |
| `/api/orders/summary` | GET | Resumen de ventas | ✅ |
| `/api/orders/daily` | GET | Ventas diarias | ✅ |
| `/api/products` | GET/POST | Listar/crear productos | ✅ |
| `/api/products/[id]` | GET/PATCH/DELETE | Producto individual | ✅ |
| `/api/categories` | GET/POST | Categorías | ✅ |
| `/api/categories/[id]` | PATCH/DELETE | Categoría individual | ✅ |
| `/api/daily-closes` | GET/POST | Cierres de caja | ✅ |
| `/api/reports/top-products` | GET | Top productos | ✅ |
| `/api/reports/export` | GET | Exportar CSV | ✅ |
| `/api/upload` | POST | Subir imágenes | ✅ |

---

## Tareas Pendientes

### Alta Prioridad
- [ ] Cancelar pedido (cliente - solo si status=pending)
- [ ] Repetir pedido anterior (copiar items al carrito)
- [ ] Timer de preparación visible en kanban (ya existe pero mejorar)

### Media Prioridad
- [ ] PWA - App instalable (manifest + service worker)
- [ ] Pull to refresh en móvil
- [ ] Detalle de pedido en modal/página separada
- [ ] Gestión de stock bajo (alertas visuales)

### Baja Prioridad
- [ ] Testing E2E con Playwright
- [ ] Notificaciones push reales (no solo sonido)
- [ ] Impresora de tickets (para cocina)
- [ ] Campos adicionales: dirección, teléfono en perfil

---

## Dependencias entre Fases

```
Cliente → Vendedor → Admin (cada rol hereda funcionalidades anteriores)
```

---

## Problemas Resueltos

### 12 mayo 2026
- Fix TypeScript errors para build de producción
- Actualizado landing page de "cafetería" a "Caracaya" (dulces, refrescos, comida)
- Actualizado navbar con nombre Caracaya y logo Cake
- Implementado Kanban visual para vendedor/admin
- Agregado productos y precios en tarjetas del kanban
- API orders ahora incluye order_items y user
- Notificaciones sonoras para pedidos nuevos
- Reportes: Top productos + Exportar CSV
- Navbar responsive con hamburger menu

### Errores de Build Corregidos
- Parámetros `any` implícitos en múltiples archivos
- Tipos de Recharts (Tooltip formatter)
- Toaster de react-hot-toast (API actualizada)
- Middleware de Supabase (cookies API actualizada)
- Tipos de roles en useAuth
