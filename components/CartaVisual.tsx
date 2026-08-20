'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sobresDisponibles } from './CarruselSobres';

interface CartaVisualProps {
  remitente: string;
  asunto: string;
  contenido: string;
  fecha: string;
  diseñoSobre: string;
  colorSobre: string;
  onCerrar: () => void;
}

type DiseñoHoja = 'classic' | 'modern' | 'vintage' | 'elegant';

export default function CartaVisual({ 
  remitente, 
  asunto, 
  contenido, 
  fecha, 
  diseñoSobre,
  colorSobre,
  onCerrar 
}: CartaVisualProps) {
  const [abierta, setAbierta] = useState(false);
  const [hojaVisible, setHojaVisible] = useState(false);
  const [diseñoHoja, setDiseñoHoja] = useState<DiseñoHoja>('classic');

  const handleAbrirCarta = () => {
    setAbierta(true);
    setTimeout(() => {
      setHojaVisible(true);
    }, 600);
  };

  const handleCerrarCarta = () => {
    setHojaVisible(false);
    setTimeout(() => {
      setAbierta(false);
      setTimeout(() => {
        onCerrar();
      }, 300);
    }, 400);
  };

  const diseñosHoja = {
    classic: {
      bg: 'bg-white',
      text: 'text-gray-800',
      border: 'border-gray-200',
      shadow: 'shadow-md',
      font: 'font-serif'
    },
    modern: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      shadow: 'shadow-lg shadow-indigo-200',
      font: 'font-sans'
    },
    vintage: {
      bg: 'bg-gradient-to-br from-amber-100 to-yellow-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      shadow: 'shadow-lg shadow-amber-200',
      font: 'font-serif'
    },
    elegant: {
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      text: 'text-gray-800',
      border: 'border-gray-300',
      shadow: 'shadow-xl',
      font: 'font-light'
    }
  };

  const estilo = diseñosHoja[diseñoHoja];

  const sobre = sobresDisponibles.find(s => s.id === diseñoSobre) || 
                sobresDisponibles.find(s => s.color === colorSobre) || 
                sobresDisponibles[0];
  const imageUrl = sobre.imageUrl;
  const bgGradient = sobre.bgGradient;

  if (!abierta) {
    return (
      <div className="flex flex-col items-center w-full max-w-[95%] sm:max-w-md mx-auto px-2 sm:px-0">
        <div className="text-center text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
          💡 Haz clic en el sobre para abrirlo
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02, rotate: [-1, 1, -1, 0] }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full aspect-[4/3] cursor-pointer"
          onClick={handleAbrirCarta}
        >
          <div className="relative w-full h-full rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden bg-white">
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
                <div className="absolute inset-0 border-[3px] sm:border-4 border-white/10 rounded-xl sm:rounded-2xl"></div>
                <div className="absolute inset-3 sm:inset-4 border-[1.5px] sm:border-2 border-white/5 rounded-lg sm:rounded-xl"></div>
                <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <span className="text-xl sm:text-2xl">💌</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-2">
                  <p className="text-[10px] sm:text-xs opacity-75">De:</p>
                  <p className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                    {remitente}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-xs opacity-50 whitespace-nowrap z-10">
              Click para abrir 📬
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[95%] sm:max-w-md mx-auto px-2 sm:px-0">
      <div className="mb-3 sm:mb-4 flex gap-1.5 sm:gap-2 flex-wrap justify-center">
        <button
          onClick={() => setDiseñoHoja('classic')}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
            diseñoHoja === 'classic' ? 'bg-[#C2185B] text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          📄 <span className="hidden xs:inline">Clásico</span>
        </button>
        <button
          onClick={() => setDiseñoHoja('modern')}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
            diseñoHoja === 'modern' ? 'bg-[#C2185B] text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🎨 <span className="hidden xs:inline">Moderno</span>
        </button>
        <button
          onClick={() => setDiseñoHoja('vintage')}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
            diseñoHoja === 'vintage' ? 'bg-[#C2185B] text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          📜 <span className="hidden xs:inline">Vintage</span>
        </button>
        <button
          onClick={() => setDiseñoHoja('elegant')}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
            diseñoHoja === 'elegant' ? 'bg-[#C2185B] text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          ✨ <span className="hidden xs:inline">Elegante</span>
        </button>
      </div>

      <div className="w-full aspect-[4/3]">
        <AnimatePresence mode="wait">
          <motion.div
            key="carta-abierta"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full h-full"
          >
            <div className="relative w-full h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1/3 bg-black/20" style={{
                  clipPath: 'polygon(0 0, 50% 60%, 100% 0)'
                }} />
              </div>

              <AnimatePresence>
                {hojaVisible && (
                  <motion.div
                    initial={{ y: 50, scale: 0.9, opacity: 0, rotateX: 20 }}
                    animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    className={`absolute inset-3 sm:inset-4 ${estilo.bg} rounded-lg sm:rounded-xl ${estilo.shadow} ${estilo.border} border-2 p-3 sm:p-5 md:p-6 overflow-y-auto`}
                  >
                    <div className={`${estilo.font} ${estilo.text} space-y-2 sm:space-y-4 h-full flex flex-col`}>
                      <div className="flex justify-between items-start border-b border-gray-200 pb-2 sm:pb-3 flex-shrink-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs opacity-60 truncate">De: {remitente}</p>
                          <p className="text-[10px] sm:text-xs opacity-60 truncate hidden xs:block">Fecha: {fecha}</p>
                        </div>
                        <button
                          onClick={handleCerrarCarta}
                          className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl flex-shrink-0 ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Cerrar carta"
                        >
                          ✕
                        </button>
                      </div>
                      <h3 className={`text-base sm:text-lg md:text-xl font-bold ${estilo.text} flex-shrink-0 line-clamp-2`}>
                        {asunto}
                      </h3>
                      <div className="flex-1 overflow-y-auto text-[10px] sm:text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {contenido}
                      </div>
                      <div className="border-t border-gray-200 pt-2 sm:pt-3 text-[8px] sm:text-xs opacity-40 text-center flex-shrink-0">
                        💌 saborAMI
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}