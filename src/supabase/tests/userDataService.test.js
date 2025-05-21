import { getUserId, saveUserAnswers, saveUserMatchResults, logAnalyticsEvent } from '../userDataService';
import supabaseClient from '../client';

// Mock del cliente supabase
jest.mock('../client', () => {
  const insert = jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null }));
  const upsert = jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null }));
  return {
    from: jest.fn(() => ({
      insert,
      upsert,
    })),
  };
});

// Mock del localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('User Data Service', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    localStorageMock.clear();
    // Limpiar los métodos insert y upsert si existen
    if (supabaseClient.from().insert) supabaseClient.from().insert.mockClear();
    if (supabaseClient.from().upsert) supabaseClient.from().upsert.mockClear();
  });

  describe('getUserId', () => {
    test('debería crear y almacenar un ID si no existe', () => {
      const userId = getUserId();
      
      expect(userId).toBeDefined();
      expect(typeof userId).toBe('string');
      expect(localStorage.setItem).toHaveBeenCalledWith('pjmx2025_userId', userId);
    });

    test('debería recuperar el ID existente si ya existe', () => {
      const existingId = '12345-abcde';
      localStorage.getItem.mockReturnValueOnce(existingId);
      
      const userId = getUserId();
      
      expect(userId).toBe(existingId);
      expect(localStorage.getItem).toHaveBeenCalledWith('pjmx2025_userId');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('saveUserAnswers', () => {
    test('debería guardar las respuestas del usuario en Supabase', async () => {
      const userAnswers = [{ questionId: 1, answerId: 2 }];
      await saveUserAnswers(userAnswers);
      expect(supabaseClient.from).toHaveBeenCalledWith('user_answers');
      expect(supabaseClient.from().insert).toHaveBeenCalledWith(
        [
          {
            user_id: expect.any(String),
            answers: userAnswers,
          }
        ]
      );
    });

    test('debería retornar null si no hay respuestas', async () => {
      const result = await saveUserAnswers([]);
      
      expect(result).toBeNull();
      expect(supabaseClient.from).not.toHaveBeenCalled();
    });

    test('debería enviar el formato correcto y loguear el objeto', async () => {
      // Generar respuesta aleatoria
      const randomAnswer = Array.from({ length: 5 }, (_, i) => ({
        questionId: i + 1,
        answerId: Math.floor(Math.random() * 4)
      }));
      // Espiar el console.log
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await saveUserAnswers(randomAnswer);
      // Verificar formato
      expect(Array.isArray(randomAnswer)).toBe(true);
      expect(typeof randomAnswer[0].questionId).toBe('number');
      expect(typeof randomAnswer[0].answerId).toBe('number');
      // Verificar que se logueó el objeto enviado
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Intentando guardar en Supabase:'),
        expect.objectContaining({
          answers: randomAnswer
        })
      );
      logSpy.mockRestore();
    });
  });

  describe('saveUserMatchResults', () => {
    test('debería guardar los resultados de coincidencia en Supabase', async () => {
      const matchResults = {
        userVector: { CT: 0.5, IE: 0.7 },
        matchedCandidates: [{ id: 1, similarity: 0.8 }]
      };
      await saveUserMatchResults(matchResults);
      expect(supabaseClient.from).toHaveBeenCalledWith('user_matched_candidates');
      expect(supabaseClient.from().insert).toHaveBeenCalledWith(
        [
          {
            user_id: expect.any(String),
            matched_candidates: matchResults.matchedCandidates,
            user_vector: matchResults.userVector,
          }
        ]
      );
    });

    test('debería retornar null si no hay resultados', async () => {
      const result = await saveUserMatchResults(null);
      
      expect(result).toBeNull();
      expect(supabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('logAnalyticsEvent', () => {
    test('debería registrar un evento analítico en Supabase', async () => {
      const eventType = 'test_event';
      const eventData = { key: 'value' };
      
      await logAnalyticsEvent(eventType, eventData);
      
      expect(supabaseClient.from).toHaveBeenCalledWith('analytics');
      expect(supabaseClient.from().insert).toHaveBeenCalledWith({
        user_id: expect.any(String),
        event_type: eventType,
        event_data: eventData,
      });
    });

    test('debería funcionar con eventData por defecto', async () => {
      await logAnalyticsEvent('simple_event');
      
      expect(supabaseClient.from).toHaveBeenCalledWith('analytics');
      expect(supabaseClient.from().insert).toHaveBeenCalledWith({
        user_id: expect.any(String),
        event_type: 'simple_event',
        event_data: {},
      });
    });
  });
}); 