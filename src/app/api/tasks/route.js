import { NextResponse } from 'next/server';
import {
  getTasks,
  getUpdatesForTasks,
  createTask,
  getTicketByUid,
} from '@/lib/database.mjs';
import { getUserFromRequest } from '@/lib/permissionValidator.js';
import { validateTaskPayload } from '@/lib/validators.mjs';

const canManageTasks = (user) => {
  const role = user?.systemRole?.toLowerCase?.() || 'empleado';
  return role === 'admin' || role === 'supervisor';
};

export async function GET(request) {
  try {
    const user = getUserFromRequest(request.headers);

    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId') || undefined;

    const tasks = await getTasks({ boardId });
    const taskIds = tasks.map(task => task.id);

    let updatesByTask = {};
    if (taskIds.length > 0) {
      const updates = await getUpdatesForTasks(taskIds);
      updatesByTask = updates.reduce((acc, update) => {
        if (!acc[update.task_id]) {
          acc[update.task_id] = [];
        }
        acc[update.task_id].push(update);
        return acc;
      }, {});
    }

    const payload = tasks.map(task => ({
      ...task,
      ticket_uid: task.linked_ticket_uid,
      updates: updatesByTask[task.id] || [],
    }));

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request.headers);

    if (!canManageTasks(user)) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para crear tareas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = validateTaskPayload(body, false);

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

    let ticketCode = validation.data.ticketCode ?? null;
    let ticketUid = validation.data.ticketUid ?? null;

    if (ticketUid) {
      const ticket = await getTicketByUid(ticketUid);
      if (!ticket) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ticket relacionado no encontrado',
          },
          { status: 400 }
        );
      }

      if (!ticketCode) {
        ticketCode = ticket.solicitud;
      }
    }

    const sanitized = {
      boardId: validation.data.boardId ?? null,
      ticketCode,
      ticketUid,
      title: validation.data.title,
      description: validation.data.description ?? null,
      category: validation.data.category ?? null,
      priority: validation.data.priority || 'Media',
      status: validation.data.status || 'Pendiente',
      startDate: validation.data.startDate || null,
      dueDate: validation.data.dueDate || null,
      usersServed: validation.data.usersServed ?? 0,
      progress: validation.data.progress ?? 0,
      createdBy: validation.data.createdBy ?? user.fullName,
    };

    const task = await createTask(sanitized);

    return NextResponse.json({ success: true, data: { ...task, updates: [] } });
  } catch (error) {
    console.error('Error creando tarea:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

