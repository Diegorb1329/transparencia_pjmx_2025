'use client';

import React from 'react';

const MethodologyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqData = [
    {
      question: "¿Cómo se midió la experiencia internacional?",
      answer: "Se analizó el CV de cada candidato buscando experiencia laboral, formación académica, investigaciones o participación en organismos internacionales. Se consideraron estancias académicas en el extranjero, trabajo en organismos internacionales, y experiencia en derecho internacional."
    },
    {
      question: "¿Cómo se mide la independencia a presiones políticas?",
      answer: "Se evalúa el historial de decisiones judiciales, casos donde hayan mostrado resistencia a presiones externas, transparencia patrimonial, y ausencia de vínculos políticos comprometedores. Se analizan sentencias controvertidas y la consistencia en la aplicación de la ley."
    },
    {
      question: "¿Cómo se mide la aplicación estricta vs interpretativa de la ley?",
      answer: "Se analizan las sentencias emitidas para identificar patrones: si tienden a aplicar la ley de manera literal o si incorporan elementos contextuales, sociales y evolutivos en sus interpretaciones. Se evalúa su postura en casos de precedentes y jurisprudencia."
    },
    {
      question: "¿Cómo se evalúa la rapidez vs calidad en resoluciones?",
      answer: "Se mide el tiempo promedio de resolución de casos, la calidad técnica de las sentencias (claridad, fundamentación jurídica), y si han sido revocadas en instancias superiores. Se considera la innovación en procedimientos para agilizar sin perder calidad."
    },
    {
      question: "¿Cómo se mide la sensibilidad a causas sociales?",
      answer: "Se evalúa la experiencia en casos de derechos humanos, perspectiva de género, protección de grupos vulnerables, participación en organizaciones civiles, publicaciones académicas sobre justicia social, y posturas públicas documentadas sobre inclusión y equidad."
    },
    {
      question: "¿Cómo funciona el algoritmo de coincidencias?",
      answer: "Utilizamos similitud de coseno para comparar tu perfil de preferencias con el perfil de cada candidato. Cada respuesta genera un vector en las 5 dimensiones (CT, IE, EJ, CR, SS). El sistema calcula qué tan similares son los vectores, dando un porcentaje de coincidencia del 0% al 100%."
    },
    {
      question: "¿Cómo se ponderan las preguntas?",
      answer: "Las preguntas directas por dimensión tienen peso estándar. Las preguntas de 'trade-off' ajustan el balance entre dimensiones. Las preguntas de 'sacrificio' y 'filtro' identifican qué dimensiones son menos importantes para ti. El ranking permite jerarquizar todas las dimensiones según tu preferencia."
    }
  ];

  const dimensions = [
    {
      code: "CT",
      name: "Competencia Técnica",
      color: "indigo",
      description: "Mide la experiencia profesional, conocimientos jurídicos especializados, formación académica, y track record en casos complejos."
    },
    {
      code: "IE", 
      name: "Independencia y Ética",
      color: "blue",
      description: "Evalúa la resistencia a presiones políticas, historial de decisiones independientes, transparencia patrimonial, y ética profesional."
    },
    {
      code: "EJ",
      name: "Enfoque Jurídico", 
      color: "cyan",
      description: "Analiza la filosofía judicial entre aplicación estricta vs interpretativa, adaptación a cambios sociales, y balance tradición-modernidad."
    },
    {
      code: "CR",
      name: "Capacidad Resolutiva",
      color: "teal", 
      description: "Mide la eficiencia en resolución de casos, calidad de sentencias, innovación procesal, y capacidad de mediación."
    },
    {
      code: "SS",
      name: "Sensibilidad Social",
      color: "green",
      description: "Evalúa experiencia en derechos humanos, trabajo con grupos vulnerables, perspectiva de género, y compromiso con justicia social."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">¿Cómo funciona TransparencIA?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Metodología General */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Metodología General</h3>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-4">
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-white">TransparencIA</strong> utiliza inteligencia artificial para analizar los perfiles 
              de candidatos judiciales y compararlos con tus preferencias. El sistema se basa en <strong>5 dimensiones clave</strong> 
              que evalúan diferentes aspectos de la función judicial.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-white">Proceso de evaluación:</strong>
            </p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
              <li>Análisis automatizado de CVs, trayectorias profesionales y sentencias públicas</li>
              <li>Evaluación por expertos usando criterios estandarizados</li>
              <li>Asignación de puntuaciones en cada dimensión (0-100 puntos)</li>
              <li>Comparación con tu perfil usando similitud de coseno</li>
              <li>Ranking de candidatos por porcentaje de coincidencia</li>
            </ol>
          </div>
        </div>

        {/* Dimensiones */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Las 5 Dimensiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dimensions.map((dim) => (
              <div key={dim.code} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className={`text-${dim.color}-400 font-bold text-lg mb-2`}>
                  {dim.code} - {dim.name}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {dim.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Preguntas Frecuentes</h3>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">{faq.question}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparencia */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4">Transparencia y Limitaciones</h3>
          <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-900/30">
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong className="text-white">Importante:</strong> Este sistema es una herramienta de apoyo para la toma de decisiones informadas. 
              Los resultados se basan en información pública disponible y análisis automatizado.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>La información puede tener limitaciones o no estar completamente actualizada</li>
              <li>El análisis automatizado puede tener sesgos inherentes</li>
              <li>Se recomienda complementar con investigación adicional</li>
              <li>Los resultados no constituyen una recomendación electoral definitiva</li>
            </ul>
          </div>
        </div>

        {/* Enlaces */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <a
              href="https://www.transparencIA.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
            >
              Conoce más sobre TransparencIA
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal; 