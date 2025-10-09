const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.40.129',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

async function testDeleteTicket() {
  try {
    console.log('🧪 Probando eliminación de ticket...\n');
    
    // Obtener un registro real
    const getQuery = `
      SELECT 
        solicitante,
        solicitud,
        categoria,
        agente,
        area,
        sede
      FROM public.tksoporte 
      WHERE solicitante IS NOT NULL 
        AND solicitud IS NOT NULL 
        AND categoria IS NOT NULL
      LIMIT 1;
    `;
    
    const getResult = await pool.query(getQuery);
    
    if (getResult.rows.length === 0) {
      console.log('❌ No hay registros para probar');
      return;
    }
    
    const ticket = getResult.rows[0];
    console.log('📋 Ticket a eliminar:', ticket);
    
    // Simular exactamente lo que hace el frontend
    const deleteData = {
      solicitante: ticket.solicitante,
      solicitud: ticket.solicitud,
      categoria: ticket.categoria,
      agente: ticket.agente,
      area: ticket.area,
      sede: ticket.sede
    };
    
    console.log('📤 Datos que se enviarían al frontend:', deleteData);
    
    // Probar la eliminación
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
      deleteData.solicitante,
      deleteData.solicitud,
      deleteData.categoria,
      deleteData.agente,
      deleteData.area,
      deleteData.sede
    ]);
    
    if (deleteResult.rows.length > 0) {
      console.log('✅ Eliminación exitosa!');
      console.log('Registro eliminado:', deleteResult.rows[0]);
      
      // Reinsertar para no perder datos
      const insertQuery = `
        INSERT INTO public.tksoporte (
          solicitante, solicitud, categoria, agente, area, sede, "Fecha de Registro"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(insertQuery, [
        ticket.solicitante,
        ticket.solicitud,
        ticket.categoria,
        ticket.agente,
        ticket.area,
        ticket.sede,
        new Date()
      ]);
      
      console.log('🔄 Registro reinsertado');
    } else {
      console.log('❌ No se encontró el registro para eliminar');
      
      // Verificar si existe con una query más simple
      const checkQuery = `
        SELECT * FROM public.tksoporte 
        WHERE solicitante = $1 
        AND solicitud = $2 
        AND categoria = $3
      `;
      
      const checkResult = await pool.query(checkQuery, [
        deleteData.solicitante,
        deleteData.solicitud,
        deleteData.categoria
      ]);
      
      console.log('🔍 Verificación simple - registros encontrados:', checkResult.rows.length);
      if (checkResult.rows.length > 0) {
        console.log('📋 Registro encontrado:', checkResult.rows[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testDeleteTicket();





