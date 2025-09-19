import { NextResponse } from 'next/server';
import { getTicketStats, getRecentTickets, getStatsByStatus, getTicketsByAgent, getTicketsByArea, getTicketsTrend, getAgentAttendances, getTopAreas, getTopCategorias, getTopUsuarios } from '@/lib/database.mjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '7';
    
    // Obtener estadísticas generales con filtro de días
    const stats = await getTicketStats(days);
    
    // Obtener tickets recientes
    const recentTickets = await getRecentTickets(5);
    
    // Obtener estadísticas por estado
    const statusStats = await getStatsByStatus();
    
    // Obtener tickets por agente y área
    const ticketsByAgent = await getTicketsByAgent(days);
    const ticketsByArea = await getTicketsByArea(days);
    
    // Obtener datos de tendencia
    const ticketsTrend = await getTicketsTrend(days);
    
    // Obtener atenciones por agente
    const agentAttendances = await getAgentAttendances(days);
    
    // Obtener top 3 áreas, categorías y usuarios
    const topAreas = await getTopAreas(days);
    const topCategorias = await getTopCategorias(days);
    const topUsuarios = await getTopUsuarios(days);
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          ...stats,
          tickets_por_agente: ticketsByAgent.length,
          tickets_por_area: ticketsByArea.length,
        },
        recentTickets,
        statusStats,
        ticketsByAgent,
        ticketsByArea,
        ticketsTrend,
        agentAttendances,
        topAreas,
        topCategorias,
        topUsuarios,
      }
    });
  } catch (error) {
    console.error('Error en API dashboard:', error);
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
