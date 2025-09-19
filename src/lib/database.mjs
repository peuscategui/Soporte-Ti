import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.40.129',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Función para obtener estadísticas de tickets con filtro de días
async function getTicketStats(days = 7) {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN "Fecha de Registro" IS NOT NULL AND solicitante IS NOT NULL THEN 1 END) as tickets_abiertos,
        COUNT(CASE WHEN agente IS NOT NULL AND agente != '' THEN 1 END) as tickets_asignados,
        COUNT(CASE WHEN categoria = 'Resuelto' OR categoria = 'Cerrado' THEN 1 END) as tickets_resueltos
      FROM public.tksoporte
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days';
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error obteniendo estadísticas de tickets:', error);
    return {
      total_tickets: 0,
      tickets_abiertos: 0,
      tickets_asignados: 0,
      tickets_resueltos: 0
    };
  }
}

// Función para obtener tickets recientes
async function getRecentTickets(limit = 5) {
  try {
    const query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY "Fecha de Registro" DESC) as id,
        solicitud as titulo,
        categoria as descripcion,
        categoria as estado,
        area as prioridad,
        agente as usuario_asignado,
        "Fecha de Registro" as fecha_creacion,
        "Fecha de Registro" as fecha_actualizacion
      FROM public.tksoporte 
      WHERE "Fecha de Registro" IS NOT NULL
      ORDER BY "Fecha de Registro" DESC 
      LIMIT $1;
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo tickets recientes:', error);
    return [];
  }
}

// Función para obtener estadísticas por estado
async function getStatsByStatus() {
  try {
    const query = `
      SELECT 
        categoria as estado,
        COUNT(*) as count
      FROM public.tksoporte 
      WHERE categoria IS NOT NULL AND categoria != ''
      GROUP BY categoria 
      ORDER BY count DESC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo estadísticas por estado:', error);
    return [];
  }
}

// Función para obtener tickets por agente
async function getTicketsByAgent(days = 7) {
  try {
    const query = `
      SELECT 
        agente,
        COUNT(*) as count
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND agente IS NOT NULL AND agente != ''
      GROUP BY agente 
      ORDER BY count DESC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo tickets por agente:', error);
    return [];
  }
}

// Función para obtener tickets por área
async function getTicketsByArea(days = 7) {
  try {
    const query = `
      SELECT 
        area,
        COUNT(*) as count
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND area IS NOT NULL AND area != ''
      GROUP BY area 
      ORDER BY count DESC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo tickets por área:', error);
    return [];
  }
}

// Función para obtener datos de tendencia por día
async function getTicketsTrend(days = 7) {
  try {
    const query = `
      SELECT 
        DATE("Fecha de Registro") as fecha,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN categoria = 'Resuelto' OR categoria = 'Cerrado' THEN 1 END) as tickets_resueltos
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
      GROUP BY DATE("Fecha de Registro")
      ORDER BY fecha ASC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo tendencia de tickets:', error);
    return [];
  }
}

// Función para obtener atenciones por agente con tendencia
async function getAgentAttendances(days = 7) {
  try {
    const query = `
      SELECT 
        agente,
        COUNT(*) as atenciones
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND agente IS NOT NULL 
        AND agente != ''
        AND agente != 'NULL'
        AND agente != 'null'
      GROUP BY agente
      ORDER BY atenciones DESC;
    `;
    
    const result = await pool.query(query);
    console.log('Datos de agentes obtenidos:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo atenciones por agente:', error);
    return [];
  }
}

// Función para obtener top 3 áreas más atendidas
async function getTopAreas(days = 7) {
  try {
    const query = `
      SELECT 
        area,
        COUNT(*) as total
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND area IS NOT NULL 
        AND area != ''
        AND area != 'NULL'
        AND area != 'null'
      GROUP BY area
      ORDER BY total DESC
      LIMIT 3;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo top áreas:', error);
    return [];
  }
}

// Función para obtener top 3 categorías más frecuentes
async function getTopCategorias(days = 7) {
  try {
    const query = `
      SELECT 
        categoria,
        COUNT(*) as total
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND categoria IS NOT NULL 
        AND categoria != ''
        AND categoria != 'NULL'
        AND categoria != 'null'
      GROUP BY categoria
      ORDER BY total DESC
      LIMIT 3;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo top categorías:', error);
    return [];
  }
}

// Función para obtener top 3 usuarios más atendidos
async function getTopUsuarios(days = 7) {
  try {
    const query = `
      SELECT 
        solicitante,
        COUNT(*) as total
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND solicitante IS NOT NULL 
        AND solicitante != ''
        AND solicitante != 'NULL'
        AND solicitante != 'null'
      GROUP BY solicitante
      ORDER BY total DESC
      LIMIT 3;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo top usuarios:', error);
    return [];
  }
}

export {
  pool,
  getTicketStats,
  getRecentTickets,
  getStatsByStatus,
  getTicketsByAgent,
  getTicketsByArea,
  getTicketsTrend,
  getAgentAttendances,
  getTopAreas,
  getTopCategorias,
  getTopUsuarios
};
