import React, { useState, useEffect } from 'react';

const RankingQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [ranking, setRanking] = useState([]);
  
  // Inicializar el ranking al cargar el componente
  useEffect(() => {
    if (currentAnswer && currentAnswer.length) {
      setRanking(currentAnswer);
    } else {
      // Si no hay respuesta previa, inicializar con índices en orden original
      setRanking(question.options.map((_, index) => index));
    }
  }, [question, currentAnswer]);
  
  // Mover un elemento hacia arriba en el ranking
  const moveUp = (index) => {
    if (index === 0) return; // Ya está en la cima
    
    const newRanking = [...ranking];
    const temp = newRanking[index];
    newRanking[index] = newRanking[index - 1];
    newRanking[index - 1] = temp;
    
    setRanking(newRanking);
    onAnswer(question.id, newRanking);
  };
  
  // Mover un elemento hacia abajo en el ranking
  const moveDown = (index) => {
    if (index === ranking.length - 1) return; // Ya está al final
    
    const newRanking = [...ranking];
    const temp = newRanking[index];
    newRanking[index] = newRanking[index + 1];
    newRanking[index + 1] = temp;
    
    setRanking(newRanking);
    onAnswer(question.id, newRanking);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{question.text}</h3>
      <p className="text-gray-600 mb-4">
        Ordena las opciones por importancia. La primera es la más importante, la última la menos importante.
      </p>
      
      <div className="space-y-2">
        {ranking.map((optionIndex, rankIndex) => (
          <div 
            key={optionIndex}
            className="flex items-center p-3 bg-white border rounded-lg"
          >
            <div className="flex-none w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold mr-3">
              {rankIndex + 1}
            </div>
            <div className="flex-grow">
              {question.options[optionIndex].text}
            </div>
            <div className="flex-none flex space-x-1">
              <button 
                onClick={() => moveUp(rankIndex)}
                disabled={rankIndex === 0}
                className={`p-1 rounded ${rankIndex === 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                aria-label="Mover arriba"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => moveDown(rankIndex)}
                disabled={rankIndex === ranking.length - 1}
                className={`p-1 rounded ${rankIndex === ranking.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                aria-label="Mover abajo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Botón para restablecer el orden */}
      <div className="mt-4">
        <button
          onClick={() => {
            const defaultRanking = question.options.map((_, index) => index);
            setRanking(defaultRanking);
            onAnswer(question.id, defaultRanking);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          Restablecer orden original
        </button>
      </div>
    </div>
  );
};

export default RankingQuestion; 