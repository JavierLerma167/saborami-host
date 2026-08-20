'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  doc, getDoc, collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, orderBy, Timestamp 
} from 'firebase/firestore';
import { deleteCookie } from 'cookies-next';
import { UserData, Carta } from '@/lib/types';
import { CarruselCartas, sobresDisponibles } from '@/components/CarruselSobres';
import SelectorSobresCarrusel from '@/components/SelectorSobresCarrusel';
import CartaVisual from '@/components/CartaVisual';
import SelectorFondo from '@/components/SelectorFondo';

type SobreSeleccionado = (typeof sobresDisponibles)[number];

export default function InicioSaborami() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cartaSeleccionada, setCartaSeleccionada] = useState<Carta | null>(null);
  const [mostrarCarta, setMostrarCarta] = useState(false);
  const [sobreSeleccionado, setSobreSeleccionado] = useState<SobreSeleccionado | null>(null);
  const [nuevaCarta, setNuevaCarta] = useState({
    destinatarioEmail: '',
    asunto: '',
    contenido: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [vistaActiva, setVistaActiva] = useState<'inbox' | 'enviados'>('inbox');
  const [fondoPersonalizado, setFondoPersonalizado] = useState('/fondos/fondosaborami.jpg');

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      deleteCookie('__session');
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para cargar cartas
  const cargarCartas = useCallback(async (userId: string) => {
    try {
      // Cargar cartas recibidas
      const qRecibidas = query(
        collection(db, 'cartas'),
        where('destinatarioId', '==', userId),
        orderBy('fecha', 'desc')
      );
      const recibidasSnap = await getDocs(qRecibidas);
      const cartasRecibidas: Carta[] = [];
      recibidasSnap.forEach((doc) => {
        cartasRecibidas.push({ id: doc.id, ...doc.data() } as Carta);
      });

      // Cargar cartas enviadas
      const qEnviadas = query(
        collection(db, 'cartas'),
        where('remitenteId', '==', userId),
        orderBy('fecha', 'desc')
      );
      const enviadasSnap = await getDocs(qEnviadas);
      const cartasEnviadas: Carta[] = [];
      enviadasSnap.forEach((doc) => {
        cartasEnviadas.push({ id: doc.id, ...doc.data() } as Carta);
      });

      setCartas([...cartasRecibidas, ...cartasEnviadas]);
    } catch (error) {
      console.error('Error cargando cartas:', error);
    }
  }, []);

  // Actualizar fecha y hora
  useEffect(() => {
    const updateDateTime = () => {
      const ahora = new Date();
      const opcionesFecha: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const opcionesHora: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setFechaActual(ahora.toLocaleDateString('es-ES', opcionesFecha));
      setHoraActual(ahora.toLocaleTimeString('es-ES', opcionesHora));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos del usuario y cartas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/');
        return;
      }

      setUser(currentUser);
      
      try {
        const docRef = doc(db, 'usuarios', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
        }
        
        await cargarCartas(currentUser.uid);
      } catch (error) {
        console.error('Error:', error);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, cargarCartas]);

  const handleEnviarCarta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar que hay un sobre seleccionado
    if (!sobreSeleccionado) {
      setMensajeError('Por favor, selecciona un sobre para tu carta desde el carrusel principal.');
      return;
    }

    setEnviando(true);
    setMensajeError('');
    setMensajeExito('');

    try {
      const q = query(collection(db, 'usuarios'), where('email', '==', nuevaCarta.destinatarioEmail));
      const querySnap = await getDocs(q);
      
      if (querySnap.empty) {
        setMensajeError('El destinatario no existe. Verifica el email.');
        setEnviando(false);
        return;
      }

      const destinatarioDoc = querySnap.docs[0];

      const cartaData = {
        remitenteId: user?.uid,
        remitenteNombre: userData?.username || user?.displayName || 'Usuario',
        destinatarioId: destinatarioDoc.id,
        destinatarioEmail: nuevaCarta.destinatarioEmail,
        asunto: nuevaCarta.asunto,
        contenido: nuevaCarta.contenido,
        fecha: Timestamp.now(),
        leida: false,
        importante: false,
        diseñoSobre: sobreSeleccionado.id,
        colorSobre: sobreSeleccionado.color
      };

      await addDoc(collection(db, 'cartas'), cartaData);
      
      setMensajeExito(`✉️ Carta enviada exitosamente con sobre ${sobreSeleccionado.nombre}`);
      setNuevaCarta({ destinatarioEmail: '', asunto: '', contenido: '' });
      // Mantenemos el sobre seleccionado para la próxima carta
      // setSobreSeleccionado(null); 
      
      if (user) {
        await cargarCartas(user.uid);
      }
      
      setTimeout(() => {
        setMensajeExito('');
        setMostrarModal(false);
      }, 3000);
    } catch (error) {
      console.error('Error enviando carta:', error);
      setMensajeError('Error al enviar la carta. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const marcarComoLeida = async (cartaId: string) => {
    try {
      await updateDoc(doc(db, 'cartas', cartaId), { leida: true });
      if (user) {
        await cargarCartas(user.uid);
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const eliminarCarta = async (cartaId: string) => {
    if (confirm('¿Estás seguro de eliminar esta carta?')) {
      try {
        await deleteDoc(doc(db, 'cartas', cartaId));
        if (user) {
          await cargarCartas(user.uid);
        }
      } catch (error) {
        console.error('Error eliminando carta:', error);
      }
    }
  };

  const handleAbrirCarta = (carta: Carta) => {
    setCartaSeleccionada(carta);
    setMostrarCarta(true);
    // Marcar como leída
    marcarComoLeida(carta.id);
  };

  const handleCerrarCarta = () => {
    setMostrarCarta(false);
    setTimeout(() => {
      setCartaSeleccionada(null);
    }, 500);
  };

  // 🔥 CAMBIO 1: Si el fondo es vacío, restaurar la imagen por defecto
  const handleFondoChange = (fondo: string) => {
    setFondoPersonalizado(fondo || '/fondos/fondosaborami.png');
  };

  const formatearFecha = (fecha: Timestamp | string | Date | null | undefined): string => {
    if (!fecha) return '';
    try {
      const fechaDate = fecha instanceof Timestamp ? fecha.toDate() : new Date(fecha);
      return fechaDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const cartasFiltradas = cartas.filter(carta => {
    if (vistaActiva === 'inbox') {
      return carta.destinatarioId === user?.uid;
    } else {
      return carta.remitenteId === user?.uid;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#C2185B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // 🔥 CAMBIO 2: Lógica separada para detectar si es color o imagen
  const esColor = fondoPersonalizado?.startsWith('#');
  const esImagen = fondoPersonalizado?.startsWith('/') || fondoPersonalizado?.startsWith('http') || fondoPersonalizado?.startsWith('data:');

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        backgroundColor: esColor ? fondoPersonalizado : '#f3f4f6',
        backgroundImage: esImagen ? `url(${fondoPersonalizado})` : 'none',
        backgroundSize: esImagen ? 'cover' : 'auto',
        backgroundPosition: esImagen ? 'center' : 'initial',
        backgroundAttachment: esImagen ? 'fixed' : 'initial',
      }}
    >
      {/* Header responsivo */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          {/* Menú hamburguesa */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#C2185B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Título - responsive */}
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-[#C2185B] flex-1 text-center truncate">
            💌 saborAMI
          </h1>

          {/* Info usuario - responsive */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Calendario - solo visible en desktop */}
            <div className="hidden lg:block text-right text-xs">
              <p className="font-medium text-gray-700">{fechaActual}</p>
              <p className="text-gray-500">{horaActual}</p>
            </div>

            {/* Selector de fondo */}
            <SelectorFondo 
              onFondoChange={handleFondoChange}
              fondoActual={fondoPersonalizado}
            />

            {/* Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C2185B] flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
              {userData?.username?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Nombre - oculto en móvil */}
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[80px] md:max-w-[120px]">
                {userData?.username || user?.displayName || 'Usuario'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Menú lateral con botón de cierre */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div 
          className={`absolute left-0 top-0 h-full w-64 sm:w-72 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 transform ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6">
            {/* Header del menú con botón de cierre */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#C2185B] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {userData?.username?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {userData?.username || user?.displayName || 'Usuario'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              
              {/* Botón de cerrar (X) */}
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0"
                aria-label="Cerrar menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1">
              <button 
                onClick={() => { setVistaActiva('inbox'); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                  vistaActiva === 'inbox' ? 'bg-[#C2185B] text-white' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">📬</span> Bandeja de entrada
              </button>
              <button 
                onClick={() => { setMostrarModal(true); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">✉️</span> Redactar carta
              </button>
              <button 
                onClick={() => { setVistaActiva('enviados'); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                  vistaActiva === 'enviados' ? 'bg-[#C2185B] text-white' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">📤</span> Enviados
              </button>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 text-gray-600">
                <span className="text-xl">⚙️</span> Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal responsivo */}
      <main className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Botón Redactar */}
        <div className="mb-4 sm:mb-6">
          <button 
            onClick={() => setMostrarModal(true)}
            className="w-full sm:w-auto bg-[#C2185B] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#A0154A] transition-colors shadow-md flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <span className="text-lg sm:text-xl">✉️</span> Redactar nueva carta
          </button>
        </div>

        {/* 1. SELECTOR DE SOBRES - VISIBLE EN LA PÁGINA PRINCIPAL */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">💌 Elige el diseño de tu sobre</h3>
          <SelectorSobresCarrusel
            sobres={sobresDisponibles}
            onSeleccionar={(sobre) => {
              setSobreSeleccionado(sobre);
            }}
            seleccionado={sobreSeleccionado}
          />
        </div>

        {/* 2. CARRUSEL DE CARTAS RECIBIDAS/ENVIADAS */}
        {cartasFiltradas.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {vistaActiva === 'inbox' ? '📬 Tus cartas recibidas' : '📤 Tus cartas enviadas'}
            </h3>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <CarruselCartas 
                cartas={cartasFiltradas} 
                onSeleccionarCarta={handleAbrirCarta}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 text-sm sm:text-base">
              {vistaActiva === 'inbox' 
                ? 'No tienes cartas en tu bandeja de entrada' 
                : 'No has enviado cartas aún'}
            </p>
          </div>
        )}

        {/* Versión en lista (opcional) - se muestra en pantallas grandes */}
        <div className="mt-8 hidden md:block">
          <details className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700">
              📋 Ver lista de cartas
            </summary>
            <div className="divide-y divide-gray-200">
              {cartasFiltradas.map((carta) => (
                <div 
                  key={carta.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !carta.leida && vistaActiva === 'inbox' ? 'bg-blue-50/70' : ''
                  }`}
                  onClick={() => handleAbrirCarta(carta)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!carta.leida && vistaActiva === 'inbox' && (
                          <span className="w-2 h-2 rounded-full bg-[#C2185B] flex-shrink-0"></span>
                        )}
                        <p className={`font-medium truncate ${!carta.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                          {vistaActiva === 'inbox' ? carta.remitenteNombre : carta.destinatarioEmail}
                        </p>
                      </div>
                      <p className="text-sm truncate text-gray-500">{carta.asunto}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-400">{formatearFecha(carta.fecha)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </main>

      {/* Modal para redactar carta */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#C2185B]">✉️ Redactar carta</h2>
                <button 
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {mensajeError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  ⚠️ {mensajeError}
                </div>
              )}

              {mensajeExito && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                  ✅ {mensajeExito}
                </div>
              )}

              <form onSubmit={handleEnviarCarta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinatario (email)
                  </label>
                  <input
                    type="email"
                    value={nuevaCarta.destinatarioEmail}
                    onChange={(e) => setNuevaCarta({...nuevaCarta, destinatarioEmail: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] text-sm"
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={nuevaCarta.asunto}
                    onChange={(e) => setNuevaCarta({...nuevaCarta, asunto: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] text-sm"
                    placeholder="Asunto de la carta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    value={nuevaCarta.contenido}
                    onChange={(e) => setNuevaCarta({...nuevaCarta, contenido: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] text-sm min-h-[120px] sm:min-h-[150px]"
                    placeholder="Escribe tu carta aquí..."
                    required
                  />
                </div>

                {/* INDICADOR DEL SOBRE SELECCIONADO (Solo información, sin botón de cambiar) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobre para la carta 💌
                  </label>
                  {sobreSeleccionado ? (
                    <div className="flex items-center gap-3 p-3 bg-[#C2185B]/10 rounded-lg border border-[#C2185B]/20">
                      <div 
                        className="w-8 h-8 rounded-full" 
                        style={{ backgroundColor: sobreSeleccionado.color }}
                      />
                      <span className="font-medium">{sobreSeleccionado.nombre}</span>
                      <span className="text-xs text-gray-500 ml-auto">(Seleccionado en el carrusel)</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                      ⚠️ No has seleccionado ningún sobre en el carrusel principal.
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 bg-[#C2185B] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#A0154A] transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {enviando ? 'Enviando...' : '📤 Enviar carta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 sm:flex-none bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver la carta */}
      {mostrarCarta && cartaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-transparent w-full max-w-md">
            <CartaVisual
              remitente={cartaSeleccionada.remitenteNombre}
              asunto={cartaSeleccionada.asunto}
              contenido={cartaSeleccionada.contenido}
              fecha={formatearFecha(cartaSeleccionada.fecha)}
              diseñoSobre={cartaSeleccionada.diseñoSobre || 'classic'}
              colorSobre={cartaSeleccionada.colorSobre || '#C2185B'}
              onCerrar={handleCerrarCarta}
            />
          </div>
        </div>
      )}
    </div>
  );
}