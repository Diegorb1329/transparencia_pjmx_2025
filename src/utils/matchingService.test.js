import { calculateUserScores } from './userScoreCalculator';
import { calculateCosineSimilarity, findSimilarCandidates } from './similarityCalculator';
import { processUserAnswersAndFindMatches } from './matchingService';

// Mock de preguntas
const mockQuestions = [
  {
    id: 1,
    dimension: "CT",
    type: "single",
    text: "¿Prefieres personas juzgadoras con experiencia internacional frente a personas juzgadoras cuya experiencia es exclusivamente nacional?",
    options: [
      {text: "Prefiero exclusivamente experiencia nacional", affinity: "CT"},
      {text: "Prefiero principalmente experiencia nacional", affinity: "CT"},
      {text: "No tengo preferencia", affinity: null},
      {text: "Prefiero principalmente experiencia internacional", affinity: "CT"},
      {text: "Prefiero exclusivamente experiencia internacional", affinity: "CT"}
    ]
  },
  {
    id: 2,
    dimension: "IE",
    type: "single",
    text: "¿Qué tan importante es para ti que una persona juzgadora mantenga independencia absoluta frente a presiones políticas, incluso si eso retrasa la toma de decisiones?",
    options: [
      {text: "Nada importante", affinity: "IE"},
      {text: "Poco importante", affinity: "IE"},
      {text: "Neutral", affinity: "IE"},
      {text: "Importante", affinity: "IE"},
      {text: "Indispensable", affinity: "IE"}
    ]
  },
  {
    id: 7,
    dimension: "RANKING",
    type: "ranking",
    text: "Ordena por importancia las dimensiones en las que debería enfocarse una persona juzgadora",
    options: [
      {text: "Competencia técnica", affinity: "CT"},
      {text: "Independencia y ética", affinity: "IE"},
      {text: "Enfoque jurídico", affinity: "EJ"},
      {text: "Capacidad resolutiva", affinity: "CR"},
      {text: "Sensibilidad social", affinity: "SS"}
    ]
  }
];

// Mock de candidatos
const mockCandidates = [
  {
    folio: 52219,
    nombre: "CANDIDATO A",
    CT_score: 85,
    IE_score: 90,
    EJ_score: 75,
    CR_score: 80,
    SS_score: 70
  },
  {
    folio: 52291,
    nombre: "CANDIDATO B",
    CT_score: 75,
    IE_score: 60,
    EJ_score: 65,
    CR_score: 80,
    SS_score: 50
  },
  {
    folio: 52742,
    nombre: "CANDIDATO C",
    CT_score: 90,
    IE_score: 70,
    EJ_score: 85,
    CR_score: 65,
    SS_score: 80
  }
];

// Mock de respuestas de usuario
const mockUserAnswers = [
  // Pregunta 1: Prefiere experiencia internacional
  { questionId: 1, answerId: 3 }, // índice 3: "Prefiero principalmente experiencia internacional"
  
  // Pregunta 2: Valora mucho la independencia
  { questionId: 2, answerId: 4 }, // índice 4: "Indispensable"
  
  // Pregunta 7: Ranking de dimensiones (IE > CT > SS > EJ > CR)
  { 
    questionId: 7, 
    rankingOrder: [1, 0, 3, 4, 2] // Índices correspondientes a las dimensiones en orden de preferencia
  }
];

// Tests
describe('Sistema de matching usuario-candidatos', () => {
  
  test('calculateUserScores debería generar un vector de afinidad normalizado', () => {
    const userVector = calculateUserScores(mockUserAnswers, mockQuestions);
    
    // Verificar que es un objeto con las 5 dimensiones
    expect(userVector).toHaveProperty('CT');
    expect(userVector).toHaveProperty('IE');
    expect(userVector).toHaveProperty('EJ');
    expect(userVector).toHaveProperty('CR');
    expect(userVector).toHaveProperty('SS');
    
    // Verificar que es un vector unitario (norma ≈ 1)
    const values = Object.values(userVector);
    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    expect(norm).toBeCloseTo(1, 5);
  });
  
  test('calculateCosineSimilarity debería calcular correctamente la similitud', () => {
    // Vector de usuario mock (ya normalizado)
    const mockUserVector = {
      CT: 0.4,
      IE: 0.5,
      EJ: 0.3,
      CR: 0.2,
      SS: 0.7
    };
    
    const similarity = calculateCosineSimilarity(mockUserVector, mockCandidates[0]);
    
    // La similitud debe estar entre 0 y 1
    expect(similarity).toBeGreaterThanOrEqual(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });
  
  test('findSimilarCandidates debería devolver candidatos ordenados por similitud', () => {
    // Vector de usuario mock (ya normalizado)
    const mockUserVector = {
      CT: 0.4,
      IE: 0.5,
      EJ: 0.3,
      CR: 0.2,
      SS: 0.7
    };
    
    const result = findSimilarCandidates(mockUserVector, mockCandidates, 3);
    
    // Debe devolver el número correcto de candidatos
    expect(result.length).toBe(3);
    
    // Debe estar ordenado por similitud (descendente)
    for (let i = 1; i < result.length; i++) {
      expect(result[i-1].similarity).toBeGreaterThanOrEqual(result[i].similarity);
    }
    
    // Cada candidato debe tener un valor de similitud
    result.forEach(candidate => {
      expect(candidate).toHaveProperty('similarity');
    });
  });
  
  test('processUserAnswersAndFindMatches debería integrar todo el proceso correctamente', async () => {
    const result = await processUserAnswersAndFindMatches(
      mockUserAnswers,
      mockQuestions,
      mockCandidates,
      2
    );
    
    // Debe devolver un objeto con userVector y matchedCandidates
    expect(result).toHaveProperty('userVector');
    expect(result).toHaveProperty('matchedCandidates');
    
    // matchedCandidates debe ser un array con el número correcto de candidatos
    expect(Array.isArray(result.matchedCandidates)).toBe(true);
    expect(result.matchedCandidates.length).toBe(2);
    
    // userVector debe ser un objeto con las 5 dimensiones
    expect(result.userVector).toHaveProperty('CT');
    expect(result.userVector).toHaveProperty('IE');
    expect(result.userVector).toHaveProperty('EJ');
    expect(result.userVector).toHaveProperty('CR');
    expect(result.userVector).toHaveProperty('SS');
  });
}); 