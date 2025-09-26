// Categorías consolidadas para el sistema de tickets (20 categorías principales)
export const CATEGORIAS_ESTANDAR = [
  // 1. Hardware
  'Hardware',
  
  // 2. Impresoras
  'Impresoras',
  
  // 3. Correo Electrónico
  'Correo Electrónico',
  
  // 4. Sistema Horizon
  'Sistema Horizon',
  
  // 5. Sistema General
  'Sistema General',
  
  // 6. Microsoft Office
  'Microsoft Office',
  
  // 7. Microsoft Teams
  'Microsoft Teams',
  
  // 8. SharePoint
  'SharePoint',
  
  // 9. Red y Conectividad
  'Red y Conectividad',
  
  // 10. VPN y Acceso Remoto
  'VPN y Acceso Remoto',
  
  // 11. Cuentas y Usuarios
  'Cuentas y Usuarios',
  
  // 12. Backup y Seguridad
  'Backup y Seguridad',
  
  // 13. Software Especializado
  'Software Especializado',
  
  // 14. Windows y Sistema Operativo
  'Windows y Sistema Operativo',
  
  // 15. Actualizaciones de Software
  'Actualizaciones de Software',
  
  // 16. Renovación y Cambios de Equipo
  'Renovación y Cambios de Equipo',
  
  // 17. Telefonía
  'Telefonía',
  
  // 18. Entrega y Préstamo de Equipos
  'Entrega y Préstamo de Equipos',
  
  // 19. Capacitación y Soporte General
  'Capacitación y Soporte General',
  
  // 20. Otros/Misceláneos
  'Otros/Misceláneos'
];

// Categorías agrupadas por tipo para mejor organización
export const CATEGORIAS_AGRUPADAS = {
  equipos: [
    'Hardware', 'Impresoras', 'Entrega y Préstamo de Equipos', 
    'Renovación y Cambios de Equipo'
  ],
  software: [
    'Microsoft Office', 'Microsoft Teams', 'SharePoint', 
    'Software Especializado', 'Windows y Sistema Operativo',
    'Actualizaciones de Software'
  ],
  comunicaciones: [
    'Correo Electrónico', 'Telefonía', 'Red y Conectividad', 
    'VPN y Acceso Remoto'
  ],
  sistemas: [
    'Sistema General', 'Sistema Horizon'
  ],
  usuarios: [
    'Cuentas y Usuarios', 'Capacitación y Soporte General'
  ],
  seguridad: [
    'Backup y Seguridad'
  ],
  otros: [
    'Otros/Misceláneos'
  ]
};

// Función para obtener categorías sugeridas basadas en el texto de búsqueda
export function getCategoriasSugeridas(busqueda: string): string[] {
  if (!busqueda) return CATEGORIAS_ESTANDAR.slice(0, 10);
  
  const busquedaLower = busqueda.toLowerCase();
  return CATEGORIAS_ESTANDAR
    .filter(categoria => 
      categoria.toLowerCase().includes(busquedaLower)
    )
    .slice(0, 10);
}

// Función para validar si una categoría es estándar
export function esCategoriaEstandar(categoria: string): boolean {
  return CATEGORIAS_ESTANDAR.includes(categoria);
}

// Función para obtener el grupo de una categoría
export function getGrupoCategoria(categoria: string): string | null {
  for (const [grupo, categorias] of Object.entries(CATEGORIAS_AGRUPADAS)) {
    if (categorias.includes(categoria)) {
      return grupo;
    }
  }
  return null;
}

