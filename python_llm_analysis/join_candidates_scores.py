import csv
import json

# Paths de entrada y salida
SCORES_CSV = "extract_candidates_output/candidates_scored_2.csv"
ALL_CANDIDATES_JSON = "extract_candidates_output/all_candidates.json"
CANDIDATES_CSV = "extract_candidates_output/candidates.csv"
OUTPUT_CSV = "extract_candidates_output/candidates_scored_full_2.csv"

# Leer JSON de candidatos
with open(ALL_CANDIDATES_JSON, "r", encoding="utf-8") as f:
    all_candidates = json.load(f)

# Indexar por idCandidato (como str por seguridad)
cand_info = {str(c["idCandidato"]): c for c in all_candidates}

# Leer candidates.csv para obtener url_perfil por folio
folio_to_url = {}
with open(CANDIDATES_CSV, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        folio_to_url[str(row["folio"])] = row.get("url_perfil", "")

# Leer CSV de scores y unir
with open(SCORES_CSV, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

# Determinar columnas extra del JSON
extra_cols = [
    "nombreEstado", "idDistritoJudicial", "idTipoCandidatura", "categoria", "nombreCorto", "sexo", "url_perfil"
]

# Columnas base del CSV de scores
base_cols = list(rows[0].keys())

# Crear cabecera final
header = base_cols + extra_cols

# Escribir nuevo CSV
with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    for row in rows:
        folio = str(row["folio"])
        info = cand_info.get(folio, {})
        for col in extra_cols:
            if col == "url_perfil":
                row[col] = folio_to_url.get(folio, "")
            else:
                row[col] = info.get(col, "")
        writer.writerow(row)

print(f"Archivo unido guardado en {OUTPUT_CSV}") 