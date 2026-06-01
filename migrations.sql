-- Ejecuta estos comandos en el SQL Editor de tu Supabase Dashboard
-- Ve a: https://app.supabase.com → tu proyecto → SQL Editor → New Query

-- 1. Agregar costo e inventario al catálogo
ALTER TABLE catalogo ADD COLUMN IF NOT EXISTS costo numeric DEFAULT 0;
ALTER TABLE catalogo ADD COLUMN IF NOT EXISTS cantidad integer DEFAULT 0;

-- 2. Agregar hora a las sesiones (para Google Calendar con hora exacta)
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS hora time;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS proxima_hora time;

-- 3. Tabla de gastos/costos del negocio ← NUEVA
CREATE TABLE IF NOT EXISTS gastos (
  id bigint generated always as identity primary key,
  fecha date not null default current_date,
  concepto text not null,
  categoria text default 'Otros',
  monto numeric default 0,
  notas text,
  created_at timestamptz default now()
);
