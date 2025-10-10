'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, Download, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { CATEGORIAS_ESTANDAR, getCategoriasSugeridas } from '../../constants/categorias';
import CategoriaDropdown from '../../components/CategoriaDropdown';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import ForceAdminButton from '../../components/ForceAdminButton';

function TicketsPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { permissions, canEditTicket, canViewTicket, filterTicketsByPermissions, getAvailableAgents } = usePermissions();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('solicitud');
  const [selectedSede, setSelectedSede] = useState('todas');
  const [selectedEstado, setSelectedEstado] = useState('todos');
  const [selectedAgente, setSelectedAgente] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showEditTicketModal, setShowEditTicketModal] = useState(false);
  const [showViewTicketModal, setShowViewTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [viewingTicket, setViewingTicket] = useState<any>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [agentes, setAgentes] = useState<string[]>([]);
  
  // Funciones de utilidad para formatear texto
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatSolicitud = (solicitud: string): string => {
    if (!solicitud) return '-';
    
    // Convertir a minúsculas y limpiar
    let formatted = solicitud.toLowerCase().trim();
    
    // Remover palabras comunes que no aportan valor
    const removeWords = [
      'se realiza', 'en sistema', 'de requerimientos', 'para compra', 'de',
      'la', 'el', 'los', 'las', 'un', 'una', 'con', 'por', 'para'
    ];
    
    removeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      formatted = formatted.replace(regex, '');
    });
    
    // Limpiar espacios múltiples
    formatted = formatted.replace(/\s+/g, ' ').trim();
    
    // Capitalizar primera letra de cada palabra
    formatted = formatted.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return formatted;
  };

  const formatCategoria = (categoria: string): string => {
    if (!categoria) return '-';
    
    // Convertir a minúsculas y limpiar
    let formatted = categoria.toLowerCase().trim();
    
    // Remover prefijos comunes
    const prefixes = ['sistema de', 'problemas con', 'ayuda con'];
    prefixes.forEach(prefix => {
      if (formatted.startsWith(prefix)) {
        formatted = formatted.substring(prefix.length).trim();
      }
    });
    
    // Capitalizar primera letra
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    return formatted;
  };
  
  // Reglas de mapeo área-sede
  const areaSedeRules: Record<string, string> = {
    // Áreas que van a Chorrillos
    'Logistica De Salida': 'Chorrillos',
    'Produccion': 'Chorrillos',
    'SIG': 'Chorrillos',
    'Logistica De Produccion': 'Chorrillos',
    'Almacen': 'Chorrillos',
    'Logistica': 'Chorrillos',
    
    // Áreas que van a Surquillo (por defecto)
    'Logistica De Entrada': 'Surquillo',
    'Gerencia General': 'Surquillo',
    'Recursos Humanos': 'Surquillo',
    'Contabilidad': 'Surquillo',
    'Ventas': 'Surquillo',
    'Marketing': 'Surquillo',
    'Sistemas': 'Surquillo',
    'Mantenimiento': 'Surquillo',
    'Calidad': 'Surquillo',
    'Administracion': 'Surquillo',
    'Finanzas': 'Surquillo',
    'Compras': 'Surquillo',
    'Operaciones': 'Surquillo',
    'Desarrollo': 'Surquillo',
    'Soporte Tecnico': 'Surquillo',
    'Atencion al Cliente': 'Surquillo'
  };

  // Función para obtener fecha en zona horaria de Lima
  const getLimaDateTime = () => {
    const now = new Date();
    const limaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    // Formatear para datetime-local (YYYY-MM-DDTHH:MM)
    const year = limaTime.getFullYear();
    const month = String(limaTime.getMonth() + 1).padStart(2, '0');
    const day = String(limaTime.getDate()).padStart(2, '0');
    const hours = String(limaTime.getHours()).padStart(2, '0');
    const minutes = String(limaTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Función para formatear fecha de la BD a zona horaria de Lima
  const formatDateFromDB = (dateString: string) => {
    if (!dateString) return '-';
    
    // Crear fecha desde la BD (que está en UTC)
    const fechaUTC = new Date(dateString);
    
    // Convertir a zona horaria de Lima
    const fechaLima = new Date(fechaUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    return fechaLima.toLocaleDateString('es-PE');
  };

  // Función para formatear fecha y hora de la BD a zona horaria de Lima
  const formatDateTimeFromDB = (dateString: string) => {
    if (!dateString) return '-';
    
    // Crear fecha desde la BD (que está en UTC)
    const fechaUTC = new Date(dateString);
    
    // Convertir a zona horaria de Lima
    const fechaLima = new Date(fechaUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    return fechaLima.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [newTicket, setNewTicket] = useState({
    solicitante: '',
    solicitud: '',
    categoria: '',
    agente: '',
    area: '',
    sede: '',
    estado: 'Cerrado',
    fechaCreacion: getLimaDateTime()
  });

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Iniciando carga de datos...');
      await fetchTickets();
      await fetchAreas();
      await fetchUsuarios();
      await fetchCategorias();
      await fetchAgentes();
      console.log('✅ Carga de datos completada');
    };
    
    loadData();
  }, []);

  // Manejar parámetros URL al cargar la página
  useEffect(() => {
    const filter = searchParams.get('filter');
    const type = searchParams.get('type');
    const estado = searchParams.get('estado');
    const agente = searchParams.get('agente');
    const period = searchParams.get('period');
    
    if (type === 'soporte') {
      // Para tickets de soporte, no aplicar filtros específicos
      // Solo limpiar filtros existentes y mostrar todos los tickets
      setSearchTerm('');
      setSelectedFilter('solicitud');
      setSelectedEstado('todos');
      setSelectedAgente('todos');
      console.log('🎫 Mostrando todos los tickets de soporte');
    } else if (filter) {
      switch (filter) {
        case 'infraestructura':
          setSelectedFilter('area');
          setSearchTerm('Tecnología de la Información');
          break;
        case 'all':
          // Mostrar todos los tickets sin filtros adicionales
          setSearchTerm('');
          setSelectedFilter('solicitud');
          setSelectedEstado('todos');
          setSelectedAgente('todos');
          break;
      }
    }
    
    if (estado) {
      setSelectedEstado(estado);
    }
    
    if (agente) {
      setSelectedAgente(agente);
      setSearchTerm('');
      setSelectedFilter('solicitud');
      setSelectedEstado('todos');
      console.log('👨‍💼 Filtrando por agente:', agente);
    }
    
    console.log('🔍 Parámetros URL:', { filter, type, estado, agente, period });
  }, [searchParams]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, selectedEstado, selectedAgente]);

  const fetchAreas = async () => {
    try {
      console.log('🔄 Cargando áreas...');
      const response = await fetch('/api/tickets/areas');
      const result = await response.json();
      console.log('📋 Respuesta áreas:', result);
      if (result.success) {
        setAreas(result.data);
        console.log('✅ Áreas cargadas:', result.data.length);
      }
    } catch (error) {
      console.error('Error cargando áreas:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      console.log('🔄 Cargando usuarios...');
      const response = await fetch('/api/tickets/usuarios');
      const result = await response.json();
      console.log('📋 Respuesta usuarios:', result);
      if (result.success) {
        setUsuarios(result.data);
        console.log('✅ Usuarios cargados:', result.data.length);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      console.log('🔄 Cargando categorías estándar...');
      // Usar categorías estándar en lugar de cargar desde la API
      setCategorias(CATEGORIAS_ESTANDAR);
      console.log('✅ Categorías estándar cargadas:', CATEGORIAS_ESTANDAR.length);
      
      // Opcional: También cargar categorías existentes en la BD para mostrar sugerencias
      const response = await fetch('/api/tickets/categorias');
      const result = await response.json();
      if (result.success) {
        console.log('📋 Categorías de BD disponibles:', result.data.length);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      // Fallback a categorías estándar
      setCategorias(CATEGORIAS_ESTANDAR);
    }
  };

  const fetchAgentes = async () => {
    try {
      console.log('🔄 Cargando agentes...');
      const response = await fetch('/api/tickets/agentes');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📋 Respuesta agentes:', result);
      
      if (result.success) {
        setAgentes(result.data);
        console.log('✅ Agentes cargados:', result.data.length, result.data);
      } else {
        console.error('❌ API returned success: false', result);
      }
    } catch (error) {
      console.error('❌ Error cargando agentes:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const result = await response.json();
      
      if (result.success) {
        console.log('📊 Tickets cargados:', result.data.length);
        console.log('📋 Primeros 3 tickets:', result.data.slice(0, 3));
        
        // Aplicar filtro de permisos del lado del cliente también
        let filteredTickets = result.data;
        if (user && !permissions.canViewAllTickets) {
          filteredTickets = filterTicketsByPermissions(result.data);
          console.log('🔒 Tickets filtrados por permisos:', filteredTickets.length);
        }
        
        setTickets(filteredTickets);
      } else {
        setError(result.message || 'Error cargando tickets');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    // Filtro por búsqueda de texto
    let searchMatches = true;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      switch (selectedFilter) {
        case 'solicitud':
          searchMatches = ticket.solicitud?.toLowerCase().includes(searchLower) || false;
          break;
        case 'solicitante':
          searchMatches = ticket.solicitante?.toLowerCase().includes(searchLower) || false;
          break;
        case 'categoria':
          searchMatches = ticket.categoria?.toLowerCase().includes(searchLower) || false;
          break;
        case 'agente':
          searchMatches = ticket.agente?.toLowerCase().includes(searchLower) || false;
          break;
        case 'area':
          searchMatches = ticket.area?.toLowerCase().includes(searchLower) || false;
          break;
        case 'sede':
          searchMatches = ticket.sede?.toLowerCase().includes(searchLower) || false;
          break;
        case 'estado':
          searchMatches = ticket.estado?.toLowerCase().includes(searchLower) || false;
          break;
        default:
          searchMatches = (ticket.solicitud?.toLowerCase().includes(searchLower) || false) ||
                         (ticket.solicitante?.toLowerCase().includes(searchLower) || false);
      }
    }
    
    // Filtro por estado - manejar casos donde estado puede ser null/undefined
    const estadoMatches = selectedEstado === 'todos' || 
                         (ticket.estado || 'Cerrado') === selectedEstado;
    
    // Filtro por agente - manejar casos donde agente puede ser null/undefined
    const agenteMatches = selectedAgente === 'todos' || 
                         (ticket.agente || '') === selectedAgente;
    
    return searchMatches && estadoMatches && agenteMatches;
  });

  console.log(`🔍 Filtro activo: ${selectedFilter}, Término: "${searchTerm}"`);
  console.log(`🔍 Estado seleccionado: "${selectedEstado}", Agente seleccionado: "${selectedAgente}"`);
  console.log(`📊 Total tickets: ${tickets.length}, Filtrados: ${filteredTickets.length}`);
  console.log(`🔍 DEBUG: Agentes state en render:`, agentes.length, agentes);
  console.log(`🔍 DEBUG: Estados disponibles en tickets:`, [...new Set(tickets.map(t => t.estado))]);
  console.log(`🔍 DEBUG: Agentes disponibles en tickets:`, [...new Set(tickets.map(t => t.agente).filter(Boolean))]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  
  // Resetear la página actual si está fuera del rango válido
  const validCurrentPage = Math.min(currentPage, totalPages);
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }
  
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (categoria: string) => {
    return 'text-gray-900';
  };

  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Ticket creado exitosamente:', result.data);
        setShowNewTicketModal(false);
        setNewTicket({
          solicitante: '',
          solicitud: '',
          categoria: '',
          agente: '',
          area: '',
          sede: '',
          estado: 'Cerrado',
          fechaCreacion: getLimaDateTime()
        });
        // Recargar tickets
        fetchTickets();
      } else {
        console.error('Error creando ticket:', result.error);
        alert('Error al crear el ticket: ' + result.error);
      }
    } catch (error) {
      console.error('Error creando ticket:', error);
      alert('Error de conexión al crear el ticket');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewTicket(prev => {
      const updatedTicket = {
        ...prev,
        [field]: value
      };

      // Aplicar reglas automáticas cuando se cambia el área
      if (field === 'area' && value) {
        const sedeAsignada = areaSedeRules[value] || 'Surquillo'; // Por defecto Surquillo
        console.log(`🏢 Regla aplicada: ${value} → ${sedeAsignada}`);
        updatedTicket.sede = sedeAsignada;
      }

      return updatedTicket;
    });
  };

  const handleNewTicketClick = () => {
    // Actualizar la fecha de creación al momento de abrir el modal (zona horaria de Lima)
    setNewTicket(prev => ({
      ...prev,
      estado: 'Cerrado',
      fechaCreacion: getLimaDateTime()
    }));
    setShowNewTicketModal(true);
  };

  const handleViewTicket = (ticket: any) => {
    setViewingTicket(ticket);
    setShowViewTicketModal(true);
  };

  const handleEditTicket = (ticket: any) => {
    // Normalizar el nombre del agente para que coincida con el formato del dropdown
    const normalizeAgentName = (name: string) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Guardar los datos originales para la identificación única
    const originalData = {
      solicitante: ticket.solicitante,
      solicitud: ticket.solicitud,
      categoria: ticket.categoria,
      agente: ticket.agente,
      area: ticket.area,
      sede: ticket.sede,
      fecha_creacion: ticket.fecha_creacion
    };
    
    setEditingTicket({
      ...ticket,
      agente: normalizeAgentName(ticket.agente), // Normalizar el nombre del agente
      originalData: originalData
    });
    setShowEditTicketModal(true);
  };

  const handleEditTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      const response = await fetch('/api/tickets/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTicket),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Ticket actualizado exitosamente:', result.data);
        setShowEditTicketModal(false);
        setEditingTicket(null);
        // Recargar tickets
        fetchTickets();
      } else {
        console.error('Error actualizando ticket:', result.error);
        alert('Error al actualizar el ticket: ' + result.error);
      }
    } catch (error) {
      console.error('Error actualizando ticket:', error);
      alert('Error de conexión al actualizar el ticket');
    }
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditingTicket((prev: any) => {
      const updatedTicket = {
        ...prev,
        [field]: value
      };

      // Aplicar reglas automáticas cuando se cambia el área
      if (field === 'area' && value) {
        const sedeAsignada = areaSedeRules[value] || 'Surquillo'; // Por defecto Surquillo
        console.log(`🏢 Regla aplicada en edición: ${value} → ${sedeAsignada}`);
        updatedTicket.sede = sedeAsignada;
      }

      return updatedTicket;
    });
  };

  const handleDeleteTicket = async (ticket: any) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el ticket de ${ticket.solicitante}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/tickets/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitante: ticket.solicitante,
          solicitud: ticket.solicitud,
          categoria: ticket.categoria,
          agente: ticket.agente,
          area: ticket.area,
          sede: ticket.sede
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Ticket eliminado exitosamente:', result.data);
        // Recargar tickets
        fetchTickets();
      } else {
        console.error('Error eliminando ticket:', result.error);
        alert('Error al eliminar el ticket: ' + result.error);
      }
    } catch (error) {
      console.error('Error eliminando ticket:', error);
      alert('Error de conexión al eliminar el ticket');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('solicitud');
    setSelectedEstado('todos');
    setSelectedAgente('todos');
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Crear CSV con los datos filtrados
    const csvContent = [
      ['Fecha', 'Solicitante', 'Solicitud', 'Categoría', 'Agente', 'Área', 'Sede'],
      ...filteredTickets.map(ticket => [
        formatDateFromDB(ticket.fecha_creacion),
        ticket.solicitante || '-',
        ticket.solicitud || '-',
        ticket.categoria || '-',
        ticket.agente || '-',
        ticket.area || '-',
        ticket.sede || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#283447] mb-4">Tickets</h1>
        
        {/* Indicador de vista específica */}
        {searchParams.get('type') === 'soporte' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-blue-700 font-medium">Vista: Tickets de Soporte</span>
              <span className="text-blue-600 ml-2">(Todos los tickets de soporte técnico)</span>
            </div>
          </div>
        )}
        
        {searchParams.get('estado') && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-orange-700 font-medium">Vista: Tickets {searchParams.get('estado')}</span>
            </div>
          </div>
        )}
        
        {searchParams.get('agente') && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-purple-700 font-medium">Vista: Tickets de {searchParams.get('agente')}</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Áreas cargadas: {areas.length}</span>
          <span className="text-gray-300">|</span>
          <span>Usuarios cargados: {usuarios.length}</span>
          <span className="text-gray-300">|</span>
          <span>Categorías cargadas: {categorias.length}</span>
          <span className="text-gray-300">|</span>
          <span>Agentes cargados: {agentes.length}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex gap-2">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="solicitud">Solicitud</option>
                <option value="solicitante">Solicitante</option>
                <option value="categoria">Categoría</option>
                <option value="agente">Agente</option>
                <option value="area">Área</option>
                <option value="sede">Sede</option>
                <option value="estado">Estado</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Buscar por ${selectedFilter === 'solicitud' ? 'solicitud' : 
                    selectedFilter === 'solicitante' ? 'solicitante' :
                    selectedFilter === 'categoria' ? 'categoría' :
                    selectedFilter === 'agente' ? 'agente' :
                    selectedFilter === 'area' ? 'área' :
                    selectedFilter === 'sede' ? 'sede' :
                    selectedFilter === 'estado' ? 'estado' : 'solicitud'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200">
                <Search className="h-4 w-4" />
                Buscar
              </button>
            </div>
            
            {/* Filtros adicionales */}
            <div className="flex gap-2">
              <select 
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="todos">Todos los estados</option>
                <option value="Abierto">Abierto</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Cerrado">Cerrado</option>
              </select>
              
              <select 
                value={selectedAgente}
                onChange={(e) => setSelectedAgente(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="todos">Todos los agentes</option>
                {agentes.map((agente) => (
                  <option key={agente} value={agente}>
                    {agente}
                  </option>
                ))}
              </select>
              
              <button 
                onClick={handleClearFilters}
                className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors duration-200"
                title="Limpiar todos los filtros"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-2">
            {permissions.canCreateTickets && (
              <button 
                onClick={handleNewTicketClick}
                className="bg-[#283447] text-white hover:bg-[#1e2a3a] px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                Nuevo Ticket
              </button>
            )}
            <button 
              onClick={handleExport}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Registros por página:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-900">
              Página {validCurrentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-sm text-blue-pastel hover:text-blue-pastel/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-blue-pastel-light px-2 py-1 rounded"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-2 py-4 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  FECHA
                </th>
                <th className="w-28 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  SOLICITANTE
                </th>
                <th className="w-40 py-4 px-4 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  SOLICITUD
                </th>
                <th className="w-24 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  CATEGORÍA
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  AGENTE
                </th>
                <th className="w-28 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  ÁREA
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  SEDE
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  ESTADO
                </th>
                <th className="w-16 py-4 px-3 text-center uppercase text-sm font-bold text-gray-700 tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTickets.map((ticket: any, index: number) => (
                <tr 
                  key={index} 
                  className={`transition-all duration-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="w-8 px-2 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900">
                    {formatDateFromDB(ticket.fecha_creacion)}
                  </td>
                  <td className="w-28 px-2 py-4 text-sm text-gray-900 font-bold truncate">
                    {ticket.solicitante || '-'}
                  </td>
                  <td className="w-40 px-3 py-4 text-sm text-gray-900 font-medium">
                    <div 
                      className="truncate cursor-help" 
                      title={ticket.solicitud || '-'}
                    >
                      {truncateText(formatSolicitud(ticket.solicitud), 50)}
                    </div>
                  </td>
                  <td className="w-24 px-2 py-4 text-sm">
                    <span 
                      className={`text-sm font-medium ${getStatusColor(ticket.categoria)} cursor-help`}
                      title={ticket.categoria || '-'}
                    >
                      {truncateText(formatCategoria(ticket.categoria), 20)}
                    </span>
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 font-medium">
                    <div 
                      className="truncate cursor-help" 
                      title={ticket.agente || '-'}
                    >
                      {truncateText(ticket.agente, 15)}
                    </div>
                  </td>
                  <td className="w-28 px-2 py-4 text-sm text-gray-900 font-medium">
                    <div 
                      className="truncate cursor-help" 
                      title={ticket.area || '-'}
                    >
                      {truncateText(ticket.area, 25)}
                    </div>
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 font-medium">
                    <div 
                      className="truncate cursor-help" 
                      title={ticket.sede || '-'}
                    >
                      {truncateText(ticket.sede, 15)}
                    </div>
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 font-medium">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.estado === 'Cerrado' 
                          ? 'bg-blue-100 text-blue-800' 
                          : ticket.estado === 'En Proceso'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      title={ticket.estado || 'Cerrado'}
                    >
                      {ticket.estado || 'Cerrado'}
                    </span>
                  </td>
                  <td className="w-16 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="w-8 h-8 border-2 border-blue-500 bg-white hover:bg-blue-50 flex items-center justify-center rounded transition-all duration-200"
                        title="Ver detalles del ticket"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      {canEditTicket(ticket) && (
                        <button 
                          onClick={() => handleEditTicket(ticket)}
                          className="w-8 h-8 border-2 border-green-500 bg-white hover:bg-green-50 flex items-center justify-center rounded transition-all duration-200"
                          title="Editar ticket"
                        >
                          <Edit className="h-4 w-4 text-gray-700" />
                        </button>
                      )}
                      {permissions.canDeleteTickets && (
                        <button 
                          onClick={() => handleDeleteTicket(ticket)}
                          className="w-8 h-8 border-2 border-red-500 bg-white hover:bg-red-50 flex items-center justify-center rounded transition-all duration-200"
                          title="Eliminar ticket"
                        >
                          <Trash2 className="h-4 w-4 text-gray-700" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Solicitud */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Crear Nueva Solicitud</h2>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Información sobre reglas automáticas */}
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Reglas Automáticas de Asignación
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Al seleccionar un área, la sede se asignará automáticamente:</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Logística de Salida</strong> → Chorrillos</div>
                      <div><strong>Producción</strong> → Chorrillos</div>
                      <div><strong>SIG</strong> → Chorrillos</div>
                      <div><strong>Logística de Producción</strong> → Chorrillos</div>
                      <div><strong>Almacén</strong> → Chorrillos</div>
                      <div><strong>Otras áreas</strong> → Surquillo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleNewTicketSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Columna 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solicitante
                    </label>
                    <select
                      value={newTicket.solicitante}
                      onChange={(e) => handleInputChange('solicitante', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="">Seleccionar solicitante ({usuarios.length} disponibles)</option>
                      {usuarios.length > 0 ? (
                        usuarios.map((usuario) => (
                          <option key={usuario} value={usuario}>
                            {usuario}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando usuarios...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <CategoriaDropdown
                      value={newTicket.categoria}
                      onChange={(value) => handleInputChange('categoria', value)}
                      required
                      placeholder={`Seleccionar categoría (${categorias.length} disponibles)`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede
                      {newTicket.area && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          (Asignada automáticamente)
                        </span>
                      )}
                    </label>
                    <select
                      value={newTicket.sede}
                      onChange={(e) => handleInputChange('sede', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30 ${
                        newTicket.area 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Seleccionar sede</option>
                      <option value="Surquillo">Surquillo</option>
                      <option value="Chorrillos">Chorrillos</option>
                      <option value="Pasco">Pasco</option>
                      <option value="Cuzco">Cuzco</option>
                      <option value="Arequipa">Arequipa</option>
                    </select>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área
                    </label>
                    <select
                      value={newTicket.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="">Seleccionar área ({areas.length} disponibles)</option>
                      {areas.length > 0 ? (
                        areas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando áreas...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agente Asignado
                    </label>
                    <select
                      value={newTicket.agente}
                      onChange={(e) => handleInputChange('agente', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    >
                      <option value="">Seleccionar agente ({getAvailableAgents(agentes).length} disponibles)</option>
                      {getAvailableAgents(agentes).length > 0 ? (
                        getAvailableAgents(agentes).map((agente) => (
                          <option key={agente} value={agente}>
                            {agente}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando agentes...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={newTicket.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                {/* Columna 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de creación
                    </label>
                    <input
                      type="datetime-local"
                      value={newTicket.fechaCreacion || getLimaDateTime()}
                      onChange={(e) => handleInputChange('fechaCreacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      defaultValue={getLimaDateTime()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la Solicitud
                    </label>
                    <textarea
                      value={newTicket.solicitud}
                      onChange={(e) => handleInputChange('solicitud', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      placeholder="Describe el problema o solicitud..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-pastel hover:bg-blue-pastel/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Crear Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Ticket */}
      {showEditTicketModal && editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editar Solicitud</h2>
              <button
                onClick={() => {
                  setShowEditTicketModal(false);
                  setEditingTicket(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditTicketSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Columna 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solicitante
                    </label>
                    <select
                      value={editingTicket.solicitante || ''}
                      onChange={(e) => handleEditInputChange('solicitante', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="">Seleccionar solicitante ({usuarios.length} disponibles)</option>
                      {usuarios.length > 0 ? (
                        usuarios.map((usuario) => (
                          <option key={usuario} value={usuario}>
                            {usuario}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando usuarios...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <CategoriaDropdown
                      value={editingTicket.categoria || ''}
                      onChange={(value) => handleEditInputChange('categoria', value)}
                      required
                      placeholder={`Seleccionar categoría (${categorias.length} disponibles)`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede
                      {editingTicket?.area && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          (Asignada automáticamente)
                        </span>
                      )}
                    </label>
                    <select
                      value={editingTicket.sede || ''}
                      onChange={(e) => handleEditInputChange('sede', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30 ${
                        editingTicket?.area 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Seleccionar sede</option>
                      <option value="Surquillo">Surquillo</option>
                      <option value="Chorrillos">Chorrillos</option>
                      <option value="Pasco">Pasco</option>
                      <option value="Cuzco">Cuzco</option>
                      <option value="Arequipa">Arequipa</option>
                    </select>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área
                    </label>
                    <select
                      value={editingTicket.area || ''}
                      onChange={(e) => handleEditInputChange('area', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="">Seleccionar área ({areas.length} disponibles)</option>
                      {areas.length > 0 ? (
                        areas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando áreas...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agente Asignado
                    </label>
                    <select
                      value={editingTicket.agente || ''}
                      onChange={(e) => handleEditInputChange('agente', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    >
                      <option value="">Seleccionar agente ({getAvailableAgents(agentes).length} disponibles)</option>
                      {getAvailableAgents(agentes).length > 0 ? (
                        getAvailableAgents(agentes).map((agente) => (
                          <option key={agente} value={agente}>
                            {agente}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cargando agentes...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={editingTicket.estado || 'Cerrado'}
                      onChange={(e) => handleEditInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      required
                    >
                      <option value="Abierto">Abierto</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                {/* Columna 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de creación
                    </label>
                    <input
                      type="datetime-local"
                      value={editingTicket.fecha_creacion ? new Date(editingTicket.fecha_creacion).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleEditInputChange('fecha_creacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la Solicitud
                    </label>
                    <textarea
                      value={editingTicket.solicitud || ''}
                      onChange={(e) => handleEditInputChange('solicitud', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                      placeholder="Describe el problema o solicitud..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTicketModal(false);
                    setEditingTicket(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-pastel hover:bg-blue-pastel/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Actualizar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Ticket */}
      {showViewTicketModal && viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Ticket</h2>
              <button
                onClick={() => setShowViewTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {formatDateTimeFromDB(viewingTicket.fecha_creacion)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                      {viewingTicket.solicitante || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {viewingTicket.categoria || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agente Asignado</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {viewingTicket.agente || 'Sin asignar'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {viewingTicket.estado || 'Cerrado'}
                    </p>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {viewingTicket.area || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                      {viewingTicket.sede || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID del Ticket</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-sm font-mono">
                      #{viewingTicket.id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción Completa */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de la Solicitud</label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {viewingTicket.solicitud || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewTicketModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowViewTicketModal(false);
                    handleEditTicket(viewingTicket);
                  }}
                  className="px-4 py-2 bg-blue-pastel text-white rounded-lg hover:bg-blue-pastel/90 transition-colors"
                >
                  Editar Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón temporal para forzar configuración de administrador */}
      <ForceAdminButton />
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    }>
      <TicketsPageContent />
    </Suspense>
  );
}
