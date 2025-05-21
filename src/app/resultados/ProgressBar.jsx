import React from 'react';

/**
 * Barra de progreso horizontal para mostrar scores como porcentaje
 * @param {number} value - Valor entre 0 y 100
 * @param {string} color - Clase de color de Tailwind (ej: 'bg-indigo-500')
 * @param {string} label - Etiqueta opcional
 */
export default function ProgressBar({ value = 0, color = 'bg-indigo-500', label = '' }) {
  // Asegurarse de que value sea un número válido
  let safeValue = Number(value);
  if (isNaN(safeValue)) safeValue = 0;
  safeValue = Math.max(0, Math.min(safeValue, 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {label && (
          <span className="text-xs text-gray-300 truncate mr-2">{label}</span>
        )}
        <span className="text-xs font-bold text-white min-w-[40px] text-right">
          {safeValue.toFixed(1)}%
        </span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-4 ${color} rounded-full transition-all`}
          style={{ width: `${safeValue}%` }}
        ></div>
      </div>
    </div>
  );
} 