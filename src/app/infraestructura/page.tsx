'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, Eye, AlertTriangle, Wrench, FileText, HelpCircle, Monitor } from 'lucide-react';

export default function InfraestructuraPage() {
  const [infraestructura, setInfraestructura] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('nombre');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showViewItemModal, setShowViewItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
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

  const [newItem, setNewItem] = useState({
    tipo: '',
    prioridad: '',
    titulo: '',
    descripcion: '',
    ubicacion: '',
    servicio: '',
    asignadoA: '',
    estado: '',
    tiempoInvertido: '',
    fechaCreacion: getLimaDateTime(),
    fechaResolucion: ''
  });

  // Datos de ejemplo para infraestructura
  const infraestructuraData = [
    {
      id: 1,
      tipo: 'Incidente',
      prioridad: 'Alta',
      titulo: 'Servidor principal no responde',
      descripcion: 'El servidor principal ha dejado de responder desde las 14:30. Los usuarios no pueden acceder a los sistemas críticos.',
      ubicacion: 'Surquillo',
      servicio: 'Servidores',
      asignadoA: 'Jesus Murrugarra',
      estado: 'Abierto',
      tiempoInvertido: '2.5',
      fecha_creacion: '2024-01-15T14:30:00',
      fechaResolucion: ''
    },
    {
      id: 2,
      tipo: 'Mantenimiento',
      prioridad: 'Media',
      titulo: 'Actualización de firmware en switches',
      descripcion: 'Programar mantenimiento para actualizar el firmware de todos los switches del data center.',
      ubicacion: 'Chorrillos',
      servicio: 'Red interna',
      asignadoA: 'Pamela Euscategui',
      estado: 'En Proceso',
      tiempoInvertido: '1.0',
      fecha_creacion: '2024-01-14T09:00:00',
      fechaResolucion: ''
    },
    {
      id: 3,
      tipo: 'Requerimiento',
      prioridad: 'Baja',
      titulo: 'Nuevo servidor para desarrollo',
      descripcion: 'Solicitud de nuevo servidor para el equipo de desarrollo con especificaciones específicas.',
      ubicacion: 'Arequipa',
      servicio: 'Servidores',
      asignadoA: 'Jesus Murrugarra',
      estado: 'Pendiente',
      tiempoInvertido: '0',
      fecha_creacion: '2024-01-13T10:15:00',
      fechaResolucion: ''
    },
    {
      id: 4,
      tipo: 'Consulta',
      prioridad: 'Baja',
      titulo: 'Consulta sobre configuración de firewall',
      descripcion: 'Necesito ayuda para configurar las reglas del firewall para el nuevo proyecto.',
      ubicacion: 'Surquillo',
      servicio: 'Internet',
      asignadoA: 'Pamela Euscategui',
      estado: 'Atendido',
      tiempoInvertido: '0.5',
      fecha_creacion: '2024-01-12T16:20:00',
      fechaResolucion: '2024-01-12T17:00:00'
    },
    {
      id: 5,
      tipo: 'Incidente',
      prioridad: 'Alta',
      titulo: 'Corte de energía en data center',
      descripcion: 'Se ha producido un corte de energía en el data center principal. Los UPS están funcionando pero necesitamos verificar el estado de todos los equipos.',
      ubicacion: 'Chorrillos',
      servicio: 'Servidores',
      asignadoA: 'Jesus Murrugarra',
      estado: 'Escalado',
      tiempoInvertido: '4.0',
      fecha_creacion: '2024-01-11T08:45:00',
      fechaResolucion: ''
    }
  ];

  useEffect(() => {
    fetchInfraestructura();
  }, []);

  const fetchInfraestructura = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/infraestructura');
      const result = await response.json();
      
      if (result.success) {
        setInfraestructura(result.data);
      } else {
        setError(result.message || 'Error cargando infraestructura');
      }
    } catch (error) {
      console.error('Error fetching infraestructura:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredInfraestructura = infraestructura.filter((item: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    switch (selectedFilter) {
      case 'titulo':
        return item.titulo?.toLowerCase().includes(searchLower);
      case 'tipo':
        return item.tipo?.toLowerCase().includes(searchLower);
      case 'prioridad':
        return item.prioridad?.toLowerCase().includes(searchLower);
      case 'estado':
        return item.estado?.toLowerCase().includes(searchLower);
      case 'descripcion':
        return item.descripcion?.toLowerCase().includes(searchLower);
      case 'ubicacion':
        return item.ubicacion?.toLowerCase().includes(searchLower);
      case 'servicio':
        return item.servicio?.toLowerCase().includes(searchLower);
      case 'asignadoA':
        return item.asignadoA?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredInfraestructura.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInfraestructura = filteredInfraestructura.slice(startIndex, startIndex + itemsPerPage);

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'incidente':
        return <AlertTriangle className="h-4 w-4" />;
      case 'mantenimiento':
        return <Wrench className="h-4 w-4" />;
      case 'requerimiento':
        return <FileText className="h-4 w-4" />;
      case 'consulta':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditingItem((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Preparar los datos con fecha_creacion del formulario
      const itemData = {
        ...newItem,
        fechaCreacion: newItem.fechaCreacion || new Date().toISOString(),
        estado: newItem.estado || 'Abierto',
        tiempoInvertido: newItem.tiempoInvertido || '0'
      };
      
      const response = await fetch('/api/infraestructura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInfraestructura([result.data, ...infraestructura]);
        setNewItem({
          tipo: '',
          prioridad: '',
          titulo: '',
          descripcion: '',
          ubicacion: '',
          servicio: '',
          asignadoA: '',
          estado: '',
          tiempoInvertido: '',
          fechaCreacion: getLimaDateTime(),
          fechaResolucion: ''
        });
        setShowNewItemModal(false);
      } else {
        setError(result.message || 'Error creando item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      setError('Error de conexión');
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
    setShowEditItemModal(true);
  };

  const handleViewItem = (item: any) => {
    setViewingItem({ ...item });
    setShowViewItemModal(true);
  };

  const handleNewItemClick = () => {
    // Actualizar la fecha de creación al momento de abrir el modal (zona horaria de Lima)
    setNewItem(prev => ({
      ...prev,
      fechaCreacion: getLimaDateTime()
    }));
    setShowNewItemModal(true);
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/infraestructura/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInfraestructura(infraestructura.map(item => 
          item.id === editingItem.id ? result.data : item
        ));
        setShowEditItemModal(false);
        setEditingItem(null);
      } else {
        setError(result.message || 'Error actualizando item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Error de conexión');
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${item.titulo}"?`)) {
      try {
        const response = await fetch(`/api/infraestructura/${item.id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          setInfraestructura(infraestructura.filter(i => i.id !== item.id));
        } else {
          setError(result.message || 'Error eliminando item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Error de conexión');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-pastel mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando infraestructura...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#283447] mb-4">Infraestructura</h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Total de elementos: {infraestructura.length}</span>
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
                <option value="titulo">Título</option>
                <option value="tipo">Tipo</option>
                <option value="prioridad">Prioridad</option>
                <option value="estado">Estado</option>
                <option value="descripcion">Descripción</option>
                <option value="ubicacion">Ubicación</option>
                <option value="servicio">Servicio</option>
                <option value="asignadoA">Asignado a</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Buscar por ${selectedFilter}...`}
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={handleNewItemClick}
              className="bg-[#283447] text-white hover:bg-[#1e2a3a] px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Nuevo Elemento
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors duration-200">
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
              className="text-sm text-blue-pastel hover:text-blue-pastel/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-blue-pastel-light px-2 py-1 rounded"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
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

      {/* Infraestructura Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-1 py-3 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="w-32 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  TÍTULO
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  TIPO
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  PRIORIDAD
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  UBICACIÓN
                </th>
                <th className="w-20 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  SERVICIO
                </th>
                <th className="w-24 py-4 px-3 text-left uppercase text-sm font-bold text-gray-700 tracking-wider">
                  ASIGNADO A
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
              {paginatedInfraestructura.map((item: any, index: number) => (
                <tr key={index} className={`transition-all duration-200 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}>
                  <td className="w-8 px-2 py-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="w-32 px-2 py-4 text-sm text-gray-900 font-medium truncate">
                    <div className="flex items-center gap-2">
                      {getTipoIcon(item.tipo)}
                      <span className="truncate uppercase" title={item.titulo}>{item.titulo}</span>
                    </div>
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 uppercase font-medium truncate">
                    {item.tipo}
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 uppercase font-medium truncate">
                    {item.prioridad}
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 uppercase font-medium truncate">
                    {item.ubicacion}
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 uppercase font-medium truncate">
                    {item.servicio}
                  </td>
                  <td className="w-24 px-2 py-4 text-sm text-gray-900 font-medium truncate">
                    {item.asignado_a}
                  </td>
                  <td className="w-20 px-2 py-4 text-sm text-gray-900 uppercase font-medium truncate">
                    {item.estado}
                  </td>
                  <td className="w-16 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewItem(item)}
                        className="w-8 h-8 border-2 border-blue-500 bg-white hover:bg-blue-50 flex items-center justify-center rounded transition-all duration-200"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="w-8 h-8 border-2 border-green-500 bg-white hover:bg-green-50 flex items-center justify-center rounded transition-all duration-200"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-700" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item)}
                        className="w-8 h-8 border-2 border-red-500 bg-white hover:bg-red-50 flex items-center justify-center rounded transition-all duration-200"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo Elemento de Infraestructura</h2>
              <button
                onClick={() => setShowNewItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleNewItemSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newItem.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Incidente">Incidente</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Requerimiento">Requerimiento</option>
                    <option value="Consulta">Consulta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={newItem.prioridad}
                    onChange={(e) => handleInputChange('prioridad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar prioridad</option>
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Media">Media (Normal)</option>
                    <option value="Baja">Baja (Puede esperar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    value={newItem.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar ubicación</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Chorrillos">Chorrillos</option>
                    <option value="Surquillo">Surquillo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicio
                  </label>
                  <select
                    value={newItem.servicio}
                    onChange={(e) => handleInputChange('servicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    <option value="Internet">Internet</option>
                    <option value="Red interna">Red interna</option>
                    <option value="Servidores">Servidores</option>
                    <option value="Telefonía">Telefonía</option>
                    <option value="WiFi">WiFi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignado a
                  </label>
                  <select
                    value={newItem.asignadoA}
                    onChange={(e) => handleInputChange('asignadoA', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar asignado</option>
                    <option value="Jesus Murrugarra">Jesus Murrugarra</option>
                    <option value="Pamela Euscategui">Pamela Euscategui</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={newItem.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Abierto">Abierto</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Atendido">Atendido</option>
                    <option value="Escalado">Escalado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newItem.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    maxLength={80}
                    placeholder="Máximo 80 caracteres"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newItem.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    rows={4}
                    placeholder="Describe qué está pasando..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo invertido (horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newItem.tiempoInvertido}
                    onChange={(e) => handleInputChange('tiempoInvertido', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de creación
                  </label>
                  <input
                    type="datetime-local"
                    value={newItem.fechaCreacion || getLimaDateTime()}
                    onChange={(e) => handleInputChange('fechaCreacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    defaultValue={getLimaDateTime()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de resolución
                  </label>
                  <input
                    type="datetime-local"
                    value={newItem.fechaResolucion}
                    onChange={(e) => handleInputChange('fechaResolucion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#283447] hover:bg-[#1e2a3a] rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Crear Elemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Editar Elemento de Infraestructura</h2>
              <button
                onClick={() => {
                  setShowEditItemModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={editingItem.tipo || ''}
                    onChange={(e) => handleEditInputChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Incidente">Incidente</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Requerimiento">Requerimiento</option>
                    <option value="Consulta">Consulta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={editingItem.prioridad || ''}
                    onChange={(e) => handleEditInputChange('prioridad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar prioridad</option>
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Media">Media (Normal)</option>
                    <option value="Baja">Baja (Puede esperar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    value={editingItem.ubicacion || ''}
                    onChange={(e) => handleEditInputChange('ubicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar ubicación</option>
                    <option value="Arequipa">Arequipa</option>
                    <option value="Chorrillos">Chorrillos</option>
                    <option value="Surquillo">Surquillo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicio
                  </label>
                  <select
                    value={editingItem.servicio || ''}
                    onChange={(e) => handleEditInputChange('servicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    <option value="Internet">Internet</option>
                    <option value="Red interna">Red interna</option>
                    <option value="Servidores">Servidores</option>
                    <option value="Telefonía">Telefonía</option>
                    <option value="WiFi">WiFi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignado a
                  </label>
                  <select
                    value={editingItem.asignadoA || ''}
                    onChange={(e) => handleEditInputChange('asignadoA', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar asignado</option>
                    <option value="Jesus Murrugarra">Jesus Murrugarra</option>
                    <option value="Pamela Euscategui">Pamela Euscategui</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={editingItem.estado || ''}
                    onChange={(e) => handleEditInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Abierto">Abierto</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Atendido">Atendido</option>
                    <option value="Escalado">Escalado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingItem.titulo || ''}
                    onChange={(e) => handleEditInputChange('titulo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    maxLength={80}
                    placeholder="Máximo 80 caracteres"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingItem.descripcion || ''}
                    onChange={(e) => handleEditInputChange('descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    rows={4}
                    placeholder="Describe qué está pasando..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo invertido (horas)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingItem.tiempoInvertido || ''}
                    onChange={(e) => handleEditInputChange('tiempoInvertido', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de creación
                  </label>
                  <input
                    type="datetime-local"
                    value={editingItem.fecha_creacion ? new Date(editingItem.fecha_creacion).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleEditInputChange('fecha_creacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de resolución
                  </label>
                  <input
                    type="datetime-local"
                    value={editingItem.fechaResolucion || ''}
                    onChange={(e) => handleEditInputChange('fechaResolucion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditItemModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#283447] hover:bg-[#1e2a3a] rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Actualizar Elemento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewItemModal && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalles del Elemento de Infraestructura</h2>
              <button
                onClick={() => {
                  setShowViewItemModal(false);
                  setViewingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.tipo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.prioridad}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.ubicacion}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.servicio}</p>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.asignado_a || viewingItem.asignadoA}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.estado}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo invertido (horas)</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{viewingItem.tiempo_invertido || viewingItem.tiempoInvertido || '0'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de creación</label>
                    <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                      {viewingItem.fecha_creacion ? new Date(viewingItem.fecha_creacion).toLocaleString('es-PE', { 
                        timeZone: 'America/Lima',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Título y descripción */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 font-medium">{viewingItem.titulo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900 whitespace-pre-wrap">{viewingItem.descripcion}</p>
                </div>
              </div>

              {/* Fecha de resolución si existe */}
              {viewingItem.fecha_resolucion && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de resolución</label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                    {new Date(viewingItem.fecha_resolucion).toLocaleString('es-PE', { 
                      timeZone: 'America/Lima',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewItemModal(false);
                    setViewingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewItemModal(false);
                    setViewingItem(null);
                    handleEditItem(viewingItem);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#283447] hover:bg-[#1e2a3a] rounded-lg"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



