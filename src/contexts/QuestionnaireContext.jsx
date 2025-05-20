'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const QuestionnaireContext = createContext();

// Hook personalizado para usar el contexto
export const useQuestionnaire = () => useContext(QuestionnaireContext);

// Proveedor del contexto
export const QuestionnaireProvider = ({ children }) => {
  // Estado para almacenar las preguntas
  const [questions, setQuestions] = useState([]);
  
  // Estado para almacenar las respuestas del usuario
  const [userAnswers, setUserAnswers] = useState([]);
  
  // Estado para el paso actual del cuestionario
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(true);
  
  // Estado para almacenar errores
  const [error, setError] = useState(null);
  
  // Cargar las preguntas al iniciar
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/user_questions.json');
        const data = await response.json();
        setQuestions(data);
        
        // Restaurar respuestas del localStorage si existen
        const savedAnswers = localStorage.getItem('pjmx2025_answers');
        if (savedAnswers) {
          setUserAnswers(JSON.parse(savedAnswers));
        }
        
        // Restaurar paso actual si existe
        const savedStep = localStorage.getItem('pjmx2025_currentStep');
        if (savedStep) {
          setCurrentStep(parseInt(savedStep, 10));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las preguntas');
        setLoading(false);
        console.error(err);
      }
    };
    
    loadQuestions();
  }, []);
  
  // Actualizar el localStorage cuando cambian las respuestas
  useEffect(() => {
    if (userAnswers.length > 0) {
      localStorage.setItem('pjmx2025_answers', JSON.stringify(userAnswers));
    }
  }, [userAnswers]);
  
  // Actualizar el localStorage cuando cambia el paso actual
  useEffect(() => {
    localStorage.setItem('pjmx2025_currentStep', currentStep.toString());
  }, [currentStep]);
  
  // Función para manejar las respuestas
  const handleAnswer = (questionId, answer) => {
    // Verificar si ya existe una respuesta para esta pregunta
    const existingAnswerIndex = userAnswers.findIndex(
      ans => ans.questionId === questionId
    );
    
    if (existingAnswerIndex !== -1) {
      // Actualizar respuesta existente
      const updatedAnswers = [...userAnswers];
      
      // Si es una pregunta de ranking, guardamos el orden completo
      const question = questions.find(q => q.id === questionId);
      if (question && question.type === 'ranking') {
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          rankingOrder: answer
        };
      } else {
        // Para preguntas de tipo "single"
        updatedAnswers[existingAnswerIndex] = {
          questionId,
          answerId: answer
        };
      }
      
      setUserAnswers(updatedAnswers);
    } else {
      // Agregar nueva respuesta
      const question = questions.find(q => q.id === questionId);
      
      if (question && question.type === 'ranking') {
        setUserAnswers([
          ...userAnswers,
          { questionId, rankingOrder: answer }
        ]);
      } else {
        // Para preguntas de tipo "single"
        setUserAnswers([
          ...userAnswers,
          { questionId, answerId: answer }
        ]);
      }
    }
  };
  
  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Función para retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Función para obtener la respuesta actual
  const getCurrentAnswer = (questionId) => {
    const answer = userAnswers.find(ans => ans.questionId === questionId);
    
    if (!answer) return null;
    
    const question = questions.find(q => q.id === questionId);
    if (question && question.type === 'ranking') {
      return answer.rankingOrder;
    }
    
    return answer.answerId;
  };
  
  // Función para limpiar todas las respuestas
  const resetQuestionnaire = () => {
    setUserAnswers([]);
    setCurrentStep(1);
    localStorage.removeItem('pjmx2025_answers');
    localStorage.removeItem('pjmx2025_currentStep');
  };
  
  // Valores a exponer en el contexto
  const value = {
    questions,
    userAnswers,
    currentStep,
    loading,
    error,
    handleAnswer,
    nextStep,
    prevStep,
    getCurrentAnswer,
    resetQuestionnaire,
    totalSteps: questions.length
  };
  
  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export default QuestionnaireContext; 