import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database.mjs';
import { validateTicketPermission, validateAgentAssignment, getUserFromRequest } from '../../../../lib/permissionValidator.js';

export async function PUT(request) {
  try {
    // Obtener usuario desde headers
    const user = getUserFromRequest(request.headers);
    
    const body = await request.json();
    const { id, solicitante, solicitud, categoria, agente, area, sede, estado, tipoAtencion, fechaCierre, solucion, originalData } = body;

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

    // Convertir fecha de cierre si existe
    let fechaCierreParaBD = null;
    if (fechaCierre) {
      fechaCierreParaBD = new Date(fechaCierre).toISOString();
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
        estado = $7,
        tipo_atencion = $8,
        fecha_cierre = $9,
        solucion = $10
      WHERE solicitante = $11 
      AND solicitud = $12 
      AND categoria = $13 
      AND agente = $14 
      AND area = $15 
      AND sede = $16
      AND "Fecha de Registro" = $17
      RETURNING *
    `;
    
    // Ajustar la fecha de creación para comparación
    let fechaCreacionAjustada = originalData?.fecha_creacion;
    if (fechaCreacionAjustada && !fechaCreacionAjustada.includes('Z') && !fechaCreacionAjustada.includes('+')) {
      // Si es datetime-local, convertir a ISO string
      fechaCreacionAjustada = new Date(fechaCreacionAjustada).toISOString();
    } else if (!fechaCreacionAjustada) {
      // Si no hay fecha, usar la fecha actual
      fechaCreacionAjustada = new Date().toISOString();
    }
    
    const values = [
      solicitante, 
      solicitud, 
      categoria, 
      agente, 
      area, 
      sede,
      estado || 'Cerrado',
      tipoAtencion || null,
      fechaCierreParaBD,
      solucion || null,
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

