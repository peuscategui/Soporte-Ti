import { NextResponse } from 'next/server';
import { searchTicketsForTasks } from '@/lib/database.mjs';
import { getUserFromRequest } from '@/lib/permissionValidator.js';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request.headers);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limitParam = Number(searchParams.get('limit') || 25);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 25;

    const tickets = await searchTicketsForTasks({ queryText: q, limit });

    const payload = tickets.map(ticket => ({
      ticketUid: ticket.ticket_uid,
      title: ticket.solicitud,
      category: ticket.categoria,
      owner: ticket.solicitante,
      status: ticket.estado,
      createdAt: ticket.fecha_creacion,
    }));

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error buscando tickets para tareas:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

