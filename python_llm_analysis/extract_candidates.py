#!/usr/bin/env python3
"""
Script para extraer la lista de candidatos del Poder Judicial desde los endpoints JSON del INE.
Este script obtiene y consolida la información de candidatos de diferentes categorías judiciales.
"""

import requests
import json
import pandas as pd
import os
from datetime import datetime

# Crear directorio para almacenar datos
output_dir = os.path.join(os.getcwd(), "extract_candidates_output")
os.makedirs(output_dir, exist_ok=True)

# Endpoints identificados para candidatos judiciales
ENDPOINTS = {
    "jueces_distrito": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/juecesDistrito.json",
    "magistrados_circuito": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/magistraturaTribunales.json",
    "magistrados_sala_superior": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/magistraturaSalaSuperior.json",
    "magistrados_sala_regional": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/magistraturaSalasRegionales.json",
    "magistrados_tribunal_disciplina": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/magistraturaTribunalDJ.json",
    "ministros_suprema_corte": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/ministrosSupremaCorte.json"
}

# Endpoint para catálogos
CATALOG_ENDPOINTS = {
    "estados": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/catalogoEstadosSecciones.json",
    "tipos_candidaturas": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/catalogoTiposCandidaturas.json",
    "grados_academicos": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/catalogoGradoAcademico.json",
    "poderes_union": "https://candidaturaspoderjudicial.ine.mx/cycc/documentos/json/catalogoPoderesUnion.json"
}

def fetch_json(url):
    """Obtiene datos JSON desde una URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error al obtener datos de {url}: {e}")
        return None

def save_json(data, filename):
    """Guarda datos en formato JSON."""
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Datos guardados en {filepath}")
    return filepath

def extract_candidates():
    """Extrae y consolida la lista de candidatos de todos los endpoints."""
    all_candidates = []
    
    # Obtener catálogos para referencias
    catalogs = {}
    for name, url in CATALOG_ENDPOINTS.items():
        catalog_data = fetch_json(url)
        if catalog_data:
            catalogs[name] = catalog_data
            save_json(catalog_data, f"catalog_{name}.json")
    
    # Procesar cada endpoint de candidatos
    for category, url in ENDPOINTS.items():
        print(f"\nObteniendo candidatos de: {category}")
        data = fetch_json(url)
        
        if not data:
            print(f"No se pudieron obtener datos para {category}")
            continue
        
        # Guardar datos crudos
        save_json(data, f"raw_{category}.json")
        
        # Extraer candidatos según la estructura específica de cada endpoint
        candidates = []
        
        try:
            # La estructura puede variar entre endpoints, intentamos adaptarnos
            if isinstance(data, list):
                candidates = data
            elif isinstance(data, dict):
                # Buscar la lista de candidatos en diferentes posibles claves
                for key in ['candidatos', 'items', 'data', 'results']:
                    if key in data and isinstance(data[key], list):
                        candidates = data[key]
                        break
                
                # Si no encontramos en claves comunes, buscamos cualquier lista grande
                if not candidates:
                    for key, value in data.items():
                        if isinstance(value, list) and len(value) > 0:
                            candidates = value
                            break
            
            print(f"Se encontraron {len(candidates)} candidatos en {category}")
            
            # Añadir categoría a cada candidato
            for candidate in candidates:
                if isinstance(candidate, dict):
                    candidate['categoria'] = category
                    all_candidates.append(candidate)
        
        except Exception as e:
            print(f"Error al procesar {category}: {e}")
    
    print(f"\nTotal de candidatos encontrados: {len(all_candidates)}")
    
    # Guardar todos los candidatos en un solo archivo
    save_json(all_candidates, "all_candidates.json")
    
    return all_candidates

def normalize_candidates(candidates):
    """Normaliza los datos de candidatos para tener una estructura uniforme."""
    normalized = []
    
    for candidate in candidates:
        try:
            normalized_candidate = {
                "folio": None,
                "nombre": None,
                "primer_apellido": None,
                "segundo_apellido": None,
                "genero": None,
                "puesto": None,
                "categoria": candidate.get('categoria', ''),
                "url_perfil": None,
                "documentos": [],
                "idCandidato": None,
                "idTipoCandidatura": None
            }
            # Folio
            for field in ['folio', 'id', 'idCandidato', 'clave', 'folioRegistro']:
                if field in candidate and candidate[field]:
                    normalized_candidate["folio"] = str(candidate[field])
                    break
            # Nombre
            for field in ['nombre', 'nombres', 'name', 'nombreCandidato']:
                if field in candidate and candidate[field]:
                    normalized_candidate["nombre"] = candidate[field]
                    break
            # Primer apellido
            for field in ['primerApellido', 'apellido1', 'paterno', 'apellidoPaterno']:
                if field in candidate and candidate[field]:
                    normalized_candidate["primer_apellido"] = candidate[field]
                    break
            # Segundo apellido
            for field in ['segundoApellido', 'apellido2', 'materno', 'apellidoMaterno']:
                if field in candidate and candidate[field]:
                    normalized_candidate["segundo_apellido"] = candidate[field]
                    break
            # Género
            for field in ['genero', 'sexo', 'gender']:
                if field in candidate and candidate[field]:
                    normalized_candidate["genero"] = candidate[field]
                    break
            # Puesto
            for field in ['puesto', 'cargo', 'tipoCandidatura', 'position', 'nombreCargo']:
                if field in candidate and candidate[field]:
                    normalized_candidate["puesto"] = candidate[field]
                    break
            # idCandidato
            for field in ['idCandidato', 'id']:
                if field in candidate and candidate[field]:
                    normalized_candidate["idCandidato"] = str(candidate[field])
                    break
            # idTipoCandidatura
            for field in ['idTipoCandidatura']:
                if field in candidate and candidate[field]:
                    normalized_candidate["idTipoCandidatura"] = str(candidate[field])
                    break
            # URL del perfil
            if normalized_candidate["idCandidato"] and normalized_candidate["idTipoCandidatura"]:
                normalized_candidate["url_perfil"] = f"https://candidaturaspoderjudicial.ine.mx/detalleCandidato/{normalized_candidate['idCandidato']}/{normalized_candidate['idTipoCandidatura']}"
            # Documentos
            for field in ['documentos', 'docs', 'archivos', 'attachments']:
                if field in candidate and isinstance(candidate[field], list):
                    normalized_candidate["documentos"] = candidate[field]
                    break
            # Si no encontramos nombre pero hay nombreCompleto
            if not normalized_candidate["nombre"] and 'nombreCompleto' in candidate:
                parts = candidate['nombreCompleto'].split()
                if len(parts) >= 3:
                    normalized_candidate["nombre"] = parts[0]
                    normalized_candidate["primer_apellido"] = parts[1]
                    normalized_candidate["segundo_apellido"] = ' '.join(parts[2:])
                elif len(parts) == 2:
                    normalized_candidate["nombre"] = parts[0]
                    normalized_candidate["primer_apellido"] = parts[1]
            # Verificar si tenemos al menos nombre o folio para identificar al candidato
            if normalized_candidate["nombre"] or normalized_candidate["folio"]:
                normalized.append(normalized_candidate)
        except Exception as e:
            print(f"Error al normalizar candidato: {e}")
            print(f"Datos del candidato: {candidate}")
    print(f"Candidatos normalizados: {len(normalized)}")
    save_json(normalized, "normalized_candidates.json")
    return normalized

def create_candidates_dataframe(candidates, limit=None):
    """Crea un DataFrame con los candidatos normalizados."""
    # Limitar a los primeros N candidatos si se especifica
    if limit and limit > 0:
        candidates = candidates[:limit]
    
    # Crear DataFrame
    df = pd.DataFrame(candidates)
    
    # Guardar como CSV
    csv_path = os.path.join(output_dir, "candidates.csv")
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"DataFrame guardado en {csv_path}")
    
    return df

def main():
    """Función principal para extraer y procesar candidatos."""
    print("Iniciando extracción de candidatos del Poder Judicial...")
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Extraer candidatos de todos los endpoints
    all_candidates = extract_candidates()
    
    # Normalizar datos de candidatos
    normalized_candidates = normalize_candidates(all_candidates)
    
    # Crear DataFrame limitado a 10 candidatos para prueba
    candidates_df = create_candidates_dataframe(normalized_candidates)
    
    print("\nResumen de la extracción:")
    print(f"Total de candidatos encontrados: {len(all_candidates)}")
    print(f"Candidatos normalizados: {len(normalized_candidates)}")
    print(f"Candidatos en DataFrame de prueba: {len(candidates_df)}")
    
    print("\nExtracción completada.")

if __name__ == "__main__":
    main()
