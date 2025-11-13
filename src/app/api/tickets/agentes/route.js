import { NextResponse } from 'next/server';
import { getAllAgentes } from '../../../../lib/database.mjs';

export async function GET() {
  try {
    console.log('🔄 Obteniendo agentes...');
    const agentes = await getAllAgentes();
    
    console.log('✅ Agentes obtenidos:', agentes.length);
    console.log('📋 Primeros 5 agentes:', agentes.slice(0, 5));
    
    return NextResponse.json({
      success: true,
      data: agentes
    });
  } catch (error) {
    console.error('❌ Error obteniendo agentes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
