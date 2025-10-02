import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database.mjs';
import { validateTicketPermission, validateAgentAssignment, getUserFromRequest } from '../../../../lib/permissionValidator.js';

export async function PUT(request) {
  try {
    // Obtener usuario desde headers
    const user = getUserFromRequest(request.headers);
    
    const body = await request.json();
    const { id, solicitante, solicitud, categoria, agente, area, sede, estado, originalData } = body;

    // Validar campos requeridos
    if (!id || !solicitante || !solicitud || !categoria || !area || !sede) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos' 
        },
        { status: 400 }
      );
    }

    // Validar permisos para editar el ticket
    const ticketToEdit = { id, agente: originalData?.agente || agente };
    const editPermission = validateTicketPermission(user, ticketToEdit, 'edit');
    if (!editPermission.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: editPermission.reason || 'No tienes permisos para editar este ticket' 
        },
        { status: 403 }
      );
    }

    // Validar permisos para asignar agente si está cambiando
    if (agente && agente !== originalData?.agente) {
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

    // Usar los datos originales para identificar el registro de manera única
    // Esto es más estable que usar ROW_NUMBER()
    const queryText = `
      UPDATE public.tksoporte 
      SET 
        solicitante = $1,
        solicitud = $2,
        categoria = $3,
        agente = $4,
        area = $5,
        sede = $6,
        estado = $7
      WHERE solicitante = $8 
      AND solicitud = $9 
      AND categoria = $10 
      AND agente = $11 
      AND area = $12 
      AND sede = $13
      AND "Fecha de Registro" = $14
      RETURNING *
    `;
    
    // Ajustar la fecha de creación si viene en datetime-local
    let fechaCreacionAjustada = originalData?.fecha_creacion;
    if (fechaCreacionAjustada && !fechaCreacionAjustada.includes('Z') && !fechaCreacionAjustada.includes('+')) {
      // Si es datetime-local, ajustar por zona horaria de Lima
      const fechaLocal = new Date(fechaCreacionAjustada);
      const fechaLima = new Date(fechaLocal.getTime() + (5 * 60 * 60 * 1000));
      fechaCreacionAjustada = fechaLima.toISOString();
    } else if (!fechaCreacionAjustada) {
      // Si no hay fecha, usar la fecha actual de Lima
      const ahora = new Date();
      const fechaLima = new Date(ahora.getTime() + (5 * 60 * 60 * 1000));
      fechaCreacionAjustada = fechaLima.toISOString();
    }
    
    const values = [
      solicitante, 
      solicitud, 
      categoria, 
      agente, 
      area, 
      sede,
      estado || 'Cerrado',
      originalData?.solicitante || '',
      originalData?.solicitud || '',
      originalData?.categoria || '',
      originalData?.agente || '',
      originalData?.area || '',
      originalData?.sede || '',
      fechaCreacionAjustada
    ];
    
    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket no encontrado o ya fue modificado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Ticket actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando ticket:', error);
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

