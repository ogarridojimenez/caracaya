# Plan de Mejoras - Caracaya App

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

*Documento actualizado: 2026-05-16*
*Estado: FASE 1-5 completadas, nuevas mejoras propuestas*