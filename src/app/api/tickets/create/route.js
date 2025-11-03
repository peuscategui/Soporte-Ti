import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/database.mjs';
import { validateTicketPermission, validateAgentAssignment, getUserFromRequest } from '../../../../lib/permissionValidator.js';

export async function POST(request) {
  try {
    // Obtener usuario desde headers
    const user = getUserFromRequest(request.headers);
    
    const body = await request.json();
    console.log('🔍 Datos recibidos para crear ticket:', body);
    
    const {
      solicitud,
      categoria,
      area,
      solicitante,
      agente,
      sede,
      estado,
      fechaCreacion,
      tipoAtencion,
      fechaCierre,
      solucion
    } = body;
    
    // Validar permisos para crear tickets
    const createPermission = validateTicketPermission(user, {}, 'create');
    if (!createPermission.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: createPermission.reason || 'No tienes permisos para crear tickets' 
        },
        { status: 403 }
      );
    }
    
    // Validar permisos para asignar agente
    if (agente) {
      const assignPermission = validateAgentAssignment(user, agente);
      if (!assignPermission.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: assignPermission.reason || 'No puedes asignar tickets a este agente' 
          },
          { status: 403 }
        );
      }
    }
    
    console.log('🔍 Agente extraído:', agente);

    // Validar campos requeridos
    if (!solicitud || !categoria || !area || !solicitante) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Insertar nuevo ticket
    console.log('🔍 Insertando ticket con agente:', agente || null);
    console.log('🔍 Fecha recibida:', fechaCreacion);
    
    // Convertir la fecha de datetime-local a timestamp UTC
    let fechaParaBD;
    if (fechaCreacion) {
      // El datetime-local viene en formato "YYYY-MM-DDTHH:MM" (hora local del navegador)
      // Lo convertimos a ISO string para almacenar en UTC
      fechaParaBD = new Date(fechaCreacion).toISOString();
    } else {
      // Si no hay fecha, usar la fecha actual
      fechaParaBD = new Date().toISOString();
    }
    
    console.log('🔍 Fecha ajustada para BD:', fechaParaBD);
    
    // Convertir fecha de cierre si existe
    let fechaCierreParaBD = null;
    if (fechaCierre) {
      fechaCierreParaBD = new Date(fechaCierre).toISOString();
    }
    
    const result = await query(`
      INSERT INTO tksoporte (
        solicitud, 
        categoria, 
        area, 
        solicitante, 
        agente, 
        sede, 
        estado,
        "Fecha de Registro",
        tipo_atencion,
        fecha_cierre,
        solucion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      solicitud,
      categoria,
      area,
      solicitante,
      agente || null,
      sede || 'Surquillo',
      estado || 'Cerrado',
      fechaParaBD,
      tipoAtencion || null,
      fechaCierreParaBD,
      solucion || null
    ]);
    
    console.log('✅ Ticket creado exitosamente:', result.rows[0]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
