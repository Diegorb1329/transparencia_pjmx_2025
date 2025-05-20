'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../components/Layout/Layout';
import { processUserAnswersAndFindMatches, loadMatchingData } from '../../utils/matchingService';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import Slider from 'react-slick';

// Importar estilos para el carrusel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Registrar componentes de Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ResultadosPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCandidates, setTotalCandidates] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    candidatura: '',
    estado: '',
    distrito: ''
  });
  
  // Opciones para filtros (se cargarán dinámicamente)
  const [filterOptions, setFilterOptions] = useState({
    candidaturas: [],
    estados: [],
    distritos: []
  });
  
  // Candidatos filtrados
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  // Estado para rastrear qué imágenes han fallado
  const [failedImages, setFailedImages] = useState({});

  // Configuración del carrusel
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // Mostrar 4 tarjetas en lugar de 2
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    touchThreshold: 10,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Cargar resultados al montar el componente
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        
        // Recuperar respuestas del localStorage
        const savedAnswers = localStorage.getItem('pjmx2025_answers');
        if (!savedAnswers) {
          // Si no hay respuestas, redirigir al cuestionario
          router.push('/preguntas');
          return;
        }
        
        const userAnswers = JSON.parse(savedAnswers);
        
        // Cargar datos necesarios
        const { questions, candidates } = await loadMatchingData();
        
        // Guardar el número total de candidatos
        setTotalCandidates(candidates.length);
        
        // Procesar respuestas y encontrar matches
        const matchResults = await processUserAnswersAndFindMatches(
          userAnswers,
          questions,
          candidates,
          candidates.length // Mostrar todos los candidatos, ordenados por afinidad
        );
        
        setResults(matchResults);
        setFilteredCandidates(matchResults.matchedCandidates);
        
        // Extraer opciones para filtros
        const candidaturas = [...new Set(candidates.map(c => c.nombreCorto))];
        const estados = [...new Set(candidates.map(c => c.nombreEstado))];
        const distritos = [...new Set(candidates.map(c => c.idDistritoJudicial))];
        
        setFilterOptions({
          candidaturas,
          estados,
          distritos: distritos.filter(d => d).sort((a, b) => a - b)
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los resultados');
        setLoading(false);
        console.error(err);
      }
    };
    
    loadResults();
  }, [router]);

  // Aplicar filtros
  useEffect(() => {
    if (!results) return;
    
    let filtered = [...results.matchedCandidates];
    
    // Filtrar por tipo de candidatura
    if (filters.candidatura) {
      filtered = filtered.filter(c => c.nombreCorto === filters.candidatura);
    }
    
    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(c => c.nombreEstado === filters.estado);
    }
    
    // Filtrar por distrito
    if (filters.distrito) {
      filtered = filtered.filter(c => c.idDistritoJudicial === parseInt(filters.distrito));
    }
    
    setFilteredCandidates(filtered);
  }, [filters, results]);

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      candidatura: '',
      estado: '',
      distrito: ''
    });
  };

  // Función para manejar errores de carga de imágenes
  const handleImageError = (event, folio) => {
    // Marcar esta imagen como fallida
    setFailedImages(prev => ({
      ...prev,
      [folio]: true
    }));
    // Establecer la imagen de fallback
    event.target.src = '/user_placeholder.svg';
  };

  // Datos para el gráfico de radar
  const prepareRadarData = () => {
    if (!results) return null;
    
    return {
      labels: ['Competencia Técnica (CT)', 'Independencia (IE)', 'Experiencia Jurídica (EJ)', 'Conservación (CR)', 'Sensibilidad Social (SS)'],
      datasets: [
        {
          label: 'Tu perfil',
          data: [
            results.userVector.CT * 100,
            results.userVector.IE * 100,
            results.userVector.EJ * 100,
            results.userVector.CR * 100,
            results.userVector.SS * 100
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        }
      ]
    };
  };

  // Opciones del gráfico de radar
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <main className="flex-grow px-4 sm:px-6 lg:container lg:mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <main className="flex-grow px-4 sm:px-6 lg:container lg:mx-auto py-8">
          <div className="bg-red-900/40 border border-red-800/50 text-red-100 rounded-lg p-6 shadow-lg">
            <h3 className="font-bold text-xl">Error</h3>
            <p className="mt-2">{error}</p>
            <button
              onClick={() => router.push('/preguntas')}
              className="mt-4 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-all shadow-md"
            >
              Volver al cuestionario
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Si no hay resultados, mostrar mensaje
  if (!results) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <main className="flex-grow px-4 sm:px-6 lg:container lg:mx-auto py-8">
          <div className="bg-yellow-900/40 border border-yellow-800/50 text-yellow-100 rounded-lg p-6 shadow-lg">
            <h3 className="font-bold text-xl">Sin resultados</h3>
            <p className="mt-2">No se han encontrado resultados para mostrar.</p>
            <button
              onClick={() => router.push('/preguntas')}
              className="mt-4 px-6 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md"
            >
              Realizar cuestionario
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-grow px-4 sm:px-6 lg:container lg:mx-auto py-8">
        {/* Top Find Button */}
        <div className="flex justify-center mb-12">
          <div className="px-6 py-2 bg-gray-900/70 border border-gray-700 rounded-full flex items-center gap-2 text-white shadow-md">
            <span className="text-xs">★</span>
            <span>Resultados Personalizados</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Tu Match Judicial
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-400 mb-8 tracking-tight">
            Candidatos que Comparten tus Valores
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Descubrimos {filteredCandidates.length} candidatos que mejor coinciden con tus preferencias.
            De un total de {totalCandidates} participantes en la elección.
          </p>
        </div>

        {/* Barra de filtros */}
        <div className="mb-8 bg-gray-900/90 p-6 rounded-lg shadow-md border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-white tracking-wide">Filtrar resultados:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por tipo de candidatura */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Tipo de candidatura</label>
              <select
                name="candidatura"
                value={filters.candidatura}
                onChange={handleFilterChange}
                className="block w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block mb-2 text-sm font-medium text-gray-300">Estado</label>
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="block w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block mb-2 text-sm font-medium text-gray-300">Distrito Judicial</label>
              <select
                name="distrito"
                value={filters.distrito}
                onChange={handleFilterChange}
                className="block w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-all"
          >
            Limpiar filtros
          </button>
        </div>
        
        {/* 5 Dimensions */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white tracking-wide mb-6">Tu perfil en las 5 dimensiones clave:</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
          <div className="bg-[#1a1a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-indigo-900/20 transition-all border border-indigo-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-indigo-400">CT</div>
            <div className="text-sm text-gray-400">Competencia Técnica</div>
            <div className="font-medium text-white mt-1">{results && (results.userVector.CT * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-[#1a2a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-blue-900/20 transition-all border border-blue-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-blue-400">IE</div>
            <div className="text-sm text-gray-400">Independencia y Ética</div>
            <div className="font-medium text-white mt-1">{results && (results.userVector.IE * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-[#1a3a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-cyan-900/20 transition-all border border-cyan-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-cyan-400">EJ</div>
            <div className="text-sm text-gray-400">Enfoque Jurídico</div>
            <div className="font-medium text-white mt-1">{results && (results.userVector.EJ * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-[#1a4a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-teal-900/20 transition-all border border-teal-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-teal-400">CR</div>
            <div className="text-sm text-gray-400">Capacidad Resolutiva</div>
            <div className="font-medium text-white mt-1">{results && (results.userVector.CR * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-[#1a4a2a] rounded-lg text-center py-3 shadow-lg hover:shadow-green-900/20 transition-all border border-green-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-green-400">SS</div>
            <div className="text-sm text-gray-400">Sensibilidad Social</div>
            <div className="font-medium text-white mt-1">{results && (results.userVector.SS * 100).toFixed(0)}%</div>
          </div>
        </div>
        
        {/* Gráfico de Radar */}
        <div className="mb-12 bg-gray-900/90 p-6 rounded-lg shadow-md border border-gray-800">
          <h3 className="text-xl font-bold mb-6 text-white tracking-wide text-center">Visualización de tu perfil</h3>
          <div className="mx-auto" style={{ maxWidth: '500px', height: '400px' }}>
            <Radar data={prepareRadarData()} options={radarOptions} />
          </div>
        </div>
        
        {/* Candidatos encontrados */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-white tracking-wide text-center">
            Candidatos que coinciden con tu perfil
          </h3>
          
          {/* Carrusel de candidatos */}
          <Slider {...sliderSettings}>
            {filteredCandidates.map((candidate, index) => (
              <div key={candidate.folio} className="px-2">
                <div className="bg-gray-900/90 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-800 h-full flex flex-col items-center">
                  {/* Porcentaje de similitud en la parte superior */}
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {(candidate.similarity * 100).toFixed(1)}%
                  </div>
                  
                  {/* Nombre y posición */}
                  <h4 className="text-lg font-semibold text-center mb-4 text-white">{index + 1}. {candidate.nombre}</h4>
                  
                  {/* Imagen del candidato en círculo al centro - solo mostrar si no ha fallado antes */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-4 border-blue-900/40">
                      {!failedImages[candidate.folio] ? (
                        <Image
                          src={`https://candidaturaspoderjudicial.ine.mx/cycc/img/fotocandidato/${candidate.folio}.jpg`}
                          alt={`Foto de ${candidate.nombre}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          onError={(e) => handleImageError(e, candidate.folio)}
                          sizes="96px"
                        />
                      ) : (
                        // Si la imagen ha fallado previamente, mostrar directamente el placeholder
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 text-center mb-4">
                    {candidate.nombreCorto} | {candidate.nombreEstado} | Distrito: {candidate.idDistritoJudicial || 'N/A'}
                  </div>
                  
                  <div className="w-full mt-3 grid grid-cols-5 gap-2 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-indigo-400">CT</div>
                      <div className="font-medium text-white">{candidate.CT_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-blue-400">IE</div>
                      <div className="font-medium text-white">{candidate.IE_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-cyan-400">EJ</div>
                      <div className="font-medium text-white">{candidate.EJ_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-teal-400">CR</div>
                      <div className="font-medium text-white">{candidate.CR_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-green-400">SS</div>
                      <div className="font-medium text-white">{candidate.SS_score}</div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <a
                      href={candidate.url_perfil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-900/30 text-blue-300 rounded-md hover:bg-blue-800/50 transition-all"
                    >
                      Ver perfil completo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => router.push('/preguntas')}
            className="px-8 py-4 bg-white text-black font-bold rounded-lg shadow-xl 
                      transition duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 group accent-font"
          >
            <span className="flex items-center">
              Volver al Cuestionario
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gray-900/70 border border-gray-700 text-white font-bold rounded-lg shadow-xl 
                     transition duration-300 ease-in-out hover:bg-gray-800 hover:scale-105 group"
          >
            <span className="flex items-center">
              Inicio
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </span>
          </button>
        </div>
      </main>
    </div>
  );
} 