'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  MessageCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HeadphonesIcon,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/agentes', label: 'Agentes', icon: Users },
  { href: '/areas', label: 'Áreas', icon: Building2 },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/knowledge', label: 'Base de Conocimientos', icon: BookOpen },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: dashboardData, loading } = useDashboardData();

  // Preparar estadísticas rápidas con datos reales
  const quickStats = [
    { 
      label: 'Tickets Abiertos', 
      value: dashboardData?.stats?.tickets_abiertos || 0, 
      color: 'text-red-500' 
    },
    { 
      label: 'Tickets Asignados', 
      value: dashboardData?.stats?.tickets_asignados || 0, 
      color: 'text-yellow-500' 
    },
    { 
      label: 'Tickets Resueltos Hoy', 
      value: dashboardData?.stats?.tickets_resueltos || 0, 
      color: 'text-green-500' 
    },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={`relative flex flex-col bg-secondary transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-600 px-4">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-white text-xl font-bold tracking-wider uppercase">EFC</p>
            <p className="text-white text-sm font-bold tracking-wider uppercase">SOPORTE TI</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center p-3 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-5 w-5" />
              <span className={`ml-3 font-medium text-sm ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-600">
          <h3 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wide">
            Resumen Rápido
          </h3>
          <div className="space-y-2">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">{stat.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-600">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
