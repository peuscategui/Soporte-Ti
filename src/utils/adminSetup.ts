// Utilidad para configurar automáticamente el rol de administrador
export const setupAdminRole = () => {
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
  
  console.log('✅ Usuario configurado como administrador');
  console.log('📋 Datos:', adminUser);
  
  return adminUser;
};

// Función para verificar y corregir el rol si es necesario
export const ensureAdminRole = () => {
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      
      // Si es el usuario correcto pero no tiene rol de admin
      if (userData.email === 'usuario@efc.com.pe' && userData.systemRole !== 'admin') {
        console.log('🔧 Corrigiendo rol de usuario...');
        return setupAdminRole();
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return setupAdminRole();
    }
  } else {
    // No hay usuario almacenado, configurar como admin
    console.log('🔧 Configurando usuario inicial como administrador...');
    return setupAdminRole();
  }
  
  return null;
};
