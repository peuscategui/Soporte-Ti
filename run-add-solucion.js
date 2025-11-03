// Script para agregar campo solucion a la tabla tksoporte
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

async function addSolucionField() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-solucion-field.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Agregando campo "solucion" a la tabla...');
    console.log('SQL:', sql);
    
    // Ejecutar el SQL
    const result = await pool.query(sql);
    
    console.log('✅ Campo agregado exitosamente');
    console.log('Resultado:', result);
    
    // Verificar la columna
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'tksoporte'
        AND column_name = 'solucion';
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log('\n📋 Campo agregado:');
    console.table(checkResult.rows);
    
  } catch (error) {
    console.error('❌ Error agregando campo solucion:', error);
    console.error('Detalles:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

addSolucionField();




