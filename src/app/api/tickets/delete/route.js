import { NextResponse } from 'next/server';
import { pool } from '@/lib/database.mjs';

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { solicitante, solicitud, categoria, agente, area, sede } = body;

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
    const query = `
      DELETE FROM public.tksoporte 
      WHERE solicitante = $1 
      AND solicitud = $2 
      AND categoria = $3
      AND (agente = $4 OR ($4 IS NULL AND agente IS NULL))
      AND (area = $5 OR ($5 IS NULL AND area IS NULL))
      AND (sede = $6 OR ($6 IS NULL AND sede IS NULL))
      RETURNING *
    `;
    
    const result = await pool.query(query, [solicitante, solicitud, categoria, agente, area, sede]);
    
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

