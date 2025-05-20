'use client';

import React from 'react';

const FilterBar = ({ filters, filterOptions, handleFilterChange, clearFilters }) => {
  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por tipo de candidatura */}
        <div>
          <label className="block mb-2 text-sm font-medium">Tipo de candidatura</label>
          <select
            name="candidatura"
            value={filters.candidatura}
            onChange={handleFilterChange}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas las candidaturas</option>
            {filterOptions.candidaturas.map((candidatura) => (
              <option key={candidatura} value={candidatura}>
                {candidatura}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por estado */}
        <div>
          <label className="block mb-2 text-sm font-medium">Estado</label>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos los estados</option>
            {filterOptions.estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por distrito */}
        <div>
          <label className="block mb-2 text-sm font-medium">Distrito Judicial</label>
          <select
            name="distrito"
            value={filters.distrito}
            onChange={handleFilterChange}
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos los distritos</option>
            {filterOptions.distritos.map((distrito) => (
              <option key={distrito} value={distrito}>
                {distrito}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={clearFilters}
        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default FilterBar;
