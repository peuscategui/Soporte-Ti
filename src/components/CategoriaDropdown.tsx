import React, { useState } from 'react';
import { CATEGORIAS_ESTANDAR, CATEGORIAS_AGRUPADAS } from '../constants/categorias';

interface CategoriaDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function CategoriaDropdown({ 
  value, 
  onChange, 
  required = false, 
  className = "",
  placeholder = "Seleccionar categoría"
}: CategoriaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar categorías basado en la búsqueda
  const filteredCategorias = CATEGORIAS_ESTANDAR.filter(categoria =>
    categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar categorías filtradas
  const categoriasAgrupadas = Object.entries(CATEGORIAS_AGRUPADAS).map(([grupo, categorias]) => ({
    grupo,
    categorias: categorias.filter(categoria => 
      filteredCategorias.includes(categoria)
    )
  })).filter(grupo => grupo.categorias.length > 0);

  const handleCategoriaSelect = (categoria: string) => {
    onChange(categoria);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30 cursor-pointer ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-pastel/30"
              autoFocus
            />
          </div>

          {/* Lista de categorías agrupadas */}
          <div className="max-h-60 overflow-y-auto">
            {categoriasAgrupadas.length > 0 ? (
              categoriasAgrupadas.map(({ grupo, categorias }) => (
                <div key={grupo} className="border-b border-gray-100 last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {grupo}
                  </div>
                  {categorias.map((categoria) => (
                    <div
                      key={categoria}
                      className={`px-6 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                        value === categoria ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                      onClick={() => handleCategoriaSelect(categoria)}
                    >
                      {categoria}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No se encontraron categorías
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
            {filteredCategorias.length} de {CATEGORIAS_ESTANDAR.length} categorías
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
