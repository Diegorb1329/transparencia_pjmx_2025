#!/usr/bin/env python3
"""
Script para asociar candidatos a distritos judiciales.
Este script utiliza los datos de candidatos extraídos y los archivos geográficos
de distritos judiciales para crear una asociación entre ambos.
"""

import os
import pandas as pd
import geopandas as gpd
import json
import logging
from tqdm import tqdm

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("candidatos_distritos.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Directorios de trabajo
BASE_DIR = "/home/ubuntu"
INE_SCRAPER_DIR = os.path.join(BASE_DIR, "ine_scraper")
DISTRITOS_DIR = os.path.join(BASE_DIR, "distritos_judiciales")
OUTPUT_DIR = os.path.join(DISTRITOS_DIR, "output")
RESULT_DIR = os.path.join(BASE_DIR, "resultado_final")

# Crear directorio de resultados si no existe
os.makedirs(RESULT_DIR, exist_ok=True)

def load_candidates_data():
    """
    Carga los datos de candidatos desde los archivos generados por el scraper.
    """
    try:
        # Intentar cargar desde el CSV con documentos
        candidates_csv = os.path.join(INE_SCRAPER_DIR, "data", "candidates_with_documents.csv")
        if os.path.exists(candidates_csv):
            df = pd.read_csv(candidates_csv)
            logger.info(f"Datos de candidatos cargados desde CSV: {candidates_csv}")
            return df
        
        # Si no existe, intentar cargar desde el JSON normalizado
        normalized_json = os.path.join(INE_SCRAPER_DIR, "data", "normalized_candidates.json")
        if os.path.exists(normalized_json):
            with open(normalized_json, 'r', encoding='utf-8') as f:
                candidates = json.load(f)
            df = pd.DataFrame(candidates)
            logger.info(f"Datos de candidatos cargados desde JSON: {normalized_json}")
            return df
        
        # Si no existe ninguno, cargar desde el JSON original
        all_candidates_json = os.path.join(INE_SCRAPER_DIR, "data", "all_candidates.json")
        if os.path.exists(all_candidates_json):
            with open(all_candidates_json, 'r', encoding='utf-8') as f:
                candidates = json.load(f)
            df = pd.DataFrame(candidates)
            logger.info(f"Datos de candidatos cargados desde JSON original: {all_candidates_json}")
            return df
        
        logger.error("No se encontraron archivos de candidatos")
        return None
    
    except Exception as e:
        logger.error(f"Error al cargar datos de candidatos: {e}")
        return None

def load_raw_candidates_data():
    """
    Carga los datos crudos de candidatos para obtener información adicional.
    """
    try:
        # Cargar datos crudos de jueces de distrito como ejemplo
        raw_json = os.path.join(INE_SCRAPER_DIR, "data", "raw_jueces_distrito.json")
        if os.path.exists(raw_json):
            with open(raw_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if "candidatos" in data and isinstance(data["candidatos"], list):
                # Crear un diccionario para búsqueda rápida por ID
                candidates_dict = {}
                for candidate in data["candidatos"]:
                    if "idCandidato" in candidate:
                        candidates_dict[str(candidate["idCandidato"])] = candidate
                
                logger.info(f"Datos crudos de candidatos cargados desde: {raw_json}")
                return candidates_dict
        
        logger.warning("No se encontraron datos crudos de candidatos")
        return {}
    
    except Exception as e:
        logger.error(f"Error al cargar datos crudos de candidatos: {e}")
        return {}

def load_districts_data():
    """
    Carga los datos de distritos judiciales.
    """
    try:
        # Cargar CSV de búsqueda
        csv_path = os.path.join(OUTPUT_DIR, "distritos_judiciales_lookup.csv")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            logger.info(f"Datos de distritos judiciales cargados desde CSV: {csv_path}")
            return df
        
        # Si no existe el CSV, intentar cargar desde el shapefile
        shp_path = os.path.join(OUTPUT_DIR, "distritos_judiciales_mexico.shp")
        if os.path.exists(shp_path):
            gdf = gpd.read_file(shp_path)
            df = pd.DataFrame(gdf.drop(columns='geometry'))
            logger.info(f"Datos de distritos judiciales cargados desde shapefile: {shp_path}")
            return df
        
        logger.error("No se encontraron archivos de distritos judiciales")
        return None
    
    except Exception as e:
        logger.error(f"Error al cargar datos de distritos judiciales: {e}")
        return None

def associate_candidates_with_districts(candidates_df, districts_df, raw_candidates=None):
    """
    Asocia candidatos con distritos judiciales basado en los campos comunes.
    """
    try:
        if candidates_df is None or districts_df is None:
            logger.error("No se pueden asociar candidatos con distritos: datos faltantes")
            return None
        
        # Crear copia de los datos de candidatos para no modificar el original
        result_df = candidates_df.copy()
        
        # Añadir columnas para la información de distrito
        result_df['distrito_judicial'] = None
        result_df['circuito_judicial'] = None
        result_df['nombre_distrito'] = None
        result_df['entidad_distrito'] = None
        
        # Normalizar nombres de columnas en el DataFrame de distritos
        districts_df.columns = [col.lower() for col in districts_df.columns]
        
        # Mapeo de columnas posibles en el DataFrame de distritos
        district_id_cols = ['distrito_j', 'distrito_judicial', 'dist_jud']
        circuit_id_cols = ['circuito', 'circuito_judicial', 'circ_jud']
        district_name_cols = ['nombre_dis', 'nombre_distrito_judicial', 'nombre_dj']
        entity_cols = ['entidad', 'cve_ent']
        
        # Encontrar las columnas reales en el DataFrame de distritos
        district_id_col = next((col for col in district_id_cols if col in districts_df.columns), None)
        circuit_id_col = next((col for col in circuit_id_cols if col in districts_df.columns), None)
        district_name_col = next((col for col in district_name_cols if col in districts_df.columns), None)
        entity_col = next((col for col in entity_cols if col in districts_df.columns), None)
        
        if not all([district_id_col, circuit_id_col, entity_col]):
            logger.error("Columnas necesarias no encontradas en el DataFrame de distritos")
            return None
        
        # Contador de asociaciones exitosas
        successful_matches = 0
        
        # Procesar cada candidato
        for idx, candidate in tqdm(result_df.iterrows(), total=len(result_df), desc="Asociando candidatos"):
            try:
                # Obtener ID del candidato
                candidate_id = str(candidate.get('folio', ''))
                
                # Buscar información adicional en datos crudos si está disponible
                raw_data = None
                if raw_candidates and candidate_id in raw_candidates:
                    raw_data = raw_candidates[candidate_id]
                
                # Intentar asociar por idCircuito y idDistritoJudicial si están disponibles en datos crudos
                if raw_data and 'idCircuito' in raw_data and 'idDistritoJudicial' in raw_data:
                    circuit_id = raw_data['idCircuito']
                    district_id = raw_data['idDistritoJudicial']
                    
                    # Buscar en el DataFrame de distritos
                    matching_districts = districts_df[
                        (districts_df[circuit_id_col] == circuit_id) & 
                        (districts_df[district_id_col] == district_id)
                    ]
                    
                    if not matching_districts.empty:
                        # Tomar el primer distrito que coincida
                        district = matching_districts.iloc[0]
                        
                        # Asignar valores
                        result_df.at[idx, 'distrito_judicial'] = district[district_id_col]
                        result_df.at[idx, 'circuito_judicial'] = district[circuit_id_col]
                        if district_name_col and district_name_col in district:
                            result_df.at[idx, 'nombre_distrito'] = district[district_name_col]
                        if entity_col and entity_col in district:
                            result_df.at[idx, 'entidad_distrito'] = district[entity_col]
                        
                        successful_matches += 1
                        continue
                
                # Si no se encontró coincidencia o no hay datos crudos, intentar asociar por estado
                if 'nombreEstado' in raw_data:
                    estado = raw_data['nombreEstado']
                    
                    # Buscar distritos en ese estado
                    matching_districts = districts_df[
                        districts_df[entity_col].str.upper() == estado.upper()
                    ]
                    
                    if not matching_districts.empty:
                        # Tomar el primer distrito del estado (simplificación)
                        district = matching_districts.iloc[0]
                        
                        # Asignar valores
                        result_df.at[idx, 'distrito_judicial'] = district[district_id_col]
                        result_df.at[idx, 'circuito_judicial'] = district[circuit_id_col]
                        if district_name_col and district_name_col in district:
                            result_df.at[idx, 'nombre_distrito'] = district[district_name_col]
                        if entity_col and entity_col in district:
                            result_df.at[idx, 'entidad_distrito'] = district[entity_col]
                        
                        successful_matches += 1
            
            except Exception as e:
                logger.warning(f"Error al procesar candidato {candidate_id}: {e}")
        
        logger.info(f"Asociación completada. Coincidencias exitosas: {successful_matches}/{len(result_df)}")
        return result_df
    
    except Exception as e:
        logger.error(f"Error al asociar candidatos con distritos: {e}")
        return None

def create_lookup_table(candidates_with_districts):
    """
    Crea una tabla de búsqueda para que los usuarios puedan encontrar su distrito.
    """
    try:
        if candidates_with_districts is None:
            logger.error("No se puede crear tabla de búsqueda: datos faltantes")
            return None
        
        # Agrupar por distrito y circuito
        grouped = candidates_with_districts.groupby(['circuito_judicial', 'distrito_judicial', 'nombre_distrito', 'entidad_distrito'])
        
        # Crear DataFrame con información de distritos y conteo de candidatos
        lookup_data = []
        for (circuito, distrito, nombre, entidad), group in grouped:
            lookup_data.append({
                'circuito_judicial': circuito,
                'distrito_judicial': distrito,
                'nombre_distrito': nombre,
                'entidad': entidad,
                'num_candidatos': len(group),
                'candidatos': ', '.join(group['nombre'].astype(str).tolist()[:5]) + ('...' if len(group) > 5 else '')
            })
        
        lookup_df = pd.DataFrame(lookup_data)
        
        # Guardar como CSV
        output_path = os.path.join(RESULT_DIR, "lookup_distritos_candidatos.csv")
        lookup_df.to_csv(output_path, index=False)
        
        logger.info(f"Tabla de búsqueda guardada en: {output_path}")
        return lookup_df
    
    except Exception as e:
        logger.error(f"Error al crear tabla de búsqueda: {e}")
        return None

def create_geojson_with_candidates(candidates_with_districts):
    """
    Crea un archivo GeoJSON con distritos judiciales y sus candidatos asociados.
    """
    try:
        # Cargar shapefile de distritos
        shp_path = os.path.join(OUTPUT_DIR, "distritos_judiciales_mexico.shp")
        if not os.path.exists(shp_path):
            logger.error(f"No se encontró el shapefile: {shp_path}")
            return None
        
        gdf = gpd.read_file(shp_path)
        
        # Normalizar nombres de columnas
        gdf.columns = [col.lower() for col in gdf.columns]
        
        # Mapeo de columnas
        district_id_cols = ['distrito_j', 'distrito_judicial', 'dist_jud']
        circuit_id_cols = ['circuito', 'circuito_judicial', 'circ_jud']
        
        # Encontrar las columnas reales
        district_id_col = next((col for col in district_id_cols if col in gdf.columns), None)
        circuit_id_col = next((col for col in circuit_id_cols if col in gdf.columns), None)
        
        if not all([district_id_col, circuit_id_col]):
            logger.error("Columnas necesarias no encontradas en el GeoDataFrame")
            return None
        
        # Agrupar candidatos por distrito y circuito
        candidates_grouped = candidates_with_districts.groupby(['circuito_judicial', 'distrito_judicial'])
        
        # Crear diccionario para búsqueda rápida
        candidates_by_district = {}
        for (circuito, distrito), group in candidates_grouped:
            key = f"{circuito}_{distrito}"
            candidates_by_district[key] = group.to_dict('records')
        
        # Añadir candidatos a cada distrito en el GeoDataFrame
        gdf['candidatos'] = None
        for idx, row in gdf.iterrows():
            circuito = row[circuit_id_col]
            distrito = row[district_id_col]
            key = f"{circuito}_{distrito}"
            
            if key in candidates_by_district:
                gdf.at[idx, 'candidatos'] = candidates_by_district[key]
            else:
                gdf.at[idx, 'candidatos'] = []
        
        # Convertir a GeoJSON
        geojson_path = os.path.join(RESULT_DIR, "distritos_judiciales_con_candidatos.geojson")
        gdf.to_file(geojson_path, driver='GeoJSON')
        
        logger.info(f"GeoJSON con candidatos guardado en: {geojson_path}")
        return geojson_path
    
    except Exception as e:
        logger.error(f"Error al crear GeoJSON con candidatos: {e}")
        return None

def main():
    """
    Función principal que coordina el proceso de asociación.
    """
    logger.info("Iniciando proceso de asociación de candidatos con distritos judiciales")
    
    # Cargar datos de candidatos
    candidates_df = load_candidates_data()
    if candidates_df is None:
        logger.error("No se pudieron cargar los datos de candidatos")
        return
    
    # Cargar datos crudos de candidatos para información adicional
    raw_candidates = load_raw_candidates_data()
    
    # Cargar datos de distritos judiciales
    districts_df = load_districts_data()
    if districts_df is None:
        logger.error("No se pudieron cargar los datos de distritos judiciales")
        return
    
    # Asociar candidatos con distritos
    candidates_with_districts = associate_candidates_with_districts(candidates_df, districts_df, raw_candidates)
    if candidates_with_districts is None:
        logger.error("No se pudieron asociar candidatos con distritos")
        return
    
    # Guardar resultados
    output_path = os.path.join(RESULT_DIR, "candidatos_con_distritos.csv")
    candidates_with_districts.to_csv(output_path, index=False)
    logger.info(f"Candidatos con distritos guardados en: {output_path}")
    
    # Crear tabla de búsqueda
    lookup_df = create_lookup_table(candidates_with_districts)
    
    # Crear GeoJSON con candidatos
    
(Content truncated due to size limit. Use line ranges to read in chunks)