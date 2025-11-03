// Script para ejecutar la migración SQL
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

async function runMigration() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-ticket-fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Ejecutando migración SQL...');
    console.log('SQL:', sql);
    
    // Ejecutar el SQL
    const result = await pool.query(sql);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('Resultado:', result);
    
    // Verificar las columnas
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'tksoporte'
        AND column_name IN ('tipo_atencion', 'fecha_cierre');
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log('\n📋 Columnas agregadas:');
    console.table(checkResult.rows);
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

runMigration();




