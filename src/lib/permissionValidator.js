// Roles del sistema
const ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'Administrador',
    permissions: {
      canViewAllTickets: true,
      canEditAllTickets: true,
      canCreateTickets: true,
      canEditOwnTickets: true,
      canViewOwnTickets: true,
      canDeleteTickets: true,
      canManageUsers: true,
      canViewReports: true,
    },
  },
  AGENTE: {
    id: 'agente',
    name: 'Agente de Soporte',
    permissions: {
      canViewAllTickets: false,
      canEditAllTickets: false,
      canCreateTickets: true,
      canEditOwnTickets: true,
      canViewOwnTickets: true,
      canDeleteTickets: false,
      canManageUsers: false,
      canViewReports: false,
    },
  },
  SUPERVISOR: {
    id: 'supervisor',
    name: 'Supervisor',
    permissions: {
      canViewAllTickets: true,
      canEditAllTickets: false,
      canCreateTickets: true,
      canEditOwnTickets: true,
      canViewOwnTickets: true,
      canDeleteTickets: false,
      canManageUsers: false,
      canViewReports: true,
    },
  },
  EMPLEADO: {
    id: 'empleado',
    name: 'Empleado',
    permissions: {
      canViewAllTickets: false,
      canEditAllTickets: false,
      canCreateTickets: true,
      canEditOwnTickets: false,
      canViewOwnTickets: false,
      canDeleteTickets: false,
      canManageUsers: false,
      canViewReports: false,
    },
  },
};

// Función para validar permisos en el servidor
export const validateTicketPermission = (
  user,
  ticket,
  action
) => {
  
  // Obtener el rol del usuario
  const userRole = user?.systemRole || 'empleado';
  const role = ROLES[userRole.toUpperCase()] || ROLES.EMPLEADO;
  
  // Verificar si es administrador (acceso completo)
  if (role.id === 'admin') {
    return { allowed: true };
  }

  switch (action) {
    case 'view':
      if (role.permissions.canViewAllTickets) {
        return { allowed: true };
      }
      if (role.permissions.canViewOwnTickets && isTicketAssignedToUser(ticket, user)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'No tienes permisos para ver este ticket' 
      };

    case 'edit':
      if (role.permissions.canEditAllTickets) {
        return { allowed: true };
      }
      if (role.permissions.canEditOwnTickets && isTicketAssignedToUser(ticket, user)) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Solo puedes editar tickets asignados a ti' 
      };

    case 'delete':
      if (role.permissions.canDeleteTickets) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'No tienes permisos para eliminar tickets' 
      };

    case 'create':
      if (role.permissions.canCreateTickets) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'No tienes permisos para crear tickets' 
      };

    default:
      return { 
        allowed: false, 
        reason: 'Acción no válida' 
      };
  }
};

// Función para verificar si un ticket está asignado al usuario
const isTicketAssignedToUser = (ticket, user) => {
  if (!ticket?.agente || !user?.fullName) {
    return false;
  }

  const ticketAgent = ticket.agente.toLowerCase().trim();
  const userFullName = user.fullName.toLowerCase().trim();
  const userEmail = user.email?.toLowerCase().trim();

  return ticketAgent === userFullName || 
         ticketAgent === userEmail ||
         ticketAgent.includes(userFullName) ||
         userFullName.includes(ticketAgent);
};

// Función para validar asignación de agente
export const validateAgentAssignment = (
  user,
  assignedAgent
) => {
  
  const userRole = user?.systemRole || 'empleado';
  const role = ROLES[userRole.toUpperCase()] || ROLES.EMPLEADO;
  
  // Administradores pueden asignar a cualquiera
  if (role.id === 'admin') {
    return { allowed: true };
  }

  // Supervisores pueden asignar a cualquiera
  if (role.id === 'supervisor') {
    return { allowed: true };
  }

  // Agentes solo pueden asignar a sí mismos
  if (role.id === 'agente') {
    const userFullName = user.fullName.toLowerCase().trim();
    const assignedAgentLower = assignedAgent.toLowerCase().trim();
    
    if (assignedAgentLower === userFullName || 
        assignedAgentLower.includes(userFullName) ||
        userFullName.includes(assignedAgentLower)) {
      return { allowed: true };
    }
    
    return { 
      allowed: false, 
      reason: 'Solo puedes asignar tickets a ti mismo' 
    };
  }

  // Empleados no pueden asignar tickets
  return { 
    allowed: false, 
    reason: 'No tienes permisos para asignar tickets' 
  };
};

// Función para obtener usuario desde headers (simulación)
export const getUserFromRequest = (headers) => {
  // En una implementación real, esto obtendría el usuario desde el token JWT
  // Por ahora, simularemos con datos del localStorage o headers
  
  const authHeader = headers.authorization;
  if (!authHeader) {
    return null;
  }

  // Simulación: obtener usuario desde token o headers
  // En producción, esto sería decodificado desde un JWT
  try {
    // Por ahora, retornar un usuario de ejemplo
    // En producción, esto vendría del token JWT decodificado
    return {
      fullName: 'Usuario EFC',
      email: 'usuario@efc.com.pe',
      systemRole: 'admin' // Configurado como administrador
    };
  } catch (error) {
    console.error('Error obteniendo usuario desde request:', error);
    return null;
  }
};

// Función para filtrar tickets según permisos del usuario
export const filterTicketsByUserPermissions = (
  tickets,
  user
) => {
  if (!user) {
    return [];
  }

  const userRole = user.systemRole || 'empleado';
  const role = ROLES[userRole.toUpperCase()] || ROLES.EMPLEADO;

  // Si puede ver todos los tickets
  if (role.permissions.canViewAllTickets) {
    return tickets;
  }

  // Si solo puede ver sus propios tickets
  if (role.permissions.canViewOwnTickets) {
    return tickets.filter(ticket => isTicketAssignedToUser(ticket, user));
  }

  return [];
};
