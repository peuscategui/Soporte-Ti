-- Script para actualizar fecha_cierre en registros existentes
-- Establece fecha_cierre = "Fecha de Registro" para TODOS los tickets

UPDATE public.tksoporte 
SET fecha_cierre = "Fecha de Registro"
WHERE "Fecha de Registro" IS NOT NULL;

-- Verificar cuántos registros se actualizaron
SELECT 
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN fecha_cierre IS NOT NULL THEN 1 END) as con_fecha_cierre,
  COUNT(CASE WHEN fecha_cierre IS NULL THEN 1 END) as sin_fecha_cierre
FROM public.tksoporte;




