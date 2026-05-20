# Plan de Correcciones - Caraballo

## FASE 1: CRÍTICOS DE SEGURIDAD (Sesión 1)
**Objetivo:** Arreglar fallos que permiten acceso no autorizado o robo de datos

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 1 | Precio sin verificación server-side | `api/orders/route.ts` | Consultar precio real de la DB y validar |
| 2 | userId permite ver pedidos ajenos | `api/orders/route.ts:77` | Eliminar parámetro userId o validar rol staff |
| 4 | Password reset poisoning | `api/auth/recover/route.ts` | Usar URL fija del env, no Origin header |
| 7 | Schema productos usa `stock` vs `stock_quantity` | `lib/validations/product.ts` | Corregir a `stock_quantity` |

---

## FASE 2: ENDPOINTS ROTOS (Sesión 2)
**Objetivo:** Hacer funcionales las APIs que fallan

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 3 | Double request.json() categorías | `api/categories/route.ts:32,45` | Leer body una sola vez |
| 6 | daily-closes usa columnas inexistentes | `api/daily-closes/route.ts` | Usar columnas reales o crear migración |
| 8 | Admin API usa clave errónea | `api/auth/users/route.ts` | Usar service role client |

---

## FASE 3: AUTENTICACIÓN Y RUTAS (Sesión 3)
**Objetivo:** Arreglar problemas de auth y acceso

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 9 | /products sin autenticación | `src/app/products/page.tsx` | Mover a grupo (dashboard) o agregar auth |
| 10 | Double LayoutProviders | `app/(auth)/layout.tsx` | Quitar provider del layout auth |
| 12 | Login sin validación Zod | `api/auth/login/route.ts` | Usar schema de auth.ts |

---

## FASE 4: CALIDAD Y CONSISTENCIA (Sesión 4)
**Objetivo:** Limpiar código y mejorar mantenibilidad

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 19 | Uso extensivo de `any` | admin, contabilidad, usuarios | Reemplazar con tipos reales |
| 20 | Mezcla Tailwind vs inline styles | contabilidad, admin/usuarios | Migrar a Tailwind |
| 21 | `<img>` en vez de `<Image>` | varios | Reemplazar con Next Image |
| 22 | 500.tsx código muerto | `app/500.tsx` | Eliminar o convertir a error.tsx |
| 24 | Página /usuarios duplicada | `app/usuarios` vs `app/admin/usuarios` | Unificar o eliminar |

---

## FASE 5: PERFORMANCE Y OPTIMIZACIÓN (Sesión 5)
**Objetivo:** Mejorar velocidad y eficiencia

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 14 | Rate limiting inútil en serverless | `lib/rate-limit.ts` | Mover a Edge Middleware o eliminar |
| 15 | Reportes cargan datos en memoria | `api/reports/top-products/route.ts` | Usar función SQL existente |
| 16 | Middleware consulta DB cada request | `middleware.ts` | Agregar caché o usar JWT claims |
| 17 | División por cero en dashboard | `vendedor/page.tsx:168` | Validar antes de dividir |

---

## FASE 6: ERROR HANDLING Y UX (Sesión 6)
**Objetivo:** Mejorar manejo de errores y experiencia

| # | Problema | Archivo | Solución |
|---|----------|---------|----------|
| 11 | `.select('*')` expone datos | varios endpoints | Especificar columnas exactas |
| 13 | Errores internos filtrados | `api/auth/register/route.ts` | Sanear mensajes de error |
| 25 | Link incorrecto post-registro | `register/page.tsx:65` | Cambiar "Regístrate" → "Inicia sesión" |
| 26 | Fonts via @import | `page.tsx` | Usar next/font |
| 28 | Sin error.tsx por ruta | dashboard | Agregar error boundaries |

---

## FASE 7: TESTING Y LIMPIEZA FINAL (Sesión 7)
**Objetivo:** Aumentar cobertura y limpiar código muerto

| # | Problema | Solución |
|---|----------|----------|
| 18 | RLS con roles obsoletos | Crear migración para actualizar |
| 23 | global-error anidado incorrectamente | Corregir o eliminar |
| 27 | Scroll listener sin passive | Agregar `{ passive: true }` |
| 29 | Solo 2 archivos de test | Agregar tests de API, componentes |

---

## Resumen por sesión

| Sesión | Foco | Problemas |
|--------|------|-----------|
| 1 | Seguridad crítica | 1, 2, 4, 7 |
| 2 | Endpoints rotos | 3, 6, 8 |
| 3 | Auth y rutas | 9, 10, 12 |
| 4 | Calidad código | 19, 20, 21, 22, 24 |
| 5 | Performance | 14, 15, 16, 17 |
| 6 | Error handling | 11, 13, 25, 26, 28 |
| 7 | Testing y cleanup | 18, 23, 27, 29 |

**Total: 7 sesiones × ~1 hora = 7 horas de trabajo**

---

## Notas

- Al final de cada fase: `npm run build` + `npm run test`
- Prioridad: Fases 1 y 2 son las más urgentes
- Algunas correcciones pueden requerir migración de DB