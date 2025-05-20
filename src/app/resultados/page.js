'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout';
import { processUserAnswersAndFindMatches, loadMatchingData } from '../../utils/matchingService';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import FilterBar from '../../components/Common/FilterBar';
import ProfileRadarChart from '../../components/Common/ProfileRadarChart';
import CandidateCarousel from '../../components/Common/CandidateCarousel';

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
        
        {/* Componente de barra de filtros */}
        <FilterBar 
          filters={filters} 
          filterOptions={filterOptions} 
          handleFilterChange={handleFilterChange} 
          clearFilters={clearFilters}
        />
        
        {/* Componente de gráfico de radar */}
        <ProfileRadarChart userVector={results.userVector} />
        
        {/* Componente de carrusel de candidatos */}
        <CandidateCarousel candidates={filteredCandidates} />
        
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