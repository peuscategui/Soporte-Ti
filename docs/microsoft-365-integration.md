# Integración con Microsoft 365

Este documento explica cómo integrar la aplicación con Microsoft 365 para mostrar la información real del usuario autenticado.

## Configuración Inicial

### 1. Registro de la Aplicación en Azure AD

1. Ve a [Azure Portal](https://portal.azure.com)
2. Navega a **Azure Active Directory** > **App registrations**
3. Haz clic en **New registration**
4. Configura:
   - **Name**: `Soporte EFC`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `http://localhost:3000/auth/callback` (para desarrollo)

### 2. Configurar Permisos

En la aplicación registrada, ve a **API permissions** y agrega:
- `User.Read` (Microsoft Graph)
- `User.ReadBasic.All` (Microsoft Graph)

### 3. Obtener Credenciales

En **Overview** de tu aplicación, copia:
- **Application (client) ID**
- **Directory (tenant) ID**

## Implementación en el Código

### 1. Instalar Dependencias

```bash
npm install @azure/msal-browser @azure/msal-react
```

### 2. Configurar MSAL

Crear `src/config/authConfig.ts`:

```typescript
import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'your-client-id',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_TENANT_ID || 'your-tenant-id'}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'User.ReadBasic.All'],
};
```

### 3. Configurar Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

### 4. Actualizar el Hook useAuth

Modificar `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { User } from '@microsoft/microsoft-graph-types';

interface AuthUser {
  fullName: string;
  role: string;
  email: string;
  id?: string;
  department?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { instance, accounts } = useMsal();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (accounts.length > 0) {
          // Usuario ya autenticado
          const account = accounts[0];
          await loadUserFromMicrosoftGraph(account);
        } else {
          // No hay usuario autenticado
          setUser(null);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [accounts]);

  const loadUserFromMicrosoftGraph = async (account: any) => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: account,
      });

      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      if (graphResponse.ok) {
        const userData: User = await graphResponse.json();
        const authUser: AuthUser = {
          fullName: userData.displayName || `${userData.givenName} ${userData.surname}`,
          role: userData.jobTitle || 'Empleado',
          email: userData.mail || userData.userPrincipalName || '',
          id: userData.id,
          department: userData.department,
        };
        
        setUser(authUser);
        localStorage.setItem('user', JSON.stringify(authUser));
      }
    } catch (error) {
      console.error('Error obteniendo usuario desde Microsoft Graph:', error);
    }
  };

  const login = async () => {
    try {
      await instance.loginPopup({
        scopes: ['User.Read', 'User.ReadBasic.All'],
      });
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && accounts.length > 0,
  };
};
```

### 5. Configurar el Provider MSAL

Modificar `src/app/layout.tsx`:

```typescript
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/config/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <MsalProvider instance={msalInstance}>
          {children}
        </MsalProvider>
      </body>
    </html>
  );
}
```

### 6. Crear Página de Login

Crear `src/app/login/page.tsx`:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Soporte EFC
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión con tu cuenta de Microsoft 365
          </p>
        </div>
        <div>
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión con Microsoft 365
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Uso Actual

Actualmente, la aplicación está configurada para:

1. **Mostrar usuario por defecto**: Si no hay usuario autenticado, muestra "Usuario EFC"
2. **Leer desde localStorage**: Si hay información almacenada, la usa
3. **Preparado para Microsoft Graph**: El código está listo para integrarse con Microsoft 365

## Próximos Pasos

1. Configurar la aplicación en Azure AD
2. Agregar las variables de entorno
3. Instalar las dependencias de MSAL
4. Implementar el provider MSAL
5. Crear la página de login
6. Probar la integración completa

## Notas Importantes

- La aplicación actual funciona sin autenticación real
- El hook `useAuth` está preparado para la integración
- El header muestra información del usuario correctamente
- El logout limpia la información almacenada
