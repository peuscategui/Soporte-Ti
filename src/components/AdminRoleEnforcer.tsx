'use client';

import { useEffect } from 'react';

export default function AdminRoleEnforcer() {
  useEffect(() => {
    // Ejecutar inmediatamente al cargar
    const forceAdminRole = () => {
      console.log('🔧 Forzando configuración de administrador...');
      
      // Limpiar configuraciones anteriores
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      
      // Configurar usuario como administrador
      const adminUser = {
        fullName: 'Usuario EFC',
        role: 'Administrador',
        email: 'usuario@efc.com.pe',
        systemRole: 'admin'
      };
      
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('userRole', JSON.stringify('admin'));
      
      console.log('✅ Usuario configurado como administrador:', adminUser);
      
      // Recargar la página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // Verificar si necesita configuración
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    
    if (!storedUser || !storedRole || storedRole !== '"admin"') {
      console.log('🔧 Configuración de administrador necesaria');
      forceAdminRole();
    } else {
      console.log('✅ Usuario ya configurado como administrador');
    }
  }, []);

  return null; // Este componente no renderiza nada
}
