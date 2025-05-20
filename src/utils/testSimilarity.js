/**
 * Script para probar la funcionalidad de similitud del coseno
 * con datos reales de preguntas y candidatos.
 */
import fs from 'fs';
import path from 'path';
import { calculateUserScores } from './userScoreCalculator.js';
import { findSimilarCandidates } from './similarityCalculator.js';

// Función principal
async function testMatchingSystem() {
  try {
    // Cargar preguntas
    const questionsPath = path.resolve('./public/data/user_questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    
    // Cargar candidatos (sólo los primeros 10 para prueba)
    const candidatesPath = path.resolve('./public/data/candidates_scored_full_2.json');
    const candidatesData = fs.readFileSync(candidatesPath, 'utf8');
    const allCandidates = JSON.parse(candidatesData);
    const candidates = allCandidates.slice(0, 10);
    
    console.log(`Preguntas cargadas: ${questions.length}`);
    console.log(`Candidatos cargados: ${candidates.length}`);
    
    // Crear algunas respuestas de prueba
    const testUserAnswers = [
      // Pregunta 1: CT - Experiencia internacional vs nacional
      { questionId: 1, answerId: 3 }, // Prefiero principalmente experiencia internacional
      
      // Pregunta 2: IE - Independencia absoluta
      { questionId: 2, answerId: 4 }, // Indispensable
      
      // Pregunta 3: EJ - Aplicación estricta vs interpretativa
      { questionId: 3, answerId: 3 }, // Más interpretación que aplicación estricta
      
      // Pregunta 4: CR - Rapidez vs calidad
      { questionId: 4, answerId: 3 }, // Prefiero calidad, aunque tome más tiempo
      
      // Pregunta 5: SS - Experiencia en causas sociales
      { questionId: 5, answerId: 3 }, // Importante
      
      // Pregunta 6: TRADEOFF - Entre SS y CR
      { questionId: 6, answerId: 1 }, // Sacrificaría eficiencia por sensibilidad social
      
      // Pregunta 7: RANKING - Importancia de dimensiones
      { 
        questionId: 7, 
        rankingOrder: [2, 0, 1, 4, 3] // EJ, CT, IE, SS, CR (índices de las dimensiones)
      }
    ];
    
    // Calcular vector de usuario
    const userVector = calculateUserScores(testUserAnswers, questions);
    console.log('\nVector del usuario:');
    console.log(userVector);
    
    // Encontrar candidatos similares
    const matchedCandidates = findSimilarCandidates(userVector, candidates, 5);
    
    console.log('\nCandidatos más similares:');
    matchedCandidates.forEach((candidate, index) => {
      console.log(`\n${index + 1}. ${candidate.nombre} (${(candidate.similarity * 100).toFixed(1)}%)`);
      console.log(`   CT: ${candidate.CT_score}, IE: ${candidate.IE_score}, EJ: ${candidate.EJ_score}, CR: ${candidate.CR_score}, SS: ${candidate.SS_score}`);
    });
    
  } catch (error) {
    console.error('Error al ejecutar la prueba:', error);
  }
}

// Ejecutar la prueba
testMatchingSystem(); 