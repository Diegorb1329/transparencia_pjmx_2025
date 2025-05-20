/**
 * Calcula el vector de afinidad del usuario basado en sus respuestas
 * @param {Array} userAnswers - Array de objetos {questionId, answerId} representando las respuestas del usuario
 * @param {Array} questions - Array de preguntas del cuestionario
 * @returns {Object} Vector normalizado con puntuaciones en las 5 dimensiones
 */
export const calculateUserScores = (userAnswers, questions) => {
  // Inicializar scores en 0 para cada dimensión
  const scores = {
    CT: 0,
    IE: 0,
    EJ: 0,
    CR: 0,
    SS: 0
  };
  
  // Contador para promediar los valores
  const counts = {
    CT: 0,
    IE: 0,
    EJ: 0,
    CR: 0,
    SS: 0
  };

  // Procesar cada respuesta del usuario
  userAnswers.forEach(userAnswer => {
    const { questionId, answerId } = userAnswer;
    
    // Encontrar la pregunta correspondiente
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Procesar según el tipo de pregunta
    if (question.type === "single") {
      // Encontrar la opción seleccionada
      const selectedOption = question.options[answerId];
      if (!selectedOption) return;
      
      // Procesar según la dimensión de la pregunta
      processSingleAnswer(question, selectedOption, scores, counts);
      
    } else if (question.type === "ranking") {
      // Procesar pregunta de ranking (asignar puntos según posición)
      processRankingAnswer(userAnswer.rankingOrder, scores, counts);
    }
  });
  
  // Calcular promedios
  const dimensions = Object.keys(scores);
  dimensions.forEach(dim => {
    if (counts[dim] > 0) {
      scores[dim] = scores[dim] / counts[dim];
    }
  });
  
  // Normalizar a valores positivos primero
  const normalizedPositive = normalizePositive(scores);
  
  // Normalizar a vector unitario
  const normalizedUnitVector = normalizeVector(normalizedPositive);
  
  // Calcular porcentajes relativos
  const relativePercentages = calculateRelativePercentages(normalizedUnitVector);
  
  return {
    normalizedVector: normalizedUnitVector,
    relativePercentages: relativePercentages
  };
};

/**
 * Procesa una respuesta de tipo "single"
 */
const processSingleAnswer = (question, selectedOption, scores, counts) => {
  const dimension = question.dimension;
  
  // Preguntas dimensionales directas (CT, IE, EJ, CR, SS)
  if (["CT", "IE", "EJ", "CR", "SS"].includes(dimension)) {
    // Obtener puntuación según la posición (0-100)
    const score = getScoreFromOption(question.options, selectedOption);
    
    // Actualizar la dimensión correspondiente
    if (selectedOption.affinity) {
      scores[selectedOption.affinity] += score;
      counts[selectedOption.affinity]++;
    }
  }
  // Preguntas de TRADEOFF
  else if (dimension === "TRADEOFF") {
    if (selectedOption.affinity === "CR") {
      scores.CR += 30;
      scores.SS -= 30;
      counts.CR++;
      counts.SS++;
    } else if (selectedOption.affinity === "SS") {
      scores.SS += 30;
      scores.CR -= 30;
      counts.SS++;
      counts.CR++;
    }
  }
  // Preguntas de FILTRO o SACRIFICIO
  else if (["FILTRO", "SACRIFICIO", "SACRIFICIO2"].includes(dimension)) {
    if (selectedOption.affinity) {
      scores[selectedOption.affinity] -= 50;
      counts[selectedOption.affinity]++;
    }
  }
};

/**
 * Procesa una respuesta de tipo "ranking"
 */
const processRankingAnswer = (rankingOrder, scores, counts) => {
  const dimensions = ["CT", "IE", "EJ", "CR", "SS"];
  
  // Asignar puntos según posición en el ranking
  rankingOrder.forEach((dimIndex, position) => {
    const dimension = dimensions[dimIndex];
    
    // Puntajes: 1er lugar = 100, 2do = 75, 3ro = 50, 4to = 25, 5to = 0
    const score = 100 - (position * 25);
    scores[dimension] += score;
    counts[dimension]++;
  });
};

/**
 * Obtiene la puntuación según la posición de la opción en la lista
 */
const getScoreFromOption = (options, selectedOption) => {
  const index = options.findIndex(opt => opt.text === selectedOption.text);
  const totalOptions = options.length;
  
  // Para 5 opciones: 0, 25, 50, 75, 100
  // Para 4 opciones: 0, 33, 66, 100
  // Para otras cantidades: distribuir equitativamente
  if (totalOptions <= 1) return 50;
  return (index / (totalOptions - 1)) * 100;
};

/**
 * Normaliza los scores para que todos sean positivos
 */
const normalizePositive = (scoreObj) => {
  const dimensions = Object.keys(scoreObj);
  const minScore = Math.min(...dimensions.map(dim => scoreObj[dim]));
  
  // Si hay valores negativos, ajustar todos sumando el valor absoluto del mínimo
  if (minScore < 0) {
    const adjusted = {};
    dimensions.forEach(dim => {
      adjusted[dim] = scoreObj[dim] + Math.abs(minScore);
    });
    return adjusted;
  }
  
  return { ...scoreObj };
};

/**
 * Calcula porcentajes relativos para que la suma sea 100%
 */
export const calculateRelativePercentages = (scoreObj) => {
  const dimensions = Object.keys(scoreObj);
  const total = dimensions.reduce((sum, dim) => sum + Math.max(0, scoreObj[dim]), 0);
  
  if (total === 0) {
    // Evitar división por cero
    return dimensions.reduce((result, dim) => {
      result[dim] = 20; // Distribución equitativa (5 dimensiones = 20% cada una)
      return result;
    }, {});
  }
  
  // Calcular el porcentaje relativo de cada dimensión
  const percentages = {};
  dimensions.forEach(dim => {
    // Asegurar que solo se consideren valores positivos para los porcentajes
    const score = Math.max(0, scoreObj[dim]);
    percentages[dim] = (score / total) * 100;
  });
  
  return percentages;
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