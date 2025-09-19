import { NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET() {
  try {
    const query = `
      SELECT 
        ROW_NUMBER() OVER (ORDER BY "Fecha de Registro" DESC) as id,
        "Fecha de Registro" as fecha_creacion,
        solicitante,
        solicitud,
        categoria,
        agente,
        area
      FROM public.tksoporte 
      WHERE "Fecha de Registro" IS NOT NULL
      ORDER BY "Fecha de Registro" DESC;
    `;
    
    const result = await pool.query(query);
    
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
