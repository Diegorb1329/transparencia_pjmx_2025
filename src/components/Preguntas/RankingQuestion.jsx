import React, { useState, useEffect } from 'react';

const RankingQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [ranking, setRanking] = useState([]);
  const [dragging, setDragging] = useState(null);
  
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
  
  // Funciones de arrastrar y soltar
  const handleDragStart = (e, index) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    // Para mejorar la vista de arrastre
    if (e.target.classList) {
      setTimeout(() => {
        e.target.classList.add('opacity-60');
      }, 0);
    }
  };
  
  const handleDragEnd = (e) => {
    setDragging(null);
    if (e.target.classList) {
      e.target.classList.remove('opacity-60');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('bg-blue-900/30');
    }
  };
  
  const handleDragLeave = (e) => {
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('bg-blue-900/30');
    }
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = dragging;
    
    if (sourceIndex === targetIndex) return;
    
    const newRanking = [...ranking];
    const item = newRanking[sourceIndex];
    
    // Eliminar el elemento de su posición original
    newRanking.splice(sourceIndex, 1);
    // Insertar en la nueva posición
    newRanking.splice(targetIndex, 0, item);
    
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('bg-blue-900/30');
    }
    
    setRanking(newRanking);
    onAnswer(question.id, newRanking);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">{question.text}</h2>
      <p className="text-gray-400 mb-6">
        Ordena las opciones por importancia. Arrastra y suelta los elementos para ordenarlos o usa las flechas.
      </p>
      
      <div className="space-y-3">
        {ranking.map((optionIndex, rankIndex) => (
          <div 
            key={optionIndex}
            className={`flex items-center p-4 bg-black/30 border border-gray-700 rounded-xl cursor-move transition-all 
              ${dragging === rankIndex ? 'opacity-60' : ''}`}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, rankIndex)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e, rankIndex)}
          >
            <div className="flex-none w-8 h-8 bg-blue-700 rounded-full text-white flex items-center justify-center font-bold mr-4">
              {rankIndex + 1}
            </div>
            <div className="flex-grow text-white">
              {question.options[optionIndex].text}
            </div>
            <div className="flex-none flex space-x-2">
              <button 
                onClick={() => moveUp(rankIndex)}
                disabled={rankIndex === 0}
                className={`p-2 rounded-lg transition-all ${rankIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-900/20'}`}
                aria-label="Mover arriba"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => moveDown(rankIndex)}
                disabled={rankIndex === ranking.length - 1}
                className={`p-2 rounded-lg transition-all ${rankIndex === ranking.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-900/20'}`}
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
      <div className="mt-6">
        <button
          onClick={() => {
            const defaultRanking = question.options.map((_, index) => index);
            setRanking(defaultRanking);
            onAnswer(question.id, defaultRanking);
          }}
          className="px-4 py-2 border border-gray-700 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-all"
        >
          Restablecer orden original
        </button>
      </div>
    </div>
  );
};

export default RankingQuestion; 