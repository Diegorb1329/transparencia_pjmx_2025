import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SingleQuestion from './SingleQuestion';

// Mock de pregunta para pruebas
const mockQuestion = {
  id: 1,
  dimension: "CT",
  type: "single",
  text: "¿Prefieres personas juzgadoras con experiencia internacional frente a personas juzgadoras cuya experiencia es exclusivamente nacional?",
  options: [
    { text: "Prefiero exclusivamente experiencia nacional", affinity: "CT" },
    { text: "Prefiero principalmente experiencia nacional", affinity: "CT" },
    { text: "No tengo preferencia", affinity: null },
    { text: "Prefiero principalmente experiencia internacional", affinity: "CT" },
    { text: "Prefiero exclusivamente experiencia internacional", affinity: "CT" }
  ]
};

describe('SingleQuestion Component', () => {
  test('renders question text correctly', () => {
    render(
      <SingleQuestion 
        question={mockQuestion} 
        onAnswer={jest.fn()} 
        currentAnswer={null} 
      />
    );
    
    // Verificar que el texto de la pregunta se muestra correctamente
    expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
  });
  
  test('renders all options correctly', () => {
    render(
      <SingleQuestion 
        question={mockQuestion} 
        onAnswer={jest.fn()} 
        currentAnswer={null} 
      />
    );
    
    // Verificar que todas las opciones se muestran
    mockQuestion.options.forEach(option => {
      expect(screen.getByText(option.text)).toBeInTheDocument();
    });
  });
  
  test('calls onAnswer when an option is clicked', () => {
    const mockOnAnswer = jest.fn();
    
    render(
      <SingleQuestion 
        question={mockQuestion} 
        onAnswer={mockOnAnswer} 
        currentAnswer={null} 
      />
    );
    
    // Hacer clic en la segunda opción
    fireEvent.click(screen.getByText(mockQuestion.options[1].text));
    
    // Verificar que onAnswer se llama con los parámetros correctos
    expect(mockOnAnswer).toHaveBeenCalledWith(mockQuestion.id, 1);
  });
  
  test('highlights the selected option', () => {
    const selectedIndex = 2;
    
    render(
      <SingleQuestion 
        question={mockQuestion} 
        onAnswer={jest.fn()} 
        currentAnswer={selectedIndex} 
      />
    );
    
    // Obtener todos los elementos de opción
    const options = screen.getAllByText(/Prefiero|No tengo/);
    
    // La opción seleccionada debe tener estilo diferente (contenedor azul)
    const selectedOption = options[selectedIndex].closest('div').closest('div');
    expect(selectedOption).toHaveClass('border-blue-500');
    
    // Otras opciones no deben tener ese estilo
    const nonSelectedOption = options[0].closest('div').closest('div');
    expect(nonSelectedOption).not.toHaveClass('border-blue-500');
  });
  
  test('displays dimension information correctly', () => {
    render(
      <SingleQuestion 
        question={mockQuestion} 
        onAnswer={jest.fn()} 
        currentAnswer={null} 
      />
    );
    
    // Verificar que la dimensión se muestra correctamente
    expect(screen.getByText(`Dimensión: ${mockQuestion.dimension}`)).toBeInTheDocument();
  });
}); 