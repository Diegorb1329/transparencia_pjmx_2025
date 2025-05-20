'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  // Configuración del carrusel
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
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
          20 // Mostrar los 20 mejores matches
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

  // Preparar datos para el gráfico de radar
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

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <Layout title="PJMx 2025 - Resultados">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <Layout title="PJMx 2025 - Resultados">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => router.push('/preguntas')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Volver al cuestionario
          </button>
        </div>
      </Layout>
    );
  }

  // Si no hay resultados, mostrar mensaje
  if (!results) {
    return (
      <Layout title="PJMx 2025 - Resultados">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <h3 className="font-bold">Sin resultados</h3>
          <p>No se han encontrado resultados para mostrar.</p>
          <button
            onClick={() => router.push('/preguntas')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg"
          >
            Realizar cuestionario
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PJMx 2025 - Resultados">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Candidatos compatibles con tus preferencias</h2>
        <p className="text-center text-gray-600 mb-6">¿Sabías que hay {totalCandidates} candidatos en esta elección?</p>
        
        {/* Filtros (ahora en la parte superior) */}
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
        
        {/* Gráfico de Radar */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Tu perfil de preferencias</h3>
          <div className="mx-auto" style={{ maxWidth: '500px', height: '400px' }}>
            <Radar data={prepareRadarData()} options={radarOptions} />
          </div>
        </div>
        
        {/* Resultados encontrados */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {filteredCandidates.length} candidatos encontrados
          </h3>
          
          {/* Carrusel de candidatos */}
          <Slider {...sliderSettings}>
            {filteredCandidates.map((candidate, index) => (
              <div key={candidate.folio} className="px-2">
                <div className="bg-white p-4 rounded-lg shadow-md h-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">{index + 1}. {candidate.nombre}</h4>
                      <div className="text-sm text-gray-600">
                        {candidate.nombreCorto} | {candidate.nombreEstado} | Distrito: {candidate.idDistritoJudicial || 'N/A'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(candidate.similarity * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-5 gap-2">
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
                  
                  <div className="mt-4">
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
              </div>
            ))}
          </Slider>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => router.push('/preguntas')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Volver al cuestionario
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200"
          >
            Inicio
          </button>
        </div>
      </div>
    </Layout>
  );
} 