'use client';

import { useState } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown, HeadphonesIcon, Wrench, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionQuickSettings from '../PermissionQuickSettings';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPermissionSettings, setShowPermissionSettings] = useState(false);
  const { user, loading, logout } = useAuth();
  const { userRole, isAdmin, isAgent, isSupervisor } = usePermissions();

  const notifications = [
    { id: 1, message: 'Nuevo ticket asignado: #12345', time: 'Hace 5 min' },
    { id: 2, message: 'Ticket #9876 resuelto por Juan', time: 'Hace 1 hora' },
  ];


  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#283447] rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Seguimiento de atenciones</h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">4</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {loading ? 'Cargando...' : (user?.fullName || 'Usuario')}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {loading ? 'Cargando...' : (
                  <>
                    {isAdmin && <Shield className="h-3 w-3 text-red-500" />}
                    {isSupervisor && <Shield className="h-3 w-3 text-blue-500" />}
                    {isAgent && <User className="h-3 w-3 text-green-500" />}
                    {userRole?.name || user?.role || 'Usuario'}
                  </>
                )}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                  {loading ? 'Cargando...' : (user?.email || 'usuario@efc.com.pe')}
                </div>
                {(isAdmin || isSupervisor) && (
                  <button 
                    onClick={() => setShowPermissionSettings(true)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Permisos
                  </button>
                )}
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Permission Quick Settings Modal */}
      <PermissionQuickSettings
        isOpen={showPermissionSettings}
        onClose={() => setShowPermissionSettings(false)}
      />
    </header>
  );
}

