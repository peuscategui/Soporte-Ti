import { useState, useEffect } from 'react';
import { ensureAdminRole } from '../utils/adminSetup';

interface User {
  fullName: string;
  role: string;
  email: string;
  id?: string;
  department?: string;
  systemRole?: string; // Rol del sistema (admin, agente, supervisor, empleado)
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Asegurar que el usuario tenga rol de administrador
        const correctedUser = ensureAdminRole();
        
        if (correctedUser) {
          setUser(correctedUser);
        } else {
          // Intentar obtener información del usuario desde localStorage
          const storedUser = localStorage.getItem('user');
          
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } else {
            // Si no hay usuario almacenado, intentar obtenerlo desde Microsoft Graph
            await loadUserFromMicrosoftGraph();
          }
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
        // Usuario por defecto en caso de error
        setUser({
          fullName: 'Usuario EFC',
          role: 'Administrador',
          email: 'usuario@efc.com.pe',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const loadUserFromMicrosoftGraph = async () => {
    try {
      // Esta función se integraría con Microsoft Graph API
      // Ejemplo de implementación:
      
      // const token = localStorage.getItem('accessToken');
      // if (!token) {
      //   throw new Error('No access token found');
      // }
      
      // const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (response.ok) {
      //   const userData = await response.json();
      //   const user: User = {
      //     fullName: userData.displayName || userData.givenName + ' ' + userData.surname,
      //     role: userData.jobTitle || 'Empleado',
      //     email: userData.mail || userData.userPrincipalName,
      //     id: userData.id,
      //     department: userData.department
      //   };
      //   
      //   setUser(user);
      //   localStorage.setItem('user', JSON.stringify(user));
      // }

      // Por ahora, usar datos de ejemplo
      const exampleUser: User = {
        fullName: 'Usuario EFC',
        role: 'Administrador',
        email: 'usuario@efc.com.pe',
        id: 'example-id',
        department: 'Tecnología'
      };
      
      setUser(exampleUser);
      localStorage.setItem('user', JSON.stringify(exampleUser));
      
    } catch (error) {
      console.error('Error obteniendo usuario desde Microsoft Graph:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      // Limpiar información del usuario
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Limpiar estado
      setUser(null);
      
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante el logout:', error);
      window.location.href = '/login';
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
};
