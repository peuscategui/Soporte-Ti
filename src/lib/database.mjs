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
        COUNT(CASE WHEN categoria = 'Resuelto' OR categoria = 'Cerrado' THEN 1 END) as tickets_resueltos,
        -- Tickets de Soporte (categorías generales de soporte técnico)
        COUNT(CASE WHEN categoria IN (
          'Hardware', 'Impresoras', 'Correo Electrónico', 'Sistema General', 
          'Microsoft Office', 'Microsoft Teams', 'SharePoint', 'Red y Conectividad',
          'VPN y Acceso Remoto', 'Cuentas y Usuarios', 'Backup y Seguridad',
          'Software Especializado', 'Windows y Sistema Operativo', 
          'Actualizaciones de Software', 'Telefonía', 'Entrega y Préstamo de Equipos',
          'Capacitación y Soporte General', 'Otros/Misceláneos'
        ) THEN 1 END) as tickets_soporte,
        -- Tickets de Infraestructura (categorías relacionadas con infraestructura)
        COUNT(CASE WHEN categoria IN (
          'Sistema Horizon', 'Renovación y Cambios de Equipo'
        ) OR area = 'Tecnología de la Información' THEN 1 END) as tickets_infraestructura
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
      tickets_resueltos: 0,
      tickets_soporte: 0,
      tickets_infraestructura: 0
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
    
    // Normalizar nombres de agentes para evitar duplicados por capitalización
    const normalizedAgents = {};
    
    result.rows.forEach(row => {
      // Normalizar el nombre: primera letra de cada palabra en mayúscula, resto en minúscula
      const normalizedName = row.agente
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (normalizedAgents[normalizedName]) {
        normalizedAgents[normalizedName] += row.count;
      } else {
        normalizedAgents[normalizedName] = row.count;
      }
    });
    
    // Convertir de vuelta al formato esperado
    const finalResult = Object.entries(normalizedAgents)
      .map(([agente, count]) => ({ agente, count }))
      .sort((a, b) => b.count - a.count);
    
    return finalResult;
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
    
    // Normalizar nombres de agentes para evitar duplicados por capitalización
    const normalizedAgents = {};
    
    result.rows.forEach(row => {
      // Normalizar el nombre: primera letra de cada palabra en mayúscula, resto en minúscula
      const normalizedName = row.agente
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (normalizedAgents[normalizedName]) {
        normalizedAgents[normalizedName] += row.atenciones;
      } else {
        normalizedAgents[normalizedName] = row.atenciones;
      }
    });
    
    // Convertir de vuelta al formato esperado
    const finalResult = Object.entries(normalizedAgents)
      .map(([agente, atenciones]) => ({ agente, atenciones }))
      .sort((a, b) => b.atenciones - a.atenciones);
    
    console.log('Datos de agentes normalizados:', finalResult);
    return finalResult;
  } catch (error) {
    console.error('Error obteniendo atenciones por agente:', error);
    return [];
  }
}

// Función para obtener top 10 áreas más atendidas
async function getTopAreas(days = 7) {
  try {
    const query = `
      SELECT 
        area,
        COUNT(*) as cantidad
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND area IS NOT NULL 
        AND area != ''
        AND area != 'NULL'
        AND area != 'null'
      GROUP BY area
      ORDER BY cantidad DESC
      LIMIT 10;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo top áreas:', error);
    return [];
  }
}

// Función para obtener top 10 categorías más frecuentes
async function getTopCategorias(days = 7) {
  try {
    const query = `
      SELECT 
        categoria,
        COUNT(*) as cantidad
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND categoria IS NOT NULL 
        AND categoria != ''
        AND categoria != 'NULL'
        AND categoria != 'null'
      GROUP BY categoria
      ORDER BY cantidad DESC
      LIMIT 10;
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

// Función para obtener atenciones por sede
async function getSedeAttendances(days = 7) {
  try {
    const query = `
      SELECT 
        sede,
        COUNT(*) as atenciones
      FROM public.tksoporte 
      WHERE "Fecha de Registro" >= CURRENT_DATE - INTERVAL '${days} days'
        AND "Fecha de Registro" IS NOT NULL
        AND sede IS NOT NULL 
        AND sede != ''
        AND sede != 'NULL'
        AND sede != 'null'
      GROUP BY sede
      ORDER BY atenciones DESC;
    `;
    
    const result = await pool.query(query);
    console.log('Datos de sede obtenidos:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo atenciones por sede:', error);
    return [];
  }
}

// Funciones para infraestructura
async function getInfraestructuraStats(days = 7) {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_infraestructura,
        COUNT(CASE WHEN estado = 'Abierto' THEN 1 END) as infraestructura_abiertos,
        COUNT(CASE WHEN estado = 'En Proceso' THEN 1 END) as infraestructura_en_proceso,
        COUNT(CASE WHEN estado = 'Atendido' THEN 1 END) as infraestructura_atendidos,
        COUNT(CASE WHEN estado = 'Escalado' THEN 1 END) as infraestructura_escalados
      FROM public.infraestructura
      ${days > 0 ? `WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '${days} days'` : ''};
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error obteniendo estadísticas de infraestructura:', error);
    return {
      total_infraestructura: 0,
      infraestructura_abiertos: 0,
      infraestructura_en_proceso: 0,
      infraestructura_atendidos: 0,
      infraestructura_escalados: 0
    };
  }
}

async function getAllInfraestructura() {
  try {
    const query = `
      SELECT 
        id,
        tipo,
        prioridad,
        titulo,
        descripcion,
        ubicacion,
        servicio,
        asignado_a,
        estado,
        tiempo_invertido,
        fecha_creacion,
        fecha_resolucion,
        created_at,
        updated_at
      FROM public.infraestructura
      ORDER BY fecha_creacion DESC;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo infraestructura:', error);
    return [];
  }
}

async function createInfraestructuraItem(data) {
  try {
    const query = `
      INSERT INTO public.infraestructura (
        tipo, prioridad, titulo, descripcion, ubicacion, servicio,
        asignado_a, estado, tiempo_invertido, fecha_creacion, fecha_resolucion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    
    const values = [
      data.tipo,
      data.prioridad,
      data.titulo,
      data.descripcion,
      data.ubicacion,
      data.servicio,
      data.asignadoA,
      data.estado,
      data.tiempoInvertido || 0,
      data.fechaCreacion || new Date(),
      data.fechaResolucion || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creando item de infraestructura:', error);
    throw error;
  }
}

async function updateInfraestructuraItem(id, data) {
  try {
    const query = `
      UPDATE public.infraestructura SET
        tipo = $1,
        prioridad = $2,
        titulo = $3,
        descripcion = $4,
        ubicacion = $5,
        servicio = $6,
        asignado_a = $7,
        estado = $8,
        tiempo_invertido = $9,
        fecha_resolucion = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
    `;
    
    const values = [
      data.tipo,
      data.prioridad,
      data.titulo,
      data.descripcion,
      data.ubicacion,
      data.servicio,
      data.asignadoA,
      data.estado,
      data.tiempoInvertido || 0,
      data.fechaResolucion || null,
      id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error actualizando item de infraestructura:', error);
    throw error;
  }
}

async function deleteInfraestructuraItem(id) {
  try {
    const query = `
      DELETE FROM public.infraestructura 
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error eliminando item de infraestructura:', error);
    throw error;
  }
}

// Funciones para obtener datos de dropdowns
async function getAllUsuarios() {
  try {
    const query = `
      SELECT DISTINCT solicitante 
      FROM public.tksoporte 
      WHERE solicitante IS NOT NULL AND solicitante != ''
      ORDER BY solicitante;
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => row.solicitante);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

async function getAllAreas() {
  try {
    const query = `
      SELECT DISTINCT area 
      FROM public.tksoporte 
      WHERE area IS NOT NULL AND area != ''
      ORDER BY area;
    `;
    
    const result = await pool.query(query);
    const rawAreas = result.rows.map(row => row.area);
    
    // Normalizar áreas para eliminar duplicados y variaciones
    const normalizedAreas = normalizeAreas(rawAreas);
    
    return normalizedAreas;
  } catch (error) {
    console.error('Error obteniendo áreas:', error);
    return [];
  }
}

// Función para normalizar áreas y eliminar duplicados
function normalizeAreas(areas) {
  const areaMap = new Map();
  
  // Reglas de normalización
  const normalizationRules = {
    // Control Presupuestal
    'Control Presupuestal Y De Gestion': 'Control Presupuestal y de Gestión',
    'Control presupuestal y de gestión': 'Control Presupuestal y de Gestión',
    
    // Cotizaciones
    'Cotización Internacional': 'Cotizaciones Internacionales',
    
    // Facturación
    'Facturacion Y Cobranzas': 'Facturación y Cobranzas',
    
    // Oficina de Proyectos
    'Oficina De Gestion De Proyectos': 'Oficina de Gestión de Proyectos',
    'Oficina de Proyectos': 'Oficina de Gestión de Proyectos',
    
    // Tesorería
    'Tesoreria': 'Tesorería',
    
    // Tecnología de la Información
    'Tecnologia De La Informacion Y Comunicaciones': 'Tecnología de la Información',
    'TI': 'Tecnología de la Información',
    'TIC': 'Tecnología de la Información',
    
    // Logística
    'Logística de Entrtada': 'Logística de Entrada',
    
    // Operaciones
    'Operacion Comercial Internacional': 'Operación Comercial Internacional',
    'Operacion Logistica Internacional': 'Operación Logística Internacional',
    'Operaciones Logisticas': 'Operaciones Logísticas',
    
    // Gestión
    'Gestion De Calidad Y Mejora De Procesos': 'Gestión de Calidad y Mejora de Procesos',
    'Gestion De Informacion': 'Gestión de Información',
    'Gestion Y Desarrollo Humano': 'Gestión y Desarrollo Humano',
    
    // Otros
    'Efc Distribuciones': 'EFC Distribuciones',
    'E Commerce': 'E-Commerce'
  };
  
  // Aplicar reglas de normalización
  areas.forEach(area => {
    const normalizedArea = normalizationRules[area] || area;
    
    // Si ya existe, no duplicar
    if (!areaMap.has(normalizedArea)) {
      areaMap.set(normalizedArea, normalizedArea);
    }
  });
  
  // Convertir a array y ordenar
  return Array.from(areaMap.values()).sort();
}

async function getAllAgentes() {
  try {
    const query = `
      SELECT DISTINCT agente 
      FROM public.tksoporte 
      WHERE agente IS NOT NULL AND agente != ''
      ORDER BY agente;
    `;
    
    const result = await pool.query(query);
    const rawAgentes = result.rows.map(row => row.agente);
    
    // Normalizar agentes para eliminar duplicados por capitalización
    const normalizedAgentes = normalizeAgentes(rawAgentes);
    
    return normalizedAgentes;
  } catch (error) {
    console.error('Error obteniendo agentes:', error);
    return [];
  }
}

// Función para normalizar agentes y eliminar duplicados por capitalización
function normalizeAgentes(agentes) {
  const agenteMap = new Map();
  
  // Reglas de normalización para agentes
  const normalizationRules = {
    'ALONSO QUISPE': 'Alonso Quispe',
    'JERRY CONTRERAS': 'Jerry Contreras',
    'JESUS MURRUGARRA': 'Jesus Murrugarra'
  };
  
  // Aplicar reglas de normalización
  agentes.forEach(agente => {
    const normalizedAgente = normalizationRules[agente] || agente;
    
    // Si ya existe, no duplicar
    if (!agenteMap.has(normalizedAgente)) {
      agenteMap.set(normalizedAgente, normalizedAgente);
    }
  });
  
  // Convertir a array y ordenar
  return Array.from(agenteMap.values()).sort();
}

async function getAllCategorias() {
  try {
    const query = `
      SELECT DISTINCT categoria 
      FROM public.tksoporte 
      WHERE categoria IS NOT NULL AND categoria != ''
      ORDER BY categoria;
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => row.categoria);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
}

// Función genérica para ejecutar queries
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
}

export {
  pool,
  query,
  getTicketStats,
  getRecentTickets,
  getStatsByStatus,
  getTicketsByAgent,
  getTicketsByArea,
  getTicketsTrend,
  getAgentAttendances,
  getSedeAttendances,
  getTopAreas,
  getTopCategorias,
  getTopUsuarios,
  getInfraestructuraStats,
  getAllInfraestructura,
  createInfraestructuraItem,
  updateInfraestructuraItem,
  deleteInfraestructuraItem,
  getAllUsuarios,
  getAllAreas,
  getAllAgentes,
  getAllCategorias
};

