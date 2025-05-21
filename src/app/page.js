'use client';

import { useRouter } from 'next/navigation';
import Layout from '../components/Layout/Layout';
import { useEffect, useState } from 'react';
import { getUserAnswersCount } from '../supabase/userDataService';

export default function Home() {
  const router = useRouter();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    getUserAnswersCount().then(setUserCount);
  }, []);

  const handleStartQuestionnaire = () => {
    router.push('/preguntas');
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
        </div>

        {/* 5 Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
          <div className="bg-[#1a1a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-indigo-900/20 transition-all border border-indigo-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-indigo-400">CT</div>
            <div className="text-sm text-gray-400">Competencia Técnica</div>
          </div>
          
          <div className="bg-[#1a2a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-blue-900/20 transition-all border border-blue-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-blue-400">IE</div>
            <div className="text-sm text-gray-400">Independencia y Ética</div>
          </div>
          
          <div className="bg-[#1a3a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-cyan-900/20 transition-all border border-cyan-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-cyan-400">EJ</div>
            <div className="text-sm text-gray-400">Enfoque Jurídico</div>
          </div>
          
          <div className="bg-[#1a4a4a] rounded-lg text-center py-3 shadow-lg hover:shadow-teal-900/20 transition-all border border-teal-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-teal-400">CR</div>
            <div className="text-sm text-gray-400">Capacidad Resolutiva</div>
          </div>
          
          <div className="bg-[#1a4a2a] rounded-lg text-center py-3 shadow-lg hover:shadow-green-900/20 transition-all border border-green-900/30 hover:-translate-y-1">
            <div className="font-bold text-2xl text-green-400">SS</div>
            <div className="text-sm text-gray-400">Sensibilidad Social</div>
          </div>
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
    </div>
  );
} 