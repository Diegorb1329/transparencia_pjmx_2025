'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../components/Layout/Layout';
import { processUserAnswersAndFindMatches, loadMatchingData } from '../../utils/matchingService';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

// Registrar componentes de Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Componentes para flechas personalizadas
const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} bg-gray-800 rounded-full p-2 absolute left-0 z-10 -ml-5 cursor-pointer flex items-center justify-center`}
      style={{ ...style, display: 'flex', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px' }}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </div>
  );
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} bg-gray-800 rounded-full p-2 absolute right-0 z-10 -mr-5 cursor-pointer flex items-center justify-center`}
      style={{ ...style, display: 'flex', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px' }}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default function ResultadosPage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCandidates, setTotalCandidates] = useState(0);
  // Estado para candidatos seleccionados para comparar en el radar (múltiples)
  const [selectedCandidates, setSelectedCandidates] = useState({});
  // Estado para el modal de detalles del candidato
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
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
  
  // Lista completa de distritos por estado
  const [distritosMap, setDistritosMap] = useState({});
  
  // Candidatos filtrados
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  // Estado para rastrear qué imágenes han fallado
  const [failedImages, setFailedImages] = useState({});
  // Estado para el tipo de ordenamiento
  const [sortType, setSortType] = useState('score'); // presetear en 'score'
  // 1. Agrega un estado para el candidato actualmente en hover
  const [hoveredCandidate, setHoveredCandidate] = useState(null);

  // Configuración del carrusel
  const sliderSettings = {
    dots: false, // Quitar los puntos de navegación para evitar que se llene la página
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2, // Deslizar 2 a la vez para navegar más rápido
    prevArrow: <PrevArrow />, // Flecha personalizada para navegación previa
    nextArrow: <NextArrow />, // Flecha personalizada para navegación siguiente
    swipeToSlide: true,
    touchThreshold: 5, // Hacer más sensible el deslizamiento números más bajos para que se deslice más rápido
    adaptiveHeight: false, // Mantener altura consistente
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
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
          slidesToScroll: 1,
          dots: true, // Habilitar puntos solo en móvil
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
        
        // Extraer opciones para filtros
        const candidaturas = [...new Set(candidates.map(c => c.nombreCorto))];
        const estados = [...new Set(candidates.map(c => c.nombreEstado))];
        
        // Crear un mapa de distritos por estado
        const distritosEstadoMap = {};
        candidates.forEach(candidate => {
          const estado = candidate.nombreEstado;
          const distrito = candidate.idDistritoJudicial;
          
          if (!distrito) return; // Ignorar candidatos sin distrito
          
          if (!distritosEstadoMap[estado]) {
            distritosEstadoMap[estado] = new Set();
          }
          distritosEstadoMap[estado].add(distrito);
        });
        
        // Convertir Sets a arrays ordenados
        const processedDistritosMap = {};
        Object.keys(distritosEstadoMap).forEach(estado => {
          processedDistritosMap[estado] = [...distritosEstadoMap[estado]].sort((a, b) => a - b);
        });
        
        setDistritosMap(processedDistritosMap);
        
        setFilterOptions({
          candidaturas,
          estados,
          distritos: [] // Inicialmente vacío, se llenará al seleccionar estado
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
    
    // Definir qué tipos de candidatura son federales (no dependen del estado)
    const federalCandidaturas = [
      "Magistraturas de Tribunales Colegiados de Circuito",
      "Magistratura Sala Superior del TE del PJF",
      "Magistratura Salas Regionales del TE del PJF",
      "Magistratura Tribunal de Disciplina Judicial",
      "Ministra/o Suprema Corte de Justicia de la Nación"
    ];
    
    // Dividir candidatos entre federales y locales
    const federalCandidates = filtered.filter(c => 
      federalCandidaturas.includes(c.nombreCorto)
    );
    
    let localCandidates = filtered.filter(c => 
      !federalCandidaturas.includes(c.nombreCorto)
    );
    
    // Filtrar por tipo de candidatura si está especificado
    if (filters.candidatura) {
      if (federalCandidaturas.includes(filters.candidatura)) {
        // Si es candidatura federal, solo mostrar esas
        filtered = federalCandidates.filter(c => c.nombreCorto === filters.candidatura);
      } else {
        // Si es candidatura local, filtrar en los locales
        localCandidates = localCandidates.filter(c => c.nombreCorto === filters.candidatura);
      }
    }
    
    // Filtrar candidatos locales por estado
    if (filters.estado) {
      localCandidates = localCandidates.filter(c => c.nombreEstado === filters.estado);
      
      // Actualizar opciones de distritos basados en el estado seleccionado
      const estadoDistritos = distritosMap[filters.estado] || [];
      setFilterOptions(prev => ({
        ...prev,
        distritos: estadoDistritos
      }));
      
      // Limpiar distrito si no está en el nuevo estado
      if (filters.distrito && !estadoDistritos.includes(parseInt(filters.distrito))) {
        setFilters(prev => ({
          ...prev,
          distrito: ''
        }));
      }
    } else {
      // Si no hay estado seleccionado, limpiar los distritos
      setFilterOptions(prev => ({
        ...prev,
        distritos: []
      }));
      
      // Limpiar el distrito seleccionado
      if (filters.distrito) {
        setFilters(prev => ({
          ...prev,
          distrito: ''
        }));
      }
      
      // Si no hay estado seleccionado, solo mostrar candidatos federales
      localCandidates = [];
    }
    
    // Filtrar por distrito para candidatos locales
    if (filters.distrito) {
      localCandidates = localCandidates.filter(c => c.idDistritoJudicial === parseInt(filters.distrito));
    }
    
    // Combinar candidatos federales y locales para el resultado final
    filtered = [...federalCandidates, ...localCandidates];
    
    // Si hay un filtro de tipo de candidatura aplicado, filtrar el resultado combinado
    if (filters.candidatura) {
      filtered = filtered.filter(c => c.nombreCorto === filters.candidatura);
    }
    
    setFilteredCandidates(filtered);
  }, [filters, results, distritosMap]);

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
    
    // Crear el dataset del usuario
    const datasets = [
      {
        label: 'Tu perfil',
        data: [
          typeof results.userVector.CT === 'number' && results.userVector.CT <= 1 ? results.userVector.CT * 100 : Number(results.userVector.CT),
          typeof results.userVector.IE === 'number' && results.userVector.IE <= 1 ? results.userVector.IE * 100 : Number(results.userVector.IE),
          typeof results.userVector.EJ === 'number' && results.userVector.EJ <= 1 ? results.userVector.EJ * 100 : Number(results.userVector.EJ),
          typeof results.userVector.CR === 'number' && results.userVector.CR <= 1 ? results.userVector.CR * 100 : Number(results.userVector.CR),
          typeof results.userVector.SS === 'number' && results.userVector.SS <= 1 ? results.userVector.SS * 100 : Number(results.userVector.SS),
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      }
    ];
    
    // Añadir datasets para todos los candidatos seleccionados
    const colorPalette = [
      ['rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)'],  // Rojo
      ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 1)'],  // Verde
      ['rgba(255, 159, 64, 0.2)', 'rgba(255, 159, 64, 1)'],  // Naranja
      ['rgba(153, 102, 255, 0.2)', 'rgba(153, 102, 255, 1)'], // Púrpura
      ['rgba(255, 205, 86, 0.2)', 'rgba(255, 205, 86, 1)']   // Amarillo
    ];
    
    // Convertir el objeto de candidatos seleccionados en un array
    const selectedCandidatesArray = Object.values(selectedCandidates);
    
    selectedCandidatesArray.forEach((candidate, index) => {
      const colorIndex = index % colorPalette.length;
      datasets.push({
        label: candidate.nombre,
        data: [
          typeof candidate.CT_score === 'number' && candidate.CT_score <= 1 ? candidate.CT_score * 100 : Number(candidate.CT_score),
          typeof candidate.IE_score === 'number' && candidate.IE_score <= 1 ? candidate.IE_score * 100 : Number(candidate.IE_score),
          typeof candidate.EJ_score === 'number' && candidate.EJ_score <= 1 ? candidate.EJ_score * 100 : Number(candidate.EJ_score),
          typeof candidate.CR_score === 'number' && candidate.CR_score <= 1 ? candidate.CR_score * 100 : Number(candidate.CR_score),
          typeof candidate.SS_score === 'number' && candidate.SS_score <= 1 ? candidate.SS_score * 100 : Number(candidate.SS_score),
        ],
        backgroundColor: colorPalette[colorIndex][0],
        borderColor: colorPalette[colorIndex][1],
        borderWidth: 2,
      });
    });
    
    return {
      labels: ['Competencia Técnica (CT)', 'Independencia (IE)', 'Experiencia Jurídica (EJ)', 'Capacidad Resolutiva (CR)', 'Sensibilidad Social (SS)'],
      datasets
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
          callback: function(value) {
            return value + '%';
          },
          backdropColor: 'rgba(0,0,0,0)',
          z: 1,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { weight: 'bold' },
        },
        backgroundColor: 'rgba(0,0,0,0)',
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { weight: 'bold' },
          boxWidth: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.r !== undefined ? context.parsed.r : context.raw;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    backgroundColor: 'rgba(0,0,0,0)',
  };
  
  // Función para seleccionar un candidato para comparar en el radar
  const handleSelectCandidateForRadar = (candidate) => {
    setSelectedCandidates(prev => {
      // Si el candidato ya está seleccionado, quitarlo
      if (prev[candidate.folio]) {
        const newSelected = {...prev};
        delete newSelected[candidate.folio];
        return newSelected;
      } 
      // Si no está seleccionado, añadirlo (máximo 5 candidatos)
      else {
        // Limitar a 5 candidatos para evitar sobrecarga visual
        if (Object.keys(prev).length >= 5) {
          alert('Máximo 5 candidatos pueden ser comparados a la vez');
          return prev;
        }
        return {
          ...prev,
          [candidate.folio]: candidate
        };
      }
    });
  };
  
  // Función para abrir búsqueda de Google
  const handleGoogleSearch = (nombre) => {
    const searchQuery = `Noticias sobre "${nombre}" candidato al poder judicial en México`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  // Función para abrir el modal de detalles del candidato
  const handleOpenDetailModal = (candidate, e) => {
    // Evitar que se propague el evento si viene de los botones de acción
    if (e && e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    setDetailCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailCandidate(null);
  };

  // Ordenar los candidatos antes de renderizar el carrusel
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortType === 'score') {
      // Suma de scores normalizados (0-100)
      const aSum = (typeof a.CT_score === 'number' && a.CT_score <= 1 ? a.CT_score * 100 : Number(a.CT_score))
        + (typeof a.IE_score === 'number' && a.IE_score <= 1 ? a.IE_score * 100 : Number(a.IE_score))
        + (typeof a.EJ_score === 'number' && a.EJ_score <= 1 ? a.EJ_score * 100 : Number(a.EJ_score))
        + (typeof a.CR_score === 'number' && a.CR_score <= 1 ? a.CR_score * 100 : Number(a.CR_score))
        + (typeof a.SS_score === 'number' && a.SS_score <= 1 ? a.SS_score * 100 : Number(a.SS_score));
      const bSum = (typeof b.CT_score === 'number' && b.CT_score <= 1 ? b.CT_score * 100 : Number(b.CT_score))
        + (typeof b.IE_score === 'number' && b.IE_score <= 1 ? b.IE_score * 100 : Number(b.IE_score))
        + (typeof b.EJ_score === 'number' && b.EJ_score <= 1 ? b.EJ_score * 100 : Number(b.EJ_score))
        + (typeof b.CR_score === 'number' && b.CR_score <= 1 ? b.CR_score * 100 : Number(b.CR_score))
        + (typeof b.SS_score === 'number' && b.SS_score <= 1 ? b.SS_score * 100 : Number(b.SS_score));
      return bSum - aSum;
    } else {
      // Ordenar por afinidad (similarity)
      return (b.similarity || 0) - (a.similarity || 0);
    }
  });

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
            De un total de {totalCandidates} participantes en la elección, selecciona un estado para encontrar
            candidatos que mejor coinciden con tus preferencias.
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
                {/* Primero mostrar opciones locales */}
                <optgroup label="Candidaturas Locales (requieren estado)">
                  {filterOptions.candidaturas
                    .filter(c => ![
                                  "Magistratura Sala Superior del TE del PJF",
                                  "Magistratura Salas Regionales del TE del PJF",
                                  "Magistratura Tribunal de Disciplina Judicial",
                                  "Ministra/o Suprema Corte de Justicia de la Nación"].includes(c))
                    .map((candidatura) => (
                      <option key={candidatura} value={candidatura}>
                        {candidatura}
                      </option>
                    ))}
                </optgroup>
                {/* Luego mostrar opciones federales */}
                <optgroup label="Candidaturas Federales (en todo el país)">
                  {filterOptions.candidaturas
                    .filter(c => [
                                 "Magistratura Sala Superior del TE del PJF",
                                 "Magistratura Salas Regionales del TE del PJF",
                                 "Magistratura Tribunal de Disciplina Judicial",
                                 "Ministra/o Suprema Corte de Justicia de la Nación"].includes(c))
                    .map((candidatura) => (
                      <option key={candidatura} value={candidatura}>
                        {candidatura}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
            
            {/* Filtro por estado - OBLIGATORIO */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Estado <span className="text-red-400">*</span>
              </label>
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="block w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona un estado</option>
                {filterOptions.estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {!filters.estado && (
                <p className="mt-1 text-sm text-red-400">Debes seleccionar un estado para ver candidatos</p>
              )}
            </div>
            
            {/* Filtro por distrito - Dinámico según estado */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Distrito Judicial</label>
              <select
                name="distrito"
                value={filters.distrito}
                onChange={handleFilterChange}
                className="block w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!filters.estado || filterOptions.distritos.length === 0}
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
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-all"
            >
              Limpiar filtros
            </button>
            
            <div className="text-gray-400 text-sm">
              {filters.estado ? (
                <>
                  Mostrando {filteredCandidates.length} candidato{filteredCandidates.length !== 1 ? 's' : ''} 
                  {filters.candidatura ? ` de tipo ${filters.candidatura}` : ''}
                  {` en ${filters.estado}`}
                  {filters.distrito ? ` (Distrito ${filters.distrito})` : ''}
                  {!filters.candidatura && filteredCandidates.length > 0 && (
                    <span className="text-blue-400 ml-1">
                      (incluye candidaturas federales)
                    </span>
                  )}
                </>
              ) : (
                <>
                  {filteredCandidates.length > 0 ? (
                    <>
                      Mostrando {filteredCandidates.length} candidato{filteredCandidates.length !== 1 ? 's' : ''} federales
                      {filters.candidatura ? ` de tipo ${filters.candidatura}` : ''}
                    </>
                  ) : (
                    <>Selecciona un estado para ver candidatos locales. Las candidaturas federales se muestran automáticamente.</>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 5 Dimensions */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white tracking-wide mb-6">Tu perfil en las 5 dimensiones clave:</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
          <div className="flex flex-col items-center bg-[#1a1a4a] rounded-lg py-3 px-2 shadow-lg hover:shadow-indigo-900/20 transition-all border border-indigo-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-indigo-400 mb-1">CT</div>
            <ProgressBar value={typeof results.userVector.CT === 'number' && results.userVector.CT <= 1 ? results.userVector.CT * 100 : Number(results.userVector.CT)} color="bg-indigo-500" label="Competencia Técnica" />
          </div>
          <div className="flex flex-col items-center bg-[#1a2a4a] rounded-lg py-3 px-2 shadow-lg hover:shadow-blue-900/20 transition-all border border-blue-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-blue-400 mb-1">IE</div>
            <ProgressBar value={typeof results.userVector.IE === 'number' && results.userVector.IE <= 1 ? results.userVector.IE * 100 : Number(results.userVector.IE)} color="bg-blue-500" label="Independencia y Ética" />
          </div>
          <div className="flex flex-col items-center bg-[#1a3a4a] rounded-lg py-3 px-2 shadow-lg hover:shadow-cyan-900/20 transition-all border border-cyan-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-cyan-400 mb-1">EJ</div>
            <ProgressBar value={typeof results.userVector.EJ === 'number' && results.userVector.EJ <= 1 ? results.userVector.EJ * 100 : Number(results.userVector.EJ)} color="bg-cyan-500" label="Enfoque Jurídico" />
          </div>
          <div className="flex flex-col items-center bg-[#1a4a4a] rounded-lg py-3 px-2 shadow-lg hover:shadow-teal-900/20 transition-all border border-teal-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-teal-400 mb-1">CR</div>
            <ProgressBar value={typeof results.userVector.CR === 'number' && results.userVector.CR <= 1 ? results.userVector.CR * 100 : Number(results.userVector.CR)} color="bg-teal-500" label="Capacidad Resolutiva" />
          </div>
          <div className="flex flex-col items-center bg-[#1a4a2a] rounded-lg py-3 px-2 shadow-lg hover:shadow-green-900/20 transition-all border border-green-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-green-400 mb-1">SS</div>
            <ProgressBar value={typeof results.userVector.SS === 'number' && results.userVector.SS <= 1 ? results.userVector.SS * 100 : Number(results.userVector.SS)} color="bg-green-500" label="Sensibilidad Social" />
          </div>
        </div>
        
        {/* Gráfico de Radar */}
        <div className="mb-12 bg-gray-900/90 p-6 rounded-lg shadow-md border border-gray-800">
          <h3 className="text-xl font-bold mb-4 text-white tracking-wide text-center">
            Visualización de tu perfil
            {Object.keys(selectedCandidates).length > 0 && (
              <span className="ml-2 text-blue-400">vs {Object.keys(selectedCandidates).length} candidato(s)</span>
            )}
          </h3>
          {Object.keys(selectedCandidates).length > 0 && (
            <div className="mb-4 flex justify-center">
              <button 
                onClick={() => setSelectedCandidates({})}
                className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-md hover:bg-blue-800/50 transition-all text-sm"
              >
                ↩️ Quitar todas las comparaciones
              </button>
            </div>
          )}
          <div className="mx-auto flex flex-col md:flex-row items-center" style={{ minHeight: '400px' }}>
            <div className="w-full h-[400px]">
              <Radar data={prepareRadarData()} options={radarOptions} />
            </div>
          </div>
          {Object.keys(selectedCandidates).length === 0 && (
            <div className="mt-4 text-center text-gray-400 text-sm">
              <p>Haz clic en el botón 📊 de cualquier candidato para comparar su perfil con el tuyo</p>
            </div>
          )}
        </div>
        
        {/* Candidatos encontrados */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-white tracking-wide text-center">
            {filters.estado ? 
              `Candidatos que coinciden con tu perfil (${filteredCandidates.length})` :
              'Selecciona un estado para ver resultados'
            }
          </h3>
          
          {!filters.estado ? (
            <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-800/40 text-center my-8">
              <p className="text-gray-300 mb-4">
                Para ver candidaturas locales (Juezas/es de Distrito), selecciona un estado en los filtros superiores.
              </p>
              <p className="text-sm text-gray-400">
                Las candidaturas federales (Magistraturas y Ministros) se muestran automáticamente sin necesidad de seleccionar estado, ya que aplican a todo el país.
              </p>
              {filteredCandidates.length > 0 && (
                <div className="mt-4 p-3 bg-blue-900/50 rounded-md inline-block">
                  <p className="text-blue-200">
                    Mostrando {filteredCandidates.length} candidatura{filteredCandidates.length !== 1 ? 's' : ''} federal{filteredCandidates.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              )}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-amber-900/30 p-6 rounded-lg border border-amber-800/40 text-center my-8">
              <p className="text-gray-300">
                No se encontraron candidatos que coincidan con los filtros seleccionados.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-amber-900/50 text-white rounded-md hover:bg-amber-800/60 transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              {/* Información de desplazamiento */}
              <div className="text-center text-gray-400 mb-4">
                <span>Desliza para ver más candidatos →</span>
              </div>
              
              {/* Carrusel de candidatos con estilo personalizado */}
              <div className="mx-auto relative px-10">
                <Swiper
                  effect="coverflow"
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView={3}
                  spaceBetween={30}
                  coverflowEffect={{
                    rotate: 30,
                    stretch: 0,
                    depth: 200,
                    modifier: 1,
                    slideShadows: true,
                  }}
                  navigation
                  modules={[EffectCoverflow, Navigation]}
                  className="candidate-swiper"
                  style={{ paddingBottom: '40px' }}
                  breakpoints={{
                    1280: { slidesPerView: 4 },
                    1024: { slidesPerView: 3 },
                    640: { slidesPerView: 1 },
                  }}
                >
                  {sortedCandidates.map((candidate, index) => (
                    <SwiperSlide key={candidate.folio}>
                      <div
                        className={`bg-gray-900/90 p-6 rounded-lg shadow-lg transition-all border border-gray-800 h-full flex flex-col items-center cursor-pointer
                          ${selectedCandidates[candidate.folio] ? 'bg-blue-800/80' : ''}`}
                        onClick={(e) => handleOpenDetailModal(candidate, e)}
                      >
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
                            <ProgressBar value={typeof candidate.CT_score === 'number' && candidate.CT_score <= 1 ? candidate.CT_score * 100 : Number(candidate.CT_score)} color="bg-indigo-500" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-blue-400">IE</div>
                            <ProgressBar value={typeof candidate.IE_score === 'number' && candidate.IE_score <= 1 ? candidate.IE_score * 100 : Number(candidate.IE_score)} color="bg-blue-500" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-cyan-400">EJ</div>
                            <ProgressBar value={typeof candidate.EJ_score === 'number' && candidate.EJ_score <= 1 ? candidate.EJ_score * 100 : Number(candidate.EJ_score)} color="bg-cyan-500" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-teal-400">CR</div>
                            <ProgressBar value={typeof candidate.CR_score === 'number' && candidate.CR_score <= 1 ? candidate.CR_score * 100 : Number(candidate.CR_score)} color="bg-teal-500" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-green-400">SS</div>
                            <ProgressBar value={typeof candidate.SS_score === 'number' && candidate.SS_score <= 1 ? candidate.SS_score * 100 : Number(candidate.SS_score)} color="bg-green-500" />
                          </div>
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex justify-center w-full gap-4 mb-4 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCandidateForRadar(candidate);
                            }}
                            className={`p-2 rounded-full ${selectedCandidates[candidate.folio] ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 transition-all`}
                            title="Ver en gráfico radar"
                          >
                            <span role="img" aria-label="radar" className="text-lg">📊</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoogleSearch(candidate.nombre);
                            }}
                            className="p-2 rounded-full bg-gray-800 hover:bg-blue-700 transition-all"
                            title="Buscar noticias en Google"
                          >
                            <span role="img" aria-label="search" className="text-lg">🔍</span>
                          </button>

                          <a
                            href={candidate.url_perfil}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block p-2 rounded-full bg-gray-800 hover:bg-blue-700 transition-all"
                            title="Ver perfil completo en sitio oficial"
                          >
                            <span role="img" aria-label="external-link" className="text-lg">🔗</span>
                          </a>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}
        </div>
        
        {/* CTA Buttons */}
        <div className="flex justify-center my-8">
          <button
            onClick={() => router.push('/preguntas')}
            className="px-8 py-3 mr-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all shadow-lg"
          >
            Volver al cuestionario
          </button>
          
          <Link href="/" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg">
            Volver al inicio
          </Link>
        </div>

        {/* Botón de enlace a TransparencIA.tech */}
        <div className="flex justify-center my-8">
          <a
            href="https://www.transparencIA.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
          >
            Conoce nuestro trabajo
          </a>
        </div>
      </main>
      
      {/* Estilos personalizados para el carrusel */}
      <style jsx global>{`
        /* Mejorar el estilo de las tarjetas dentro del slider */
        .candidate-swiper .swiper-slide {
          height: inherit !important;
          display: flex !important;
        }
        
        .candidate-swiper .swiper-slide > div {
          display: flex;
          height: 100%;
          width: 100%;
        }
        
        /* Mejorar la visibilidad de las flechas al pasar el mouse */
        .candidate-swiper .swiper-button-prev:hover,
        .candidate-swiper .swiper-button-next:hover {
          background-color: rgba(55, 65, 81, 0.9) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        
        /* Estilo para dispositivos móviles */
        @media (max-width: 640px) {
          .candidate-swiper .swiper-pagination {
            bottom: -30px;
          }
          
          .candidate-swiper .swiper-pagination .swiper-pagination-bullet {
            color: white;
            opacity: 0.5;
            font-size: 8px;
          }
          
          .candidate-swiper .swiper-pagination .swiper-pagination-bullet-active {
            color: white;
            opacity: 0.9;
          }
        }
      `}</style>

      {/* Modal de Detalles del Candidato */}
      {isDetailModalOpen && detailCandidate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-white">{detailCandidate.nombre}</h3>
                <button 
                  onClick={handleCloseDetailModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Imagen y datos básicos */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-blue-900/40 mb-4">
                    {!failedImages[detailCandidate.folio] ? (
                      <Image
                        src={`https://candidaturaspoderjudicial.ine.mx/cycc/img/fotocandidato/${detailCandidate.folio}.jpg`}
                        alt={`Foto de ${detailCandidate.nombre}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, detailCandidate.folio)}
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-bold text-blue-400 mb-2">
                    {(detailCandidate.similarity * 100).toFixed(1)}% coincidencia
                  </div>
                  <div className="text-sm text-gray-400 text-center">
                    {detailCandidate.nombreCorto} | {detailCandidate.nombreEstado}
                  </div>
                  <div className="text-sm text-gray-400 text-center mb-4">
                    Distrito: {detailCandidate.idDistritoJudicial || 'N/A'}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex gap-3 my-4">
                    <button
                      onClick={(e) => handleSelectCandidateForRadar(detailCandidate)}
                      className={`p-2 rounded-full ${selectedCandidates[detailCandidate.folio] ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 transition-all`}
                      title="Ver en gráfico radar"
                    >
                      <span role="img" aria-label="radar" className="text-lg">📊</span>
                    </button>
                    
                    <button
                      onClick={() => handleGoogleSearch(detailCandidate.nombre)}
                      className="p-2 rounded-full bg-gray-800 hover:bg-blue-700 transition-all"
                      title="Buscar noticias en Google"
                    >
                      <span role="img" aria-label="search" className="text-lg">🔍</span>
                    </button>
                    
                    <a
                      href={detailCandidate.url_perfil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block p-2 rounded-full bg-gray-800 hover:bg-blue-700 transition-all"
                      title="Ver perfil completo en sitio oficial"
                    >
                      <span role="img" aria-label="external-link" className="text-lg">🔗</span>
                    </a>
                  </div>
                </div>
                
                {/* Detalles y puntuaciones */}
                <div className="flex-1">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Puntuaciones</h4>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="flex flex-col items-center">
                        <ProgressBar value={typeof detailCandidate.CT_score === 'number' && detailCandidate.CT_score <= 1 ? detailCandidate.CT_score * 100 : Number(detailCandidate.CT_score)} color="bg-indigo-500" label="CT" />
                        <div className="text-xs text-gray-400">Competencia Técnica</div>
                        <div className="text-xs text-blue-400 mt-1">Tu perfil: {results && (results.userVector.CT * 100).toFixed(1)}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ProgressBar value={typeof detailCandidate.IE_score === 'number' && detailCandidate.IE_score <= 1 ? detailCandidate.IE_score * 100 : Number(detailCandidate.IE_score)} color="bg-blue-500" label="IE" />
                        <div className="text-xs text-gray-400">Independencia y Ética</div>
                        <div className="text-xs text-blue-400 mt-1">Tu perfil: {results && (results.userVector.IE * 100).toFixed(1)}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ProgressBar value={typeof detailCandidate.EJ_score === 'number' && detailCandidate.EJ_score <= 1 ? detailCandidate.EJ_score * 100 : Number(detailCandidate.EJ_score)} color="bg-cyan-500" label="EJ" />
                        <div className="text-xs text-gray-400">Enfoque Jurídico</div>
                        <div className="text-xs text-blue-400 mt-1">Tu perfil: {results && (results.userVector.EJ * 100).toFixed(1)}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ProgressBar value={typeof detailCandidate.CR_score === 'number' && detailCandidate.CR_score <= 1 ? detailCandidate.CR_score * 100 : Number(detailCandidate.CR_score)} color="bg-teal-500" label="CR" />
                        <div className="text-xs text-gray-400">Capacidad Resolutiva</div>
                        <div className="text-xs text-blue-400 mt-1">Tu perfil: {results && (results.userVector.CR * 100).toFixed(1)}%</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ProgressBar value={typeof detailCandidate.SS_score === 'number' && detailCandidate.SS_score <= 1 ? detailCandidate.SS_score * 100 : Number(detailCandidate.SS_score)} color="bg-green-500" label="SS" />
                        <div className="text-xs text-gray-400">Sensibilidad Social</div>
                        <div className="text-xs text-blue-400 mt-1">Tu perfil: {results && (results.userVector.SS * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico de comparación */}
                  {selectedCandidates[detailCandidate.folio] && (
                    <div className="bg-gray-800/50 p-4 rounded-lg mb-4 border border-gray-700">
                      <h5 className="text-sm font-medium text-white mb-2">Comparación con tu perfil</h5>
                      <div style={{ height: '200px' }}>
                        <Radar data={prepareRadarData()} options={{...radarOptions, maintainAspectRatio: false}} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Explicaciones de puntuaciones */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Detalles de puntuaciones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-indigo-400 font-medium mb-1">Competencia Técnica (CT)</div>
                    <p className="text-gray-300 text-sm">{detailCandidate.CT_explanation}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-blue-400 font-medium mb-1">Independencia y Ética (IE)</div>
                    <p className="text-gray-300 text-sm">{detailCandidate.IE_explanation}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-cyan-400 font-medium mb-1">Enfoque Jurídico (EJ)</div>
                    <p className="text-gray-300 text-sm">{detailCandidate.EJ_explanation}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-teal-400 font-medium mb-1">Capacidad Resolutiva (CR)</div>
                    <p className="text-gray-300 text-sm">{detailCandidate.CR_explanation}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 md:col-span-2">
                    <div className="text-green-400 font-medium mb-1">Sensibilidad Social (SS)</div>
                    <p className="text-gray-300 text-sm">{detailCandidate.SS_explanation}</p>
                  </div>
                </div>
              </div>
              
              {/* Ventajas y Áreas de Oportunidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Ventajas</h4>
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/30">
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      {detailCandidate.ventajas.split(';').map((ventaja, index) => (
                        <li key={index}>{ventaja.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-3">Áreas de oportunidad</h4>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-900/30">
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      {detailCandidate.areas_oportunidad.split(';').map((area, index) => (
                        <li key={index}>{area.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleCloseDetailModal}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 