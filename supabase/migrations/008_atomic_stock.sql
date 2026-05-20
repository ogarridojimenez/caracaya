-- Decremento atómico de stock para evitar sobreventa en concurrencia
-- Ejecutar en Supabase SQL Editor

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id
    AND stock_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
