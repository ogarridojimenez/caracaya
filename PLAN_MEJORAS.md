# Plan de Mejoras - Caraballo App

## Estado: ✅ FASE 1-5 COMPLETADAS

---

## IMPLEMENTADO

### FASE 1: Fundamentos Críticos
- ✅ Sistema de Inventario con Stock (validación en orders API)
- ✅ Auditoría de Seguridad RLS (políticas de autenticación)

### FASE 2: Rendimiento y UX
- ✅ Paginación en pedidos y productos
- ✅ Next.js Image (configuración de dominios)
- ✅ Loading Skeletons en páginas de admin

### FASE 3: Limpieza y Mantenibilidad
- ✅ Componentes UI (ProductCard, Section, Container)
- ✅ Products API con filtros (featured, categoryId)
- ✅ Tipos TypeScript centralizados (src/types/)

### FASE 4: Funcionalidades Avanzadas
- ✅ WebSockets/SSE para notificaciones tiempo real
- ✅ Búsqueda debounceada (hook useDebounce)
- ⚫ Dark Mode (excluido por el usuario)

### FASE 5: Polish y Extras
- ✅ Tests Unitarios (Vitest + React Testing Library)
- ✅ Internacionalización (hook useTranslations)
- ✅ Error Boundaries + página 500

---

## NUEVAS PROPUESTAS DE MEJORA

## NIVEL 1: Quick Wins (1-2 días)

### 1.1 Consistencia de Código
**Problema:** No hay estándar de formato, cada开发者 formatea diferente.

**Cambios a realizar:**
- Agregar Prettier + ESLint
- Configurar lint-staged o husky para commits
- Crear `.prettierrc` y `.eslintrc.json`

**Prueba:**
1. npm run lint pasa sin errores
2. git commit hook formatea automáticamente

---

### 1.2 Más Tests de Hooks
**Problema:** Solo hay test de useDebounce, hooks críticos sin cobertura.

**Cambios a realizar:**
- Tests para useNotifications
- Tests para useCart (zustand store)
- Tests para useOrders

**Prueba:**
1. npm run test → más de 10 tests pasando
2. Coverage > 50%

---

### 1.3 Barrel Exports
**Carpetas sin index.ts dificultan imports.

**Cambios a realizar:**
- Crear index.ts en: components/ui, features/orders, features/products, lib/api, hooks

**Prueba:**
1. Import paths más limpios
2. IDE autocomplete funciona mejor

---

## NIVEL 2: Estabilidad (1 semana)

### 2.1 React Query Configuración
**Problema:** No hay cache óptimo, cada componente hace sus propias llamadas.

**Cambios a realizar:**
- Configurar QueryClientProvider global
- Crear useQuery configs con staleTime apropiado
- Agregar prefetching en páginas relacionadas

**Prueba:**
1. Menos requests a la API en navegación
2. Estado cache persiste entre páginas

---

### 2.2 Rate Limiting en APIs
**Problema:** APIs expuestas a ataques de fuerza bruta.

**Cambios a realizar:**
- Agregar rate-limit a endpoints críticos (/auth/*)
- Implementar en middleware o endpoint específico
- Configurar límites por IP/user

**Prueba:**
1. POST /auth/login > 5 veces → 429 Too Many Requests
2. Logs muestran intentos bloqueados

---

### 2.3 Tests de Componentes UI
**Problema:** No hay tests de componentes visuales.

**Cambios a realizar:**
- Tests para ProductCard (render, hover states)
- Tests para OrderCard (status colors, actions)
- Tests para AddToCartButton

**Prueba:**
1. coverage de componentes > 60%

---

## NIVEL 3: Profesionalización (2-3 semanas)

### 3.1 CI/CD con GitHub Actions
**Problema:** No hay validación automática en push.

**Cambios a realizar:**
- Crear `.github/workflows/ci.yml`
- Runs: lint, build, test en cada PR
- Badge de status en README

**Prueba:**
1. PR triggea pipeline automáticamente
2. Merge bloqueado si build/test falla

---

### 3.2 E2E con Playwright
**Problema:** No hay tests de flujos completos.

**Cambios a realizar:**
- Instalar Playwright
- Tests: login → add to cart → checkout
- Tests: admin order management

**Prueba:**
1. npm run e2e → tests de flujos críticos pasando

---

### 3.3 Sentry para Error Tracking
**Problema:** No hay forma detrackear errores en producción.

**Cambios a realizar:**
- Agregar @sentry/nextjs
- Configurar DSN en environment
- Agregar contexto de usuario en errores

**Prueba:**
1. Errors en producción aparecen en Sentry dashboard

---

## NIVEL 4: Escalabilidad (1 mes+)

### 4.1 Rediseño Landing con Tailwind
**Problema:** Landing usa CSS inline, difícil de mantener.

**Cambios a realizar:**
- Convertir page.tsx a componentes Tailwind
- Usar los componentes UI ya creados
- Mantener mismo diseño visual

**Prueba:**
1. Landing idéntico visualmente
2. Mantenibilidad mejorada (styles en clases)

---

### 4.2 Dark Mode
**Problema:** Solo modo claro disponible.

**Cambios a realizar:**
- Crear ThemeProvider (Zustand o Context)
- Agregar toggle en navbar
- Variables CSS para theme colors

**Prueba:**
1. Toggleswitch cambia tema
2. Todas las páginas respetan theme
3. Persiste en localStorage

---

### 4.3 PWA - Service Workers
**Problema:** No funciona offline.

**Cambios a realizar:**
- Agregar next-pwa o similar
- Configurar manifest.json
- Cache de assets estáticos

**Prueba:**
1. Installable como app
2. Funciona offline (partial)

---

## Resumen de Mejoras Pendientes

| Nivel | Prioridad | Tiempo | Impacto |
|-------|-----------|--------|---------|
| 1. Quick Wins | 🔴 Alta | 1-2 días | Consistencia código |
| 2. Estabilidad | 🔴 Alta | 1 semana | Performance + seguridad |
| 3. Profesional | 🟡 Media | 2-3 sem | DevOps + testing |
| 4. Escalabilidad | 🟢 Baja | 1 mes | UX + offline |

---

## Order Sugerido de Implementación

1. **Prettier + ESLint** - Base para cualquier开发
2. **Más tests** - Confianza al hacer cambios
3. **React Query** - Performance inmediato
4. **CI/CD** - Quality gate en merges
5. **E2E** - Confianza en flujos críticos

---

## Notas Importantes

- **No modificar login/register** - Mantener funcionando
- **Probar cada cambio** - npm run dev + build
- **Verificar tipos** - npm run build sin errores
- **Tests deben pasar** - npm run test

---

## CORRECCIONES CRÍTICAS - Code Review

### SEGURIDAD (CRÍTICO - Corregir antes de producción)

#### S1: APIs sin autenticación
**Archivos:** `src/app/api/orders/summary/route.ts`, `src/app/api/orders/daily/route.ts`, `src/app/api/products/route.ts`

**Problema:** Rutas expuestas sin check de auth - cualquier usuario puede acceder a datos financieros y crear productos.

**Cambios:**
- Agregar `getUser()` al inicio de GET /summary y GET /daily
- Agregar role check en POST /products (solo admin)
- Agregar role check en PATCH/DELETE /products/[id] (solo admin)

---

#### S2: CSV Injection
**Archivo:** `src/app/api/reports/export/route.ts:28-39`

**Problema:** Nombres de usuarios injectados en CSV pueden ejecutar fórmulas maliciosas en Excel.

**Cambios:**
- Sanitizar celdas que empiezan con `=`, `+`, `-`, `@`, `\t` con prefijo `'`

---

#### S3: Order Status sin autorización
**Archivo:** `src/app/api/orders/[id]/route.ts:69-78`

**Problema:** Cualquier usuario puede cambiar status de cualquier pedido.

**Cambios:**
- Agregar check: solo staff (vendedor/manager_admin) puede avanzar status
- Solo owner o staff puede cancelar

---

#### S4: Race condition en stock
**Archivo:** `src/app/api/orders/route.ts:124-194`

**Problema:** Dos pedidos simultáneos pueden consumir el mismo stock.

**Cambios:**
- Usar transacción de base de datos con row-level locking
- O usar RPC de Supabase para decremento atómico

---

#### S5: Rate Limiter inútil en producción
**Archivo:** `src/lib/rate-limit.ts`

**Problema:** Map in-memory no funciona en serverless/Vercel (instancias separadas).

**Cambios:**
- Migrar a Redis o Upstash para rate limiting real
- Agregar cleanup de entradas expiradas

---

#### S6: SSE sin autenticación
**Archivo:** `src/app/api/notifications/stream/route.ts`

**Problema:** Cualquiera puede recibir notificaciones de pedidos en tiempo real.

**Cambios:**
- Agregar auth check antes de establecer stream

---

### BUGS DE PRODUCCIÓN (ALTO - Corregir pronto)

#### B1: Image upload no funciona
**Archivo:** `src/features/products/components/ProductFormModal.tsx:68-109`

**Problema:** El usuario selecciona imagen pero nunca se sube.

**Cambios:**
- Implementar upload de imagen antes de crear producto
- Usar returned URL en el mutation

---

#### B2: daily-closes POST no existe
**Archivo:** `src/app/api/daily-closes/route.ts`

**Problema:** Frontend POSTea pero no hay handler - 405 Method Not Allowed.

**Cambios:**
- Agregar POST handler para crear daily closes

---

#### B3: categories API no envía cookies
**Archivo:** `src/lib/api/categories.ts:6`

**Problema:** `credentials: 'include'` faltante - 401 en requests.

**Cambios:**
- Agregar credentials a fetch options

---

#### B4: Auth no detecta cambios de sesión
**Archivo:** `src/features/auth/hooks/use-auth.tsx:31-57`

**Problema:** Expiración de sesión no se detecta - usuario queda en estado zombie.

**Cambios:**
- Usar `supabase.auth.onAuthStateChange()` para escuchar cambios

---

#### B5: Register redirige sin verificar email
**Archivo:** `src/features/auth/hooks/use-auth.tsx:76-86`

**Problema:** Redirige antes de confirmar que email fue verificado.

**Cambios:**
- Verificar `data.session` antes de redirigir

---

#### B6: useNotifications reconnect loop
**Archivo:** `src/hooks/use-notifications.ts:38-42`

**Problema:** Reconexión infinita en errores - consume recursos.

**Cambios:**
- Agregar exponential backoff con max retries

---

### CALIDAD DE CÓDIGO (MEDIO - Mantenimiento)

#### C1: Código duplicado
**Problema:** `isStaff` en 3 archivos, `statusConfig` en 4+ archivos.

**Cambios:**
- Consolidar `isStaff` en `src/lib/auth/helpers.ts`
- Consolidar `statusConfig` en `src/domain/types/config.ts`

---

#### C2: Tipos `any` excesivos
**Archivos:** contabilidad, admin, pedidos usan `any[]`

**Cambios:**
- Reemplazar con tipos de `src/domain/types/database.ts`

---

#### C3: Landing page sin Tailwind
**Archivo:** `src/app/page.tsx` (413 líneas inline styles)

**Cambios:**
- Convertir a componentes Tailwind (ver Nivel 4.1)

---

#### C4: Código muerto
**Archivos:** `use-translations.ts`, `use-service-worker.ts`, next-intl sin usar

**Cambios:**
- Eliminar o integrar los hooks

---

#### C5: Character chino en error boundary
**Archivo:** `src/components/error-boundary.tsx:46`

**Cambios:**
- Cambiar `发生` por texto correcto en español

---

#### C6: /usuarios accesible sin rol admin
**Archivo:** `src/app/(dashboard)/usuarios/page.tsx`

**Cambios:**
- Mover a `/admin/usuarios` o agregar role check

---

### MEJORAS MENORES (BAJO)

- Eliminar `eslint.config.mjs` (usar solo `.eslintrc.json`)
- Agregar security headers en `next.config.js`
- Crear `manifest.json` o eliminar referencia
- Agregar `loading="lazy"` a imágenes below-the-fold

---

## Orden de Implementación Sugerido

### Semana 1: Seguridad Crítica
1. S1 - APIs sin auth
2. S3 - Order status authorization
3. S2 - CSV injection

### Semana 2: Bugs de Producción
4. B1 - Image upload
5. B2 - daily-closes POST
6. B3 - categories credentials
7. B4 - Auth state listener
8. S6 - SSE auth

### Semana 3: Arquitectura y Calidad
9. S4 - Race condition stock (transacciones)
10. C1 - Código duplicado
11. C2 - Tipos any
12. C5 - Error boundary

### Semana 4: Refinamiento
13. S5 - Rate limiter Redis
14. B5 - Register flow
15. B6 - Reconnect backoff
16. C3 - Landing Tailwind
17. C4 - Código muerto
18. C6 - /usuarios protection

---

*Documento actualizado: 2026-05-16*
*Estado: FASE 1-5 completadas + Code Review Corrections añadidas*