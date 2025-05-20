import os
import json
from openai import OpenAI
import time
import csv
import re

# Configuración OpenRouter
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "google/gemini-2.5-flash-preview"
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

# Paths
CANDIDATES_PATH = "extract_candidates_output/all_candidates.json"
CV_TEXTS_DIR = "download_profiles_output/texts"
OUTPUT_PATH = "extract_candidates_output/candidates_scored_2.json"
CSV_OUTPUT_PATH = "extract_candidates_output/candidates_scored_2.csv"

# Dimensiones
DIMENSIONS = [
    ("CT", "Competencia Técnica"),
    ("IE", "Independencia y Ética"),
    ("EJ", "Enfoque Jurídico"),
    ("CR", "Capacidad Resolutiva"),
    ("SS", "Sensibilidad Social")
]

PROMPT_TEMPLATE = '''
Eres un jurista experto en selección de jueces. Analiza el siguiente perfil de candidato judicial y responde SOLO en el siguiente formato JSON, sin ningún texto adicional antes o después:
{{
  "CT": {{"score": int, "explanation": str}},
  "IE": {{"score": int, "explanation": str}},
  "EJ": {{"score": int, "explanation": str}},
  "CR": {{"score": int, "explanation": str}},
  "SS": {{"score": int, "explanation": str}},
  "ventaja": [str, ...],  # 3-5 bulletpoints, fortalezas principales
  "area_oportunidad": [str, ...]  # 3-5 bulletpoints, áreas de mejora
}}

Instrucciones estrictas para la evaluación:
- Devuelve SOLO el JSON solicitado, sin texto adicional, sin comentarios, sin markdown, sin encabezados, sin explicación fuera del JSON.
- Los campos "score" deben ser enteros entre 0 y 100. Si no hay suficiente información, asigna un score bajo.
- Si el perfil no tiene evidencia clara, asigna un score bajo y explica por qué.
- Si el JSON no es válido o falta algún campo, tu respuesta será descartada.
- Sé especialmente estricto con la justificación de scores altos (>90).
- Calificaciones entre 90 y 99 solo si el candidato cumple con todos los requisitos y demuestra logros sobresalientes, experiencia comprobada y aportaciones relevantes.
- Calificaciones entre 70 y 89 para perfiles sólidos pero con áreas de mejora, experiencia incompleta o logros no excepcionales.
- Calificaciones entre 40 y 69 para perfiles promedio, con experiencia limitada, logros poco claros o faltantes de información relevante.
- Calificaciones menores a 40 si hay deficiencias claras, falta de experiencia, información insuficiente o dudas importantes.
- No sobrecalifiques: la mayoría de los candidatos deben recibir puntajes en el rango medio o bajo, a menos que haya evidencia contundente de excelencia.
- Justifica explícitamente cualquier calificación mayor a 90, señalando la evidencia concreta que la respalda.
- Si la información es insuficiente o ambigua, asigna un puntaje bajo y explica la razón.
- Para cada dimensión, justifica la calificación en 10-20 palabras, usando evidencia específica del perfil.
- Escribe entre 3 y 5 ventajas y 3 y 5 áreas de oportunidad del candidato en forma de bulletpoints.
- Sé riguroso, objetivo y consistente. No inventes información que no esté en el perfil.
'''

def load_candidates():
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_cv_text(folio):
    path = os.path.join(CV_TEXTS_DIR, f"{folio}_cv.txt")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def score_candidate(candidate):
    folio = str(candidate.get("idCandidato") or candidate.get("folio"))
    cv_text = load_cv_text(folio)
    prompt = PROMPT_TEMPLATE + f"""
Perfil del candidato:
Nombre: {candidate.get("nombreCandidato", "")}
Sexo: {candidate.get("sexo", "")}
Categoría: {candidate.get("categoria", "")}
Estado: {candidate.get("nombreEstado", "")}
Especialidad: {candidate.get("especialidad", "")}
Descripción del trabajo previo: {candidate.get("descripcionTP", "")}
Descripción del candidato: {candidate.get("descripcionCandidato", "")}
Visión jurisdiccional: {candidate.get("visionJurisdiccional", "")}
Visión de impartición de justicia: {candidate.get("visionImparticionJusticia", "")}
Propuesta 1: {candidate.get("propuesta1", "")}
Propuesta 2: {candidate.get("propuesta2", "")}
Propuesta 3: {candidate.get("propuesta3", "")}
CV: {cv_text[:8000]}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": [{"type": "text", "text": prompt}]}]
    )
    content = response.choices[0].message.content
    try:
        result = json.loads(content)
    except Exception:
        result = {"raw_response": content}
    return result

def save_results_csv(results, path, log_path=None):
    fieldnames = [
        "folio", "nombre",
        "CT_score", "CT_explanation",
        "IE_score", "IE_explanation",
        "EJ_score", "EJ_explanation",
        "CR_score", "CR_explanation",
        "SS_score", "SS_explanation",
        "ventajas", "areas_oportunidad"
    ]
    logs = []
    with open(path, "w", encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for entry in results:
            scoring = entry["scoring"]
            status = "OK"
            raw_response = None
            if "raw_response" in scoring:
                raw = scoring["raw_response"]
                raw_response = raw
                raw = raw.strip().strip('`').strip('json').strip()
                match = re.search(r'\{.*\}', raw, re.DOTALL)
                if match:
                    try:
                        scoring = json.loads(match.group(0))
                    except Exception:
                        scoring = {}
                        status = "ERROR"
                else:
                    scoring = {}
                    status = "ERROR"
            row = {
                "folio": entry["folio"],
                "nombre": entry["nombre"],
                "CT_score": scoring.get("CT", {}).get("score", ""),
                "CT_explanation": scoring.get("CT", {}).get("explanation", ""),
                "IE_score": scoring.get("IE", {}).get("score", ""),
                "IE_explanation": scoring.get("IE", {}).get("explanation", ""),
                "EJ_score": scoring.get("EJ", {}).get("score", ""),
                "EJ_explanation": scoring.get("EJ", {}).get("explanation", ""),
                "CR_score": scoring.get("CR", {}).get("score", ""),
                "CR_explanation": scoring.get("CR", {}).get("explanation", ""),
                "SS_score": scoring.get("SS", {}).get("score", ""),
                "SS_explanation": scoring.get("SS", {}).get("explanation", ""),
                "ventajas": "; ".join(scoring.get("ventaja", [])) if isinstance(scoring.get("ventaja", []), list) else scoring.get("ventaja", ""),
                "areas_oportunidad": "; ".join(scoring.get("area_oportunidad", [])) if isinstance(scoring.get("area_oportunidad", []), list) else scoring.get("area_oportunidad", "")
            }
            writer.writerow(row)
            if log_path:
                logs.append({
                    "folio": entry["folio"],
                    "nombre": entry["nombre"],
                    "status": status,
                    "raw_response": raw_response if status == "ERROR" else None
                })
    if log_path:
        with open(log_path, "w", encoding="utf-8") as flog:
            for log in logs:
                flog.write(json.dumps(log, ensure_ascii=False) + "\n")

def score_candidate_with_retries(candidate, max_retries=5):
    expected_keys = {"CT", "IE", "EJ", "CR", "SS", "ventaja", "area_oportunidad"}
    for attempt in range(max_retries):
        result = score_candidate(candidate)
        # Validación: debe ser dict, tener las claves esperadas y los scores deben ser enteros 0-100
        scoring = result if isinstance(result, dict) else result.get("scoring", {})
        if not isinstance(scoring, dict):
            scoring = {}
        # Si viene raw_response, intentar parsear
        if "raw_response" in scoring:
            raw = scoring["raw_response"]
            raw = raw.strip().strip('`').strip('json').strip()
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    scoring = json.loads(match.group(0))
                except Exception:
                    scoring = {}
        # Validar estructura y tipos
        if (
            isinstance(scoring, dict)
            and expected_keys.issubset(scoring.keys())
            and all(isinstance(scoring[k], dict) and isinstance(scoring[k].get("score", None), int) and 0 <= scoring[k]["score"] <= 100 for k in ["CT", "IE", "EJ", "CR", "SS"])
            and isinstance(scoring.get("ventaja", []), list)
            and isinstance(scoring.get("area_oportunidad", []), list)
        ):
            return scoring
        time.sleep(2)
    # Si nunca fue válido, devolver el último intento (aunque sea error)
    return scoring

def main():
    candidates = load_candidates()  # Procesar todos los candidatos
    results = []
    for i, candidate in enumerate(candidates):
        nombre = candidate.get("nombreCandidato", candidate.get("folio", ""))
        print(f"[{i+1}/{len(candidates)}] Scoring {nombre}")
        result = score_candidate_with_retries(candidate)
        results.append({"folio": candidate.get("idCandidato", ""), "nombre": nombre, "scoring": result})
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        save_results_csv(results, CSV_OUTPUT_PATH, log_path="extract_candidates_output/candidates_scored_log.txt")
        time.sleep(1.5)
    print(f"Scoring completado. Resultados en {OUTPUT_PATH} y {CSV_OUTPUT_PATH}")

def test_first_candidate():
    """Testea el scoring solo con el primer candidato y escala 0-100."""
    global PROMPT_TEMPLATE
    # Modificar el PROMPT_TEMPLATE para pedir calificación de 0 a 100
    PROMPT_TEMPLATE = '''
Eres un jurista experto en selección de jueces. Analiza el siguiente perfil de candidato judicial y responde SOLO en el siguiente formato JSON, sin ningún texto adicional antes o después:
{{
  "CT": {{"score": int, "explanation": str}},
  "IE": {{"score": int, "explanation": str}},
  "EJ": {{"score": int, "explanation": str}},
  "CR": {{"score": int, "explanation": str}},
  "SS": {{"score": int, "explanation": str}},
  "ventaja": [str, ...],  # 3-5 bulletpoints, fortalezas principales
  "area_oportunidad": [str, ...]  # 3-5 bulletpoints, áreas de mejora
}}

Instrucciones estrictas para la evaluación:
- Devuelve SOLO el JSON solicitado, sin texto adicional, sin comentarios, sin markdown, sin encabezados, sin explicación fuera del JSON.
- Los campos "score" deben ser enteros entre 0 y 100. Si no hay suficiente información, asigna un score bajo.
- Si el perfil no tiene evidencia clara, asigna un score bajo y explica por qué.
- Si el JSON no es válido o falta algún campo, tu respuesta será descartada.
- Sé especialmente estricto con la justificación de scores altos (>90).
- Calificaciones entre 90 y 99 solo si el candidato cumple con todos los requisitos y demuestra logros sobresalientes, experiencia comprobada y aportaciones relevantes.
- Calificaciones entre 70 y 89 para perfiles sólidos pero con áreas de mejora, experiencia incompleta o logros no excepcionales.
- Calificaciones entre 40 y 69 para perfiles promedio, con experiencia limitada, logros poco claros o faltantes de información relevante.
- Calificaciones de 0 a 39 si hay deficiencias claras, falta de experiencia, información insuficiente o dudas importantes.
- No sobrecalifiques: la mayoría de los candidatos deben recibir puntajes en el rango medio o bajo, a menos que haya evidencia contundente de excelencia.
- Justifica explícitamente cualquier calificación mayor a 90, señalando la evidencia concreta que la respalda.
- Si la información es insuficiente o ambigua, asigna un puntaje bajo y explica la razón.
- Para cada dimensión, justifica la calificación en 10-20 palabras, usando evidencia específica del perfil. 
- Escribe entre 3 y 5 ventajas y 3 y 5 áreas de oportunidad del candidato en forma de bulletpoints. Se particularmente riguroso con las desventajas.
- Sé riguroso, objetivo y consistente. No inventes información que no esté en el perfil.
'''
    # Cargar solo el primer candidato
    candidates = load_candidates()
    if not candidates:
        print("No hay candidatos disponibles.")
        return
    first_candidate = candidates[0]
    print(f"Probando scoring para: {first_candidate.get('nombreCandidato', first_candidate.get('folio', ''))}")
    result = score_candidate_with_retries(first_candidate)
    print("Resultado del scoring:")
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main() 