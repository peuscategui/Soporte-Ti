import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/database.mjs';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      solicitud,
      categoria,
      area,
      solicitante,
      agenteAsignado,
      sede,
      fechaCreacion
    } = body;

    // Validar campos requeridos
    if (!solicitud || !categoria || !area || !solicitante) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Insertar nuevo ticket
    const result = await query(`
      INSERT INTO tksoporte (
        solicitud, 
        categoria, 
        area, 
        solicitante, 
        agente, 
        sede, 
        "Fecha de Registro"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      solicitud,
      categoria,
      area,
      solicitante,
      agenteAsignado || null,
      sede || 'Surquillo',
      fechaCreacion || new Date().toISOString()
    ]);

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
