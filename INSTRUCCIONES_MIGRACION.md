# 📋 Instrucciones para Migración de Base de Datos

## Nuevos Campos Agregados al Sistema de Tickets

Se han agregado **2 nuevos campos** a la tabla `public.tksoporte`:

1. **`tipo_atencion`** - Campo tipo VARCHAR(50) con 3 opciones:
   - Incidencia
   - Problema
   - Requerimiento

2. **`fecha_cierre`** - Campo tipo TIMESTAMP para registrar cuándo se cerró el ticket

## ⚠️ IMPORTANTE - No se elimina ningún dato

El script SQL **SOLO AGREGA** columnas nuevas, **NO elimina ni modifica datos existentes**.

## 📝 Pasos para Ejecutar la Migración

### Opción 1: Usando Node.js (Recomendado)

```bash
cd soporte-efc
node run-migration.js
```

### Opción 2: Usando SQL directo

Si tienes acceso a `psql` o PgAdmin, puedes ejecutar el archivo `add-ticket-fields.sql` directamente.

**Contenido del script:**
```sql
-- Agregar campo tipo_atencion con valores predefinidos
ALTER TABLE public.tksoporte 
ADD COLUMN IF NOT EXISTS tipo_atencion VARCHAR(50) 
CHECK (tipo_atencion IN ('Incidencia', 'Problema', 'Requerimiento'));

-- Agregar campo fecha_cierre para registrar cuándo se cerró el ticket
ALTER TABLE public.tksoporte 
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP;
```

### Opción 3: Manualmente en PgAdmin

1. Conéctate a la base de datos en: `192.168.40.129:5432`
2. Base de datos: `postgres`
3. Esquema: `public`
4. Tabla: `tksoporte`
5. Ejecuta el contenido del archivo `add-ticket-fields.sql`

## ✅ Verificar la Migración

Después de ejecutar la migración, verifica que las columnas se hayan creado:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tksoporte'
  AND column_name IN ('tipo_atencion', 'fecha_cierre');
```

Deberías ver:
```
    column_name   |     data_type     | is_nullable
------------------+-------------------+-------------
 tipo_atencion    | character varying | YES
 fecha_cierre     | timestamp         | YES
```

## 🎨 Cambios en el Frontend

### Formulario de Creación de Tickets
- ✅ Campo "Tipo de Atención" con opciones: Incidencia, Problema, Requerimiento
- ✅ Campo "Fecha de Cierre" (datetime-local)

### Formulario de Edición de Tickets
- ✅ Campo "Tipo de Atención" editable
- ✅ Campo "Fecha de Cierre" editable

### Tabla de Visualización
- ✅ Columna "TIPO ATENCIÓN" con badges de colores:
  - 🔴 Incidencia (rojo)
  - 🟡 Problema (amarillo)
  - 🟢 Requerimiento (verde)
- ✅ Columna "FECHA CIERRE" mostrando la fecha formateada

### Modal de Detalles
- ✅ Muestra "Tipo de Atención"
- ✅ Muestra "Fecha de Cierre"

## 🔄 APIs Actualizadas

- ✅ `/api/tickets/route.js` - GET: Incluye los nuevos campos en la consulta
- ✅ `/api/tickets/create/route.js` - POST: Maneja creación con nuevos campos
- ✅ `/api/tickets/update/route.js` - PUT: Maneja actualización con nuevos campos

## 📊 Datos Existentes

Los tickets existentes tendrán:
- `tipo_atencion`: NULL (se mostrará como "-" en la UI)
- `fecha_cierre`: NULL (se mostrará como "No cerrado" en la UI)

Puedes actualizar estos valores posteriormente desde el formulario de edición de tickets.

## 🚀 Próximos Pasos

1. Ejecuta la migración SQL usando una de las opciones arriba
2. Reinicia el servidor de desarrollo si está corriendo
3. Prueba crear un nuevo ticket con los nuevos campos
4. Verifica que los campos aparecen correctamente en la tabla

## ❓ Problemas Comunes

**Error: "column already exists"**
- Esto es normal si ya ejecutaste la migración antes
- La cláusula `IF NOT EXISTS` previene errores

**Error: "permission denied"**
- Verifica que el usuario `postgres` tenga permisos de ALTER TABLE

**Los campos no aparecen en la UI**
- Asegúrate de haber reiniciado el servidor de desarrollo
- Verifica que la migración se ejecutó correctamente
- Revisa la consola del navegador por errores




