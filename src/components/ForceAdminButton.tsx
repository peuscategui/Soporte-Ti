'use client';

import { useState } from 'react';

export default function ForceAdminButton() {
  const [clicked, setClicked] = useState(false);

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
    
    setClicked(true);
    
    // Recargar la página para aplicar cambios
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (clicked) {
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        ✅ Configurando como administrador... Recargando página
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <button 
        onClick={forceAdminRole}
        className="font-bold"
      >
        🔧 Configurar como Administrador
      </button>
    </div>
  );
}
