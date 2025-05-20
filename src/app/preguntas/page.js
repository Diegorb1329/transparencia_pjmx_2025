'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout/Layout';
import SingleQuestion from '../../components/Preguntas/SingleQuestion';
import RankingQuestion from '../../components/Preguntas/RankingQuestion';
import QuestionProgress from '../../components/Preguntas/QuestionProgress';
import { QuestionnaireProvider, useQuestionnaire } from '../../contexts/QuestionnaireContext';

// Componente interno que usa el contexto
const QuestionnaireContent = () => {
  const router = useRouter();
  const {
    questions,
    currentStep,
    totalSteps,
    loading,
    error,
    handleAnswer,
    nextStep,
    prevStep,
    getCurrentAnswer,
    userAnswers
  } = useQuestionnaire();

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 text-red-400 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-bold text-xl mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Si no hay preguntas, mostrar mensaje
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="font-bold text-xl mb-2">Sin preguntas</h3>
        <p>No se han encontrado preguntas para el cuestionario.</p>
      </div>
    );
  }

  // Obtener la pregunta actual
  const currentQuestion = questions[currentStep - 1];
  
  // Verificar si puede continuar (si ha respondido la pregunta actual)
  const canContinue = getCurrentAnswer(currentQuestion.id) !== null;
  
  // Verificar si ha completado todas las preguntas
  const isComplete = currentStep === totalSteps && canContinue;

  // Manejar el envío de respuestas
  const handleSubmit = () => {
    // Redirigir a la página de resultados
    router.push('/resultados');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <QuestionProgress currentStep={currentStep} totalSteps={totalSteps} />

      {/* Numeración de preguntas */}
      <div className="text-gray-400 text-sm tracking-widest font-medium mb-6">
        {currentStep}/{totalSteps} PJMx 2025
      </div>

      {/* Contenedor de la pregunta */}
      <div className="mb-12 bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-xl">
        {currentQuestion.type === 'single' ? (
          <SingleQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={getCurrentAnswer(currentQuestion.id)}
          />
        ) : currentQuestion.type === 'ranking' ? (
          <RankingQuestion
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={getCurrentAnswer(currentQuestion.id)}
          />
        ) : (
          <div className="bg-red-900/20 p-6 rounded-xl border border-red-700/30 text-red-400">
            Tipo de pregunta no soportado: {currentQuestion.type}
          </div>
        )}
      </div>

      {/* Navegación entre preguntas */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
            currentStep === 1
              ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600'
          }`}
        >
          Anterior
        </button>

        {isComplete ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-green-700 text-white rounded-xl font-medium shadow-lg hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            Ver resultados
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
              canContinue
                ? 'bg-blue-700 text-white hover:bg-blue-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600'
                : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

// Componente principal envuelto con el proveedor del contexto
export default function PreguntasPage() {
  return (
    <QuestionnaireProvider>
      <Layout title="PJMx 2025 - Cuestionario">
        <div className="min-h-screen bg-black text-white">
          <QuestionnaireContent />
        </div>
      </Layout>
    </QuestionnaireProvider>
  );
} 