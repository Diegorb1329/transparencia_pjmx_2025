'use client';

import React from 'react';
import Slider from 'react-slick';
import CandidateCard from './CandidateCard';

// Necesitamos importar los estilos de slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CandidateCarousel = ({ candidates }) => {
  // Configuración del carrusel
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: false,
    arrows: true,
    swipeToSlide: true,
    draggable: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0,
          arrows: true
        }
      }
    ]
  };

  // Estilos CSS personalizados
  const customStyles = `
    .slick-arrow {
      z-index: 10;
      width: 30px;
      height: 30px;
    }
    .slick-prev {
      left: -15px;
    }
    .slick-next {
      right: -15px;
    }
    .slick-track {
      display: flex !important;
    }
    .slick-slide {
      height: inherit !important;
      display: flex !important;
      justify-content: center;
      align-items: stretch;
    }
    .slick-slide > div {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: stretch;
    }
  `;

  // Agregar estilos al head usando useEffect
  React.useEffect(() => {
    // Crear un elemento style
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    
    // Añadirlo al head
    document.head.appendChild(styleElement);
    
    // Limpiar cuando el componente se desmonte
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6">Candidatos ordenados por afinidad</h3>
      
      {candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron candidatos con los filtros seleccionados.
        </div>
      ) : (
        <div className="carousel-container" style={{ width: '100%', position: 'relative' }}>
          <Slider {...settings}>
            {candidates.map((candidate, index) => (
              <div key={candidate.folio} className="px-2">
                <div className="h-full">
                  <CandidateCard candidate={candidate} index={index} />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
      
      {candidates.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500">
          Mostrando {candidates.length} candidatos
        </div>
      )}
    </div>
  );
};

export default CandidateCarousel;

