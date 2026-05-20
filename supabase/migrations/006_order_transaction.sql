-- Función atómica para creación de pedidos
-- Resuelve race condition: verifica stock, decrementa, crea order + items en una transacción

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id UUID,
  p_items JSONB,        -- [{product_id, product_name, quantity, unit_price, total_price, notes}]
  p_subtotal DECIMAL,
  p_tax_amount DECIMAL,
  p_discount_amount DECIMAL,
  p_total DECIMAL,
  p_pickup_time TIMESTAMPTZ,
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product RECORD;
  v_order JSONB;
BEGIN
  -- Generar número de orden único
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');

  -- Verificar stock y decrementar para cada item (bloqueo por fila con FOR UPDATE)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, stock_quantity, is_available, name
    INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
    END IF;

    IF NOT v_product.is_available THEN
      RAISE EXCEPTION 'Producto no disponible: %', v_product.name;
    END IF;

    IF v_product.stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Stock insuficiente para %: disponible %, solicitado %',
        v_product.name, v_product.stock_quantity, v_item->>'quantity';
    END IF;

    -- Decrementar stock
    UPDATE products
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT,
        updated_at = NOW()
    WHERE id = v_product.id;
  END LOOP;

  -- Crear la orden
  INSERT INTO orders (user_id, order_number, status, subtotal, tax_amount, discount_amount, total, pickup_time, notes)
  VALUES (p_user_id, v_order_number, 'pending', p_subtotal, p_tax_amount, p_discount_amount, p_total, p_pickup_time, p_notes)
  RETURNING id INTO v_order_id;

  -- Crear los items de la orden
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, notes)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'quantity')::INT,
      (v_item->>'unit_price')::DECIMAL,
      (v_item->>'total_price')::DECIMAL,
      v_item->>'notes'
    );
  END LOOP;

  -- Retornar la orden creada con sus items
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'user_id', o.user_id,
    'status', o.status,
    'subtotal', o.subtotal,
    'tax_amount', o.tax_amount,
    'discount_amount', o.discount_amount,
    'total', o.total,
    'pickup_time', o.pickup_time,
    'notes', o.notes,
    'created_at', o.created_at,
    'order_items', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price,
        'notes', oi.notes
      ))
      FROM order_items oi
      WHERE oi.order_id = o.id
    )
  ) INTO v_order
  FROM orders o
  WHERE o.id = v_order_id;

  RETURN v_order;
END;
$$;
