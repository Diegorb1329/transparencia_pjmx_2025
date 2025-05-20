-- Crear tabla para almacenar las respuestas de los usuarios
CREATE TABLE IF NOT EXISTS user_answers (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- ID de usuario (o 'anonymous' para usuarios no autenticados)
  answers JSONB NOT NULL, -- Respuestas al cuestionario en formato JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla para almacenar los resultados de coincidencia de candidatos
CREATE TABLE IF NOT EXISTS user_matched_candidates (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- ID de usuario (o 'anonymous' para usuarios no autenticados)
  matched_candidates JSONB NOT NULL, -- Lista de candidatos coincidentes en formato JSON
  user_vector JSONB NOT NULL, -- Vector de preferencias del usuario
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla para almacenar información de usuarios (opcional, para implementar autenticación)
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- ID de usuario de Supabase Auth
  email TEXT,
  name TEXT,
  location TEXT,
  preferences JSONB, -- Preferencias del usuario en formato JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla para estadísticas y análisis
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- Tipo de evento (por ejemplo, 'quiz_completed', 'results_viewed')
  event_data JSONB, -- Datos del evento en formato JSON
  user_id TEXT, -- ID de usuario (opcional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matched_candidates_user_id ON user_matched_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);

-- Trigger para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a las tablas
CREATE TRIGGER update_user_answers_updated_at
BEFORE UPDATE ON user_answers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_matched_candidates_updated_at
BEFORE UPDATE ON user_matched_candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 