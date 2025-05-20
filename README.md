# Transparencia PJMx 2025

Sistema de asociación entre usuarios y candidatos a jueces del Poder Judicial de México 2025, utilizando similitud de coseno para encontrar coincidencias basadas en 5 dimensiones clave.

## 🚀 Propósito del proyecto

Este proyecto implementa un sistema que ayuda a los ciudadanos a encontrar candidatos judiciales que mejor se alineen con sus valores y preferencias. Mediante un cuestionario interactivo, se calcula un vector de afinidad que permite comparar las preferencias del usuario con los perfiles de los candidatos.

## 🧠 Dimensiones evaluadas

- **CT**: Competencia técnica
- **IE**: Independencia y ética
- **EJ**: Enfoque jurídico
- **CR**: Capacidad resolutiva
- **SS**: Sensibilidad social

## 🛠️ Tecnologías utilizadas

- [Next.js](https://nextjs.org/) - Framework React
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Jest](https://jestjs.io/) - Framework de testing

## 📁 Estructura del proyecto

```
pjmx2025_vercel/
  ├── public/
  │   └── data/                   # Datos JSON de preguntas y candidatos
  │       ├── user_questions.json
  │       └── candidates_scored_full_2.json
  │
  └── src/
      ├── app/                    # Páginas Next.js (App Router)
      │   ├── page.js             # Página de inicio
      │   ├── preguntas/          # Página del cuestionario
      │   └── resultados/         # Página de resultados
      │
      ├── components/             # Componentes React
      │   ├── Layout/             # Estructura común para todas las páginas
      │   └── Preguntas/          # Componentes del cuestionario
      │
      ├── contexts/               # Contextos React
      │   └── QuestionnaireContext.jsx
      │
      └── utils/                  # Funciones de utilidad
          ├── userScoreCalculator.js      # Cálculo de puntajes
          ├── similarityCalculator.js     # Cálculo de similitud
          └── matchingService.js          # Servicio de matching
```

## 🚀 Primeros pasos

### Prerequisitos

- Node.js 18.0 o superior
- npm o yarn

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/transparencia_pjmx_2025.git
   cd transparencia_pjmx_2025/pjmx2025_vercel
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## ⚙️ Algoritmo de matching

El sistema utiliza el algoritmo de similitud de coseno para calcular la compatibilidad entre usuarios y candidatos:

1. Las respuestas del usuario se convierten a un vector numérico en las 5 dimensiones
2. Se calcula la similitud de coseno entre el vector del usuario y los vectores de los candidatos
3. Los candidatos se ordenan por similitud (0-100%)

## 🧪 Tests

Para ejecutar los tests:

```bash
npm test
# o
yarn test
```

Para ejecutar tests en modo watch:

```bash
npm run test:watch
# o
yarn test:watch
```

## 🤝 Contribuir al proyecto

¿Quieres contribuir? ¡Genial! Estos son los pasos:

1. Haz fork del proyecto
2. Crea una rama para tu contribución (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Áreas donde puedes contribuir

- Mejorar la UI/UX de la aplicación
- Añadir visualizaciones para los vectores de usuario
- Implementar nuevas funcionalidades de filtrado
- Mejorar la accesibilidad
- Añadir soporte para dispositivos móviles
- Ampliar la cobertura de tests

## 📝 Convenciones de código

- Utilizamos ESLint y Prettier para mantener un estilo de código consistente
- Los componentes se crean utilizando functional components y hooks
- Se utiliza la estructura de archivos y directorios descrita anteriormente

## 📚 Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Documentación de Jest](https://jestjs.io/docs/getting-started)

## 📝 Licencia

Este proyecto está licenciado bajo la licencia MIT - ver el archivo LICENSE para más detalles.

## 📞 Contacto

Si tienes alguna pregunta o sugerencia, puedes contactarnos en [diegorb1329@gmail.com](mailto:diegorb1329@gmail.com)
