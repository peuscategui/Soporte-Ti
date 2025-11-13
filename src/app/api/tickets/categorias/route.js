import { NextResponse } from 'next/server';
import { getAllCategorias } from '../../../../lib/database.mjs';

export async function GET() {
  try {
    console.log('🔄 Obteniendo categorías...');
    const categorias = await getAllCategorias();
    
    console.log('✅ Categorías obtenidas:', categorias.length);
    console.log('📋 Primeras 5 categorías:', categorias.slice(0, 5));
    
    return NextResponse.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
