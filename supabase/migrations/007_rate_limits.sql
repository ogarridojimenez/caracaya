-- Tabla para rate limiting persistente en serverless
-- Reemplaza el Map() en memoria que se resetea en cada invocación

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'default',
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, endpoint)
);

-- Índice para búsquedas rápidas por identifier + endpoint
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint
  ON rate_limits(identifier, endpoint);

-- Índice para limpieza de registros expirados
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON rate_limits(window_start);

-- Función RPC para verificar y actualizar rate limit de forma atómica
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT DEFAULT 'default',
  p_max_requests INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
  -- Buscar registro existente
  SELECT count, window_start INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint;

  IF NOT FOUND THEN
    -- Primer request: crear registro
    INSERT INTO rate_limits (identifier, endpoint, count, window_start)
    VALUES (p_identifier, p_endpoint, 1, v_now);
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1);
  END IF;

  -- Si la ventana expiró, resetear
  IF v_record.window_start < v_window_start THEN
    UPDATE rate_limits
    SET count = 1, window_start = v_now
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1);
  END IF;

  -- Dentro de la ventana: verificar límite
  IF v_record.count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after', EXTRACT(EPOCH FROM (v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL - v_now))::INTEGER
    );
  END IF;

  -- Incrementar contador
  UPDATE rate_limits
  SET count = count + 1
  WHERE identifier = p_identifier AND endpoint = p_endpoint;

  RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - v_record.count - 1);
END;
$$;

-- Función para limpiar registros expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_rate_limits(p_max_age_seconds INTEGER DEFAULT 3600)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - (p_max_age_seconds || ' seconds')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Actualizar get_top_products con soporte de fechas
CREATE OR REPLACE FUNCTION get_top_products(
  p_limit INT DEFAULT 10,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
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
    AND (p_start_date IS NULL OR o.created_at >= p_start_date)
    AND (p_end_date IS NULL OR o.created_at <= p_end_date)
  GROUP BY oi.product_name
  ORDER BY total_quantity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
