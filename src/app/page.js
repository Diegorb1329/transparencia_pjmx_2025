'use client';

import { useRouter } from 'next/navigation';
import Layout from '../components/Layout/Layout';
import { useEffect, useState } from 'react';
import { getUserAnswersCount } from '../supabase/userDataService';
import MethodologyModal from '../components/Common/MethodologyModal';

export default function Home() {
  const router = useRouter();
  const [userCount, setUserCount] = useState(null);
  const [showDimensionModal, setShowDimensionModal] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  useEffect(() => {
    getUserAnswersCount().then(setUserCount);
  }, []);

  const handleStartQuestionnaire = () => {
    router.push('/preguntas');
  };

  // Definición de dimensiones con explicaciones detalladas
  const dimensions = {
    CT: {
      name: "Competencia Técnica",
      color: "indigo",
      bgColor: "#1a1a4a",
      borderColor: "indigo-900/30",
      shadowColor: "indigo-900/20",
      textColor: "indigo-400",
      description: "Experiencia profesional, conocimientos jurídicos especializados, y formación académica sólida",
      details: [
        "Años de experiencia en el sistema judicial",
        "Especialización en áreas específicas del derecho",
        "Formación académica y posgrados relevantes",
        "Participación en casos complejos y precedentes",
        "Experiencia internacional o nacional según el caso"
      ]
    },
    IE: {
      name: "Independencia y Ética",
      color: "blue",
      bgColor: "#1a2a4a",
      borderColor: "blue-900/30",
      shadowColor: "blue-900/20",
      textColor: "blue-400",
      description: "Resistencia a presiones políticas, integridad moral, transparencia en decisiones",
      details: [
        "Historial de decisiones independientes",
        "Resistencia documentada a presiones externas",
        "Transparencia en su patrimonio y conflictos de interés",
        "Ética profesional y personal intachable",
        "Compromiso con la imparcialidad judicial"
      ]
    },
    EJ: {
      name: "Enfoque Jurídico",
      color: "cyan",
      bgColor: "#1a3a4a",
      borderColor: "cyan-900/30",
      shadowColor: "cyan-900/20",
      textColor: "cyan-400",
      description: "Balance entre interpretación legal y aplicación estricta, adaptación a cambios sociales",
      details: [
        "Filosofía judicial: estricta vs. interpretativa",
        "Adaptación a cambios sociales y tecnológicos",
        "Consideración del contexto social en decisiones",
        "Innovación en procedimientos judiciales",
        "Balance entre tradición jurídica y modernidad"
      ]
    },
    CR: {
      name: "Capacidad Resolutiva",
      color: "teal",
      bgColor: "#1a4a4a",
      borderColor: "teal-900/30",
      shadowColor: "teal-900/20",
      textColor: "teal-400",
      description: "Eficiencia en la resolución de casos, calidad de sentencias, innovación procesal",
      details: [
        "Rapidez en la resolución de casos",
        "Calidad y solidez de las sentencias",
        "Innovación en procedimientos judiciales",
        "Capacidad de mediación y resolución de conflictos",
        "Claridad en el lenguaje jurídico utilizado"
      ]
    },
    SS: {
      name: "Sensibilidad Social",
      color: "green",
      bgColor: "#1a4a2a",
      borderColor: "green-900/30",
      shadowColor: "green-900/20",
      textColor: "green-400",
      description: "Experiencia en causas sociales, empatía con grupos vulnerables, perspectiva de inclusión",
      details: [
        "Experiencia en derechos humanos",
        "Trabajo con grupos vulnerables",
        "Perspectiva de género e inclusión",
        "Sensibilidad hacia causas ambientales",
        "Compromiso con la justicia social"
      ]
    }
  };

  const handleDimensionClick = (dimensionKey) => {
    setSelectedDimension(dimensions[dimensionKey]);
    setShowDimensionModal(true);
  };

  const closeDimensionModal = () => {
    setShowDimensionModal(false);
    setSelectedDimension(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Removed header bar */}
      <main className="flex-grow px-4 sm:px-6 lg:container lg:mx-auto py-8">
        {/* Top Find Button */}
        <div className="flex justify-center mb-12">
          <button className="px-6 py-2 bg-gray-900/70 border border-gray-700 rounded-full flex items-center gap-2 text-white hover:bg-gray-800 transition-all shadow-md">
            <span className="text-xs">★</span>
            <span>Encuentra Tu Candidato Judicial Ideal</span>
          </button>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            TransparencIA X PJMx
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-400 mb-8 tracking-tight">
            Encuentra candidatos con tus valores
          </h2>
          {/* Contador de usuarios */}
          <div className="font-bold text-lg text-indigo-300 mb-4">
            {userCount !== null
              ? `¡${userCount} ${userCount === 1 ? 'persona ha' : 'personas han'} contestado!`
              : 'Cargando...'}
          </div>
          {/* Botones de enlaces */}
          <div className="flex justify-center gap-4 mb-4">
            <a
              href="https://www.transparencIA.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
            >
              Conoce nuestro trabajo
            </a>
            <button
              onClick={() => setShowMethodologyModal(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold shadow hover:bg-gray-600 transition"
            >
              ¿Cómo funciona?
            </button>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Responde una serie de preguntas políticas para encontrar candidatos judiciales 
            que mejor representan tus valores y prioridades.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Inspirado por <a href="https://compass.deepgov.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">DeepGov</a>
          </p>
        </div>

        {/* Three Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="bg-gray-900/90 rounded-lg p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all hover:bg-gray-900 border border-gray-800 hover:scale-103">
            <div className="bg-gray-800 rounded-full p-4 mb-4 flex items-center justify-center">
              <span role="img" aria-label="document" className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Responde Preguntas</h3>
            <p className="text-gray-400">
              Comparte tus opiniones sobre cuestiones judiciales clave
            </p>
          </div>

          <div className="bg-gray-900/90 rounded-lg p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all hover:bg-gray-900 border border-gray-800 hover:scale-103">
            <div className="bg-gray-800 rounded-full p-4 mb-4 flex items-center justify-center">
              <span role="img" aria-label="balance" className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Ajusta Importancia</h3>
            <p className="text-gray-400">
              Pondera temas según tus prioridades personales
            </p>
          </div>

          <div className="bg-gray-900/90 rounded-lg p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all hover:bg-gray-900 border border-gray-800 hover:scale-103">
            <div className="bg-gray-800 rounded-full p-4 mb-4 flex items-center justify-center">
              <span role="img" aria-label="magnifying glass" className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Encuentra Coincidencias</h3>
            <p className="text-gray-400">
              Descubre qué candidatos judiciales se alinean con tus valores
            </p>
          </div>
        </div>

        {/* Dimensions Heading */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white tracking-wide">El sistema se basa en 5 dimensiones clave:</h3>
          <p className="text-sm text-gray-400 mt-2">Haz clic en cada dimensión para conocer más detalles</p>
        </div>

        {/* 5 Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
          {Object.entries(dimensions).map(([key, dimension]) => (
            <div
              key={key}
              className={`rounded-lg text-center py-3 shadow-lg transition-all border hover:-translate-y-1 cursor-pointer group`}
              style={{ 
                backgroundColor: dimension.bgColor,
                borderColor: `var(--${dimension.color}-900)`,
              }}
              onClick={() => handleDimensionClick(key)}
            >
              <div className={`font-bold text-2xl text-${dimension.color}-400 mb-1`}>
                {key}
              </div>
              <div className="text-sm text-gray-400 px-2 group-hover:text-gray-300 transition-colors">
                {dimension.name}
              </div>
              <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Clic para detalles
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartQuestionnaire}
            className="px-8 py-4 bg-white text-black font-bold rounded-lg shadow-xl 
                      transition duration-300 ease-in-out hover:bg-gray-200 hover:scale-105 group accent-font"
          >
            <span className="flex items-center">
              Comenzar Cuestionario
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </main>

      {/* Modal de dimensiones */}
      {showDimensionModal && selectedDimension && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-bold text-${selectedDimension.color}-400`}>
                {selectedDimension.name}
              </h3>
              <button
                onClick={closeDimensionModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {selectedDimension.description}
            </p>
            
            <h4 className="text-lg font-semibold text-white mb-3">Esta dimensión evalúa:</h4>
            <ul className="space-y-2">
              {selectedDimension.details.map((detail, index) => (
                <li key={index} className="flex items-start text-gray-300">
                  <div className={`w-2 h-2 rounded-full bg-${selectedDimension.color}-400 mt-2 mr-3 flex-shrink-0`}></div>
                  {detail}
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                <strong className="text-white">¿Cómo se mide?</strong> Las personas candidatas son evaluadas 
                por expertos usando inteligencia artificial que analiza sus CV, trayectoria profesional, 
                casos relevantes y posturas públicas documentadas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de metodología */}
      <MethodologyModal 
        isOpen={showMethodologyModal}
        onClose={() => setShowMethodologyModal(false)}
      />
    </div>
  );
} 