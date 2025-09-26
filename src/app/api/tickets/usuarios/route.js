import { NextResponse } from 'next/server';
import { getAllUsuarios } from '@/lib/database.mjs';

export async function GET() {
  try {
    console.log('🔄 Obteniendo usuarios...');
    const usuarios = await getAllUsuarios();
    
    console.log('✅ Usuarios obtenidos:', usuarios.length);
    console.log('📋 Primeros 5 usuarios:', usuarios.slice(0, 5));
    
    return NextResponse.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
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
