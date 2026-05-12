-- =====================================================
-- ACTUALIZAR ROLES EN TABLA USERS
-- =====================================================

-- Cambiar enum de roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check CHECK (role IN ('cliente', 'vendedor', 'manager_admin'));

-- Verificar usuarios actuales
SELECT id, email, role FROM users;
