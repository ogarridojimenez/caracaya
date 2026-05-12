# Instrucciones para configurar Supabase

## Paso 1: Ejecutar el Schema SQL

1. Ve a tu proyecto en Supabase:
   https://supabase.com/dashboard/project/uqmsqprxapdlkgwvaine

2. Click en **SQL Editor** en el menú lateral izquierdo

3. Crea una nueva query

4. Copia y pega TODO el contenido de `supabase/migrations/001_initial_schema.sql`

5. Click en **RUN** (botón verde) o presiona `Ctrl+Enter`

## Paso 2: Ejecutar Seed Data (datos de ejemplo)

1. Crea otra nueva query en SQL Editor

2. Copia y pega el contenido de `supabase/migrations/002_seed_data.sql`

3. Click en **RUN**

## Paso 3: Crear bucket de Storage para imágenes

1. Ve a **Storage** en el menú lateral

2. Click en **New bucket**

3. Configura:
   - **Bucket name**: `products`
   - Marque **Public bucket** ✓

4. Click en **Create bucket**

## Paso 4: Verificar que todo quedó creado

Ve a **Table Editor** y verifica que existan estas tablas:
- `users`
- `categories`
- `products`
- `orders`
- `order_items`
- `transactions`

Y que `products` tenga datos de ejemplo (deberías ver Americano, Latte, etc.)

---

**Listo!** Tu app Coffee está configurada y lista para usar.

El archivo `.env.local` ya tiene las credenciales:
- `NEXT_PUBLIC_SUPABASE_URL=https://uqmsqprxapdlkgwvaine.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gpzxJBKjvBLJM9Ihy4ZGMw_m5rhWvhs`
