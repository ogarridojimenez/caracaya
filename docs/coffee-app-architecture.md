# Coffee App — Arquitectura de Software

## 1. Stack Tecnológico y Justificación de Capas

### Stack
- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **BaaS:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Estado:** Zustand (cliente) + React Query (servidor)
- **Despliegue:** Vercel (frontend) + Supabase Cloud

### Separación de Capas

```
┌─────────────────────────────────────────────────────┐
│                    PRESENTATION                     │
│         Pages, Components, Hooks (UI only)           │
├─────────────────────────────────────────────────────┤
│                   APPLICATION                       │
│    Server Actions, API Routes, Business Logic       │
├─────────────────────────────────────────────────────┤
│                    DOMAIN                           │
│     Types, Validations, Constants, Domain Rules      │
├─────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE                      │
│   Supabase Client, API Calls, Auth, Storage         │
└─────────────────────────────────────────────────────┘
```

**Justificación:**
- **Presentation:** Solo renderizado y eventos UI. Sin lógica de negocio.
- **Application:** Coordination entre domain e infrastructure. Aquí viven Server Actions.
- **Domain:** Types (single source of truth), validaciones de negocio, constantes. Independiente de framework.
- **Infrastructure:** Acceso a Supabase. Es el único layer que cambia si cambias BaaS.

---

## 2. Estructura de Carpetas

```
coffeeshop/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Dashboard group
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── transactions/
│   │   │   └── layout.tsx
│   │   ├── api/                      # API Routes (if needed)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/                    # Shared UI components
│   │   ├── ui/                       # Primitives (Button, Input, Card...)
│   │   ├── forms/                    # Form components
│   │   └── layout/                   # Header, Sidebar, Footer
│   │
│   ├── features/                     # Feature-based modules
│   │   ├── products/
│   │   │   ├── components/           # Product-specific components
│   │   │   ├── hooks/                # useProducts, useProduct...
│   │   │   ├── types.ts              # Product domain types
│   │   │   └── constants.ts
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── constants.ts
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types.ts
│   │   │   └── constants.ts
│   │   └── auth/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── lib/                   # Auth helpers
│   │
│   ├── lib/                          # Infrastructure shared
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   ├── middleware.ts        # Auth middleware
│   │   │   └── types.ts              # Supabase generated types
│   │   ├── api/
│   │   │   └── client.ts             # HTTP client wrapper
│   │   └── utils/                    # Utility functions
│   │
│   ├── domain/                       # Cross-cutting domain
│   │   ├── types/                    # Global base types
│   │   │   ├── database.ts          # DB-generated types
│   │   │   ├── index.ts
│   │   │   └── shared.ts             # Enums, constants
│   │   ├── validations/              # Zod schemas
│   │   └── constants/
│   │
│   └── store/                        # Zustand stores
│       ├── cart-store.ts
│       └── ui-store.ts
│
├── supabase/
│   ├── migrations/                   # SQL migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                      # Seed data
│
├── public/
├── .env.local
├── .env.example
└── package.json
```

### Rationale de la Estructura

- **`features/`**: Cada módulo de negocio es autocontenido. Cambios en órdenes no rompen productos. Fácil de testear.
- **`lib/supabase/`**: Cliente de Supabase en un solo lugar. Cambio de BaaS = solo aquí.
- **`domain/types/`**: Types generados de la BD son la fuente de verdad. Todo referencing `domain/types`.
- **`components/ui/`**: Componentes puramente presentacionales. Sin acceso a datos.

---

## 3. Esquema de Base de Datos (PostgreSQL/Supabase)

### Diagrama de Relaciones

```
categories ─────┐
               │
products ──────┼── order_items ───── orders ───── users
                    │
              transactions
                    │
              payment_methods
```

### Script SQL Completo

```sql
-- =====================================================
-- COFFEE APP - Schema PostgreSQL (Supabase)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE order_status AS ENUM (
  'pending',      -- Order created, awaiting confirmation
  'confirmed',   -- Confirmed by staff
  'preparing',   -- Being prepared
  'ready',       -- Ready for pickup
  'completed',   -- Picked up
  'cancelled'    -- Cancelled
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

CREATE TYPE payment_method AS ENUM (
  'cash',
  'card',
  'transfer'
);

CREATE TYPE transaction_type AS ENUM (
  'sale',
  'refund',
  'expense',
  'income'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'barista', 'manager', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,  -- For margin calculation
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  preparation_time_minutes INTEGER DEFAULT 5,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,  -- Human readable: ORD-0001
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  pickup_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,  -- Snapshot at time of order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,  -- Snapshot at time of order
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions (Accounting)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  reference_id TEXT,  -- External payment reference
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = true;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Products: Public read
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Products: Staff can modify
CREATE POLICY "Staff can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('barista', 'manager', 'admin')
    )
  );

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Orders: Users see own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Orders: Staff see all
CREATE POLICY "Staff can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('barista', 'manager', 'admin')
    )
  );

-- Orders: Users can create
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Must match order access
CREATE POLICY "Order items follow order access" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('barista', 'manager', 'admin')
        )
      )
    )
  );

-- Transactions: Staff only
CREATE POLICY "Staff can manage transactions" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('manager', 'admin')
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM orders;
  NEW.order_number = 'ORD-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Auto-decrement stock on order
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_decrement_stock
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION decrement_stock();

-- =====================================================
-- VIEWS
-- =====================================================

-- Daily sales summary
CREATE VIEW daily_sales AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue,
  SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END) as refunds
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Low stock products
CREATE VIEW low_stock_products AS
SELECT
  p.id,
  p.name,
  p.stock_quantity,
  p.low_stock_threshold,
  c.name as category
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.stock_quantity <= p.low_stock_threshold
AND p.is_available = true;

-- Transaction summary
CREATE VIEW transaction_summary AS
SELECT
  type,
  payment_method,
  SUM(amount) as total_amount,
  COUNT(*) as count
FROM transactions
GROUP BY type, payment_method;
```

---

## 4. Tipos TypeScript Globales

```typescript
// =====================================================
// src/domain/types/database.ts
// Generated types from Supabase schema
// =====================================================

export type UUID = string;
export type Timestamptz = string; // ISO 8601

// Enums
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type TransactionType = 'sale' | 'refund' | 'expense' | 'income';
export type UserRole = 'customer' | 'barista' | 'manager' | 'admin';

// =====================================================
// Table Types
// =====================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'> & {
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
          id?: UUID;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: UUID;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
          id?: UUID;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: Timestamptz;
        };
        Update: Partial<Omit<OrderItem, 'id' | 'order_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'> & {
          id?: UUID;
          created_at?: Timestamptz;
        };
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
    };
    Views: {
      daily_sales: {
        Row: DailySale;
      };
      low_stock_products: {
        Row: LowStockProduct;
      };
      transaction_summary: {
        Row: TransactionSummary;
      };
    };
  };
}

// =====================================================
// Entity Types
// =====================================================

export interface User {
  id: UUID;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Product {
  id: UUID;
  category_id: UUID;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  cost: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  preparation_time_minutes: number | null;
  is_featured: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID | null;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  pickup_time: Timestamptz | null;
  completed_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: Timestamptz;
}

export interface Transaction {
  id: UUID;
  order_id: UUID | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  reference_id: string | null;
  processed_by: UUID | null;
  created_at: Timestamptz;
}

// =====================================================
// View Types
// =====================================================

export interface DailySale {
  date: string;
  order_count: number;
  revenue: number;
  refunds: number;
}

export interface LowStockProduct {
  id: UUID;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  category: string;
}

export interface TransactionSummary {
  type: TransactionType;
  payment_method: PaymentMethod;
  total_amount: number;
  count: number;
}

// =====================================================
// Composite Types (for joins and nested data)
// =====================================================

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface OrderWithDetails extends Order {
  items: (OrderItem & { product: Product })[];
  user: User | null;
  transactions: Transaction[];
}

// =====================================================
// API Response Types
-- =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 5. Análisis de Riesgos Técnicos

### Riesgo 1: Concurrencia en Inventario (Stock Race Condition)

**Descripción del riesgo:**
Cuando múltiples usuarios intentan comprar el último producto disponible simultáneamente, el decremento de stock en `order_items` trigger puede producir números negativos o inventario inconsistente. Sin transacciones serializadas, dos pedidos casi simultáneos podrían ambos decrementar de 1 → 0.

**Mitigación implementada:**

```sql
-- 1. CHECK constraint para prevención primaria
ALTER TABLE products
ADD CONSTRAINT stock_non_negative CHECK (stock_quantity >= 0);

-- 2. Función de decremento con locking
CREATE OR REPLACE FUNCTION decrement_stock_safe()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id
  AND stock_quantity >= NEW.quantity;  -- Solo si hay stock
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Row-level locking en aplicación
```

```typescript
// En Server Action o Edge Function
async function createOrderWithStockCheck(items: OrderItem[]) {
  return await supabase.rpc('create_order_with_stock', {
    items_data: items,
    user_id: userId
  }, {
    // Preferir edge para menor latencia
    geoLocation: 'auto'
  });
}
```

**Nivel de riesgo:** 🔴 Alto → 🟡 Medio (mitigado)

---

### Riesgo 2: Consistencia en Transacciones Financieras

**Descripción del riesgo:**
Si un pedido se crea pero falla la inserción de la transacción (o viceversa), los números de contabilidad no matchearán con los pedidos. En un sistema de cafetería esto puede significar "dinero perdido" o "inventario descontado sin registro de pago".

**Mitigación implementada:**

```sql
-- Función transaccional atómica
CREATE OR REPLACE FUNCTION create_order_transactional(
  p_order_data JSONB,
  p_items_data JSONB,
  p_transaction_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- 1. Crear orden
    INSERT INTO orders (user_id, status, subtotal, tax_amount, discount_amount, total, notes, pickup_time)
    VALUES (
      p_order_data->>'user_id',
      'pending',
      (p_order_data->>'subtotal')::DECIMAL,
      (p_order_data->>'tax_amount')::DECIMAL,
      (p_order_data->>'discount_amount')::DECIMAL,
      (p_order_data->>'total')::DECIMAL,
      p_order_data->>'notes',
      p_order_data->>'pickup_time'
    )
    RETURNING id INTO v_order_id;

    -- 2. Crear items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items_data)
    LOOP
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (
        v_order_id,
        (item->>'product_id')::UUID,
        item->>'product_name',
        (item->>'quantity')::INTEGER,
        (item->>'unit_price')::DECIMAL,
        (item->>'total_price')::DECIMAL
      );
    END LOOP;

    -- 3. Crear transacción
    INSERT INTO transactions (order_id, type, amount, description, payment_method, payment_status, processed_by)
    VALUES (
      v_order_id,
      p_transaction_data->>'type',
      (p_transaction_data->>'amount')::DECIMAL,
      p_transaction_data->>'description',
      p_transaction_data->>'payment_method',
      'paid',
      p_transaction_data->>'processed_by'
    )
    RETURNING id INTO v_transaction_id;

    -- Commit automático si todo OK
    RETURN v_order_id;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback automático
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Wrapper en infraestructura
async function createOrderTransactionSafe(orderData: CreateOrderDTO) {
  const { data, error } = await supabase.rpc('create_order_transactional', {
    p_order_data: orderData.order,
    p_items_data: orderData.items,
    p_transaction_data: orderData.transaction
  });

  if (error) {
    // Log para auditoría
    console.error('Order transaction failed:', {
      orderData,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw new Error('ORDER_CREATION_FAILED');
  }

  return data;
}
```

**Nivel de riesgo:** 🔴 Alto → 🟢 Bajo (mitigado con función atómica)

---

## 6. Notas de Implementación

### Server Actions vs API Routes
- **Server Actions** para mutaciones de datos (crear orden, actualizar producto)
- **API Routes** solo para webhooks externos o integraciones que requieren headers específicos

### Realtime para Dashboard
```typescript
// Suscribirse a cambios en órdenes para dashboard staff
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: 'status=eq.ready'
  }, (payload) => {
    // Notificar al staff que hay pedido listo
  })
  .subscribe();
```

### Testing Strategy
- Unit tests: Domain types y validations (Zod schemas)
- Integration tests: Supabase functions con test database
- E2E tests: Playwright para flujos críticos (crear pedido, checkout)
