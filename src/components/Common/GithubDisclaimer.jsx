'use client';

import { useState } from 'react';

export default function GithubDisclaimer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end">
      {/* Botón de GitHub */}
      <a
        href="https://github.com/Diegorb1329/transparencia_pjmx_2025"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full shadow hover:bg-gray-800 transition mb-2"
      >
        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
            -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
            -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65
            7.65 0 018 4.77c.68.003 1.36.092 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
            2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
            1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        Código abierto
      </a>

      {/* Botón para abrir disclaimer */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-700 text-white rounded-full shadow hover:bg-blue-800 transition"
      >
        {open ? 'Cerrar aviso' : 'Ver aviso'}
      </button>

      {/* Ventana desplegable */}
      {open && (
        <div className="mt-2 w-80 bg-white text-gray-900 rounded-lg shadow-lg p-4 border border-blue-200">
          <h4 className="font-bold mb-2">Aviso importante</h4>
          <p className="text-sm mb-2">
            Esta es una iniciativa experimental y de código abierto. El objetivo es fomentar la transparencia y la participación ciudadana.
          </p>
          <p className="text-sm mb-2">
            Las decisiones de voto deben ser independientes. Nos deslindamos de cualquier influencia directa o indirecta sobre la intención de voto de los usuarios.
          </p>
          <p className="text-xs text-gray-500">
            Consulta el código fuente y más detalles en nuestro <a href="https://github.com/Diegorb1329/transparencia_pjmx_2025" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">GitHub</a>.
          </p>
        </div>
      )}
    </div>
  );
} 