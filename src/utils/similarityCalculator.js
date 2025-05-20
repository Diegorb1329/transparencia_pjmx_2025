/**
 * Calcula la similitud del coseno entre el vector de un usuario y un candidato
 * @param {Object} userVector - Vector normalizado del usuario {CT, IE, EJ, CR, SS}
 * @param {Object} candidateData - Datos del candidato incluyendo scores
 * @returns {Number} Valor de similitud entre 0 y 1
 */
export const calculateCosineSimilarity = (userVector, candidateData) => {
  // Extraer scores del candidato
  const candidateVector = {
    CT: candidateData.CT_score / 100, // Normalizar a 0-1
    IE: candidateData.IE_score / 100,
    EJ: candidateData.EJ_score / 100,
    CR: candidateData.CR_score / 100,
    SS: candidateData.SS_score / 100
  };
  
  // Normalizar vector del candidato
  const normalizedCandidateVector = normalizeVector(candidateVector);
  
  // Calcular producto punto
  let dotProduct = 0;
  const dimensions = Object.keys(userVector);
  
  dimensions.forEach(dim => {
    dotProduct += userVector[dim] * normalizedCandidateVector[dim];
  });
  
  return dotProduct; // Ya son vectores unitarios, el producto punto es igual a coseno
};

/**
 * Normaliza un vector de scores para que su norma sea 1
 */
const normalizeVector = (scoreObj) => {
  const dimensions = Object.keys(scoreObj);
  const values = dimensions.map(dim => scoreObj[dim]);
  
  // Calcular la norma (magnitud) del vector
  const norm = Math.sqrt(
    values.reduce((sum, val) => sum + val * val, 0)
  );
  
  // Si la norma es 0, devolver el vector original
  if (norm === 0) return scoreObj;
  
  // Normalizar cada dimensión
  const normalizedScores = {};
  dimensions.forEach(dim => {
    normalizedScores[dim] = scoreObj[dim] / norm;
  });
  
  return normalizedScores;
};

/**
 * Encuentra los candidatos más similares a un usuario
 * @param {Object} userVector - Vector normalizado del usuario
 * @param {Array} candidates - Lista de candidatos con sus scores
 * @param {Number} limit - Número máximo de candidatos a devolver
 * @returns {Array} Lista de candidatos ordenados por similitud
 */
export const findSimilarCandidates = (userVector, candidates, limit = 10) => {
  // Calcular similitud para cada candidato
  const candidatesWithSimilarity = candidates.map(candidate => ({
    ...candidate,
    similarity: calculateCosineSimilarity(userVector, candidate)
  }));
  
  // Ordenar por similitud (descendente)
  candidatesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
  
  // Limitar resultados
  return candidatesWithSimilarity.slice(0, limit);
}; 