'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Users, 
  Building2, 
  Calendar, 
  XCircle, 
  TrendingUp, 
  Tag, 
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react';
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
  const [periodFilter, setPeriodFilter] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [periodFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?days=${periodFilter}`);
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
            title: 'Tickets de Soporte',
            value: dashboardData?.stats?.tickets_soporte?.toString() || '0',
            change: `Últimos ${periodFilter} días`,
            changeType: 'positive',
            icon: Ticket,
          },
          {
            title: 'Tickets de Infraestructura',
            value: dashboardData?.infraestructuraStats?.total_infraestructura?.toString() || '0',
            change: `Últimos ${periodFilter} días`,
            changeType: 'positive',
            icon: Building2,
          },
          {
            title: 'Total de Tickets',
            value: dashboardData?.stats?.total_tickets?.toString() || '0',
            change: `Últimos ${periodFilter} días`,
            changeType: 'neutral',
            icon: Calendar,
          },
          {
            title: 'Tickets Resueltos',
            value: dashboardData?.stats?.tickets_resueltos?.toString() || '0',
            change: 'Completados',
            changeType: 'positive',
            icon: Activity,
          },
        ];

        // Preparar datos para gráficos de top 10
        const prepareTop10CategoriasData = () => {
          if (!dashboardData?.topCategorias || dashboardData.topCategorias.length === 0) {
            return {
              labels: ['Sin datos'],
              datasets: []
            };
          }

          const top10 = dashboardData.topCategorias.slice(0, 10);
          const labels = top10.map((cat: any) => cat.categoria);
          const data = top10.map((cat: any) => Number(cat.cantidad));

          // Colores para cada categoría
          const colors = [
            '#4CAF50', '#2F4050', '#FF9800', '#9C27B0', '#F44336', 
            '#2196F3', '#795548', '#607D8B', '#E91E63', '#3F51B5'
          ];

          return {
            labels,
            datasets: [{
              label: 'Solicitudes',
              data: data,
              backgroundColor: colors.slice(0, labels.length).map((color: string) => color + '80'),
              borderColor: colors.slice(0, labels.length),
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            }]
          };
        };

        const prepareTop10AreasData = () => {
          if (!dashboardData?.topAreas || dashboardData.topAreas.length === 0) {
            return {
              labels: ['Sin datos'],
              datasets: []
            };
          }

          const top10 = dashboardData.topAreas.slice(0, 10);
          const labels = top10.map((area: any) => area.area);
          const data = top10.map((area: any) => Number(area.cantidad));

          // Colores para cada área
          const colors = [
            '#4CAF50', '#2F4050', '#FF9800', '#9C27B0', '#F44336', 
            '#2196F3', '#795548', '#607D8B', '#E91E63', '#3F51B5'
          ];

          return {
            labels,
            datasets: [{
              label: 'Solicitudes',
              data: data,
              backgroundColor: colors.slice(0, labels.length).map((color: string) => color + '80'),
              borderColor: colors.slice(0, labels.length),
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            }]
          };
        };

        const top10CategoriasData = prepareTop10CategoriasData();
        const top10AreasData = prepareTop10AreasData();


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

    const labels = dashboardData.ticketsTrend.map((item: any) => 
      new Date(item.fecha).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    
    const totalTickets = dashboardData.ticketsTrend.map((item: any) => item.total_tickets);
    const resolvedTickets = dashboardData.ticketsTrend.map((item: any) => item.tickets_resueltos);

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
    const labels = dashboardData.agentAttendances.map((item: any) => item.agente);
    const data = dashboardData.agentAttendances.map((item: any) => Number(item.atenciones));

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
        backgroundColor: colors.slice(0, labels.length).map((color: string) => color + '80'),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  };

  const agentChartData = prepareAgentChartData();

  // Preparar datos del gráfico de sede (barras)
  const prepareSedeChartData = () => {
    if (!dashboardData?.sedeAttendances || dashboardData.sedeAttendances.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: []
      };
    }

    console.log('Datos de sede en frontend:', dashboardData.sedeAttendances);

    // Los datos ya vienen agrupados por sede desde la base de datos
    const labels = dashboardData.sedeAttendances.map((item: any) => item.sede);
    const data = dashboardData.sedeAttendances.map((item: any) => Number(item.atenciones));

    console.log('Labels sede:', labels);
    console.log('Data sede:', data);

    // Colores para cada sede
    const colors = [
      '#4CAF50', '#2F4050', '#FF9800', '#9C27B0', '#F44336', '#2196F3', '#795548'
    ];

    return {
      labels,
      datasets: [{
        label: 'Atenciones por Sede',
        data: data,
        backgroundColor: colors.slice(0, labels.length).map((color: string) => color + '80'),
        borderColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  };

  const sedeChartData = prepareSedeChartData();

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
          callback: function(value: any) {
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

  // Opciones específicas para gráficos horizontales
  const horizontalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Hacer el gráfico horizontal
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 11
          }
        }
      },
    },
  };

  return (
    <div className="flex-1 p-8 min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Soporte</h1>
        <p className="text-gray-600">Resumen general del sistema de soporte técnico</p>
      </div>

      {/* Filtro de período */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por período:</span>
            </div>
            <div className="flex items-center space-x-2">
            <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7">Últimos 7 días</option>
              <option value="15">Últimos 15 días</option>
              <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
            </select>
              <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat: any, index: number) => {
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
                    : stat.changeType === 'neutral'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="font-bold text-gray-900 mb-2 text-3xl">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">Últimos {periodFilter} días</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Tendencia de Tickets */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tendencia de Tickets</h2>
              <p className="text-sm text-gray-600 mt-1">Análisis temporal de tickets - Últimos {periodFilter} días</p>
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">Atenciones por Agente</h2>
              <p className="text-sm text-gray-600 mt-1">Total de solicitudes atendidas por agente - Últimos {periodFilter} días</p>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Bar data={agentChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Atenciones por Sede */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Atenciones por Sede</h2>
              <p className="text-sm text-gray-600 mt-1">Total de solicitudes atendidas por sede - Últimos {periodFilter} días</p>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Bar data={sedeChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top 10 Categorías */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top 10 Categorías</h2>
                <p className="text-sm text-gray-600 mt-1">Más solicitadas en los últimos {periodFilter} días</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                <Tag className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Bar data={top10CategoriasData} options={horizontalChartOptions} />
            </div>
          </div>
        </div>

        {/* Top 10 Áreas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 border-t-primary">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top 10 Áreas</h2>
                <p className="text-sm text-gray-600 mt-1">Más solicitudes en los últimos {periodFilter} días</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80">
              <Bar data={top10AreasData} options={horizontalChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
