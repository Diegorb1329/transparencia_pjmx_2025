'use client';

import { useRouter } from 'next/navigation';
import Layout from '../components/Layout/Layout';

export default function Home() {
  const router = useRouter();

  const handleStartQuestionnaire = () => {
    router.push('/preguntas');
  };

  return (
    <Layout title="PJMx 2025 - Inicio">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-800">
              Encuentra tu candidato judicial ideal
            </h2>
            
            <div className="flex justify-center mb-8">
              <img 
                src="/images/hero-image.jpg" 
                alt="Justicia" 
                className="w-full max-w-md rounded-lg shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=Justicia';
                }}
              />
            </div>
            
            <div className="space-y-6 mb-8">
              <p className="text-lg">
                Bienvenido al sistema de matching de candidatos judiciales para PJMx 2025.
                Esta herramienta te ayudará a encontrar a los candidatos que mejor se alinean con tus preferencias y valores.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">¿Cómo funciona?</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Responde un breve cuestionario sobre tus preferencias en cuanto a características de jueces.</li>
                  <li>Nuestro algoritmo analizará tus respuestas y las comparará con los perfiles de los candidatos.</li>
                  <li>Te mostraremos una lista de los candidatos más compatibles con tus preferencias.</li>
                  <li>Podrás filtrar los resultados por tipo de candidatura, estado y distrito judicial.</li>
                </ol>
              </div>
              
              <p>
                El sistema se basa en 5 dimensiones clave:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <div className="font-bold text-indigo-800">CT</div>
                  <div className="text-sm">Competencia Técnica</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="font-bold text-blue-800">IE</div>
                  <div className="text-sm">Independencia y Ética</div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg text-center">
                  <div className="font-bold text-cyan-800">EJ</div>
                  <div className="text-sm">Enfoque Jurídico</div>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg text-center">
                  <div className="font-bold text-teal-800">CR</div>
                  <div className="text-sm">Capacidad Resolutiva</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="font-bold text-green-800">SS</div>
                  <div className="text-sm">Sensibilidad Social</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleStartQuestionnaire}
                className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Comenzar Cuestionario →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 