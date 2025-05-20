# Sistema de Matching Usuario-Candidatos para PJMx 2025

Este proyecto implementa un sistema de asociación entre usuarios y candidatos a jueces utilizando la similitud del coseno para encontrar los mejores matches basados en 5 dimensiones clave:

- **CT**: Competencia técnica
- **IE**: Independencia y ética
- **EJ**: Enfoque jurídico
- **CR**: Capacidad resolutiva
- **SS**: Sensibilidad social

## Funcionamiento

1. El usuario responde un cuestionario sobre sus preferencias respecto a cualidades judiciales
2. Las respuestas se procesan para generar un vector de afinidad en las 5 dimensiones
3. Se calcula la similitud del coseno entre el vector del usuario y los vectores de cada candidato
4. Se muestran los candidatos más similares, ordenados por grado de compatibilidad

## Estructura del Proyecto

```
pjmx2025_vercel/
  ├── public/
  │   └── data/
  │       ├── user_questions.json    # Preguntas del cuestionario
  │       └── candidates_scored_full_2.json  # Datos de candidatos con scores
  │
  └── src/
      ├── components/
      │   └── MatchingComponent.jsx  # Componente React para el cuestionario
      │
      └── utils/
          ├── userScoreCalculator.js    # Calcula scores de usuarios
          ├── similarityCalculator.js   # Calcula similitud del coseno
          ├── matchingService.js        # Servicio integrado de matching
          ├── matchingService.test.js   # Tests para el servicio
          └── testSimilarity.js         # Script para pruebas
```

## Tipos de Preguntas y Procesamiento

El sistema procesa distintos tipos de preguntas:

- **Single**: Selección única con puntajes directos
- **Ranking**: Ordenamiento de dimensiones por importancia
- **Tradeoff**: Comparaciones entre dimensiones
- **Filtro/Sacrificio**: Identificación de dimensiones menos relevantes

## Algoritmo de Similitud

1. Las respuestas del usuario se convierten a un vector normalizado en 5 dimensiones
2. Los candidatos ya tienen puntuaciones en las mismas 5 dimensiones
3. Se calcula la similitud del coseno entre vectores normalizados
4. El resultado es un valor entre 0 y 1, donde 1 es perfecta similitud

## Uso en React

```jsx
import { useEffect, useState } from 'react';
import { loadMatchingData, processUserAnswersAndFindMatches } from './utils/matchingService';

function App() {
  const [userAnswers, setUserAnswers] = useState([]);
  const [matchResults, setMatchResults] = useState(null);

  const submitAnswers = async () => {
    const { questions, candidates } = await loadMatchingData();
    const results = await processUserAnswersAndFindMatches(
      userAnswers, 
      questions, 
      candidates
    );
    setMatchResults(results);
  };

  // Resto del componente...
}
```

## Cómo Probar

Para ejecutar el script de prueba:

```
cd pjmx2025_vercel
node --experimental-modules src/utils/testSimilarity.js
```

Para ejecutar los tests:

```
npm test
```
