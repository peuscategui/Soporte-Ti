import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database.mjs';

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { solicitante, solicitud, categoria, agente, area, sede } = body;
    
    console.log('🔍 DELETE request recibida con datos:', {
      solicitante,
      solicitud,
      categoria,
      agente,
      area,
      sede
    });

    if (!solicitante || !solicitud || !categoria) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos del ticket requeridos para eliminación' 
        },
        { status: 400 }
      );
    }

    // Eliminar ticket usando una combinación única de campos
    // Manejar tanto valores NULL como cadenas vacías
    const queryText = `
      DELETE FROM public.tksoporte 
      WHERE solicitante = $1 
      AND solicitud = $2 
      AND categoria = $3
      AND (agente = $4 OR ($4 = '' AND agente IS NULL) OR ($4 IS NULL AND agente IS NULL))
      AND (area = $5 OR ($5 = '' AND area IS NULL) OR ($5 IS NULL AND area IS NULL))
      AND (sede = $6 OR ($6 = '' AND sede IS NULL) OR ($6 IS NULL AND sede IS NULL))
      RETURNING *
    `;
    
    console.log('🔍 Ejecutando query de eliminación con parámetros:', [solicitante, solicitud, categoria, agente, area, sede]);
    
    const result = await query(queryText, [solicitante, solicitud, categoria, agente, area, sede]);
    
    console.log('🔍 Resultado de la eliminación:', result.rows.length, 'registros afectados');
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket no encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Ticket eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando ticket:', error);
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

