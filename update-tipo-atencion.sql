-- Script para actualizar tipo_atencion en registros existentes
-- Establece tipo_atencion = 'Incidencia' para todos los tickets que no tienen tipo_atencion

UPDATE public.tksoporte 
SET tipo_atencion = 'Incidencia'
WHERE tipo_atencion IS NULL;

-- Verificar cuántos registros se actualizaron
SELECT 
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN tipo_atencion = 'Incidencia' THEN 1 END) as incidencias,
  COUNT(CASE WHEN tipo_atencion = 'Problema' THEN 1 END) as problemas,
  COUNT(CASE WHEN tipo_atencion = 'Requerimiento' THEN 1 END) as requerimientos,
  COUNT(CASE WHEN tipo_atencion IS NULL THEN 1 END) as sin_tipo
FROM public.tksoporte;




