import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.mjs';
import { filterTicketsByUserPermissions, getUserFromRequest } from '../../../lib/permissionValidator.js';

export async function GET(request) {
  try {
    // Obtener usuario desde headers (en producción sería desde JWT)
    const user = getUserFromRequest(request.headers);
    
    const queryText = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY "Fecha de Registro" DESC) as id,
        "Fecha de Registro" as fecha_creacion,
        COALESCE(solicitante, '') as solicitante,
        COALESCE(solicitud, '') as solicitud,
        COALESCE(categoria, '') as categoria,
        COALESCE(agente, '') as agente,
        COALESCE(area, '') as area,
        COALESCE(sede, '') as sede,
        COALESCE(estado, 'Cerrado') as estado,
        COALESCE(tipo_atencion, '') as tipo_atencion,
        fecha_cierre,
        COALESCE(solucion, '') as solucion
      FROM public.tksoporte 
      WHERE "Fecha de Registro" IS NOT NULL
      ORDER BY "Fecha de Registro" DESC;
    `;
    
    const result = await query(queryText);
    
    // Filtrar tickets según permisos del usuario
    let filteredTickets = result.rows;
    if (user) {
      filteredTickets = filterTicketsByUserPermissions(result.rows, user);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredTickets,
      total: filteredTickets.length,
      user: user ? { name: user.fullName, role: user.systemRole } : null
    });
  } catch (error) {
    console.error('Error en API tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
