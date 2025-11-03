-- Script para agregar campo solucion a la tabla public.tksoporte
-- Fecha: 2025-10-20
-- Descripción: Agrega campo para descripción de la solución del ticket

-- Agregar campo solucion como TEXT para permitir descripciones largas
ALTER TABLE public.tksoporte 
ADD COLUMN IF NOT EXISTS solucion TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN public.tksoporte.solucion IS 'Descripción de la solución aplicada al ticket';

-- Verificar la columna agregada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tksoporte'
  AND column_name = 'solucion';




