import { processUserAnswersAndFindMatches, loadMatchingData } from '../matchingService';
import { calculateUserScores } from '../userScoreCalculator';
import { findSimilarCandidates } from '../similarityCalculator';
import { saveUserAnswers, saveUserMatchResults, logAnalyticsEvent } from '../../supabase/userDataService';

// Mocks de los módulos
jest.mock('../userScoreCalculator', () => ({
  calculateUserScores: jest.fn(() => ({
    normalizedVector: { CT: 0.5, IE: 0.7, EJ: 0.3, CR: 0.4, SS: 0.6 },
    relativePercentages: { CT: 20, IE: 30, EJ: 10, CR: 15, SS: 25 }
  }))
}));

jest.mock('../similarityCalculator', () => ({
  findSimilarCandidates: jest.fn(() => [
    { id: 1, folio: 'ABC123', nombre: 'Candidato 1', similarity: 0.85, nombreCorto: 'Juez' },
    { id: 2, folio: 'DEF456', nombre: 'Candidato 2', similarity: 0.75, nombreCorto: 'Magistrado' }
  ])
}));

jest.mock('../../supabase/userDataService', () => ({
  saveUserAnswers: jest.fn(() => Promise.resolve({ id: 1 })),
  saveUserMatchResults: jest.fn(() => Promise.resolve({ id: 1 })),
  logAnalyticsEvent: jest.fn(() => Promise.resolve({ id: 1 }))
}));

// Mock para fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ id: 1 }])
  })
);

describe('Matching Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processUserAnswersAndFindMatches', () => {
    test('debe procesar respuestas y llamar a las funciones de Supabase', async () => {
      const userAnswers = [{ questionId: 1, answerId: 2 }];
      const questions = [{ id: 1, text: '¿Pregunta?', dimension: 'CT' }];
      const candidates = [{ id: 1, nombre: 'Candidato 1' }];
      
      const results = await processUserAnswersAndFindMatches(userAnswers, questions, candidates);
      
      // Verificar que se calculan los puntajes y candidatos
      expect(calculateUserScores).toHaveBeenCalledWith(userAnswers, questions);
      expect(findSimilarCandidates).toHaveBeenCalled();
      
      // Verificar la estructura de resultados
      expect(results).toEqual({
        userVector: expect.any(Object),
        userRelativePercentages: expect.any(Object),
        matchedCandidates: expect.any(Array)
      });
      
      // Esperar a que se completen las promesas
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar llamadas a Supabase
      expect(saveUserAnswers).toHaveBeenCalledWith(userAnswers);
      expect(saveUserMatchResults).toHaveBeenCalledWith(results);
      expect(logAnalyticsEvent).toHaveBeenCalledWith('results_generated', expect.any(Object));
    });
  });

  describe('loadMatchingData', () => {
    test('debe cargar datos y registrar evento analítico', async () => {
      const data = await loadMatchingData();
      
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(data).toEqual({
        questions: expect.any(Array),
        candidates: expect.any(Array)
      });
      
      // Esperar a que se completen las promesas
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar llamada a evento analítico
      expect(logAnalyticsEvent).toHaveBeenCalledWith('data_loaded', expect.any(Object));
    });
  });
}); 