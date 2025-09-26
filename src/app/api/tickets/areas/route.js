import { NextResponse } from 'next/server';
import { getAllAreas } from '@/lib/database.mjs';

export async function GET() {
  try {
    console.log('🔄 Obteniendo áreas...');
    const areas = await getAllAreas();
    
    console.log('✅ Áreas obtenidas:', areas.length);
    console.log('📋 Primeras 5 áreas:', areas.slice(0, 5));
    
    return NextResponse.json({
      success: true,
      data: areas
    });
  } catch (error) {
    console.error('❌ Error obteniendo áreas:', error);
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
