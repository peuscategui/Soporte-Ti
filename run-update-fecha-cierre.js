// Script para actualizar fecha_cierre en registros existentes
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

async function updateFechaCierre() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'update-fecha-cierre.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Actualizando fecha_cierre en registros existentes...');
    console.log('SQL:', sql);
    
    // Separar las queries
    const queries = sql.split(';').filter(q => q.trim().length > 0);
    
    // Ejecutar UPDATE primero
    console.log('\n🔄 Ejecutando UPDATE...');
    const updateResult = await pool.query(queries[0]);
    console.log(`✅ Actualizados ${updateResult.rowCount} registros`);
    
    // Ejecutar SELECT para estadísticas
    console.log('\n📊 Obteniendo estadísticas...');
    const statsResult = await pool.query(queries[1]);
    const stats = statsResult.rows[0];
    console.log('\n📊 Estadísticas:');
    console.log(`  Total de tickets: ${stats.total_tickets}`);
    console.log(`  Con fecha de cierre: ${stats.con_fecha_cierre}`);
    console.log(`  Sin fecha de cierre: ${stats.sin_fecha_cierre}`);
    
  } catch (error) {
    console.error('❌ Error actualizando fecha_cierre:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

updateFechaCierre();




