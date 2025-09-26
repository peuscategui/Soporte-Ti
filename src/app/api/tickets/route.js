import { NextResponse } from 'next/server';
import { query } from '../../../lib/database.mjs';

export async function GET() {
  try {
    const queryText = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY "Fecha de Registro" DESC) as id,
        "Fecha de Registro" as fecha_creacion,
        COALESCE(solicitante, '') as solicitante,
        COALESCE(solicitud, '') as solicitud,
        COALESCE(categoria, '') as categoria,
        COALESCE(agente, '') as agente,
        COALESCE(area, '') as area,
        COALESCE(sede, '') as sede
      FROM public.tksoporte 
      WHERE "Fecha de Registro" IS NOT NULL
      ORDER BY "Fecha de Registro" DESC;
    `;
    
    const result = await query(queryText);
    
    return NextResponse.json({
      success: true,
      data: result.rows
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
