'use client';

import React from 'react';
import { Radar } from 'react-chartjs-2';

const ProfileRadarChart = ({ userVector }) => {
  // Configuración del gráfico
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };
  
  // Datos para el gráfico de radar
  const radarData = {
    labels: ['Competencia Técnica (CT)', 'Independencia (IE)', 'Experiencia Jurídica (EJ)', 'Conservación (CR)', 'Sensibilidad Social (SS)'],
    datasets: [
      {
        label: 'Tu perfil',
        data: [
          userVector.CT * 100,
          userVector.IE * 100,
          userVector.EJ * 100,
          userVector.CR * 100,
          userVector.SS * 100
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      }
    ]
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Tu perfil de preferencias</h3>
      <div className="mx-auto" style={{ maxWidth: '500px', height: '400px' }}>
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
};

export default ProfileRadarChart;
