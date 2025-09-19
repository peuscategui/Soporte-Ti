const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventario_efc',
  password: 'postgres',
  port: 5432,
});

async function analyzeTksoporte() {
  try {
    console.log('🔍 Analizando estructura de la tabla tksoporte...\n');
    
    // Obtener estructura de la tabla
    const structureQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tksoporte'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await pool.query(structureQuery);
    
    console.log('📋 ESTRUCTURA DE LA TABLA tksoporte:');
    console.log('=====================================');
    structureResult.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}`);
      console.log(`   Tipo: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      console.log(`   Default: ${col.column_default || 'N/A'}`);
      console.log('');
    });
    
    // Obtener conteo de registros
    const countQuery = 'SELECT COUNT(*) as total FROM public.tksoporte;';
    const countResult = await pool.query(countQuery);
    console.log(`📊 Total de registros: ${countResult.rows[0].total}\n`);
    
    // Obtener muestra de datos
    const sampleQuery = 'SELECT * FROM public.tksoporte LIMIT 5;';
    const sampleResult = await pool.query(sampleQuery);
    
    console.log('📄 MUESTRA DE DATOS (primeros 5 registros):');
    console.log('==========================================');
    if (sampleResult.rows.length > 0) {
      console.log(JSON.stringify(sampleResult.rows, null, 2));
    } else {
      console.log('No hay datos en la tabla');
    }
    
    // Obtener estadísticas por estado si existe la columna
    const statusQuery = `
      SELECT 
        CASE 
          WHEN column_name = 'estado' OR column_name = 'status' 
          THEN column_name 
          ELSE NULL 
        END as status_column
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'tksoporte'
      AND (column_name ILIKE '%estado%' OR column_name ILIKE '%status%');
    `;
    
    const statusResult = await pool.query(statusQuery);
    if (statusResult.rows.length > 0) {
      const statusColumn = statusResult.rows[0].status_column;
      const statusStatsQuery = `SELECT ${statusColumn}, COUNT(*) as count FROM public.tksoporte GROUP BY ${statusColumn} ORDER BY count DESC;`;
      const statusStatsResult = await pool.query(statusStatsQuery);
      
      console.log(`\n📈 ESTADÍSTICAS POR ${statusColumn.toUpperCase()}:`);
      console.log('=====================================');
      statusStatsResult.rows.forEach(row => {
        console.log(`${row[statusColumn]}: ${row.count} tickets`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error analizando la tabla:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeTksoporte();
