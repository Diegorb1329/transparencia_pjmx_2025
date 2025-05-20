import os
import fitz  # PyMuPDF

PDF_DIR = 'download_profiles_output/documents'
TEXT_DIR = 'download_profiles_output/texts'
os.makedirs(TEXT_DIR, exist_ok=True)

for filename in os.listdir(PDF_DIR):
    if filename.lower().endswith('.pdf'):
        pdf_path = os.path.join(PDF_DIR, filename)
        text_path = os.path.join(TEXT_DIR, filename.replace('.pdf', '.txt'))
        try:
            doc = fitz.open(pdf_path)
            text = ''
            for page in doc:
                text += page.get_text()
            with open(text_path, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"Convertido: {filename} -> {text_path}")
        except Exception as e:
            print(f"Error al convertir {filename}: {e}") 