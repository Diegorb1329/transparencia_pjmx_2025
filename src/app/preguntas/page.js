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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Si no hay preguntas, mostrar mensaje
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
        <h3 className="font-bold">Sin preguntas</h3>
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
    <div className="max-w-3xl mx-auto">
      <QuestionProgress currentStep={currentStep} totalSteps={totalSteps} />

      {/* Contenedor de la pregunta */}
      <div className="mb-8">
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
          <div className="bg-red-50 p-4 rounded-lg">
            Tipo de pregunta no soportado: {currentQuestion.type}
          </div>
        )}
      </div>

      {/* Navegación entre preguntas */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg shadow ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-blue-700 hover:bg-gray-50'
          }`}
        >
          Anterior
        </button>

        {isComplete ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Ver resultados
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canContinue}
            className={`px-6 py-2 rounded-lg shadow ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        )}
      </div>
      
      {/* Contador de preguntas respondidas */}
      <div className="mt-8 text-center text-gray-600">
        <p>{userAnswers.length} de {totalSteps} preguntas respondidas</p>
      </div>
    </div>
  );
};

// Componente principal envuelto con el proveedor del contexto
export default function PreguntasPage() {
  return (
    <QuestionnaireProvider>
      <Layout title="PJMx 2025 - Cuestionario">
        <QuestionnaireContent />
      </Layout>
    </QuestionnaireProvider>
  );
} 