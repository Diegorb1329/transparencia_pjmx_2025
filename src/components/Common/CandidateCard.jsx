'use client';

import React from 'react';
import CandidateImage from './CandidateImage';

const CandidateCard = ({ candidate, index }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center">
      {/* Porcentaje de similitud en la parte superior */}
      <div className="text-2xl font-bold text-blue-600 mb-2">
        {(candidate.similarity * 100).toFixed(1)}%
      </div>
      
      {/* Nombre y posición */}
      <h4 className="text-lg font-semibold text-center mb-4">{index + 1}. {candidate.nombre}</h4>
      
      {/* Imagen del candidato en círculo al centro */}
      <CandidateImage 
        folio={candidate.folio} 
        name={candidate.nombre} 
        className="my-4"
      />
      
      <div className="text-sm text-gray-600 text-center mb-4">
        {candidate.nombreCorto} | {candidate.nombreEstado} | Distrito: {candidate.idDistritoJudicial || 'N/A'}
      </div>
      
      <div className="w-full mt-3 grid grid-cols-5 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500">CT</div>
          <div className="font-medium">{candidate.CT_score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">IE</div>
          <div className="font-medium">{candidate.IE_score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">EJ</div>
          <div className="font-medium">{candidate.EJ_score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">CR</div>
          <div className="font-medium">{candidate.CR_score}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">SS</div>
          <div className="font-medium">{candidate.SS_score}</div>
        </div>
      </div>
      
      <div className="mt-auto">
        <a
          href={candidate.url_perfil}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          Ver perfil completo
        </a>
      </div>
    </div>
  );
};

export default CandidateCard;
