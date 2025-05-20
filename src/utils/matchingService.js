import { calculateUserScores } from './userScoreCalculator';
import { findSimilarCandidates } from './similarityCalculator';
import { saveUserAnswers, saveUserMatchResults, logAnalyticsEvent } from '../supabase/userDataService';

/**
 * Procesa las respuestas del usuario y encuentra candidatos similares
 * @param {Array} userAnswers - Respuestas del usuario
 * @param {Array} questions - Preguntas del cuestionario
 * @param {Array} candidates - Lista de candidatos
 * @param {Number} limit - Número máximo de candidatos a devolver
 * @returns {Object} Objeto con el vector del usuario y los candidatos similares
 */
export const processUserAnswersAndFindMatches = async (
  userAnswers,
  questions,
  candidates,
  limit = 10
) => {
  try {
    // Calcular vector de afinidad del usuario
    const userScores = calculateUserScores(userAnswers, questions);
    
    // Encontrar candidatos similares usando el vector normalizado
    const matchedCandidates = findSimilarCandidates(userScores.normalizedVector, candidates, limit);
    
    const results = {
      userVector: userScores.normalizedVector,
      userRelativePercentages: userScores.relativePercentages,
      matchedCandidates
    };
    
    // Guardar datos en Supabase (de forma asíncrona, sin bloquear)
    Promise.all([
      saveUserAnswers(userAnswers),
      saveUserMatchResults(results),
      logAnalyticsEvent('results_generated', { 
        matchCount: matchedCandidates.length,
        topMatch: matchedCandidates.length > 0 ? 
          { 
            similarity: matchedCandidates[0].similarity,
            candidateType: matchedCandidates[0].nombreCorto 
          } : null
      })
    ]).catch(error => {
      // Solo registrar el error, no interrumpir el flujo
      console.error('Error al guardar datos en Supabase:', error);
    });
    
    return results;
  } catch (error) {
    console.error('Error al procesar respuestas y encontrar matches:', error);
    throw error;
  }
};

/**
 * Carga los datos necesarios desde archivos JSON
 * @returns {Object} Objeto con preguntas y candidatos
 */
export const loadMatchingData = async () => {
  try {
    // Cargar preguntas
    const questionsResponse = await fetch('/data/user_questions.json');
    const questions = await questionsResponse.json();
    
    // Cargar candidatos
    const candidatesResponse = await fetch('/data/candidates_scored_full_2.json');
    const candidates = await candidatesResponse.json();
    
    // Registrar evento de carga de datos (sin esperar)
    logAnalyticsEvent('data_loaded', { 
      questionsCount: questions.length, 
      candidatesCount: candidates.length 
    }).catch(console.error);
    
    return { questions, candidates };
  } catch (error) {
    console.error('Error al cargar datos para matching:', error);
    throw error;
  }
}; 