-- Script para agregar campos a la tabla public.tksoporte
-- Fecha: 2025-10-20
-- Descripción: Agrega campos para tipo de atención y fecha de cierre

-- Agregar campo tipo_atencion con valores predefinidos
ALTER TABLE public.tksoporte 
ADD COLUMN IF NOT EXISTS tipo_atencion VARCHAR(50) CHECK (tipo_atencion IN ('Incidencia', 'Problema', 'Requerimiento'));

-- Agregar campo fecha_cierre para registrar cuándo se cerró el ticket
ALTER TABLE public.tksoporte 
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.tksoporte.tipo_atencion IS 'Tipo de atención: Incidencia, Problema o Requerimiento';
COMMENT ON COLUMN public.tksoporte.fecha_cierre IS 'Fecha y hora en que se cerró el ticket';

-- Verificar las columnas agregadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tksoporte'
  AND column_name IN ('tipo_atencion', 'fecha_cierre');




