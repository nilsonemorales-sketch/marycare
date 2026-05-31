-- Ejecuta estos comandos en el SQL Editor de tu Supabase Dashboard
-- Ve a: https://app.supabase.com → tu proyecto → SQL Editor → New Query

-- 1. Agregar costo e inventario al catálogo
ALTER TABLE catalogo ADD COLUMN IF NOT EXISTS costo numeric DEFAULT 0;
ALTER TABLE catalogo ADD COLUMN IF NOT EXISTS cantidad integer DEFAULT 0;

-- 2. Agregar hora a las sesiones (para Google Calendar con hora exacta)
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS hora time;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS proxima_hora time;
