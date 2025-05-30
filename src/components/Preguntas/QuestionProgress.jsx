import React from 'react';

const QuestionProgress = ({ currentStep, totalSteps }) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="mb-10">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <div>Pregunta {currentStep} de {totalSteps}</div>
        <div>{progress}% completado</div>
      </div>
      
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Indicadores de pasos */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index + 1 <= currentStep 
                ? 'w-2.5 h-2.5 bg-blue-500 shadow-md shadow-blue-500/50' 
                : 'w-2 h-2 bg-gray-700 mt-0.5'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default QuestionProgress; 