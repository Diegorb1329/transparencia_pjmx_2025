// Añadir las extensiones de testing-library
import '@testing-library/jest-dom';

// Mock para localStorage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
}

// Mock para fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

// Suprimir errores de consola durante los tests
console.error = jest.fn();
console.warn = jest.fn(); 