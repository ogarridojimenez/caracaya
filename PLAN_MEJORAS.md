# Plan de Mejoras - Caracaya App

## Metodología de Trabajo
- **Iterativa**: Una mejora a la vez, probar, validar
- **Rollback**: Si algo falla, revertir al estado anterior
- **Sin push**: Todo local hasta que el usuario lo autorice

---

## FASE 1: Fundamentos Críticos (Semana 1-2)

### 1.1 Sistema de Inventario con Stock
**Problema:** Hay campos `stock_quantity` y `low_stock_threshold` pero no se usan para bloquear ventas.

**Cambios a realizar:**
- Modificar `/api/orders/route.ts` POST para validar stock antes de crear pedido
- Agregar endpoint `/api/products/stock-check` para verificar múltiples items
- Actualizar UI del carrito para mostrar disponibilidad

**Archivos esperados:**
- `src/app/api/orders/route.ts` - validar stock antes de crear
- `src/app/api/products/stock/route.ts` (nuevo) - verificar stock
- `src/lib/api/products.ts` - agregar función de verificación

**Prueba:**
1. Crear producto con stock=2
2. Agregar 3 unidades al carrito → debe mostrar error "Stock insuficiente"
3. Agregar 2 unidades → debe permitir

**Rollback:** Mantener código anterior sin validación de stock.

---

### 1.2 Auditoría de Seguridad RLS
**Problema:** Inconsistencia entre roles en políticas RLS y tabla users.

**Cambios a realizar:**
- Revisar políticas en `supabase/migrations/`
- Verificar que todas las tablas tengan RLS apropiado
- Asegurar que `vendedor` solo vea lo necesario

**Prueba:**
1. Login como vendedor
2. Intentar acceder a `/api/auth/users` → debe bloquear
3. Intentar acceder a `/api/products` → debe permitir solo lectura

**Rollback:** Restaurar políticas anteriores si hay problemas de acceso legítimos.

---

## FASE 2: Rendimiento y UX (Semana 2-3)

### 2.1 Paginación
**Problema:** No hay paginación, con muchos pedidos/products la UI colapsa.

**Cambios a realizar:**
- Modificar hooks `useOrders` y `useProducts` para aceptar parámetros de paginación
- Agregar UI de paginación en `/admin/pedidos` y `/admin/productos`

**Archivos esperados:**
- `src/features/orders/hooks.ts` - agregar paginación
- `src/features/products/hooks.ts` - agregar paginación
- `src/app/(dashboard)/admin/orders/page.tsx` - agregar controles paginación

**Prueba:**
1. Crear más de 20 pedidos
2. Ver que aparecen max 10 por página
3. Navegar entre páginas funciona

**Rollback:** Mantener vista sin paginación.

---

### 2.2 Next.js Image
**Problema:** No se usa `<Image />` de Next.js, pérdida de rendimiento.

**Cambios a realizar:**
- Agregar dominio `images.unsplash.com` a `next.config.js`
- Reemplazar `<img>` por `<Image />` en landing page

**Archivos:**
- `next.config.js` - agregar dominio externo
- `src/app/page.tsx` - usar Image para productos

**Prueba:**
1. Build pasa sin errores de imagen
2. Imágenes cargan correctamente en producción

**Rollback:** Revertir a etiquetas img originales.

---

### 2.3 Loading Skeletons
**Problema:** Estados vacíos cuando carga, UX pobre.

**Cambios a realizar:**
- Crear componente `Skeleton.tsx` en `src/components/ui/`
- Agregar skeletons a páginas de admin

**Prueba:**
1. Recargar página de pedidos
2. Ver skeleton mientras carga
3. Contenido aparece después

**Rollback:** Quitar skeletons, volver a spinners/txt simple.

---

## FASE 3: Limpieza y Mantenibilidad (Semana 3-4)

### 3.1 Componentizar Landing Page
**Problema:** Estilos inline hardcoded, difícil mantenimiento.

**Cambios a realizar:**
- Crear componentes: `Button`, `Card`, `Section`, `Container`
- Reemplazar inline styles por Tailwind classes

**Archivos nuevos:**
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Section.tsx`
- `src/components/ui/Container.tsx`

**Prueba:**
1. Landing se ve igual que antes
2. Estilos responsive funcionan
3. No hay errores de console

**Rollback:** Mantener estilos inline originales.

---

### 3.2 Productos desde Base de Datos
**Problema:** Landing hardcodea productos, no lee de DB.

**Cambios a realizar:**
- Agregar endpoint `/api/products?featured=true`
- Landing lee productos destacados de la API

**Prueba:**
1. Marcar productos como "featured" en DB
2. Landing muestra esos productos
3. Cambios en DB reflejan en landing

**Rollback:** Volver a productos hardcoded.

---

### 3.3 Tipos TypeScript
**Problema:** Uso excesivo de `any`, sin tipos definidos.

**Cambios a crear:**
- `src/types/order.ts` - tipos para pedidos
- `src/types/product.ts` - tipos para productos
- `src/types/user.ts` - tipos para usuarios

**Prueba:**
1. Build pasa sin errores de tipos
2. Autocomplete funciona en IDE

**Rollback:** Mantener tipos `any` donde estaban.

---

## FASE 4: Funcionalidades Avanzadas (Semana 4-5)

### 4.1 WebSockets para Pedidos en Tiempo Real
**Problema:** No hay actualizaciones en tiempo real.

**Cambios a realizar:**
- Configurar Supabase Realtime en el cliente
- Agregar suscripción a cambios en pedidos

**Prueba:**
1. Abrir dos navegadores (vendedor y admin)
2. Crear pedido en uno → aparece en otro automáticamente

**Rollback:** Quitar suscripción, mantener polling actual.

---

### 4.2 Dark Mode
**Problema:** Solo hay modo claro.

**Cambios a realizar:**
- Agregar ThemeProvider con Zustand
- Toggle en navbar
- Variables CSS para colores

**Prueba:**
1. Toggle dark mode funciona
2. Todas las páginas respetan theme
3. Persiste al recargar

**Rollback:** Mantener solo modo claro.

---

### 4.3 Búsqueda Debounceada
**Problema:** Búsqueda hace request en cada keystroke.

**Cambios a realizar:**
- Agregar debounce de 300ms en búsquedas
-hook `useDebounce` en `src/lib/hooks/`

**Prueba:**
1. Escribir en search box
2. Solo hace request después de 300ms de pausa
3. UX más fluida

**Rollback:** Quitar debounce, inmediata.

---

## FASE 5: Polish y Extras (Semana 5-6)

### 5.1 Tests Unitarios
- Agregar Vitest + React Testing Library
- Cover componentes críticos

### 5.2 Internacionalización (i18n)
- Agregar next-intl o similar
- Keys de texto en JSON

### 5.3 Error Boundaries
- Crear ErrorBoundary global
- Página 500 personalizada

---

## Resumen de Fases

| Fase | Duración | Items |
|------|----------|-------|
| 1. Fundamentos | 1-2 sem | Inventario, Seguridad RLS |
| 2. Rendimiento | 2-3 sem | Paginación, Image, Skeletons |
| 3. Limpieza | 3-4 sem | Componentes UI, DB Products, Types |
| 4. Avanzado | 4-5 sem | WebSockets, Dark Mode, Debounce |
| 5. Polish | 5-6 sem | Tests, i18n, ErrorBoundary |

---

## Order Sugerido de Implementación

1. **Inventario** - Más crítico para el negocio
2. **Seguridad RLS** - Evitar problemas de acceso
3. **Paginación** - Cuando crezca el catálogo
4. **Limpieza landing** - Mantenibilidad inmediata
5. **Dark mode** - Feature popular
6. **WebSockets** - Para experiencia en tiempo real

---

## Notas Importantes

- **No modificar login/register** - El documento lo indica explícitamente
- **Probar cada cambio localmente** - npm run dev
- **Verificar build** - npm run build antes de cualquier commit
- **Mantener coherencia** - Seguir estilos existentes del proyecto

---

*Documento creado: 2026-05-15*
*Revisión: Pending*