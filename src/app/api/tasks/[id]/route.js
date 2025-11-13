import { NextResponse } from 'next/server';
import {
  getTaskById,
  updateTask,
  deleteTask,
  getTicketByUid,
} from '@/lib/database.mjs';
import { getUserFromRequest } from '@/lib/permissionValidator.js';
import { validateTaskPayload } from '@/lib/validators.mjs';

const canManageTasks = (user) => {
  const role = user?.systemRole?.toLowerCase?.() || 'empleado';
  return role === 'admin' || role === 'supervisor';
};

export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request.headers);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!canManageTasks(user)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para editar tareas' },
        { status: 403 }
      );
    }

    const { id } = params;
    const existing = await getTaskById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = validateTaskPayload(body, true);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Errores de validación',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const updateData = { ...validation.data };

    if (updateData.ticketUid) {
      const ticket = await getTicketByUid(updateData.ticketUid);
      if (!ticket) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ticket relacionado no encontrado',
          },
          { status: 400 }
        );
      }

      if (!updateData.ticketCode) {
        updateData.ticketCode = ticket.solicitud;
      }
    }

    const updated = await updateTask(id, updateData);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request.headers);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!canManageTasks(user)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar tareas' },
        { status: 403 }
      );
    }

    const { id } = params;
    const existing = await getTaskById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    await deleteTask(id);

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

