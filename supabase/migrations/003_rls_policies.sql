-- =====================================================
-- RLS POLICIES - Roles: cliente, vendedor, manager_admin
-- =====================================================

-- Limpiar policies existentes
DROP POLICY IF EXISTS "Public user view" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Manager can manage users" ON users;
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
DROP POLICY IF EXISTS "Staff can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Manager can manage categories" ON categories;
DROP POLICY IF EXISTS "Cliente see own orders" ON orders;
DROP POLICY IF EXISTS "Vendedor see all orders" ON orders;
DROP POLICY IF EXISTS "Cliente can create own orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
DROP POLICY IF EXISTS "Access own order items" ON order_items;
DROP POLICY IF EXISTS "Manager can view transactions" ON transactions;
DROP POLICY IF EXISTS "Manager can manage transactions" ON transactions;

-- =====================================================
-- USERS
-- =====================================================
CREATE POLICY "Public user view" ON users FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Manager can manage users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'manager_admin')
);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE POLICY "Anyone can view available products" ON products FOR SELECT USING (is_available = true);
CREATE POLICY "Staff can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('vendedor', 'manager_admin'))
);

-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Manager can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'manager_admin')
);

-- =====================================================
-- ORDERS
-- =====================================================
CREATE POLICY "Cliente see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Vendedor see all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('vendedor', 'manager_admin'))
);
CREATE POLICY "Cliente can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('vendedor', 'manager_admin'))
);

-- =====================================================
-- ORDER_ITEMS
-- =====================================================
CREATE POLICY "Access own order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('vendedor', 'manager_admin'))
);

-- =====================================================
-- TRANSACTIONS
-- =====================================================
CREATE POLICY "Manager can view transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'manager_admin')
);
CREATE POLICY "Manager can manage transactions" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'manager_admin')
);
