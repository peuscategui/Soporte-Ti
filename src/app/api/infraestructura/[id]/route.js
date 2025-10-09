import { NextResponse } from 'next/server';
import { updateInfraestructuraItem, deleteInfraestructuraItem } from '@/lib/database.mjs';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updatedItem = await updateInfraestructuraItem(parseInt(id), body);
    
    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item de infraestructura actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en API infraestructura PUT:', error);
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

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const deletedItem = await deleteInfraestructuraItem(parseInt(id));
    
    return NextResponse.json({
      success: true,
      data: deletedItem,
      message: 'Item de infraestructura eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en API infraestructura DELETE:', error);
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





