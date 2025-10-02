// Script para configurar usuario@efc.com.pe como administrador
console.log('🔧 Configurando usuario@efc.com.pe como administrador...');

// Configurar el rol de administrador en localStorage
if (typeof window !== 'undefined') {
  // En el navegador
  localStorage.setItem('userRole', JSON.stringify('admin'));
  localStorage.setItem('user', JSON.stringify({
    fullName: 'Usuario EFC',
    role: 'Administrador',
    email: 'usuario@efc.com.pe',
    systemRole: 'admin'
  }));
  
  console.log('✅ Rol de administrador configurado en localStorage');
  console.log('📋 Datos del usuario:', {
    email: 'usuario@efc.com.pe',
    role: 'admin',
    permissions: 'Acceso completo al sistema'
  });
} else {
  // En Node.js (para desarrollo)
  console.log('⚠️  Este script debe ejecutarse en el navegador');
  console.log('📝 Para configurar manualmente:');
  console.log('1. Abre las herramientas de desarrollador (F12)');
  console.log('2. Ve a la pestaña Console');
  console.log('3. Ejecuta: localStorage.setItem("userRole", JSON.stringify("admin"))');
  console.log('4. Recarga la página');
}

console.log('🎯 Configuración completada');
console.log('🔄 Recarga la página para ver los cambios');
