-- =====================================================
-- CIERRE DE CAJA - Ventas manuales por vendedor
-- =====================================================

-- Tabla para registrar cada cierre de caja
CREATE TABLE IF NOT EXISTS daily_closes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  close_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, close_date)
);

-- Items del cierre de caja
CREATE TABLE IF NOT EXISTS daily_close_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_close_id UUID NOT NULL REFERENCES daily_closes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_daily_closes_user ON daily_closes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_closes_date ON daily_closes(close_date);
CREATE INDEX IF NOT EXISTS idx_daily_close_items_close ON daily_close_items(daily_close_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_daily_closes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_daily_closes_updated_at ON daily_closes;
CREATE TRIGGER tr_daily_closes_updated_at
  BEFORE UPDATE ON daily_closes
  FOR EACH ROW EXECUTE FUNCTION update_daily_closes_updated_at();

-- RLS para daily_closes
ALTER TABLE daily_closes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_close_items ENABLE ROW LEVEL SECURITY;

-- Vendedores y admins pueden ver todos los cierres
CREATE POLICY "Staff can view daily closes" ON daily_closes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('vendedor', 'manager_admin')
    )
  );

CREATE POLICY "Staff can view daily close items" ON daily_close_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_closes dc
      WHERE dc.id = daily_close_id
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('vendedor', 'manager_admin')
      )
    )
  );

-- Solo admins pueden crear/modificar cierres (vendedores también pueden crear)
CREATE POLICY "Staff can create daily closes" ON daily_closes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('vendedor', 'manager_admin')
    )
  );

CREATE POLICY "Managers can update daily closes" ON daily_closes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager_admin'
    )
  );

CREATE POLICY "Managers can delete daily closes" ON daily_closes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager_admin'
    )
  );

-- Items solo pueden ser insertados por staff
CREATE POLICY "Staff can manage daily close items" ON daily_close_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM daily_closes dc
      WHERE dc.id = daily_close_id
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('vendedor', 'manager_admin')
      )
    )
  );