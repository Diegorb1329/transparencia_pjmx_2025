import React, { useState, useEffect } from 'react';
import { loadMatchingData, processUserAnswersAndFindMatches } from '../utils/matchingService';

const MatchingComponent = () => {
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [matchResults, setMatchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { questions, candidates } = await loadMatchingData();
        setQuestions(questions);
        setCandidates(candidates);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejar respuesta a pregunta de tipo "single"
  const handleSingleAnswer = (questionId, answerId) => {
    // Eliminar respuesta anterior si existe
    const filteredAnswers = userAnswers.filter(
      answer => answer.questionId !== questionId
    );
    
    // Agregar nueva respuesta
    setUserAnswers([
      ...filteredAnswers,
      { questionId, answerId }
    ]);
  };
  
  // Manejar respuesta a pregunta de tipo "ranking"
  const handleRankingAnswer = (questionId, rankingOrder) => {
    // Eliminar respuesta anterior si existe
    const filteredAnswers = userAnswers.filter(
      answer => answer.questionId !== questionId
    );
    
    // Agregar nueva respuesta
    setUserAnswers([
      ...filteredAnswers,
      { questionId, rankingOrder }
    ]);
  };
  
  // Procesar respuestas y encontrar matches
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const results = await processUserAnswersAndFindMatches(
        userAnswers,
        questions,
        candidates,
        10 // Mostrar top 10 candidatos
      );
      setMatchResults(results);
      setLoading(false);
    } catch (err) {
      setError('Error al procesar las respuestas');
      setLoading(false);
      console.error(err);
    }
  };
  
  // Renderizado condicional de preguntas según su tipo
  const renderQuestion = (question) => {
    if (question.type === 'single') {
      return (
        <div key={question.id} className="mb-6">
          <h3 className="font-medium text-lg mb-2">{question.text}</h3>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`q${question.id}-o${index}`}
                  name={`question-${question.id}`}
                  className="mr-2"
                  onChange={() => handleSingleAnswer(question.id, index)}
                />
                <label htmlFor={`q${question.id}-o${index}`}>
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (question.type === 'ranking') {
      // Para simplificar, mostramos solo texto informativo
      // En una implementación real, usaríamos drag & drop o selects
      return (
        <div key={question.id} className="mb-6">
          <h3 className="font-medium text-lg mb-2">{question.text}</h3>
          <p className="text-sm text-gray-500 mb-4">
            En una implementación completa, aquí habría un sistema para ordenar las opciones.
          </p>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <span className="mr-2">{index + 1}.</span>
                <span>{option.text}</span>
              </div>
            ))}
          </div>
          <button
            className="mt-4 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => handleRankingAnswer(question.id, [0, 1, 2, 3, 4])}
          >
            Usar orden predeterminado
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  // Renderizar resultados del matching
  const renderResults = () => {
    if (!matchResults) return null;
    
    const { userVector, matchedCandidates } = matchResults;
    
    return (
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-bold mb-4">Resultados de compatibilidad</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Tu vector de afinidad:</h3>
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="font-medium">CT</div>
              <div>{(userVector.CT * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">IE</div>
              <div>{(userVector.IE * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">EJ</div>
              <div>{(userVector.EJ * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">CR</div>
              <div>{(userVector.CR * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="font-medium">SS</div>
              <div>{(userVector.SS * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mb-3">Candidatos más compatibles:</h3>
        <div className="space-y-4">
          {matchedCandidates.map((candidate, index) => (
            <div key={candidate.folio} className="border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{index + 1}. {candidate.nombre}</h4>
                <div className="font-bold text-lg">
                  {(candidate.similarity * 100).toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-sm">
                <div>CT: {candidate.CT_score}</div>
                <div>IE: {candidate.IE_score}</div>
                <div>EJ: {candidate.EJ_score}</div>
                <div>CR: {candidate.CR_score}</div>
                <div>SS: {candidate.SS_score}</div>
              </div>
              <a 
                href={candidate.url_perfil} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 text-sm underline mt-2 inline-block"
              >
                Ver perfil completo
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (loading && !matchResults) {
    return <div className="p-4">Cargando...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Encuentra tu candidato ideal</h1>
      
      <div className="mb-8">
        <p className="mb-4">
          Responde las siguientes preguntas para encontrar los candidatos judiciales que
          mejor se alinean con tus preferencias.
        </p>
        
        <div className="space-y-6">
          {questions.slice(0, 5).map(renderQuestion)}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={userAnswers.length === 0}
          className={`mt-6 px-4 py-2 rounded font-medium ${
            userAnswers.length === 0
              ? 'bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Procesando...' : 'Encontrar candidatos compatibles'}
        </button>
      </div>
      
      {renderResults()}
    </div>
  );
};

export default MatchingComponent; 