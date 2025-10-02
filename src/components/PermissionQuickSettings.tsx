'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { ROLES } from '../hooks/usePermissions';
import { Settings, Shield, User, Save, X } from 'lucide-react';

interface PermissionQuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionQuickSettings({ isOpen, onClose }: PermissionQuickSettingsProps) {
  const { user } = useAuth();
  const { isAdmin, isSupervisor, userRole } = usePermissions();
  const [selectedRole, setSelectedRole] = useState(userRole?.id || 'empleado');
  const [saving, setSaving] = useState(false);

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      
      // Actualizar el rol del usuario actual
      localStorage.setItem('userRole', JSON.stringify(selectedRole));
      
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('✅ Rol actualizado correctamente. Recarga la página para ver los cambios.');
      onClose();
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('❌ Error al actualizar el rol');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'supervisor':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'agente':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'supervisor':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'agente':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Verificar permisos después de todos los hooks
  if (!isAdmin && !isSupervisor) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración Rápida
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Usuario: {user?.fullName || 'Usuario'}
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Rol
            </label>
            <div className="space-y-3">
              {Object.values(ROLES).map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedRole === role.id
                      ? `${getRoleColor(role.id)} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-full ${getRoleColor(role.id)}`}>
                    {getRoleIcon(role.id)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-gray-500">
                      {role.id === 'admin' && 'Acceso completo al sistema'}
                      {role.id === 'supervisor' && 'Vista completa, gestión limitada'}
                      {role.id === 'agente' && 'Solo tickets asignados'}
                      {role.id === 'empleado' && 'Solo crear tickets'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Cambio de Rol
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Al cambiar tu rol, necesitarás recargar la página para que los cambios surtan efecto.
                  Los permisos se aplicarán inmediatamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRole}
              disabled={saving || selectedRole === userRole?.id}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
