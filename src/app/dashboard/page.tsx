'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Users, Building2, Calendar, XCircle, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('7');
  const [chartFilter, setChartFilter] = useState('7');
  const [agentFilter, setAgentFilter] = useState('7');

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  useEffect(() => {
    fetchChartData();
  }, [chartFilter]);

  useEffect(() => {
    fetchAgentData();
  }, [agentFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?days=${dateFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.message || 'Error cargando datos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`/api/dashboard?days=${chartFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData((prev: any) => ({
          ...prev,
          ticketsTrend: result.data.ticketsTrend
        }));
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  const fetchAgentData = async () => {
    try {
      const response = await fetch(`/api/dashboard?days=${agentFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData((prev: any) => ({
          ...prev,
          agentAttendances: result.data.agentAttendances
        }));
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

        // Preparar datos para las tarjetas de estadísticas
        const statCards = [
          {
            title: 'Tickets Totales',
            value: dashboardData?.stats?.total_tickets?.toString() || '0',
            change: `Últimos ${dateFilter} días`,
            changeType: 'neutral',
            icon: Ticket,
          },
          {
            title: 'Top 3 Usuarios',
            value: dashboardData?.topUsuarios?.slice(0, 3).map((user, index) => `${index + 1}. ${user.solicitante}`).join('\n') || 'Sin datos',
            change: 'Más atendidos',
            changeType: 'neutral',
            icon: Users,
          },
          {
            title: 'Top 3 Áreas',
            value: dashboardData?.topAreas?.slice(0, 3).map((area, index) => `${index + 1}. ${area.area}`).join('\n') || 'Sin datos',
            change: 'Más atendidas',
            changeType: 'neutral',
            icon: Building2,
          },
          {
            title: 'Top 3 Categorías',
            value: dashboardData?.topCategorias?.slice(0, 3).map((cat, index) => `${index + 1}. ${cat.categoria}`).join('\n') || 'Sin datos',
            change: 'Más frecuentes',
            changeType: 'neutral',
            icon: Calendar,
          },
        ];


  // Preparar datos del gráfico
  const prepareChartData = () => {
    if (!dashboardData?.ticketsTrend || dashboardData.ticketsTrend.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [
          {
            label: 'Tickets Creados',
            data: [0],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Tickets Resueltos',
            data: [0],
            borderColor: '#2F4050',
            backgroundColor: 'rgba(47, 64, 80, 0.1)',
            tension: 0.4,
          },
        ],
      };
    }

    const labels = dashboardData.ticketsTrend.map(item => 
      new Date(item.fecha).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    
    const totalTickets = dashboardData.ticketsTrend.map(item => item.total_tickets);
    const resolvedTickets = dashboardData.ticketsTrend.map(item => item.tickets_resueltos);

    return {
      labels,
      datasets: [
        {
          label: 'Tickets Creados',
          data: totalTickets,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Tickets Resueltos',
          data: resolvedTickets,
          borderColor: '#2F4050',
          backgroundColor: 'rgba(47, 64, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  // Preparar datos del gráfico de agentes (barras)
  const prepareAgentChartData = () => {
    if (!dashboardData?.agentAttendances || dashboardData.agentAttendances.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: []
      };
    }

    console.log('Datos de agentes en frontend:', dashboardData.agentAttendances);

    // Los datos ya vienen agrupados por agente desde la base de datos
    const labels = dashboardData.agentAttendances.map(item => item.agente);
    const data = dashboardData.agentAttendances.map(item => Number(item.atenciones));

    console.log('Labels:', labels);
    console.log('Data:', data);

    // Colores para cada agente
    const colors = [
      '#4CAF50', '#2F4050', '#FF9800', '#9C27B0', '#F44336', '#2196F3', '#795548'
    ];

    return {
      labels,
      datasets: [{
        label: 'Atenciones Totales',
        data: data,
        backgroundColor: colors.slice(0, labels.length).map(color => color + '80'),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  };

  const agentChartData = prepareAgentChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: false, // Ocultar leyenda para simplificar
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Soporte</h1>
        <p className="text-gray-600">Resumen general del sistema de soporte técnico</p>
      </div>

      {/* Filtro de Fechas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por período:</label>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7">Últimos 7 días</option>
              <option value="15">Últimos 15 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Mostrando datos de los últimos {dateFilter} días
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`font-bold text-gray-900 mb-2 ${stat.title.includes('Top 3') ? 'text-sm leading-tight' : 'text-3xl'}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">vs mes anterior</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendencia de Tickets */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tendencia de Tickets</h2>
                <p className="text-sm text-gray-600 mt-1">Análisis temporal de tickets</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Período:</label>
                <select 
                  value={chartFilter}
                  onChange={(e) => setChartFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Atenciones por Agente */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Atenciones por Agente</h2>
                <p className="text-sm text-gray-600 mt-1">Total de solicitudes atendidas por agente</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Período:</label>
                <select 
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Bar data={agentChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
