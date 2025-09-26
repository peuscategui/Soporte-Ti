import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/database.mjs';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, solicitante, solicitud, categoria, agente, area, sede, originalData } = body;

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
        sede = $6
      WHERE solicitante = $7 
      AND solicitud = $8 
      AND categoria = $9 
      AND agente = $10 
      AND area = $11 
      AND sede = $12
      AND "Fecha de Registro" = $13
      RETURNING *
    `;
    
    const values = [
      solicitante, 
      solicitud, 
      categoria, 
      agente, 
      area, 
      sede,
      originalData?.solicitante || '',
      originalData?.solicitud || '',
      originalData?.categoria || '',
      originalData?.agente || '',
      originalData?.area || '',
      originalData?.sede || '',
      originalData?.fecha_creacion || new Date().toISOString()
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

