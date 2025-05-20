import React from 'react';

const SingleQuestion = ({ question, onAnswer, currentAnswer }) => {
  const handleOptionSelect = (index) => {
    onAnswer(question.id, index);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{question.text}</h3>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 
              ${currentAnswer === index 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
            onClick={() => handleOptionSelect(index)}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center
                ${currentAnswer === index 
                  ? 'bg-blue-500 text-white' 
                  : 'border border-gray-400'}`}
              >
                {currentAnswer === index && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">{option.text}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dimensión de la pregunta (para debug/testing) */}
      <div className="mt-4 text-xs text-gray-400">
        Dimensión: {question.dimension}
      </div>
    </div>
  );
};

export default SingleQuestion; 