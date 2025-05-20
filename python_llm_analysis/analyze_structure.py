#!/usr/bin/env python3
"""
Script para analizar la estructura de la página del INE y sus endpoints.
Este script ayuda a identificar cómo se cargan los datos de candidatos
y qué peticiones se realizan para obtener la información.
"""

import asyncio
from playwright.async_api import async_playwright
import json
import os

async def analyze_page_structure():
    """Analiza la estructura de la página y las peticiones de red."""
    
    print("Iniciando análisis de la estructura de la página del INE...")
    
    async with async_playwright() as p:
        # Lanzar navegador
        browser = await p.chromium.launch(headless=True)
        
        # Crear un contexto con interceptación de peticiones
        context = await browser.new_context()
        
        # Crear una página
        page = await context.new_page()
        
        # Lista para almacenar las peticiones de red
        requests = []
        
        # Interceptar peticiones de red
        async def on_request(request):
            if request.resource_type in ["xhr", "fetch"]:
                requests.append({
                    "url": request.url,
                    "method": request.method,
                    "resource_type": request.resource_type,
                    "post_data": request.post_data
                })
        
        # Escuchar eventos de petición
        page.on("request", on_request)
        
        # Navegar a la página
        print("Navegando a la página principal...")
        await page.goto("https://candidaturaspoderjudicial.ine.mx/")
        await page.wait_for_load_state("networkidle")
        
        # Analizar estructura inicial
        print("\nAnalizando estructura inicial de la página...")
        
        # Obtener elementos de formulario
        form_elements = await page.evaluate("""() => {
            const formElements = {};
            const inputs = Array.from(document.querySelectorAll('input, select, button'));
            formElements.inputs = inputs.map(el => ({
                type: el.tagName.toLowerCase(),
                id: el.id,
                name: el.name,
                placeholder: el.placeholder,
                value: el.value
            }));
            return formElements;
        }""")
        
        print("\nElementos de formulario encontrados:")
        print(json.dumps(form_elements, indent=2))
        
        # Intentar interactuar con el formulario para ver cómo se cargan los datos
        print("\nInteractuando con el formulario para analizar peticiones...")
        
        # Intentar seleccionar una entidad (primer paso necesario)
        try:
            # Buscar el selector de entidad y hacer clic
            await page.click('div[role="combobox"]')
            await page.wait_for_timeout(1000)
            
            # Seleccionar la primera opción (Ciudad de México)
            await page.click('text="Ciudad de México"')
            await page.wait_for_timeout(2000)
            
            # Intentar hacer clic en el botón de consulta
            await page.click('button:has-text("Consultar")')
            await page.wait_for_timeout(5000)
            
            # Intentar hacer clic en una categoría de candidatos (Poder Judicial)
            await page.click('label:has-text("PODER JUDICIAL")')
            await page.wait_for_timeout(2000)
            
            # Intentar expandir una categoría de candidatos judiciales
            judicial_categories = await page.query_selector_all('div[role="button"]:has-text("Magistradas")')
            if judicial_categories:
                await judicial_categories[0].click()
                await page.wait_for_timeout(3000)
            
        except Exception as e:
            print(f"Error durante la interacción: {e}")
        
        # Guardar las peticiones capturadas
        print(f"\nSe capturaron {len(requests)} peticiones XHR/fetch")
        
        # Analizar y mostrar las peticiones más relevantes
        api_endpoints = {}
        for req in requests:
            url = req["url"]
            if "api" in url or "candidat" in url or "json" in url:
                domain = url.split("/")[2]
                if domain not in api_endpoints:
                    api_endpoints[domain] = []
                api_endpoints[domain].append(url)
        
        print("\nPosibles endpoints de API identificados:")
        for domain, urls in api_endpoints.items():
            print(f"\nDominio: {domain}")
            for url in set(urls):
                print(f"  - {url}")
        
        # Analizar estructura DOM para identificar patrones de datos
        print("\nAnalizando estructura DOM para identificar patrones de datos...")
        
        dom_structure = await page.evaluate("""() => {
            // Buscar elementos que podrían contener datos de candidatos
            const candidateContainers = Array.from(document.querySelectorAll('div.candidate-item, div.card, div.profile-container, div[role="listitem"]'));
            
            return {
                title: document.title,
                url: window.location.href,
                possibleCandidateContainers: candidateContainers.length,
                formStructure: document.querySelector('form') ? true : false,
                dynamicContent: !!document.querySelector('[id*="react"], [id*="app"], [id*="root"]')
            };
        }""")
        
        print("\nEstructura DOM analizada:")
        print(json.dumps(dom_structure, indent=2))
        
        # Crear carpeta de salida específica
        output_dir = os.path.join(os.getcwd(), "analyze_structure_output")
        os.makedirs(output_dir, exist_ok=True)
        
        # Guardar las peticiones capturadas
        analysis_results_path = os.path.join(output_dir, "analysis_results.json")
        with open(analysis_results_path, 'w', encoding='utf-8') as f:
            json.dump(requests, f, ensure_ascii=False, indent=2)
        print(f"\nResultados del análisis guardados en {analysis_results_path}")
        
        # Capturar una captura de pantalla para referencia
        screenshot_path = os.path.join(output_dir, "page_structure.png")
        await page.screenshot(path=screenshot_path)
        print(f"\nCaptura de pantalla guardada en: {screenshot_path}")
        
        # Cerrar el navegador
        await browser.close()
        
        # Guardar resultados del análisis
        analysis_results = {
            "form_elements": form_elements,
            "api_endpoints": api_endpoints,
            "dom_structure": dom_structure,
            "requests_count": len(requests)
        }
        
        with open("analysis_results.json", "w") as f:
            json.dump(analysis_results, f, indent=2)
        
        print("\nResultados del análisis guardados en analysis_results.json")
        print("\nAnálisis completado.")

if __name__ == "__main__":
    asyncio.run(analyze_page_structure())
