import { calculateUserScores } from './userScoreCalculator';
import { findSimilarCandidates } from './similarityCalculator';

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
    const userVector = calculateUserScores(userAnswers, questions);
    
    // Encontrar candidatos similares
    const matchedCandidates = findSimilarCandidates(userVector, candidates, limit);
    
    return {
      userVector,
      matchedCandidates
    };
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
    
    return { questions, candidates };
  } catch (error) {
    console.error('Error al cargar datos para matching:', error);
    throw error;
  }
}; 