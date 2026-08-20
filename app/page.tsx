'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { setCookie } from 'cookies-next';
import { UserData } from '@/lib/types';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 INICIO DE SESIÓN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuario logueado:', userCredential.user);

        // Guardar cookie de sesión
        const idToken = await userCredential.user.getIdToken();
        setCookie('__session', idToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        router.push('/iniciosaborami');
      } else {
        // 📝 REGISTRO
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: username
        });

        const userData: UserData = {
          username: username,
          email: email,
          phone: phone,
          createdAt: new Date().toISOString(),
          uid: user.uid
        };

        await setDoc(doc(db, 'usuarios', user.uid), userData);

        console.log('Usuario registrado:', user);

        // Guardar cookie de sesión
        const idToken = await user.getIdToken();
        setCookie('__session', idToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        router.push('/iniciosaborami');
      }
    } catch (err: unknown) {
      console.error('Error:', err);

      if (err && typeof err === 'object' && 'code' in err) {
        const errorCode = err.code as string;
        switch (errorCode) {
          case 'auth/email-already-in-use':
            setError('Este correo ya está registrado');
            break;
          case 'auth/invalid-email':
            setError('Correo electrónico inválido');
            break;
          case 'auth/weak-password':
            setError('La contraseña debe tener al menos 6 caracteres');
            break;
          case 'auth/user-not-found':
            setError('Usuario no encontrado');
            break;
          case 'auth/wrong-password':
            setError('Contraseña incorrecta');
            break;
          default:
            setError('Ocurrió un error. Intenta de nuevo');
        }
      } else {
        setError('Ocurrió un error. Intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        // ✅ Imagen de fondo igual que en la página principal
        backgroundImage: 'url("/fondos/fondosaborami.jpg")',
        // Color de respaldo por si la imagen no carga
        backgroundColor: '#006572',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay con opacidad reducida para que se vea mejor la imagen */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-2">
            <span>💌 saborAMI</span>
          </h1>
          <p className="text-white/90 mt-2 drop-shadow">
            {isLogin ? 'Bienvenido de vuelta' : 'Únete a nuestra comunidad de cartas'}
          </p>
        </div>
        {/* Card del formulario */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8">
          {/* Toggle entre Login y Registro */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-md transition-all duration-300 font-medium text-sm sm:text-base ${
                isLogin
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#C2185B]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-md transition-all duration-300 font-medium text-sm sm:text-base ${
                !isLogin
                  ? 'bg-[#C2185B] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#C2185B]'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Campos adicionales para registro */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="Nombre de usuario"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="+56 9 1234 5678"
                    required
                  />
                </div>
              </>
            )}

            {/* Campo de contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Botón de enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C2185B] text-white py-3 rounded-lg font-semibold hover:bg-[#A0154A] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Cargando...
                </span>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Registrarme'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/95 text-gray-500">o continúa con</span>
            </div>
          </div>

          {/* Botones de redes sociales */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
              <span className="text-xl mr-2">🐦</span> Twitter
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
              <span className="text-xl mr-2">🔵</span> Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-xs sm:text-sm mt-6 drop-shadow">
          Al registrarte aceptas nuestros Términos y Condiciones
        </p>
      </div>
    </div>
  );
}