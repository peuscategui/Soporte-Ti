/**
 * Módulo de validación y sanitización de datos de entrada
 * Previene SQL Injection, XSS y asegura tipos de datos correctos
 */

// Longitudes máximas de campos (basadas en estructura de BD)
const MAX_LENGTHS = {
  solicitud: 1000,
  categoria: 100,
  area: 100,
  solicitante: 100,
  agente: 100,
  sede: 100,
  estado: 50,
  tipoAtencion: 50,
  solucion: 5000,
  taskTitle: 150,
  taskDescription: 4000,
  taskCategory: 100,
  taskTicketCode: 255,
  taskCreatedBy: 100,
  taskAgentName: 120,
  taskUpdateComment: 4000,
  // Infraestructura
  tipo: 50,
  prioridad: 50,
  titulo: 200,
  descripcion: 2000,
  ubicacion: 200,
  servicio: 200,
  asignadoA: 100,
};

// Valores permitidos para enums
const ALLOWED_VALUES = {
  estado: ['Abierto', 'Cerrado', 'En Proceso', 'Pendiente'],
  estadoInfraestructura: ['Abierto', 'En Proceso', 'Atendido', 'Escalado'],
  tipoAtencion: ['Incidencia', 'Problema', 'Requerimiento'],
  prioridad: ['Baja', 'Media', 'Alta', 'Crítica'],
  tipo: ['Hardware', 'Software', 'Red', 'Servicio', 'Otro'],
  taskPriority: ['Baja', 'Media', 'Alta', 'Urgente'],
  taskStatus: ['Pendiente', 'En Progreso', 'Completada'],
};

/**
 * Sanitiza un string eliminando caracteres peligrosos (XSS)
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers (onclick=, etc)
    .trim();
}

/**
 * Valida que un string no exceda la longitud máxima
 */
export function validateLength(field, value, maxLength) {
  if (typeof value !== 'string') return { valid: false, error: `${field} debe ser un string` };
  if (value.length > maxLength) {
    return { 
      valid: false, 
      error: `${field} no puede exceder ${maxLength} caracteres (actual: ${value.length})` 
    };
  }
  return { valid: true };
}

/**
 * Valida que un valor esté en la lista de valores permitidos
 */
export function validateEnum(field, value, allowedValues) {
  if (!value) return { valid: true }; // Valores opcionales están permitidos
  if (!allowedValues.includes(value)) {
    return { 
      valid: false, 
      error: `${field} debe ser uno de: ${allowedValues.join(', ')}` 
    };
  }
  return { valid: true };
}

/**
 * Valida que una fecha sea válida y esté en un formato correcto
 */
export function validateDate(field, dateString, allowFuture = false) {
  if (!dateString) return { valid: true }; // Fechas opcionales están permitidas
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${field} no es una fecha válida` };
  }
  
  if (!allowFuture && date > new Date()) {
    return { valid: false, error: `${field} no puede ser una fecha futura` };
  }
  
  return { valid: true, date };
}

/**
 * Valida que un ID sea un número entero positivo
 */
export function validateId(id, fieldName = 'ID') {
  if (!id) return { valid: false, error: `${fieldName} es requerido` };
  
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
    return { valid: false, error: `${fieldName} debe ser un número entero positivo` };
  }
  
  return { valid: true, id: idNum };
}

/**
 * Valida y sanitiza los datos de un ticket
 */
export function validateTicketData(data, isUpdate = false) {
  const errors = [];
  const sanitized = {};
  
  // Validar campos requeridos
  const requiredFields = isUpdate 
    ? ['id', 'solicitante', 'solicitud', 'categoria', 'area', 'sede']
    : ['solicitud', 'categoria', 'area', 'solicitante'];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} es requerido`);
    }
  }
  
  // Si hay errores en campos requeridos, retornar temprano
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Validar ID si es actualización
  if (isUpdate) {
    const idValidation = validateId(data.id, 'ID');
    if (!idValidation.valid) {
      errors.push(idValidation.error);
      return { valid: false, errors };
    }
    sanitized.id = idValidation.id;
  }
  
  // Validar y sanitizar campos de texto
  const textFields = ['solicitud', 'categoria', 'area', 'solicitante', 'agente', 'sede', 'solucion'];
  for (const field of textFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const sanitizedValue = sanitizeString(String(data[field]));
      const lengthCheck = validateLength(field, sanitizedValue, MAX_LENGTHS[field] || 500);
      
      if (!lengthCheck.valid) {
        errors.push(lengthCheck.error);
      } else {
        sanitized[field] = sanitizedValue || null;
      }
    }
  }
  
  // Validar estado
  if (data.estado) {
    const estadoCheck = validateEnum('estado', data.estado, ALLOWED_VALUES.estado);
    if (!estadoCheck.valid) {
      errors.push(estadoCheck.error);
    } else {
      sanitized.estado = data.estado;
    }
  } else if (isUpdate) {
    sanitized.estado = data.estado || 'Cerrado';
  }
  
  // Validar tipoAtencion
  if (data.tipoAtencion) {
    const tipoCheck = validateEnum('tipoAtencion', data.tipoAtencion, ALLOWED_VALUES.tipoAtencion);
    if (!tipoCheck.valid) {
      errors.push(tipoCheck.error);
    } else {
      sanitized.tipoAtencion = data.tipoAtencion;
    }
  }
  
  // Validar fechas
  if (data.fechaCreacion) {
    const fechaValidation = validateDate('fechaCreacion', data.fechaCreacion, true);
    if (!fechaValidation.valid) {
      errors.push(fechaValidation.error);
    } else {
      sanitized.fechaCreacion = data.fechaCreacion;
    }
  }
  
  if (data.fechaCierre) {
    const fechaValidation = validateDate('fechaCierre', data.fechaCierre, true);
    if (!fechaValidation.valid) {
      errors.push(fechaValidation.error);
    } else {
      sanitized.fechaCierre = data.fechaCierre;
    }
  }
  
  // Mantener originalData para actualizaciones
  if (data.originalData) {
    sanitized.originalData = data.originalData;
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: sanitized };
}

export function validateTaskPayload(data, isUpdate = false) {
  const errors = [];
  const sanitized = {};

  if (!isUpdate) {
    if (!data.title || String(data.title).trim() === '') {
      errors.push('title es requerido');
    }
  }

  if (data.title !== undefined) {
    const title = sanitizeString(String(data.title));
    const lengthCheck = validateLength('title', title, MAX_LENGTHS.taskTitle);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.title = title;
    }
  }

  if (data.description !== undefined) {
    const description = sanitizeString(String(data.description));
    const lengthCheck = validateLength('description', description, MAX_LENGTHS.taskDescription);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.description = description || null;
    }
  }

  if (data.category !== undefined) {
    const category = sanitizeString(String(data.category));
    const lengthCheck = validateLength('category', category, MAX_LENGTHS.taskCategory);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.category = category || null;
    }
  }

  if (data.ticketCode !== undefined) {
    const ticketCode = sanitizeString(String(data.ticketCode));
    const lengthCheck = validateLength('ticketCode', ticketCode, MAX_LENGTHS.taskTicketCode);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.ticketCode = ticketCode || null;
    }
  }

  if (data.ticketUid !== undefined) {
    if (data.ticketUid === null || data.ticketUid === '') {
      sanitized.ticketUid = null;
    } else {
      const ticketUid = String(data.ticketUid).trim();
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(ticketUid)) {
        errors.push('ticketUid debe ser un UUID válido');
      } else {
        sanitized.ticketUid = ticketUid;
      }
    }
  }

  if (data.boardId !== undefined) {
    sanitized.boardId = data.boardId || null;
  }

  if (data.priority !== undefined) {
    const priority = sanitizeString(String(data.priority));
    const priorityCheck = validateEnum('priority', priority, ALLOWED_VALUES.taskPriority);
    if (!priorityCheck.valid) {
      errors.push(priorityCheck.error);
    } else {
      sanitized.priority = priority;
    }
  }

  if (data.status !== undefined) {
    const status = sanitizeString(String(data.status));
    const statusCheck = validateEnum('status', status, ALLOWED_VALUES.taskStatus);
    if (!statusCheck.valid) {
      errors.push(statusCheck.error);
    } else {
      sanitized.status = status;
    }
  }

  if (data.createdBy !== undefined) {
    const createdBy = sanitizeString(String(data.createdBy));
    const lengthCheck = validateLength('createdBy', createdBy, MAX_LENGTHS.taskCreatedBy);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.createdBy = createdBy || null;
    }
  }

  if (data.usersServed !== undefined) {
    const usersServed = Number(data.usersServed);
    if (!Number.isFinite(usersServed) || usersServed < 0) {
      errors.push('usersServed debe ser un número positivo');
    } else {
      sanitized.usersServed = Math.floor(usersServed);
    }
  }

  if (data.progress !== undefined) {
    const progress = Number(data.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      errors.push('progress debe estar entre 0 y 100');
    } else {
      sanitized.progress = Math.round(progress);
    }
  }

  if (data.startDate) {
    const startValidation = validateDate('startDate', data.startDate, true);
    if (!startValidation.valid) {
      errors.push(startValidation.error);
    } else {
      sanitized.startDate = new Date(data.startDate).toISOString();
    }
  } else if (data.startDate === null) {
    sanitized.startDate = null;
  }

  if (data.dueDate) {
    const dueValidation = validateDate('dueDate', data.dueDate, true);
    if (!dueValidation.valid) {
      errors.push(dueValidation.error);
    } else {
      sanitized.dueDate = new Date(data.dueDate).toISOString();
    }
  } else if (data.dueDate === null) {
    sanitized.dueDate = null;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized };
}

export function validateTaskUpdatePayload(data) {
  const errors = [];
  const sanitized = {};

  if (!data.agentName || String(data.agentName).trim() === '') {
    errors.push('agentName es requerido');
  } else {
    const agentName = sanitizeString(String(data.agentName));
    const lengthCheck = validateLength('agentName', agentName, MAX_LENGTHS.taskAgentName);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.agentName = agentName;
    }
  }

  if (data.comment !== undefined) {
    const comment = sanitizeString(String(data.comment));
    const lengthCheck = validateLength('comment', comment, MAX_LENGTHS.taskUpdateComment);
    if (!lengthCheck.valid) {
      errors.push(lengthCheck.error);
    } else {
      sanitized.comment = comment || null;
    }
  }

  if (data.usersServed !== undefined) {
    const usersServed = Number(data.usersServed);
    if (!Number.isFinite(usersServed) || usersServed < 0) {
      errors.push('usersServed debe ser un número positivo');
    } else {
      sanitized.usersServed = Math.floor(usersServed);
    }
  } else {
    sanitized.usersServed = 0;
  }

  if (data.progress !== undefined) {
    const progress = Number(data.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      errors.push('progress debe estar entre 0 y 100');
    } else {
      sanitized.progress = Math.round(progress);
    }
  } else {
    sanitized.progress = 0;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: sanitized };
}

/**
 * Valida y sanitiza los datos de infraestructura
 */
export function validateInfraestructuraData(data) {
  const errors = [];
  const sanitized = {};
  
  // Campos requeridos
  const requiredFields = ['titulo', 'tipo', 'estado'];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} es requerido`);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Validar y sanitizar campos de texto
  const textFields = ['tipo', 'prioridad', 'titulo', 'descripcion', 'ubicacion', 'servicio', 'asignadoA'];
  for (const field of textFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const sanitizedValue = sanitizeString(String(data[field]));
      const lengthCheck = validateLength(field, sanitizedValue, MAX_LENGTHS[field] || 500);
      
      if (!lengthCheck.valid) {
        errors.push(lengthCheck.error);
      } else {
        sanitized[field] = sanitizedValue || null;
      }
    }
  }
  
  // Asignar valores de tipo y prioridad sin limitar a enums estrictos
  if (data.tipo !== undefined) {
    sanitized.tipo = sanitizeString(String(data.tipo));
  }
  if (data.prioridad !== undefined) {
    sanitized.prioridad = sanitizeString(String(data.prioridad));
  }
  
  // Validar tiempo invertido (debe ser número no negativo)
  if (data.tiempoInvertido !== undefined && data.tiempoInvertido !== null) {
    const tiempoNum = parseFloat(data.tiempoInvertido);
    if (isNaN(tiempoNum) || tiempoNum < 0) {
      errors.push('tiempoInvertido debe ser un número no negativo');
    } else {
      sanitized.tiempoInvertido = tiempoNum;
    }
  }
  
  // Validar estado de infraestructura
  if (data.estado) {
    const estadoCheck = validateEnum('estado', data.estado, ALLOWED_VALUES.estadoInfraestructura);
    if (!estadoCheck.valid) {
      errors.push(estadoCheck.error);
    } else {
      sanitized.estado = data.estado;
    }
  }
  
  // Validar fecha de creación (solo para creación)
  if (data.fechaCreacion) {
    const fechaValidation = validateDate('fechaCreacion', data.fechaCreacion, true);
    if (!fechaValidation.valid) {
      errors.push(fechaValidation.error);
    } else {
      sanitized.fechaCreacion = data.fechaCreacion;
    }
  }
  
  // Validar fecha de resolución
  if (data.fechaResolucion) {
    const fechaValidation = validateDate('fechaResolucion', data.fechaResolucion, true);
    if (!fechaValidation.valid) {
      errors.push(fechaValidation.error);
    } else {
      sanitized.fechaResolucion = data.fechaResolucion;
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: sanitized };
}
