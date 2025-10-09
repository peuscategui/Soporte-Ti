const { Pool } = require('pg');
require('dotenv').config({ path: './env.production' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function listarCategoriasFinales() {
  try {
    console.log('📋 Listando todas las categorías finales...\n');
    
    // Obtener todas las categorías únicas ordenadas alfabéticamente
    const result = await pool.query(`
      SELECT 
        categoria,
        COUNT(*) as cantidad
      FROM public.tksoporte 
      WHERE categoria IS NOT NULL 
        AND categoria != ''
        AND categoria != 'NULL'
        AND categoria != 'null'
      GROUP BY categoria
      ORDER BY categoria ASC;
    `);
    
    console.log('📊 CATEGORÍAS FINALES (96 categorías únicas):');
    console.log('============================================');
    console.log(`Total de categorías: ${result.rows.length}\n`);
    
    // Mostrar todas las categorías en columnas
    const categorias = result.rows.map(row => row.categoria);
    const categoriasPorColumna = 3;
    const filas = Math.ceil(categorias.length / categoriasPorColumna);
    
    for (let i = 0; i < filas; i++) {
      let fila = '';
      for (let j = 0; j < categoriasPorColumna; j++) {
        const index = i * categoriasPorColumna + j;
        if (index < categorias.length) {
          const categoria = categorias[index];
          const cantidad = result.rows.find(row => row.categoria === categoria)?.cantidad || 0;
          fila += `${(index + 1).toString().padStart(2)}. ${categoria.padEnd(35)} (${cantidad.toString().padStart(2)})`;
          if (j < categoriasPorColumna - 1 && index + 1 < categorias.length) {
            fila += ' | ';
          }
        }
      }
      console.log(fila);
    }
    
    // Mostrar estadísticas por cantidad
    console.log('\n📈 ESTADÍSTICAS POR CANTIDAD:');
    console.log('=============================');
    
    const porCantidad = result.rows.reduce((acc, row) => {
      const cantidad = parseInt(row.cantidad);
      if (cantidad >= 10) acc['10+'] = (acc['10+'] || 0) + 1;
      else if (cantidad >= 5) acc['5-9'] = (acc['5-9'] || 0) + 1;
      else if (cantidad >= 2) acc['2-4'] = (acc['2-4'] || 0) + 1;
      else acc['1'] = (acc['1'] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(porCantidad).forEach(([rango, cantidad]) => {
      console.log(`${rango.padEnd(4)} registros: ${cantidad} categorías`);
    });
    
    // Mostrar las categorías más comunes
    console.log('\n🏆 TOP 15 CATEGORÍAS MÁS COMUNES:');
    console.log('=================================');
    const topCategorias = result.rows
      .sort((a, b) => parseInt(b.cantidad) - parseInt(a.cantidad))
      .slice(0, 15);
    
    topCategorias.forEach((row, index) => {
      const porcentaje = ((row.cantidad / result.rows.reduce((sum, r) => sum + parseInt(r.cantidad), 0)) * 100).toFixed(1);
      console.log(`${(index + 1).toString().padStart(2)}. ${row.categoria.padEnd(40)} | ${row.cantidad.toString().padStart(3)} registros (${porcentaje}%)`);
    });
    
    // Total de registros
    const totalRegistros = result.rows.reduce((sum, row) => sum + parseInt(row.cantidad), 0);
    console.log(`\n📊 Total de registros con categoría: ${totalRegistros}`);
    
  } catch (error) {
    console.error('❌ Error al listar categorías:', error);
  } finally {
    await pool.end();
  }
}

listarCategoriasFinales();