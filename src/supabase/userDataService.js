import { v4 as uuidv4 } from 'uuid';
import supabaseClient from './client';

/**
 * Genera o recupera un ID único para el usuario
 * @returns {string} ID único del usuario
 */
export const getUserId = () => {
  // Verificar si hay un entorno de navegador
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    // Si no hay entorno de navegador (ej. SSR), generar un UUID directamente
    return uuidv4();
  }
  
  // Verificar si ya existe un ID de usuario
  let userId = localStorage.getItem('pjmx2025_userId');
  
  // Si no existe, crear uno nuevo
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('pjmx2025_userId', userId);
  }
  
  return userId;
};

/**
 * Guarda las respuestas del usuario en Supabase
 * @param {Array} userAnswers - Respuestas del usuario
 * @returns {Promise} Resultado de la operación
 */
export const saveUserAnswers = async (userAnswers) => {
  if (!userAnswers || userAnswers.length === 0) return null;
  
  try {
    const userId = getUserId();
    
    const { data, error } = await supabaseClient
      .from('user_answers')
      .upsert(
        {
          user_id: userId,
          answers: userAnswers,
        },
        { onConflict: 'user_id' }
      );
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al guardar respuestas en Supabase:', error);
    // No interrumpir el flujo si falla
    return null;
  }
};

/**
 * Guarda los resultados de coincidencia de candidatos en Supabase
 * @param {Object} matchResults - Resultados de coincidencia
 * @returns {Promise} Resultado de la operación
 */
export const saveUserMatchResults = async (matchResults) => {
  if (!matchResults) return null;
  
  try {
    const userId = getUserId();
    
    const { data, error } = await supabaseClient
      .from('user_matched_candidates')
      .upsert(
        {
          user_id: userId,
          matched_candidates: matchResults.matchedCandidates,
          user_vector: matchResults.userVector,
        },
        { onConflict: 'user_id' }
      );
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al guardar resultados en Supabase:', error);
    // No interrumpir el flujo si falla
    return null;
  }
};

/**
 * Registra un evento analítico en Supabase
 * @param {string} eventType - Tipo de evento
 * @param {Object} eventData - Datos adicionales del evento
 * @returns {Promise} Resultado de la operación
 */
export const logAnalyticsEvent = async (eventType, eventData = {}) => {
  try {
    const userId = getUserId();
    
    const { data, error } = await supabaseClient
      .from('analytics')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
      });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al registrar evento analítico:', error);
    // No interrumpir el flujo si falla
    return null;
  }
}; 