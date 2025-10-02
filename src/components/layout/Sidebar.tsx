'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePermissions } from '@/hooks/usePermissions';
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
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/infraestructura', label: 'Infraestructura', icon: Building2 },
  { href: '/areas', label: 'Áreas', icon: Building2 },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/knowledge', label: 'Base de Conocimientos', icon: BookOpen },
];

const adminItems = [
  { href: '/admin/permisos', label: 'Administrar Permisos', icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: dashboardData, loading } = useDashboardData();
  const { isAdmin, isSupervisor } = usePermissions();

  // Preparar estadísticas rápidas con datos reales
  const quickStats = [
    { 
      label: 'Tickets Abiertos', 
      value: (dashboardData as any)?.stats?.tickets_abiertos || 0, 
      color: 'text-red-500' 
    },
    { 
      label: 'Tickets Asignados', 
      value: (dashboardData as any)?.stats?.tickets_asignados || 0, 
      color: 'text-yellow-500' 
    },
    { 
      label: 'Tickets Resueltos Hoy', 
      value: (dashboardData as any)?.stats?.tickets_resueltos || 0, 
      color: 'text-green-500' 
    },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={`relative flex flex-col bg-[#283447] transition-all duration-300 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b border-white/20 px-4">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1 tracking-wide">DASHBOARD</p>
            <p className="text-white text-sm font-medium tracking-wider">INFRAESTRUCTURA</p>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <HeadphonesIcon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-white hover:bg-white/10'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white group-hover:text-white'}`} />
              <span className={`ml-3 text-sm font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
            </Link>
          );
        })}
        
        {/* Admin Section */}
        {(isAdmin || isSupervisor) && (
          <>
            <div className={`border-t border-white/20 my-4 ${isCollapsed ? 'mx-2' : 'mx-0'}`}></div>
            <div className="px-3">
              <div className={`text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide ${isCollapsed ? 'hidden' : 'block'}`}>
                Administración
              </div>
              <div className="space-y-1">
                {adminItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-yellow-600 text-white'
                          : 'text-white hover:bg-white/10'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white group-hover:text-white'}`} />
                      <span className={`ml-3 text-sm font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white">
          <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">
            Resumen Rápido
          </h3>
          <div className="space-y-2">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-white">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
