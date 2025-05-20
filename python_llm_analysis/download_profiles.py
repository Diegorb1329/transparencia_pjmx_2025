#!/usr/bin/env python3
"""
Script para extraer y descargar perfiles HTML y documentos adicionales de candidatos.
Este script complementa la extracción de datos básicos con la descarga de recursos asociados.
"""

import os
import json
import pandas as pd
import requests
from urllib.parse import urljoin
import asyncio
from playwright.async_api import async_playwright
import time
from datetime import datetime
import re
import traceback

# Configuración de directorios
BASE_DIR = os.getcwd()
OUTPUT_DIR = os.path.join(BASE_DIR, "download_profiles_output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PROFILES_DIR = os.path.join(OUTPUT_DIR, "profiles")
DOCUMENTS_DIR = os.path.join(OUTPUT_DIR, "documents")
PHOTOS_DIR = os.path.join(OUTPUT_DIR, "photos")
os.makedirs(PROFILES_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)

# Directorio de entrada de candidatos
INPUT_DIR = os.path.join(BASE_DIR, "extract_candidates_output")

# URLs base
BASE_URL = "https://candidaturaspoderjudicial.ine.mx/"
MEDIA_URL = urljoin(BASE_URL, "media/cycc/")
PROFILE_URL_PATTERN = urljoin(BASE_URL, "candidato/{folio}")
ERROR_LOG_PATH = os.path.join(OUTPUT_DIR, "error_log.txt")

def load_candidates(limit=None):
    """Carga los candidatos normalizados desde el archivo JSON."""
    try:
        with open(os.path.join(INPUT_DIR, "normalized_candidates.json"), 'r', encoding='utf-8') as f:
            candidates = json.load(f)
        # Cargar también los datos originales para complementar información
        raw_data = {}
        for category in ["jueces_distrito", "magistrados_circuito", "magistrados_sala_superior", 
                         "magistrados_sala_regional", "magistrados_tribunal_disciplina", 
                         "ministros_suprema_corte"]:
            try:
                with open(os.path.join(INPUT_DIR, f"raw_{category}.json"), 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if "candidatos" in data and isinstance(data["candidatos"], list):
                        for candidate in data["candidatos"]:
                            if "idCandidato" in candidate:
                                raw_data[str(candidate["idCandidato"])] = candidate
            except Exception as e:
                print(f"Error al cargar datos originales de {category}: {e}")
        # Enriquecer los candidatos normalizados con datos originales
        for candidate in candidates:
            if candidate["folio"] in raw_data:
                raw_candidate = raw_data[candidate["folio"]]
                # Añadir campos adicionales que no estaban en la normalización
                if "urlFoto" in raw_candidate:
                    candidate["url_foto"] = raw_candidate["urlFoto"]
                if "descripcionHLC" in raw_candidate:
                    candidate["cv_file"] = raw_candidate["descripcionHLC"]
                # Completar campos que podrían estar vacíos
                if not candidate["puesto"] and "nombreCorto" in raw_candidate:
                    candidate["puesto"] = raw_candidate["nombreCorto"]
                # Separar nombre y apellidos si no están separados
                if candidate["nombre"] and not candidate["primer_apellido"]:
                    parts = candidate["nombre"].split()
                    if len(parts) >= 3:
                        candidate["nombre"] = parts[-1]
                        candidate["primer_apellido"] = parts[0]
                        candidate["segundo_apellido"] = ' '.join(parts[1:-1])
        # Limitar a la cantidad especificada
        return candidates[:limit] if limit else candidates
    except Exception as e:
        print(f"Error al cargar candidatos: {e}")
        return []

async def download_profile_html(candidate, page):
    """Descarga el HTML del perfil de un candidato usando Playwright."""
    folio = candidate["folio"]
    profile_url = PROFILE_URL_PATTERN.format(folio=folio)
    
    try:
        print(f"Descargando perfil HTML para candidato {folio}...")
        
        # Navegar a la página del perfil
        await page.goto(profile_url, timeout=60000)
        await page.wait_for_load_state("networkidle")
        
        # Esperar a que cargue el contenido principal
        try:
            await page.wait_for_selector(".candidate-profile, .profile-container, .candidate-detail", timeout=10000)
        except:
            print(f"No se encontró contenedor de perfil para candidato {folio}")
        
        # Capturar screenshot
        screenshot_path = os.path.join(PROFILES_DIR, f"{folio}_screenshot.png")
        await page.screenshot(path=screenshot_path)
        
        # Obtener el HTML completo
        html_content = await page.content()
        
        # Guardar el HTML
        html_path = os.path.join(PROFILES_DIR, f"{folio}_profile.html")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Perfil HTML guardado en {html_path}")
        return html_path
    
    except Exception as e:
        print(f"Error al descargar perfil HTML para candidato {folio}: {e}")
        return None

def download_document(url, save_path):
    """Descarga un documento desde una URL y lo guarda en la ruta especificada."""
    try:
        # Asegurar que la URL sea absoluta
        if not url.startswith(('http://', 'https://')):
            url = urljoin(MEDIA_URL, url.lstrip('/'))
        
        print(f"Descargando documento desde {url}...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"Documento guardado en {save_path}")
        return save_path
    
    except Exception as e:
        print(f"Error al descargar documento desde {url}: {e}")
        return None

def download_candidate_documents(candidate):
    """Descarga los documentos asociados a un candidato (foto, CV, etc.)."""
    folio = candidate["folio"]
    documents_paths = []
    
    # Descargar foto si está disponible
    # Usar la ruta real: https://candidaturaspoderjudicial.ine.mx/cycc/img/fotocandidato/{folio}.jpg
    photo_url = f"https://candidaturaspoderjudicial.ine.mx/cycc/img/fotocandidato/{folio}.jpg"
    photo_extension = ".jpg"
        photo_path = os.path.join(PHOTOS_DIR, f"{folio}_photo{photo_extension}")
        result = download_document(photo_url, photo_path)
        if result:
            documents_paths.append(result)
    
    # Descargar CV si está disponible
    if "cv_file" in candidate and candidate["cv_file"]:
        cv_file = candidate["cv_file"]
        # Usar la ruta real: https://candidaturaspoderjudicial.ine.mx/cycc/documentos/cv/{cv_file}
        cv_url = f"https://candidaturaspoderjudicial.ine.mx/cycc/documentos/cv/{cv_file}"
        cv_extension = os.path.splitext(cv_file)[1] or ".pdf"
        cv_path = os.path.join(DOCUMENTS_DIR, f"{folio}_cv{cv_extension}")
        result = download_document(cv_url, cv_path)
        if result:
            documents_paths.append(result)
    
    return documents_paths

async def process_candidates(candidates):
    """Procesa los candidatos para descargar documentos, omitiendo errores y registrando en log."""
    results = []
    error_log = []
        for candidate in candidates:
            try:
                folio = candidate["folio"]
                print(f"\nProcesando candidato {folio}: {candidate['nombre']}")
                result = candidate.copy()
                # Descargar documentos
                document_paths = download_candidate_documents(candidate)
                result["document_paths"] = document_paths
            # Construir URL de perfil (ya está en el campo url_perfil)
            result["profile_url"] = candidate.get("url_perfil", "")
                results.append(result)
            except Exception as e:
            error_msg = f"Error al procesar candidato {candidate.get('folio', 'desconocido')}: {e}\n{traceback.format_exc()}"
            print(error_msg)
            error_log.append(error_msg)
    # Guardar log de errores
    if error_log:
        with open(ERROR_LOG_PATH, 'a', encoding='utf-8') as f:
            for line in error_log:
                f.write(line + '\n')
    return results

def save_results_to_csv(results):
    """Guarda los resultados en un archivo CSV."""
    # Preparar datos para CSV
    csv_data = []
    for result in results:
        row = {
            "folio": result["folio"],
            "nombre": result["nombre"],
            "primer_apellido": result["primer_apellido"],
            "segundo_apellido": result["segundo_apellido"],
            "genero": result["genero"],
            "puesto": result["puesto"],
            "categoria": result["categoria"],
            "profile_url": result.get("profile_url", ""),
            "profile_html_path": result.get("profile_html_path", ""),
            "document_paths": "|".join(result.get("document_paths", []))
        }
        csv_data.append(row)
    
    # Crear DataFrame y guardar como CSV
    df = pd.DataFrame(csv_data)
    csv_path = os.path.join(OUTPUT_DIR, "candidates_with_documents.csv")
    df.to_csv(csv_path, index=False, encoding='utf-8')
    
    print(f"\nResultados guardados en {csv_path}")
    return csv_path

async def main():
    """Función principal para extraer perfiles y documentos de candidatos."""
    print("Iniciando extracción de perfiles y documentos de candidatos...")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    # Cargar todos los candidatos (sin límite)
    candidates = load_candidates()
    print(f"Se cargarán {len(candidates)} candidatos para procesamiento")
    # Procesar candidatos
    results = await process_candidates(candidates)
    # Guardar resultados
    csv_path = save_results_to_csv(results)
    print("\nResumen de la extracción:")
    print(f"Candidatos procesados: {len(results)}")
    print(f"Resultados guardados en: {csv_path}")
    print("\nExtracción completada.")

if __name__ == "__main__":
    asyncio.run(main())
