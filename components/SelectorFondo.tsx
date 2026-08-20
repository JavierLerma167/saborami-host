'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectorFondoProps {
  onFondoChange: (fondo: string) => void;
  fondoActual: string;
}

export default function SelectorFondo({ onFondoChange, fondoActual }: SelectorFondoProps) {
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar fondo guardado al iniciar y actualizar imagenSeleccionada si es data URL
  useEffect(() => {
    const fondoGuardado = localStorage.getItem('saborami_fondo');
    if (fondoGuardado) {
      onFondoChange(fondoGuardado);
      // Si es una imagen (data URL), la mostramos como seleccionada
      if (fondoGuardado.startsWith('data:')) {
        setImagenSeleccionada(fondoGuardado);
      } else {
        // Si es color o URL, no la consideramos imagen seleccionada
        setImagenSeleccionada(null);
      }
    }
  }, [onFondoChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagenSeleccionada(dataUrl);
      onFondoChange(dataUrl);
      localStorage.setItem('saborami_fondo', dataUrl);
      setMostrarSelector(false);
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (color: string) => {
    setImagenSeleccionada(null); // Al seleccionar color, quitamos la imagen seleccionada
    onFondoChange(color);
    localStorage.setItem('saborami_fondo', color);
    setMostrarSelector(false);
  };

  const quitarFondo = () => {
    setImagenSeleccionada(null);
    onFondoChange('');
    localStorage.removeItem('saborami_fondo');
    setMostrarSelector(false);
  };

  const coloresPredefinidos = [
    { nombre: 'Blanco', valor: '#ffffff' },
    { nombre: 'Gris claro', valor: '#f3f4f6' },
    { nombre: 'Rosa suave', valor: '#fce4ec' },
    { nombre: 'Celeste', valor: '#e3f2fd' },
    { nombre: 'Amarillo', valor: '#fff3e0' },
    { nombre: 'Rosa intenso', valor: '#C2185B' },
    { nombre: 'Azul', valor: '#1976d2' },
    { nombre: 'Verde', valor: '#388e3c' },
  ];

  const fondosPredefinidos = [
    { nombre: 'Papel', url: '/fondos/papel.jpg' },
    { nombre: 'Madera', url: '/fondos/madera.jpg' },
    { nombre: 'Mármol', url: '/fondos/marmol.jpg' },
  ];

  // Determinar si el fondo actual es un color (empieza con #)
  const esColorActual = fondoActual.startsWith('#');
  // Ver si es una imagen (data, / o http)
  const esImagenActual = fondoActual.startsWith('data:') || fondoActual.startsWith('/') || fondoActual.startsWith('http');

  return (
    <div className="relative">
      {/* Botón para abrir selector con vista previa del fondo actual */}
      <button
        onClick={() => setMostrarSelector(!mostrarSelector)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm text-gray-600"
        title="Cambiar fondo"
      >
        {/* Vista previa del fondo actual */}
        <span className="relative inline-block w-6 h-6 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
          {esImagenActual && fondoActual ? (
            <img src={fondoActual} alt="Fondo actual" className="w-full h-full object-cover" />
          ) : esColorActual ? (
            <span className="absolute inset-0" style={{ backgroundColor: fondoActual }} />
          ) : (
            <span className="absolute inset-0 bg-gray-200" />
          )}
        </span>
        <span className="hidden sm:inline">Fondo</span>
      </button>

      {/* Panel selector */}
      <AnimatePresence>
        {mostrarSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
          >
            <h4 className="font-semibold text-sm text-gray-700 mb-3">🎨 Personalizar fondo</h4>

            {/* Subir imagen */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Imagen personalizada</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#C2185B] hover:bg-[#C2185B]/5 transition-colors text-sm text-gray-600"
              >
                📁 Seleccionar imagen
              </button>
              {imagenSeleccionada && (
                <div className="mt-2 relative">
                  <img src={imagenSeleccionada} alt="Fondo seleccionado" className="w-full h-20 object-cover rounded-lg" />
                  <button
                    onClick={quitarFondo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Colores predefinidos */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Colores</label>
              <div className="flex flex-wrap gap-2">
                {coloresPredefinidos.map((color) => {
                  const isActive = fondoActual === color.valor;
                  return (
                    <button
                      key={color.valor}
                      onClick={() => handleColorChange(color.valor)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        isActive ? 'border-[#C2185B] ring-2 ring-[#C2185B]/30' : 'border-gray-200 hover:border-[#C2185B]'
                      }`}
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  );
                })}
              </div>
            </div>

            {/* Fondos predefinidos */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Fondos sugeridos</label>
              <div className="grid grid-cols-3 gap-2">
                {fondosPredefinidos.map((fondo) => {
                  const isActive = fondoActual === fondo.url;
                  return (
                    <button
                      key={fondo.nombre}
                      onClick={() => {
                        setImagenSeleccionada(null); // No es imagen subida, es URL predefinida
                        onFondoChange(fondo.url);
                        localStorage.setItem('saborami_fondo', fondo.url);
                        setMostrarSelector(false);
                      }}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        isActive ? 'border-[#C2185B] ring-2 ring-[#C2185B]/30' : 'border-gray-200 hover:border-[#C2185B]'
                      }`}
                    >
                      <div
                        className="w-full h-full bg-gray-200 flex items-center justify-center text-xs"
                        style={{
                          backgroundImage: `url(${fondo.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {!isActive && <span className="bg-black/20 text-white px-1 rounded">{fondo.nombre}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón quitar fondo */}
            <button
              onClick={quitarFondo}
              className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️ Quitar fondo personalizado
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}