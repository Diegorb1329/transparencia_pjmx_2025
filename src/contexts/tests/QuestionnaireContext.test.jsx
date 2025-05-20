import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuestionnaireProvider, useQuestionnaire } from '../QuestionnaireContext';
import { logAnalyticsEvent } from '../../supabase/userDataService';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de fetch para preguntas
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      {
        id: 1, 
        text: 'Pregunta 1', 
        dimension: 'CT',
        type: 'single',
        options: [
          { id: 0, text: 'Opción 1' },
          { id: 1, text: 'Opción 2' }
        ]
      },
      {
        id: 2, 
        text: 'Pregunta 2', 
        dimension: 'RANKING',
        type: 'ranking'
      }
    ])
  })
);

// Mock del servicio de analítica
jest.mock('../../supabase/userDataService', () => ({
  logAnalyticsEvent: jest.fn(() => Promise.resolve())
}));

// Componente para testing
const TestComponent = () => {
  const {
    questions,
    userAnswers,
    currentStep,
    handleAnswer,
    nextStep,
    prevStep,
    resetQuestionnaire
  } = useQuestionnaire();

  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="questions-count">{questions.length}</div>
      <div data-testid="answers-count">{userAnswers.length}</div>
      <button data-testid="answer-btn" onClick={() => handleAnswer(1, 0)}>Responder</button>
      <button data-testid="next-btn" onClick={nextStep}>Siguiente</button>
      <button data-testid="prev-btn" onClick={prevStep}>Anterior</button>
      <button data-testid="reset-btn" onClick={resetQuestionnaire}>Reiniciar</button>
    </div>
  );
};

describe('QuestionnaireContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('debería cargar preguntas y permitir responderlas', async () => {
    await act(async () => {
      render(
        <QuestionnaireProvider>
          <TestComponent />
        </QuestionnaireProvider>
      );
    });

    // Verificar que se cargaron las preguntas
    expect(screen.getByTestId('questions-count').textContent).toBe('2');
    
    // Responder una pregunta
    await act(async () => {
      fireEvent.click(screen.getByTestId('answer-btn'));
    });
    
    // Verificar que se registró la respuesta
    expect(screen.getByTestId('answers-count').textContent).toBe('1');
    
    // Verificar que se registró el evento de analítica
    expect(logAnalyticsEvent).toHaveBeenCalledWith('question_answered', expect.objectContaining({
      questionId: 1,
      isNewAnswer: true
    }));
  });

  test('debería permitir la navegación entre preguntas', async () => {
    await act(async () => {
      render(
        <QuestionnaireProvider>
          <TestComponent />
        </QuestionnaireProvider>
      );
    });

    // Navegar a la siguiente pregunta
    await act(async () => {
      fireEvent.click(screen.getByTestId('next-btn'));
    });
    
    // Verificar que avanzó
    expect(screen.getByTestId('current-step').textContent).toBe('2');
    
    // Verificar evento analítico
    expect(logAnalyticsEvent).toHaveBeenCalledWith('navigate_next', expect.objectContaining({
      fromStep: 1,
      toStep: 2
    }));
    
    // Navegar a la pregunta anterior
    await act(async () => {
      fireEvent.click(screen.getByTestId('prev-btn'));
    });
    
    // Verificar que retrocedió
    expect(screen.getByTestId('current-step').textContent).toBe('1');
    
    // Verificar evento analítico
    expect(logAnalyticsEvent).toHaveBeenCalledWith('navigate_prev', expect.objectContaining({
      fromStep: 2,
      toStep: 1
    }));
  });

  test('debería permitir reiniciar el cuestionario', async () => {
    await act(async () => {
      render(
        <QuestionnaireProvider>
          <TestComponent />
        </QuestionnaireProvider>
      );
    });

    // Responder pregunta y avanzar
    await act(async () => {
      fireEvent.click(screen.getByTestId('answer-btn'));
      fireEvent.click(screen.getByTestId('next-btn'));
    });
    
    // Verificar estado inicial
    expect(screen.getByTestId('current-step').textContent).toBe('2');
    expect(screen.getByTestId('answers-count').textContent).toBe('1');
    
    // Reiniciar
    await act(async () => {
      fireEvent.click(screen.getByTestId('reset-btn'));
    });
    
    // Verificar que se reinició
    expect(screen.getByTestId('current-step').textContent).toBe('1');
    expect(screen.getByTestId('answers-count').textContent).toBe('0');
    
    // Verificar evento analítico
    expect(logAnalyticsEvent).toHaveBeenCalledWith('questionnaire_reset');
    
    // Verificar que se eliminaron datos del localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('pjmx2025_answers');
    expect(localStorage.removeItem).toHaveBeenCalledWith('pjmx2025_currentStep');
  });
}); 