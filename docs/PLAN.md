# Plan de Desarrollo — Cafetería App

## Resumen de Roles y Rutas

| Rol | Landing Post-Login | Módulos Accesibles |
|-----|-------------------|--------------------|
| `cliente` | `/carrito` (menú) | Menú, Carrito, Mis Pedidos |
| `vendedor` | `/pedidos` (kanban) | Menú, Carrito, Pedidos (kanban), Ver todos los pedidos |
| `manager_admin` | `/admin` | **TODOS**: Admin Dashboard, Productos, Categorías, Contabilidad, Usuarios, Configuración |

### Routing Dinámico Post-Login
```
Login exitoso → verificar rol → redirect a:
  ├── cliente    → /carrito
  ├── vendedor   → /pedidos
  └── manager_admin → /admin
```

### Middleware de Protección por Rol
```
/admin/*        → solo manager_admin
/productos/*     → manager_admin, vendedor (lectura)
/pedidos        → todos (vista según rol: cliente ve solo suyos, staff ve todos)
/usuarios/*     → solo manager_admin
/contabilidad/* → solo manager_admin
```

---

| Rol | Descripción | Alcance |
|-----|-------------|---------|
| `cliente` | Cliente normal | Ver menú, hacer pedidos, ver sus pedidos |
| `vendedor` | Dependiente/Bartender | Mismo que cliente + ver todos pedidos, actualizar estado |
| `manager_admin` | Administrador | Todo + reportes, contabilidad, gestionar productos/categorías, usuarios |

---

## FASE 1: Cliente (Funcional) ✅

### Módulo: Menú y Carrito
- [x] Listar productos con búsqueda/filtro
- [x] Agregar al carrito con cantidad
- [x] Ver/editar/vaciar carrito (drawer)
- [x] Checkout: hora de recogida + notas
- [x] Crear pedido (POST /api/orders)

### Módulo: Mis Pedidos
- [x] Ver historial de pedidos del cliente
- [x] Ver detalle de un pedido (items, estado, hora) — via useOrder hook
- [ ] Cancelar pedido (solo si `pending`)
- [ ] Repetir pedido anterior (copiar items al carrito)

---

## FASE 2: Vendedor (Dependiente) 🔲

### Routing
- [x] Login como vendedor → redirect automático a `/vendedor`
- [x] Navbar del vendedor: Dashboard, Pedidos, Cierre Caja (con admin/contabilidad/usuarios ocultos)

### Módulo: Pedidos en Cocina (Kanban)
- [ ] `/pedidos` muestra TODOS los pedidos (no solo del usuario)
- [ ] Vista Kanban: Pending → Confirmado → Preparando → Listo → Completado
- [ ] Notificación sonora cuando llega pedido nuevo
- [ ] Actualizar estado con drag-drop o botones
- [ ] Timer de preparación visible
- [ ] Impresora de tickets (opcional, para cocina)

### Módulo: Turno Diario
- [x] Ver pedidos del día actual
- [x] Resumen ventas parcial del turno
- [x] Cambio de estado a "Listo" suena campana/notificación

### Módulo: Cierre de Caja
- [x] Página `/vendedor/cierre` para vendedor
- [x] Tabs: "Nuevo Cierre" e "Historial"
- [x] Lista productos vendidos manualmente (no de pedidos online)
- [x] Input: nombre producto + cantidad + precio unitario
- [x] Autocompletar desde catálogo de productos
- [x] Calcular total automáticamente
- [x] Guardar cierre con fecha y notas
- [x] Un cierre por día por vendedor (no duplicar)
- [x] Historial completo de cierres diarios con expand/collapse

### API Backend Necesaria:
- [x] `GET /api/daily-closes` → listar cierres (staff) + incluye pedidos completados
- [x] `POST /api/daily-closes` → crear/actualizar cierre diario
- [ ] `GET /api/daily-closes/[id]` → detalle de un cierre
- [ ] `DELETE /api/daily-closes/[id]` → eliminar cierre (admin)

---

## FASE 3: Admin/Manager 🔲

### Módulo: Dashboard Admin
- [x] Página principal con métricas rápido
- [x] Gráfico de ventas por día, breakdown por estado, alertas
- [x] Accesos directos a gestión

### Módulo: Gestión de Productos (CRUD)
- [x] Listar productos (ProductsTable)
- [x] Crear producto (ProductFormModal)
- [x] Editar producto
- [x] Eliminar producto (soft delete o confirmar)
- [x] Cambiar disponibilidad
- [ ] Gestión de stock bajo (alertas)
- [ ] Subir imagen de producto → Storage Supabase
- [x] Campos: nombre, descripción, precio, categoría, imagen, disponible
- [ ] Campo stock

### Módulo: Gestión de Categorías
- [ ] CRUD categorías (falta página y API)
- [ ] Ordenar categorías (drag-sort)
- [ ] Imagen de categoría
- [ ] Activar/desactivar categoría

### Módulo: Contabilidad y Reportes
- [x] Resumen ventas (suma, promedio, reembolsos)
- [x] Gráfico ventas por día
- [ ] Reporte por período (semanal, mensual, custom)
- [ ] Exportar a CSV/PDF
- [ ] Top productos vendidos
- [ ] Ventas por categoría
- [ ] Gráfico de donut por método de pago

### Módulo: Gestión de Usuarios (SOLO manager_admin)
- [x] Página `/admin/usuarios` (protegida: solo manager_admin)
- [x] Tabla con todos los usuarios: nombre, email, rol, fecha registro
- [x] Crear usuario manualmente: nombre, email, rol, password
- [x] **Editar rol**: dropdown `cliente` | `vendedor` | `manager_admin` por usuario
- [ ] Cambiar estado: activar/inactivar usuario (soft delete)
- [ ] Ver historial de actividad del usuario (pedidos creados)
- [ ] Un usuario = un rol (sin roles múltiples)

### Módulo: Configuración
- [ ] Horarios de atención
- [ ] Métodos de pago activos
- [ ] Configuración de impuestos
- [ ] Datos de la cafetería (nombre, logo, dirección)

---

## FASE 4: Auth, Routing por Rol y Backend 🔲

### Login con Redirección Dinámica por Rol
- [ ] `useAuth.signIn()` → al hacer login exitoso, leer `user.role` → `router.push()` a la ruta del rol
- [ ] Login redirecciona:
  - `cliente` → `/carrito`
  - `vendedor` → `/pedidos`
  - `manager_admin` → `/admin`
- [ ] Catch: si intenta acceder a ruta que no le pertenece → redirect a su módulo

### Middleware de Autorización (Next.js Middleware)
- [ ] `middleware.ts` intercepta todas las requests
- [ ] Verificar sesión → obtener rol → validar acceso a la ruta
- [ ] Rutas protegidas:
  - `/admin/*` → solo manager_admin
  - `/usuarios/*` → solo manager_admin
  - `/contabilidad/*` → solo manager_admin
  - `/productos` → manager_admin (escritura), vendedor (lectura OK), cliente (redirect a /carrito)
  - `/pedidos` → todos (filtro por rol en la UI: cliente ve solo suyos, staff ve todos)

### Autenticación en API Routes
- [ ] Agregar check de rol en API routes protegidas (POST/PATCH/DELETE)
- [ ] RLS policies más finas en Supabase por rol
- [ ] Rate limiting en login
- [ ] Refresh token rotation

### API Endpoints a Completar

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| GET | /api/categories | Listar categorías | ✅ |
| POST | /api/categories | Crear categoría | ✅ (falta auth check) |
| PATCH | /api/categories/[id] | Editar categoría | ❌ no existe |
| DELETE | /api/categories/[id] | Eliminar categoría | ❌ no existe |
| GET | /api/products | Listar productos | ✅ |
| POST | /api/products | Crear producto | ✅ |
| PATCH | /api/products/[id] | Editar producto | ✅ |
| DELETE | /api/products/[id] | Eliminar producto | ✅ |
| GET | /api/orders | Listar pedidos | ✅ (con filtro userId) |
| POST | /api/orders | Crear pedido | ✅ |
| GET | /api/orders/[id] | Detalle pedido | ✅ |
| PATCH | /api/orders/[id] | Actualizar estado | ✅ |
| GET | /api/orders/summary | Resumen ventas | ✅ |
| GET | /api/orders/daily | Ventas diarias | ✅ |
| GET | /api/auth/users | Listar usuarios | ✅ |
| POST | /api/auth/users | Crear usuario | ✅ |
| PATCH | /api/auth/users/[id] | Editar usuario/rol | ✅ |
| DELETE | /api/auth/users/[id] | Eliminar usuario | ✅ |

### API Nueva: Upload
- [ ] `POST /api/upload` → subir imagenes a Supabase Storage

### API Nueva: Reportes
- [ ] `GET /api/reports/top-products` → productos más vendidos
- [ ] `GET /api/reports/by-category` → ventas por categoría
- [ ] `GET /api/reports/inventory` → estado de inventario
- [ ] `GET /api/reports/export` → exportar CSV

---

## FASE 5: UX y Polish 🔲

### Estados de Carga
- [ ] Skeletons en todas las páginas (no spinners)
- [ ] Pull to refresh en móvil

### Empty States
- [ ] Productos vacíos
- [ ] Pedidos vacíos
- [ ] Carrito vacío (ya existe)

### Notificaciones
- [ ] Toasts consistentes (ya integrado con sonner)
- [ ] Pedido nuevo: notificación push / sound
- [ ] Stock bajo: toast de alerta

### Responsive
- [ ] Navbar hamburger en móvil
- [ ] Grids adaptativos
- [ ] Bottom sheet en móvil para carrito/checkout

### PWA (opcional)
- [ ] Manifest para installed app
- [ ] Service worker para offline del menú

---

## FASE 6: Testing y Deployment 🔲

### Testing
- [ ] Unit tests: types, validation schemas, store logic
- [ ] Integration: API routes con test database
- [ ] E2E: Playwright para flujos críticos (registro, pedido, checkout)

### Deployment
- [ ] Vercel: frontend
- [ ] Supabase: database + auth + storage
- [ ] Variables de entorno documentadas
- [ ] CI/CD con GitHub Actions

### Monitoreo
- [ ] Error tracking (Sentry)
- [ ] Analytics (Plausible/Vercel Analytics)

---

## Dependencias entre Fases

```
FASE 1 → FASE 2 (vendedor hereda flujo cliente, añade kanban)
FASE 1+2 → FASE 3 (admin necesita flujo completo)
FASE 4 → FASE 5 (backend debe estar listo antes de UX)
FASE 5 → FASE 6 (todo funcionando antes de deploy)
```

---

## Priorización Sugerida

1. **Inmediato**: Fix ProductsTable (`data?.data` → `data`) ✅
2. **Esta semana**: Login con redirect por rol ✅ (ya implementado)
3. **Esta semana**: Vendedor - kanban pedidos, actualizar estado ✅ (ya implementado con búsqueda/filtros)
4. **Esta semana**: Admin - gestión productos completa, CRUD categorías
5. **Próxima semana**: Admin - reportes, usuarios (editar rol, crear usuario)
6. **Polishing**: UX, testing, deploy

## Estado Actual (9 mayo 2026)

### ✅ Completado
- Login + redirect por rol
- Menú, carrito, checkout, pedidos (cliente)
- Dashboard vendedor con stats, gráficos, cierre de caja
- Dashboard admin profesional con gráficos, alertas, métricas
- Contabilidad con cierres + pedidos del mes
- CRUD productos (crear/editar/eliminar/toggle disponible)
- CRUD usuarios (crear/editar rol/eliminar)
- Admin orders con búsqueda y filtros
- Todas las API routes (auth, orders, products, daily-closes)
- Middleware de protección por rol
- Navbar dinámico por rol

### 🔲 Pendiente
- Gestión de categorías (CRUD + página `/admin/categorias`)
- Gestión de stock bajo (alertas)
- Subir imágenes a Supabase Storage (actualmente solo URL)
- Campo stock en productos
- Revisar duplicación `/productos` vs `/admin/productos` — dejar solo una
- Detalle de pedido (modal/página)
- Cancelar pedido (cliente)
- Repetir pedido anterior
- Kanban visual para vendedor
- Notificaciones sonoras para pedidos nuevos
- Reportes exportables (CSV/PDF)
- Top productos / ventas por categoría
- Perfil de usuario — página para cambiar nombre/contraseña
- Navegación móvil — hamburger menu en vez de `<select>` básico
- Testing E2E — probar flujo completo: login → carrito → checkout → pedidos → status → cierre → contabilidad
- Deploy a Vercel
- SWC error en admin dashboard — usar `className` en vez de inline styles (revertir cuando funcione)