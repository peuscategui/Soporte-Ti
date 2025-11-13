import { NextResponse } from 'next/server';
import { getAllInfraestructura, createInfraestructuraItem } from '@/lib/database.mjs';

export async function GET() {
  try {
    const infraestructura = await getAllInfraestructura();
    
    return NextResponse.json({
      success: true,
      data: infraestructura
    });
  } catch (error) {
    console.error('Error en API infraestructura GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newItem = await createInfraestructuraItem(body);
    
    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Item de infraestructura creado exitosamente'
    });
  } catch (error) {
    console.error('Error en API infraestructura POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}










