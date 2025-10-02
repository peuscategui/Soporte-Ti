# Sistema de Permisos y Roles

Este documento explica el sistema de permisos implementado para controlar el acceso de los usuarios a las funcionalidades del sistema de tickets.

## Roles del Sistema

### 1. Administrador (`admin`)
**Acceso completo al sistema**
- ✅ Ver todos los tickets
- ✅ Editar todos los tickets
- ✅ Crear tickets
- ✅ Editar sus propios tickets
- ✅ Ver sus propios tickets
- ✅ Eliminar tickets
- ✅ Gestionar usuarios
- ✅ Ver reportes
- ✅ Asignar tickets a cualquier agente

### 2. Supervisor (`supervisor`)
**Acceso de supervisión**
- ✅ Ver todos los tickets
- ❌ Editar todos los tickets (solo lectura)
- ✅ Crear tickets
- ✅ Editar sus propios tickets
- ✅ Ver sus propios tickets
- ❌ Eliminar tickets
- ❌ Gestionar usuarios
- ✅ Ver reportes
- ✅ Asignar tickets a cualquier agente

### 3. Agente de Soporte (`agente`)
**Acceso limitado a tickets asignados**
- ❌ Ver todos los tickets (solo los suyos)
- ❌ Editar todos los tickets (solo los suyos)
- ✅ Crear tickets
- ✅ Editar sus propios tickets
- ✅ Ver sus propios tickets
- ❌ Eliminar tickets
- ❌ Gestionar usuarios
- ❌ Ver reportes
- ❌ Asignar tickets a otros (solo a sí mismo)

### 4. Empleado (`empleado`)
**Acceso mínimo**
- ❌ Ver todos los tickets
- ❌ Editar todos los tickets
- ✅ Crear tickets
- ❌ Editar sus propios tickets
- ❌ Ver sus propios tickets
- ❌ Eliminar tickets
- ❌ Gestionar usuarios
- ❌ Ver reportes
- ❌ Asignar tickets

## Asignación de Roles

### Mapeo Automático por Email/Departamento
El sistema asigna roles automáticamente basándose en:

```typescript
// Administradores
email.includes('admin') || 
email.includes('administrador') || 
department.includes('admin')

// Supervisores
email.includes('supervisor') || 
email.includes('jefe') ||
department.includes('supervision')

// Agentes de Soporte
email.includes('soporte') || 
department.includes('soporte') || 
department.includes('ti') ||
role.includes('soporte') || 
role.includes('agente')

// Por defecto: Empleado
```

### Configuración Manual
Los roles también se pueden configurar manualmente en `localStorage`:

```javascript
localStorage.setItem('userRole', JSON.stringify('admin'));
```

## Implementación Técnica

### Hook usePermissions
```typescript
const { 
  permissions, 
  userRole, 
  canEditTicket, 
  canViewTicket, 
  filterTicketsByPermissions,
  getAvailableAgents 
} = usePermissions();
```

### Validación en el Servidor
```typescript
// Validar permisos para editar
const editPermission = validateTicketPermission(user, ticket, 'edit');
if (!editPermission.allowed) {
  return NextResponse.json({ error: editPermission.reason }, { status: 403 });
}

// Validar asignación de agente
const assignPermission = validateAgentAssignment(user, assignedAgent);
if (!assignPermission.allowed) {
  return NextResponse.json({ error: assignPermission.reason }, { status: 403 });
}
```

### Filtrado de Datos
```typescript
// Filtrar tickets según permisos
const filteredTickets = filterTicketsByPermissions(tickets, user);

// Obtener agentes disponibles para asignación
const availableAgents = getAvailableAgents(allAgents);
```

## Interfaz de Usuario

### Indicadores Visuales
- **🔴 Escudo rojo**: Administrador
- **🔵 Escudo azul**: Supervisor  
- **🟢 Usuario verde**: Agente de Soporte
- **Sin icono**: Empleado

### Controles Condicionales
- **Botón "Nuevo Ticket"**: Solo visible si `canCreateTickets`
- **Botón "Editar"**: Solo visible si `canEditTicket(ticket)`
- **Botón "Eliminar"**: Solo visible si `canDeleteTickets`
- **Dropdown de Agentes**: Filtrado según `getAvailableAgents()`

### Filtros de Búsqueda
- **Agentes**: Solo muestra agentes disponibles según permisos
- **Tickets**: Solo muestra tickets que el usuario puede ver

## Seguridad

### Validación Doble
1. **Frontend**: Filtros y controles de UI
2. **Backend**: Validación en APIs

### Principio de Menor Privilegio
- Los usuarios solo ven/editan lo que necesitan
- Los permisos se aplican tanto en consultas como en acciones

### Auditoría
- Todas las acciones están registradas con información del usuario
- Los logs incluyen el rol y permisos del usuario

## Ejemplos de Uso

### Escenario 1: Agente de Soporte
```typescript
// Usuario: "juan.soporte@efc.com.pe"
// Rol asignado: "agente"
// Permisos:
- ✅ Crear tickets
- ✅ Ver solo tickets asignados a "Juan Soporte"
- ✅ Editar solo tickets asignados a "Juan Soporte"
- ❌ Ver tickets de otros agentes
- ❌ Asignar tickets a otros
```

### Escenario 2: Administrador
```typescript
// Usuario: "admin@efc.com.pe"
// Rol asignado: "admin"
// Permisos:
- ✅ Acceso completo a todos los tickets
- ✅ Puede asignar tickets a cualquier agente
- ✅ Puede eliminar tickets
- ✅ Puede ver reportes
```

### Escenario 3: Supervisor
```typescript
// Usuario: "maria.supervisor@efc.com.pe"
// Rol asignado: "supervisor"
// Permisos:
- ✅ Ver todos los tickets (solo lectura)
- ✅ Crear tickets
- ✅ Editar sus propios tickets
- ✅ Asignar tickets a cualquier agente
- ✅ Ver reportes
- ❌ Eliminar tickets
```

## Configuración

### Variables de Entorno
```env
# Para integración con Microsoft 365
NEXT_PUBLIC_CLIENT_ID=your-client-id
NEXT_PUBLIC_TENANT_ID=your-tenant-id

# Para roles personalizados (opcional)
USER_ROLE_OVERRIDE=admin
```

### Personalización de Roles
Para agregar nuevos roles o modificar permisos existentes:

1. Editar `src/hooks/usePermissions.ts`
2. Actualizar el objeto `ROLES`
3. Modificar la función `mapUserToRole`
4. Actualizar las validaciones en `src/lib/permissionValidator.ts`

## Monitoreo y Debugging

### Logs de Permisos
```javascript
console.log('🔒 Tickets filtrados por permisos:', filteredTickets.length);
console.log('👤 Rol del usuario:', userRole.name);
console.log('🔑 Permisos:', permissions);
```

### Verificación de Acceso
```javascript
// Verificar si puede editar un ticket específico
const canEdit = canEditTicket(ticket);
console.log(`¿Puede editar ticket ${ticket.id}?`, canEdit);

// Verificar agentes disponibles
const agents = getAvailableAgents(allAgents);
console.log('Agentes disponibles:', agents);
```

## Próximos Pasos

1. **Integración con Active Directory**: Mapear roles desde AD
2. **Roles Granulares**: Permisos más específicos por módulo
3. **Auditoría Avanzada**: Logs detallados de acciones
4. **Roles Temporales**: Permisos con fecha de expiración
5. **Delegación**: Transferir permisos temporalmente

Este sistema garantiza que cada usuario solo tenga acceso a las funcionalidades que necesita según su rol en la organización.
