import { NextResponse } from 'next/server';
import {
  getTaskById,
  getTaskUpdates,
  addTaskUpdate,
} from '@/lib/database.mjs';
import { getUserFromRequest } from '@/lib/permissionValidator.js';
import { validateTaskUpdatePayload } from '@/lib/validators.mjs';

const canAddTaskUpdate = (user) => {
  const role = user?.systemRole?.toLowerCase?.() || 'empleado';
  return role === 'admin' || role === 'supervisor' || role === 'agente';
};

export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request.headers);

    const { id } = params;
    const task = await getTaskById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    const updates = await getTaskUpdates(id);
    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error('Error obteniendo actualizaciones de tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const clientHeaders = request.headers;

  try {
    const user = getUserFromRequest(clientHeaders);

    if (!canAddTaskUpdate(user)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para registrar actualizaciones' },
        { status: 403 }
      );
    }

    const { id } = params;
    const task = await getTaskById(id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = validateTaskUpdatePayload(body);

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

    const payload = {
      ...validation.data,
      agentName: validation.data.agentName || user.fullName,
    };

    const update = await addTaskUpdate(id, payload);

    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error('Error creando actualización de tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

