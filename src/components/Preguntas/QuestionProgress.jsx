import React from 'react';

const QuestionProgress = ({ currentStep, totalSteps }) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <div>Pregunta {currentStep} de {totalSteps}</div>
        <div>{progress}% completado</div>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Indicadores de pasos */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`rounded-full transition-all duration-300 ${
              index + 1 <= currentStep 
                ? 'w-3 h-3 bg-blue-600' 
                : 'w-2 h-2 bg-gray-300 mt-0.5'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default QuestionProgress; 