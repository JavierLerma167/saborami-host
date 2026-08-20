'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Carta } from '@/lib/types';

export interface Sobre {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  bgGradient: string;
  imageUrl: string;
}

interface CarruselSelectorProps {
  onSeleccionarSobre: (sobre: Sobre) => void;
  onCerrar: () => void;
}

interface CarruselCartasProps {
  cartas: Carta[];
  onSeleccionarCarta: (carta: Carta) => void;
}

export const sobresDisponibles: Sobre[] = [
  {
    id: 'vintage',
    nombre: 'Vintage',
    emoji: '📜',
    color: '#8B6914',
    bgGradient: 'from-amber-600 to-yellow-800',
    imageUrl: '/sobres/vintage.jpg'
  },
  {
    id: 'romantic',
    nombre: 'Romántico',
    emoji: '❤️',
    color: '#E74C3C',
    bgGradient: 'from-red-500 to-pink-600',
    imageUrl: '/sobres/romantic.jpg'
  },
  {
    id: 'nature',
    nombre: 'Natural',
    emoji: '🌿',
    color: '#27AE60',
    bgGradient: 'from-green-500 to-emerald-700',
    imageUrl: '/sobres/nature.jpg'
  },
  {
    id: 'elegant',
    nombre: 'Elegante',
    emoji: '✨',
    color: '#2C3E50',
    bgGradient: 'from-gray-600 to-gray-900',
    imageUrl: '/sobres/elegant.jpg'
  }
];

export const coloresSobre: Record<string, string> = {
  '#8B6914': 'from-amber-600 to-yellow-800',
  '#E74C3C': 'from-red-500 to-pink-600',
  '#27AE60': 'from-green-500 to-emerald-700',
  '#2C3E50': 'from-gray-600 to-gray-900'
};

export function CarruselCartas({ cartas, onSeleccionarCarta }: CarruselCartasProps) {
  const [indice, setIndice] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || cartas.length === 0) return;
    const interval = setInterval(() => {
      setIndice((prev) => (prev + 1) % cartas.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoplay, cartas.length]);

  if (cartas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-2">📭</p>
        <p className="text-gray-500">No hay cartas para mostrar</p>
      </div>
    );
  }

  const cartaActual = cartas[indice];
  const sobre = sobresDisponibles.find(s => s.color === cartaActual.colorSobre) || 
                sobresDisponibles.find(s => s.id === cartaActual.diseñoSobre) || 
                sobresDisponibles[0];
  const imageUrl = sobre.imageUrl;
  const bgGradient = sobre.bgGradient;

  const irSiguiente = () => {
    setAutoplay(false);
    setIndice((prev) => (prev + 1) % cartas.length);
    setTimeout(() => setAutoplay(true), 5000);
  };

  const irAnterior = () => {
    setAutoplay(false);
    setIndice((prev) => (prev - 1 + cartas.length) % cartas.length);
    setTimeout(() => setAutoplay(true), 5000);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="text-center mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500">
        Carta {indice + 1} de {cartas.length}
      </div>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={indice}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="cursor-pointer"
            onClick={() => onSeleccionarCarta(cartaActual)}
          >
            <div className="relative aspect-[4/3] rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow bg-white">
              <img 
                src={imageUrl} 
                alt={sobre.nombre}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${bgGradient} -z-10`}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full">
                  {/* Triángulo eliminado */}
                  <div className="absolute inset-0 border-4 border-white/10 rounded-2xl"></div>
                  <div className="absolute inset-4 border-2 border-white/5 rounded-xl"></div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💌</span>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-4">
                    <p className="text-xs opacity-75">De:</p>
                    <p className="text-sm font-semibold truncate max-w-[150px]">
                      {cartaActual.remitenteNombre}
                    </p>
                  </div>
                </div>
              </div>
              {!cartaActual.leida && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full animate-pulse z-10">
                  Nueva
                </div>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-xs opacity-50 whitespace-nowrap z-10">
                Click para abrir 📬
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {cartas.length > 1 && (
          <>
            <button
              onClick={irAnterior}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all z-10 text-xs sm:text-sm"
              aria-label="Anterior"
            >
              ◀
            </button>
            <button
              onClick={irSiguiente}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all z-10 text-xs sm:text-sm"
              aria-label="Siguiente"
            >
              ▶
            </button>
          </>
        )}
      </div>
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {cartas.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setAutoplay(false);
              setIndice(i);
              setTimeout(() => setAutoplay(true), 5000);
            }}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              i === indice ? 'w-4 sm:w-6 bg-[#C2185B]' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir a carta ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CarruselSelectorSobres({ onSeleccionarSobre, onCerrar }: CarruselSelectorProps) {
  const [indice, setIndice] = useState(0);
  const sobreActual = sobresDisponibles[indice];

  const irSiguiente = () => {
    setIndice((prev) => (prev + 1) % sobresDisponibles.length);
  };

  const irAnterior = () => {
    setIndice((prev) => (prev - 1 + sobresDisponibles.length) % sobresDisponibles.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-md max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#C2185B] flex items-center gap-2">
            <span className="text-lg sm:text-xl">💌</span> 
            <span className="hidden xs:inline">Selecciona un sobre</span>
            <span className="inline xs:hidden">Sobre</span>
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 text-center">
          Elige el sobre para tu carta
        </p>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={indice}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
              onClick={() => onSeleccionarSobre(sobreActual)}
            >
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl shadow-xl overflow-hidden bg-white">
                <img 
                  src={sobreActual.imageUrl} 
                  alt={sobreActual.nombre}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${sobreActual.bgGradient} -z-10`}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full">
                    {/* Triángulo eliminado */}
                    <div className="absolute inset-0 border-4 border-black/10 rounded-xl sm:rounded-2xl"></div>
                    <div className="absolute inset-3 sm:inset-4 border-2 border-black/5 rounded-lg sm:rounded-xl"></div>
                    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-2xl sm:text-3xl">{sobreActual.emoji}</span>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-2">
                      <p className="text-base sm:text-lg font-semibold">{sobreActual.nombre}</p>
                      <p className="text-[10px] sm:text-xs opacity-75 mt-1 hidden sm:block">Click para seleccionar</p>
                      <p className="text-[10px] sm:text-xs opacity-75 mt-1 block sm:hidden">👆</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {sobresDisponibles.length > 1 && (
            <>
              <button
                onClick={irAnterior}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all z-10 text-xs sm:text-sm"
                aria-label="Anterior"
              >
                ◀
              </button>
              <button
                onClick={irSiguiente}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-lg transition-all z-10 text-xs sm:text-sm"
                aria-label="Siguiente"
              >
                ▶
              </button>
            </>
          )}
        </div>
        <div className="text-center mt-3 sm:mt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm sm:text-base">{sobreActual.emoji}</span>
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              {sobreActual.nombre}
            </p>
          </div>
          <button
            onClick={() => onSeleccionarSobre(sobreActual)}
            className="w-full sm:w-auto bg-[#C2185B] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#A0154A] transition-colors text-sm sm:text-base font-medium"
          >
            ✉️ Usar este sobre
          </button>
        </div>
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {sobresDisponibles.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                i === indice ? 'w-4 sm:w-6 bg-[#C2185B]' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir al sobre ${i + 1}`}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-[10px] sm:text-xs text-gray-400">
          {indice + 1} de {sobresDisponibles.length}
        </div>
      </div>
    </div>
  );
}