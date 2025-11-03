const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla tksoporte...\n');
    
    // Verificar si la tabla existe
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tksoporte'
      );
    `;
    
    const tableExists = await pool.query(tableExistsQuery);
    console.log('¿Existe la tabla tksoporte?', tableExists.rows[0].exists);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla tksoporte no existe');
      return;
    }
    
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
    const sampleQuery = 'SELECT * FROM public.tksoporte LIMIT 3;';
    const sampleResult = await pool.query(sampleQuery);
    
    console.log('📄 MUESTRA DE DATOS (primeros 3 registros):');
    console.log('==========================================');
    if (sampleResult.rows.length > 0) {
      console.log(JSON.stringify(sampleResult.rows, null, 2));
    } else {
      console.log('No hay datos en la tabla');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();










