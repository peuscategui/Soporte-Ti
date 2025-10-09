const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function debugDeleteIssue() {
  try {
    console.log('🔍 Debugging delete issue...\n');
    
    // Obtener algunos registros reales de la tabla
    const query = `
      SELECT 
        solicitante,
        solicitud,
        categoria,
        agente,
        area,
        sede,
        "Fecha de Registro"
      FROM public.tksoporte 
      WHERE solicitante IS NOT NULL 
        AND solicitud IS NOT NULL 
        AND categoria IS NOT NULL
      LIMIT 5;
    `;
    
    const result = await pool.query(query);
    
    console.log('📋 REGISTROS REALES EN LA TABLA:');
    console.log('================================');
    
    result.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Registro:`);
      console.log(`   Solicitante: "${row.solicitante}"`);
      console.log(`   Solicitud: "${row.solicitud}"`);
      console.log(`   Categoría: "${row.categoria}"`);
      console.log(`   Agente: "${row.agente || 'NULL'}"`);
      console.log(`   Área: "${row.area || 'NULL'}"`);
      console.log(`   Sede: "${row.sede || 'NULL'}"`);
      console.log(`   Fecha: "${row['Fecha de Registro'] || 'NULL'}"`);
    });
    
    // Probar una eliminación con datos reales
    if (result.rows.length > 0) {
      const testRow = result.rows[0];
      console.log('\n🧪 PROBANDO ELIMINACIÓN CON DATOS REALES:');
      console.log('=========================================');
      
      const deleteQuery = `
        DELETE FROM public.tksoporte 
        WHERE solicitante = $1 
        AND solicitud = $2 
        AND categoria = $3
        AND (agente = $4 OR ($4 IS NULL AND agente IS NULL))
        AND (area = $5 OR ($5 IS NULL AND area IS NULL))
        AND (sede = $6 OR ($6 IS NULL AND sede IS NULL))
        RETURNING *
      `;
      
      const deleteResult = await pool.query(deleteQuery, [
        testRow.solicitante,
        testRow.solicitud,
        testRow.categoria,
        testRow.agente,
        testRow.area,
        testRow.sede
      ]);
      
      if (deleteResult.rows.length > 0) {
        console.log('✅ Eliminación exitosa!');
        console.log('Registro eliminado:', deleteResult.rows[0]);
        
        // Reinsertar el registro para no perder datos
        const insertQuery = `
          INSERT INTO public.tksoporte (
            solicitante, solicitud, categoria, agente, area, sede, "Fecha de Registro"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await pool.query(insertQuery, [
          testRow.solicitante,
          testRow.solicitud,
          testRow.categoria,
          testRow.agente,
          testRow.area,
          testRow.sede,
          testRow['Fecha de Registro']
        ]);
        
        console.log('🔄 Registro reinsertado para preservar datos');
      } else {
        console.log('❌ No se encontró el registro para eliminar');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugDeleteIssue();
