import { NextResponse } from 'next/server';

// Simulación de base de datos de usuarios
// En producción, esto vendría de una base de datos real
const mockUsers = [
  {
    id: '0',
    email: 'usuario@efc.com.pe',
    fullName: 'Usuario EFC',
    currentRole: 'admin',
    department: 'Administración',
    lastLogin: '2024-01-15',
    isActive: true
  },
  {
    id: '1',
    email: 'admin@efc.com.pe',
    fullName: 'Administrador EFC',
    currentRole: 'admin',
    department: 'Administración',
    lastLogin: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    email: 'jesus.murrugarra@efc.com.pe',
    fullName: 'Jesus Murrugarra',
    currentRole: 'agente',
    department: 'Soporte TI',
    lastLogin: '2024-01-15',
    isActive: true
  },
  {
    id: '3',
    email: 'jerry.contreras@efc.com.pe',
    fullName: 'Jerry Contreras',
    currentRole: 'agente',
    department: 'Soporte TI',
    lastLogin: '2024-01-14',
    isActive: true
  },
  {
    id: '4',
    email: 'alonso.quispe@efc.com.pe',
    fullName: 'Alonso Quispe',
    currentRole: 'agente',
    department: 'Soporte TI',
    lastLogin: '2024-01-13',
    isActive: true
  },
  {
    id: '5',
    email: 'supervisor@efc.com.pe',
    fullName: 'María Supervisor',
    currentRole: 'supervisor',
    department: 'Supervisión',
    lastLogin: '2024-01-15',
    isActive: true
  },
  {
    id: '6',
    email: 'empleado@efc.com.pe',
    fullName: 'Juan Empleado',
    currentRole: 'empleado',
    department: 'Ventas',
    lastLogin: '2024-01-12',
    isActive: true
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario y nuevo rol son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'supervisor', 'agente', 'empleado'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Rol no válido' },
        { status: 400 }
      );
    }

    // En producción, aquí se actualizaría la base de datos
    // Por ahora, simulamos la actualización
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Simular actualización
    mockUsers[userIndex].currentRole = newRole;
    mockUsers[userIndex].updatedAt = new Date().toISOString();

    // En producción, también se actualizaría el localStorage del usuario
    // o se invalidaría su sesión para que se actualice el rol

    return NextResponse.json({
      success: true,
      message: 'Rol actualizado correctamente',
      data: mockUsers[userIndex]
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
