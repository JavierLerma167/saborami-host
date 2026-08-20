'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sobre } from './CarruselSobres';

interface SelectorSobresCarruselProps {
  sobres: Sobre[];
  onSeleccionar: (sobre: Sobre) => void;
  seleccionado: Sobre | null;
}

export default function SelectorSobresCarrusel({ sobres, onSeleccionar, seleccionado }: SelectorSobresCarruselProps) {
  const [indice, setIndice] = useState(0);

  const anterior = () => {
    setIndice((prev) => (prev - 1 + sobres.length) % sobres.length);
  };

  const siguiente = () => {
    setIndice((prev) => (prev + 1) % sobres.length);
  };

  const sobreActual = sobres[indice];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={indice}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
            onClick={() => onSeleccionar(sobreActual)}
          >
            <div className={`relative aspect-[4/3] rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow bg-white ${
              seleccionado?.id === sobreActual.id ? 'ring-4 ring-[#C2185B] ring-offset-4' : ''
            }`}>
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
                  <div className="absolute inset-0 border-4 border-white/10 rounded-2xl"></div>
                  <div className="absolute inset-4 border-2 border-white/5 rounded-xl"></div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <span className="text-3xl">{sobreActual.emoji}</span>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-4">
                    <p className="text-xl font-bold">{sobreActual.nombre}</p>
                    <p className="text-xs opacity-75 mt-1">Click para seleccionar</p>
                  </div>
                  {seleccionado?.id === sobreActual.id && (
                    <div className="absolute top-3 right-3 bg-[#C2185B] text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
                      ✅ Seleccionado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={anterior}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
          aria-label="Anterior"
        >
          ◀
        </button>
        <button
          onClick={siguiente}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
          aria-label="Siguiente"
        >
          ▶
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {sobres.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndice(i)}
            className={`h-2 rounded-full transition-all ${
              i === indice ? 'w-6 bg-[#C2185B]' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir al sobre ${i + 1}`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        {seleccionado ? `✅ ${seleccionado.emoji} ${seleccionado.nombre} seleccionado` : 'Selecciona un sobre para tu carta'}
      </p>
    </div>
  );
}