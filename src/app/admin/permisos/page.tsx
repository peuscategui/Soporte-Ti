'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { ROLES } from '../../../hooks/usePermissions';
import { Shield, User, Settings, Save, RefreshCw, AlertCircle, Edit, Trash2, Plus, X } from 'lucide-react';

interface UserRole {
  id: string;
  email: string;
  fullName: string;
  currentRole: string;
  department?: string;
  lastLogin?: string;
}

export default function AdminPermisosPage() {
  const { user } = useAuth();
  const { isAdmin, isSupervisor } = usePermissions();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    department: '',
    currentRole: 'empleado'
  });

  // Cargar usuarios desde localStorage (simulación)
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      setLoading(true);
      
      // Intentar cargar usuarios desde localStorage
      const savedUsers = localStorage.getItem('adminUsers');
      
      if (savedUsers) {
        // Si hay usuarios guardados, usarlos
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        console.log('📋 Usuarios cargados desde localStorage:', parsedUsers);
      } else {
        // Si no hay usuarios guardados, cargar los predeterminados
        const defaultUsers: UserRole[] = [
          {
            id: '0',
            email: 'usuario@efc.com.pe',
            fullName: 'Usuario EFC',
            currentRole: 'admin',
            department: 'Administración',
            lastLogin: '2024-01-15'
          },
          {
            id: '1',
            email: 'admin@efc.com.pe',
            fullName: 'Administrador EFC',
            currentRole: 'admin',
            department: 'Administración',
            lastLogin: '2024-01-15'
          },
          {
            id: '2',
            email: 'jesus.murrugarra@efc.com.pe',
            fullName: 'Jesus Murrugarra',
            currentRole: 'agente',
            department: 'Soporte TI',
            lastLogin: '2024-01-15'
          },
          {
            id: '3',
            email: 'jerry.contreras@efc.com.pe',
            fullName: 'Jerry Contreras',
            currentRole: 'agente',
            department: 'Soporte TI',
            lastLogin: '2024-01-14'
          },
          {
            id: '4',
            email: 'alonso.quispe@efc.com.pe',
            fullName: 'Alonso Quispe',
            currentRole: 'agente',
            department: 'Soporte TI',
            lastLogin: '2024-01-13'
          },
          {
            id: '5',
            email: 'supervisor@efc.com.pe',
            fullName: 'María Supervisor',
            currentRole: 'supervisor',
            department: 'Supervisión',
            lastLogin: '2024-01-15'
          },
          {
            id: '6',
            email: 'empleado@efc.com.pe',
            fullName: 'Juan Empleado',
            currentRole: 'empleado',
            department: 'Ventas',
            lastLogin: '2024-01-12'
          }
        ];

        setUsers(defaultUsers);
        // Guardar usuarios predeterminados en localStorage
        localStorage.setItem('adminUsers', JSON.stringify(defaultUsers));
        console.log('📋 Usuarios predeterminados cargados y guardados');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => 
        u.id === userId ? { ...u, currentRole: newRole } : u
      );
      // Guardar cambios en localStorage
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
      console.log('💾 Rol actualizado y guardado:', userId, newRole);
      return updatedUsers;
    });
  };


  const handleEditUser = (user: UserRole) => {
    setEditingUser(user);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => 
        u.id === editingUser.id ? editingUser : u
      );
      // Guardar cambios en localStorage
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
      console.log('💾 Usuario editado y guardado:', editingUser);
      return updatedUsers;
    });
    
    setEditingUser(null);
    alert('✅ Usuario actualizado correctamente');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(u => u.id !== userId);
        // Guardar cambios en localStorage
        localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
        console.log('💾 Usuario eliminado y guardado:', userId);
        return updatedUsers;
      });
      alert('✅ Usuario eliminado correctamente');
    }
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.fullName) {
      alert('❌ Email y nombre son requeridos');
      return;
    }

    const newUserData: UserRole = {
      id: Date.now().toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      department: newUser.department,
      currentRole: newUser.currentRole,
      lastLogin: new Date().toISOString().split('T')[0]
    };

    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, newUserData];
      // Guardar cambios en localStorage
      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
      console.log('💾 Usuario agregado y guardado:', newUserData);
      return updatedUsers;
    });
    
    setNewUser({ email: '', fullName: '', department: '', currentRole: 'empleado' });
    setShowAddUser(false);
    alert('✅ Usuario agregado correctamente');
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agente':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar permisos de acceso después de todos los hooks
  if (!isAdmin && !isSupervisor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a la administración de permisos.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Solo administradores y supervisores pueden gestionar permisos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                Administración de Permisos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los roles y permisos de los usuarios del sistema
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Usuario
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres resetear todos los usuarios a los valores predeterminados? Esto eliminará todos los cambios.')) {
                    localStorage.removeItem('adminUsers');
                    loadUsers();
                    alert('✅ Usuarios reseteados a valores predeterminados');
                  }
                }}
                className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Resetear
              </button>
              <button
                onClick={loadUsers}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.values(ROLES).map((role) => {
            const count = users.filter(u => u.currentRole === role.id).length;
            return (
              <div key={role.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{role.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-3 rounded-full ${getRoleColor(role.id)}`}>
                    {getRoleIcon(role.id)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, email o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Todos los roles</option>
                {Object.values(ROLES).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambiar Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers
                  .filter(user => !selectedRole || user.currentRole === selectedRole)
                  .map((userRole) => (
                  <tr key={userRole.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userRole.fullName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userRole.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userRole.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole.currentRole)}`}>
                        {getRoleIcon(userRole.currentRole)}
                        {ROLES[userRole.currentRole.toUpperCase()]?.name || userRole.currentRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={userRole.currentRole}
                        onChange={(e) => handleRoleChange(userRole.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      >
                        {Object.values(ROLES).map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userRole.lastLogin ? new Date(userRole.lastLogin).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(userRole)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userRole.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(ROLES).map((role) => (
            <div key={role.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${getRoleColor(role.id)}`}>
                  {getRoleIcon(role.id)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ver todos los tickets</span>
                  <span className={`px-2 py-1 rounded text-xs ${role.permissions.canViewAllTickets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.permissions.canViewAllTickets ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Editar todos los tickets</span>
                  <span className={`px-2 py-1 rounded text-xs ${role.permissions.canEditAllTickets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.permissions.canEditAllTickets ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Crear tickets</span>
                  <span className={`px-2 py-1 rounded text-xs ${role.permissions.canCreateTickets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.permissions.canCreateTickets ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Eliminar tickets</span>
                  <span className={`px-2 py-1 rounded text-xs ${role.permissions.canDeleteTickets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.permissions.canDeleteTickets ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal para editar usuario */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Editar Usuario</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={editingUser.currentRole}
                    onChange={(e) => setEditingUser({...editingUser, currentRole: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar usuario */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Agregar Usuario</h3>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="usuario@efc.com.pe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Soporte TI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={newUser.currentRole}
                    onChange={(e) => setNewUser({...newUser, currentRole: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Agregar Usuario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
