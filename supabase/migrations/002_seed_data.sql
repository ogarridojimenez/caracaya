-- =====================================================
-- SEED DATA - Categorías y Productos de Ejemplo
-- =====================================================

-- Insertar categorías
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Bebidas Calientes', 'bebidas-calientes', 'Cafés y bebidas calientes', 1, true),
('Bebidas Frías', 'bebidas-frias', 'Bebidas frías y refrescantes', 2, true),
('Comidas', 'comidas', 'Sandwiches y snacks', 3, true),
('Postres', 'postres', 'Dulces y repostería', 4, true),
('Promociones', 'promociones', 'Ofertas especiales', 5, true);

-- Obtener IDs de categorías para usar en productos
DO $$
DECLARE
  hot_drink_id UUID;
  cold_drink_id UUID;
  food_id UUID;
  dessert_id UUID;
BEGIN
  SELECT id INTO hot_drink_id FROM categories WHERE slug = 'bebidas-calientes';
  SELECT id INTO cold_drink_id FROM categories WHERE slug = 'bebidas-frias';
  SELECT id INTO food_id FROM categories WHERE slug = 'comidas';
  SELECT id INTO dessert_id FROM categories WHERE slug = 'postres';

  -- Bebidas Calientes
  INSERT INTO products (category_id, name, slug, description, price, cost, is_available, stock_quantity, preparation_time_minutes, is_featured) VALUES
  (hot_drink_id, 'Americano', 'americano', 'Café negro fuerte, elaborado con granos de altura', 2.50, 0.80, true, 100, 3, true),
  (hot_drink_id, 'Latte', 'latte', 'Espresso con leche espumada', 3.50, 1.20, true, 80, 5, true),
  (hot_drink_id, 'Cappuccino', 'cappuccino', 'Espresso con espuma de leche cremosa', 3.50, 1.15, true, 75, 5, true),
  (hot_drink_id, 'Espresso', 'espresso', 'Café concentrado single origin', 2.00, 0.60, true, 120, 2, true),
  (hot_drink_id, 'Mocha', 'mocha', 'Espresso con chocolate y leche', 4.00, 1.50, true, 50, 5, false),
  (hot_drink_id, 'Té Verde', 'te-verde', 'Té japonés Matcha premium', 4.50, 1.80, true, 40, 4, false),
  (hot_drink_id, 'Chocolate Caliente', 'chocolate-caliente', 'Chocolate belga con crema', 3.00, 1.00, true, 60, 3, false);

  -- Bebidas Frías
  INSERT INTO products (category_id, name, slug, description, price, cost, is_available, stock_quantity, preparation_time_minutes, is_featured) VALUES
  (cold_drink_id, 'Iced Americano', 'iced-americano', 'Café frío con hielo', 3.00, 0.90, true, 90, 2, true),
  (cold_drink_id, 'Iced Latte', 'iced-latte', 'Espresso frío con leche', 4.00, 1.40, true, 70, 3, true),
  (cold_drink_id, 'Frappe', 'frappe', 'Bebida helada blend con café', 4.50, 1.60, true, 55, 5, true),
  (cold_drink_id, 'Smoothie de Frutas', 'smoothie-frutas', 'Mezcla de frutas frescas', 5.00, 2.00, true, 35, 3, false),
  (cold_drink_id, 'Limonada Natural', 'limonada-natural', 'Limón fresco con hierbabuena', 3.50, 1.00, true, 45, 2, false);

  -- Comidas
  INSERT INTO products (category_id, name, slug, description, price, cost, is_available, stock_quantity, preparation_time_minutes, is_featured) VALUES
  (food_id, 'Croissant de Jamón', 'croissant-jamon', 'Croissant tostado con jamón y queso', 5.50, 2.20, true, 30, 5, true),
  (food_id, 'Sandwich Integral', 'sandwich-integral', 'Pan integral con pollo y verduras', 6.00, 2.50, true, 25, 3, false),
  (food_id, 'Ensalada César', 'ensalada-cesar', 'Lechuga romana, pollo, parmesano', 7.50, 3.00, true, 20, 5, false),
  (food_id, 'Bagel con Cream Cheese', 'bagel-cream-cheese', 'Bagel tostado con queso crema', 4.50, 1.80, true, 35, 3, true);

  -- Postres
  INSERT INTO products (category_id, name, slug, description, price, cost, is_available, stock_quantity, preparation_time_minutes, is_featured) VALUES
  (dessert_id, 'Cheesecake', 'cheesecake', 'Tarta de queso NY style', 4.50, 1.50, true, 15, 1, true),
  (dessert_id, 'Brownie', 'brownie', 'Bizcocho de chocolate con nueces', 3.50, 1.20, true, 25, 1, false),
  (dessert_id, 'Galleta de Avena', 'galleta-avena', 'Galleta artesanal con chips de chocolate', 2.50, 0.80, true, 40, 1, false),
  (dessert_id, 'Tiramisú', 'tiramisu', 'Postre italiano con café', 5.00, 1.80, true, 12, 1, false);

END $$;
