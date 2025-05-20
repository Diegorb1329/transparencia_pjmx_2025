import React from 'react';

const SingleQuestion = ({ question, onAnswer, currentAnswer }) => {
  const handleOptionSelect = (index) => {
    onAnswer(question.id, index);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">{question.text}</h2>
      
      <div className="space-y-4 mt-8">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`p-5 border rounded-xl cursor-pointer transition-all duration-300 
              ${currentAnswer === index 
                ? 'border-blue-400 bg-blue-900/20 shadow-lg' 
                : 'border-gray-700 hover:border-blue-400 hover:bg-blue-900/10'}`}
            onClick={() => handleOptionSelect(index)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full mr-4 flex items-center justify-center
                ${currentAnswer === index 
                  ? 'bg-blue-500 text-white' 
                  : 'border border-gray-500'}`}
              >
                {currentAnswer === index && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-white">{option.text}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dimensión de la pregunta (para debug/testing) */}
      <div className="mt-6 text-xs text-gray-500">
        Dimensión: {question.dimension}
      </div>
    </div>
  );
};

export default SingleQuestion; 