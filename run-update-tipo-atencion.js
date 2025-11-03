// Script para actualizar tipo_atencion en registros existentes
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function updateTipoAtencion() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'update-tipo-atencion.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Actualizando tipo_atencion = "Incidencia" en registros existentes...');
    console.log('SQL:', sql);
    
    // Ejecutar el SQL
    const result = await pool.query(sql);
    
    console.log('✅ Actualización ejecutada exitosamente');
    console.log('Resultado:', result);
    
    // Obtener estadísticas
    if (result.length > 1) {
      const stats = result[result.length - 1].rows[0];
      console.log('\n📊 Estadísticas:');
      console.log(`  Total de tickets: ${stats.total_tickets}`);
      console.log(`  Incidencias: ${stats.incidencias}`);
      console.log(`  Problemas: ${stats.problemas}`);
      console.log(`  Requerimientos: ${stats.requerimientos}`);
      console.log(`  Sin tipo: ${stats.sin_tipo}`);
    }
    
  } catch (error) {
    console.error('❌ Error actualizando tipo_atencion:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

updateTipoAtencion();




