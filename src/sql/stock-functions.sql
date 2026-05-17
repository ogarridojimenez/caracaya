-- Funciones RPC para gestión atómica de stock
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- 1. Función para decrementar stock de forma atómica
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_success BOOLEAN := false;
  v_current_stock INT;
BEGIN
  -- Obtener stock actual
  SELECT stock_quantity INTO v_current_stock
  FROM products
  WHERE id = p_product_id;

  -- Verificar si hay stock suficiente
  IF v_current_stock IS NULL THEN
    RETURN false;
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN false;
  END IF;

  -- Decrementar stock
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id
  AND stock_quantity >= p_quantity;

  IF FOUND THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 2. Función para incrementar stock (rollback)
CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_quantity INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN FOUND;
END;
$$;

-- 3. Función para obtener stock actual
CREATE OR REPLACE FUNCTION get_product_stock(p_product_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock INT;
BEGIN
  SELECT stock_quantity INTO v_stock
  FROM products
  WHERE id = p_product_id;

  RETURN COALESCE(v_stock, 0);
END;
$$;

-- Verificar que se crearon correctamente
SELECT proname, pronargs
FROM pg_proc
WHERE proname IN ('decrement_stock', 'increment_stock', 'get_product_stock')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');