-- =====================================================
-- FUNCIONES DE AGREGACIÓN PARA CONTABILIDAD
-- =====================================================

-- Función para ventas diarias
CREATE OR REPLACE FUNCTION get_daily_sales(start_date DATE, end_date DATE)
RETURNS TABLE (
  sale_date DATE,
  order_count BIGINT,
  total_sales DECIMAL(10, 2),
  total_refunds DECIMAL(10, 2),
  net_sales DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(*) as order_count,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END), 0) as total_sales,
    COALESCE(SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END), 0) as total_refunds,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) - 
      SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END), 0) as net_sales
  FROM orders o
  WHERE DATE(o.created_at) BETWEEN start_date AND end_date
  GROUP BY DATE(o.created_at)
  ORDER BY sale_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para resumen general
CREATE OR REPLACE FUNCTION get_sales_summary(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_orders BIGINT,
  completed_orders BIGINT,
  cancelled_orders BIGINT,
  gross_sales DECIMAL(10, 2),
  total_refunds DECIMAL(10, 2),
  net_sales DECIMAL(10, 2),
  avg_order_value DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END), 0) as gross_sales,
    COALESCE(SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END), 0) as total_refunds,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) - 
      SUM(CASE WHEN o.status = 'cancelled' THEN o.total ELSE 0 END), 0) as net_sales,
    COALESCE(
      SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END)::DECIMAL / 
      NULLIF(COUNT(CASE WHEN o.status = 'completed' THEN 1 END), 0), 
      0
    ) as avg_order_value
  FROM orders o
  WHERE DATE(o.created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Función para productos más vendidos
CREATE OR REPLACE FUNCTION get_top_products(limit_count INT DEFAULT 10)
RETURNS TABLE (
  product_name TEXT,
  total_quantity BIGINT,
  total_revenue DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_name,
    SUM(oi.quantity)::BIGINT as total_quantity,
    SUM(oi.total_price) as total_revenue
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status = 'completed'
  GROUP BY oi.product_name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
