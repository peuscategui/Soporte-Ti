import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Permission {
  canViewAllTickets: boolean;
  canEditAllTickets: boolean;
  canCreateTickets: boolean;
  canEditOwnTickets: boolean;
  canViewOwnTickets: boolean;
  canDeleteTickets: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission;
}

// Definir roles del sistema
export const ROLES: Record<string, Role> = {
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

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission>(ROLES.EMPLEADO.permissions);
  const [userRole, setUserRole] = useState<Role>(ROLES.EMPLEADO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        if (!user) {
          setPermissions(ROLES.EMPLEADO.permissions);
          setUserRole(ROLES.EMPLEADO);
          setLoading(false);
          return;
        }

        // Intentar obtener el rol del usuario desde localStorage o API
        const storedRole = localStorage.getItem('userRole');
        let roleId = 'empleado'; // Rol por defecto

        // Forzar rol de administrador para usuario@efc.com.pe
        if (user && user.email === 'usuario@efc.com.pe') {
          roleId = 'admin';
          localStorage.setItem('userRole', JSON.stringify(roleId));
        } else if (storedRole) {
          roleId = JSON.parse(storedRole);
        } else {
          // Mapear roles basado en el email o departamento del usuario
          roleId = mapUserToRole(user);
          localStorage.setItem('userRole', JSON.stringify(roleId));
        }

        const role = ROLES[roleId.toUpperCase()] || ROLES.EMPLEADO;
        setPermissions(role.permissions);
        setUserRole(role);

      } catch (error) {
        console.error('Error cargando permisos del usuario:', error);
        setPermissions(ROLES.EMPLEADO.permissions);
        setUserRole(ROLES.EMPLEADO);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  // Función para mapear usuario a rol basado en email o departamento
  const mapUserToRole = (user: any): string => {
    const email = user.email?.toLowerCase() || '';
    const department = user.department?.toLowerCase() || '';
    const role = user.role?.toLowerCase() || '';

    // Usuario específico como administrador
    if (email === 'usuario@efc.com.pe') {
      return 'admin';
    }

    // Administradores
    if (email.includes('admin') || email.includes('administrador') || 
        department.includes('admin') || role.includes('admin')) {
      return 'admin';
    }

    // Supervisores
    if (email.includes('supervisor') || email.includes('jefe') ||
        department.includes('supervision') || role.includes('supervisor')) {
      return 'supervisor';
    }

    // Agentes de soporte
    if (email.includes('soporte') || email.includes('soporte') ||
        department.includes('soporte') || department.includes('ti') ||
        role.includes('soporte') || role.includes('agente')) {
      return 'agente';
    }

    // Por defecto, empleado
    return 'empleado';
  };

  // Función para verificar si el usuario puede editar un ticket específico
  const canEditTicket = (ticket: any): boolean => {
    if (!user || !ticket) return false;

    // Si es admin, puede editar cualquier ticket
    if (permissions.canEditAllTickets) {
      return true;
    }

    // Si puede editar sus propios tickets, verificar si es el agente asignado
    if (permissions.canEditOwnTickets) {
      const ticketAgent = ticket.agente?.toLowerCase().trim();
      const userFullName = user.fullName?.toLowerCase().trim();
      const userEmail = user.email?.toLowerCase().trim();
      
      return ticketAgent === userFullName || 
             ticketAgent === userEmail ||
             ticketAgent?.includes(userFullName) ||
             userFullName?.includes(ticketAgent);
    }

    return false;
  };

  // Función para verificar si el usuario puede ver un ticket específico
  const canViewTicket = (ticket: any): boolean => {
    if (!user || !ticket) return false;

    // Si puede ver todos los tickets
    if (permissions.canViewAllTickets) {
      return true;
    }

    // Si puede ver sus propios tickets, verificar si es el agente asignado
    if (permissions.canViewOwnTickets) {
      const ticketAgent = ticket.agente?.toLowerCase().trim();
      const userFullName = user.fullName?.toLowerCase().trim();
      const userEmail = user.email?.toLowerCase().trim();
      
      return ticketAgent === userFullName || 
             ticketAgent === userEmail ||
             ticketAgent?.includes(userFullName) ||
             userFullName?.includes(ticketAgent);
    }

    return false;
  };

  // Función para obtener tickets filtrados según permisos
  const filterTicketsByPermissions = (tickets: any[]): any[] => {
    if (!user) return [];

    if (permissions.canViewAllTickets) {
      return tickets;
    }

    if (permissions.canViewOwnTickets) {
      return tickets.filter(ticket => canViewTicket(ticket));
    }

    return [];
  };

  // Función para verificar si el usuario puede asignar tickets a otros
  const canAssignToOthers = (): boolean => {
    return permissions.canViewAllTickets || permissions.canEditAllTickets;
  };

  // Función para obtener la lista de agentes disponibles para asignación
  const getAvailableAgents = (allAgents: string[]): string[] => {
    if (canAssignToOthers()) {
      return allAgents;
    }

    // Si no puede asignar a otros, solo puede asignar a sí mismo
    return user ? [user.fullName] : [];
  };

  return {
    permissions,
    userRole,
    loading,
    canEditTicket,
    canViewTicket,
    filterTicketsByPermissions,
    canAssignToOthers,
    getAvailableAgents,
    isAdmin: permissions.canEditAllTickets,
    isAgent: userRole.id === 'agente',
    isSupervisor: userRole.id === 'supervisor',
    isEmployee: userRole.id === 'empleado',
  };
};
