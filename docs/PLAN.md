# Plan de Desarrollo — Caraballo

## Resumen de Roles y Rutas

| Rol | Landing Post-Login | Dashboard | Módulos Accesibles |
|-----|-------------------|-----------|--------------------|
| `cliente` | `/carrito` (menú) | `/carrito` | Menú, Carrito, Mis Pedidos |
| `vendedor` | `/pedidos` (kanban) | `/vendedor` | Menú, Pedidos (kanban), Cierre Caja, Contabilidad |
| `manager_admin` | `/admin` | `/admin` | **TODOS**: Dashboard, Productos, Categorías, Contabilidad, Usuarios, Configuración |

### Routing Dinámico Post-Login
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

## FASE 1: Cliente (Funcional) ✅

### Módulo: Menú y Carrito
- [x] Listar productos con búsqueda/filtro
- [x] Agregar al carrito con cantidad
- [x] Ver/editar/vaciar carrito (drawer)
- [x] Checkout: hora de recogida + notas
- [x] Crear pedido (POST /api/orders)

### Módulo: Mis Pedidos
- [x] Ver historial de pedidos del cliente
- [x] Ver detalle de un pedido (items, estado, hora)
- [ ] Cancelar pedido (solo si `pending`)
- [ ] Repetir pedido anterior (copiar items al carrito)

---

## FASE 2: Vendedor (Dependiente) ✅

### Routing
- [x] Login como vendedor → redirect automático a `/vendedor`
- [x] Navbar del vendedor: Dashboard, Pedidos, Cierre Caja

### Módulo: Pedidos en Cocina (Kanban)
- [x] Vista Kanban: Pending → Confirmado → Preparando → Listo → Completado
- [x] Tarjetas con productos y precios
- [x] Botón para avanzar estado directamente
- [x] Timer de preparación visible
- [x] Toggle para notificaciones sonoras
- [ ] Notificación sonora automática al recibir pedido (falta polling)

### Módulo: Turno Diario
- [x] Ver pedidos del día actual
- [x] Resumen ventas parcial del turno

### Módulo: Cierre de Caja
- [x] Página `/vendedor/cierre` para vendedor
- [x] Tabs: "Nuevo Cierre" e "Historial"
- [x] Lista productos vendidos manualmente
- [x] Autocompletar desde catálogo de productos
- [x] Calcular total automáticamente
- [x] Guardar cierre con fecha y notas
- [x] Historial completo de cierres diarios

---

## FASE 3: Admin/Manager ✅

### Módulo: Dashboard Admin
- [x] Página principal con métricas rápido
- [x] Gráfico de ventas por día, breakdown por estado, alertas
- [x] Accesos directos a gestión

### Módulo: Gestión de Productos (CRUD)
- [x] Listar productos (ProductsTable)
- [x] Crear producto (ProductFormModal)
- [x] Editar producto
- [x] Eliminar producto
- [x] Cambiar disponibilidad
- [x] Subir imagen de producto → Storage Supabase
- [x] Campos: nombre, descripción, precio, categoría, imagen, disponible

### Módulo: Gestión de Categorías
- [x] CRUD categorías completo
- [x] Página `/admin/categorias`
- [ ] Ordenar categorías (drag-sort)
- [ ] Imagen de categoría
- [x] Activar/desactivar categoría

### Módulo: Contabilidad y Reportes
- [x] Resumen ventas (suma, promedio)
- [x] Gráfico ventas por día
- [x] Reporte por período (mes/año)
- [x] Top productos vendidos
- [x] Exportar a CSV
- [ ] Exportar a PDF
- [ ] Ventas por categoría (gráfico)

### Módulo: Gestión de Usuarios (SOLO manager_admin)
- [x] Página `/admin/usuarios` (protegida: solo manager_admin)
- [x] Tabla con todos los usuarios
- [x] Crear usuario manualmente
- [x] Editar rol: dropdown cliente | vendedor | manager_admin
- [ ] Cambiar estado: activar/inactivar usuario (soft delete)
- [ ] Ver historial de actividad del usuario

---

## FASE 4: Auth, Routing por Rol y Backend ✅

### Login con Redirección Dinámica por Rol
- [x] useAuth.signIn() → redirect según rol
- [x] Login redirecciona correctamente

### Middleware de Autorización (Next.js Middleware)
- [x] middleware.ts intercepta todas las requests
- [x] Verificar sesión → obtener rol → validar acceso

### API Endpoints ✅
- [x] GET/POST/PATCH/DELETE para orders, products, categories, users
- [x] GET/POST para daily-closes
- [x] GET /api/reports/top-products
- [x] GET /api/reports/export
- [x] POST /api/upload

---

## FASE 5: UX y Polish 🔲

### Estados de Carga
- [x] Skeletons en páginas principales
- [ ] Pull to refresh en móvil

### Empty States
- [x] Productos vacíos
- [x] Pedidos vacíos
- [x] Carrito vacío

### Responsive
- [x] Navbar hamburger en móvil

### PWA 🔲
- [ ] Manifest para installed app
- [ ] Service worker para offline del menú

---

## Estado Actual (12 mayo 2026)

### ✅ Completado
- Landing page Caraballo (dulces, refrescos, comida)
- Login + redirect por rol
- Menú, carrito, checkout, pedidos (cliente)
- Dashboard vendedor con stats y gráficos
- Kanban visual con productos y precios
- Notificaciones sonoras
- Dashboard admin con métricas y alertas
- Contabilidad con cierres, pedidos, top productos
- Exportar CSV
- CRUD productos, categorías, usuarios
- Perfil de usuario
- Subida de imágenes
- Navbar responsive
- Build de producción exitoso
- Deploy en Vercel

### 🔲 Pendiente
- Cancelar pedido (cliente)
- Repetir pedido anterior
- PWA (manifest + service worker)
- Drag-sort categorías
- Soft delete usuarios
- Reporte PDF
- Notificaciones push reales
- Testing E2E

---

## Siguiente Prioridad

1. **Funcionalidades de cliente**: Cancelar/repetir pedido
2. **PWA**: Para instalar como app en móvil
3. **Polishing**: Testing, reportes adicionales
