import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api.js';

const ApiTest = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('demo123');
  const [loginResult, setLoginResult] = useState(null);
  const [chainsResult, setChainsResult] = useState(null);
  const [profileResult, setProfileResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setLoginResult(null);
      
      const result = await login({ username, password });
      
      if (result.success) {
        // Use the user data returned from login function
        const userData = result.user;
        setLoginResult({
          success: true,
          message: 'Login exitoso',
          user: userData
        });
        
        // Also verify the token status after login
        console.log('🔍 Post-login token verification:');
        console.log('  - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
        console.log('  - localStorage authToken:', localStorage.getItem('authToken') ? 'Presente' : 'Ausente');
        
      } else {
        setLoginResult({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      setLoginResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setLoginResult(null);
      
      console.log('🚀 Starting user registration...');
      
      const userData = {
        username: 'test_user',
        email: 'test@clipchain.com',
        password: 'test123',
        displayName: 'Test User'
      };
      
      console.log('📝 User data for registration:', userData);
      
      const result = await register(userData);
      console.log('📝 Registration result:', result);
      
      if (result.success) {
        setLoginResult({
          success: true,
          message: 'Usuario registrado exitosamente',
          user: result.user
        });
        
        console.log('✅ Registration successful, attempting auto-login...');
        
        // Auto-login after successful registration
        const loginResult = await login({ username: 'test_user', password: 'test123' });
        console.log('🔐 Auto-login result:', loginResult);
        
        if (loginResult.success) {
          setLoginResult({
            success: true,
            message: 'Usuario registrado y logueado exitosamente',
            user: loginResult.user
          });
        } else {
          setLoginResult({
            success: false,
            message: `Registro exitoso pero login falló: ${loginResult.error}`
          });
        }
        
      } else {
        setLoginResult({
          success: false,
          message: `Error en registro: ${result.error}`
        });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setLoginResult({
        success: false,
        message: `Error en registro: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCreatorUser = async () => {
    try {
      setLoading(true);
      setLoginResult(null);
      
      console.log('🎨 Starting creator_user creation...');
      
      const userData = {
        username: 'creator_user',
        email: 'creator@clipchain.com',
        password: 'creator123',
        displayName: 'Content Creator',
        bio: 'Professional content creator for testing'
      };
      
      console.log('🎨 User data for creator_user:', userData);
      
      const result = await register(userData);
      console.log('🎨 Creator user registration result:', result);
      
      if (result.success) {
        setLoginResult({
          success: true,
          message: 'creator_user creado exitosamente',
          user: result.user
        });
        
        console.log('✅ Creator user created, attempting auto-login...');
        
        // Auto-login after successful registration
        const loginResult = await login({ username: 'creator_user', password: 'creator123' });
        console.log('🔐 Creator user auto-login result:', loginResult);
        
        if (loginResult.success) {
          setLoginResult({
            success: true,
            message: 'creator_user creado y logueado exitosamente',
            user: loginResult.user
          });
        } else {
          setLoginResult({
            success: false,
            message: `Registro exitoso pero login falló: ${loginResult.error}`
          });
        }
        
      } else {
        setLoginResult({
          success: false,
          message: `Error creando creator_user: ${result.error}`
        });
      }
    } catch (error) {
      console.error('❌ Creator user creation error:', error);
      setLoginResult({
        success: false,
        message: `Error creando creator_user: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLoginResult(null);
      setChainsResult(null);
      setProfileResult(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const getUserChains = async () => {
    try {
      setLoading(true);
      setChainsResult(null);
      
      // Debug: Verificar estado del token antes de la request
      console.log('🔍 Pre-request token verification:');
      console.log('  - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
      console.log('  - localStorage authToken:', localStorage.getItem('authToken') ? 'Presente' : 'Ausente');
      
      const response = await apiService.getUserChains();
      console.log('🔍 API Response for getUserChains:', response);
      
      setChainsResult({
        success: true,
        message: 'Chains del usuario obtenidas',
        data: response
      });
    } catch (error) {
      console.error('🔍 Error getting user chains:', error);
      setChainsResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar el estado de la base de datos
  const checkDatabaseStatus = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Checking database status...');
      
      // Verificar chains generales
      const allChainsResponse = await apiService.getChains({ limit: 10 });
      console.log('🔍 All chains response:', allChainsResponse);
      
      // Verificar clips generales
      const allClipsResponse = await apiService.getClips({ limit: 10 });
      console.log('🔍 All clips response:', allClipsResponse);
      
      // Verificar chains del usuario si está autenticado
      let userChainsResponse = null;
      let userChainsError = null;
      if (isAuthenticated) {
        try {
          userChainsResponse = await apiService.getUserChains();
          console.log('🔍 User chains response:', userChainsResponse);
        } catch (error) {
          console.log('🔍 Error getting user chains:', error.message);
          userChainsError = error.message;
        }
      }
      
      const statusMessage = `
🔍 ESTADO DE LA BASE DE DATOS

📊 DATOS GENERALES:
• Total Chains: ${allChainsResponse.data?.length || 0}
• Total Clips: ${allClipsResponse.data?.length || 0}

👤 ESTADO DEL USUARIO:
• Autenticado: ${isAuthenticated ? 'SÍ' : 'NO'}
• Token Presente: ${apiService.token ? 'SÍ' : 'NO'}
• Usuario: ${user ? user.username : 'No establecido'}

🔗 CHAINS DEL USUARIO:
• ${isAuthenticated ? (userChainsResponse?.data?.length || 0) : 'N/A (no autenticado)'} chains encontradas
• ${userChainsError ? `Error: ${userChainsError}` : 'Consulta exitosa'}

💡 RECOMENDACIONES:
${allChainsResponse.data?.length === 0 ? '• La base de datos parece estar vacía. Ejecuta el script de setup.' : ''}
${!isAuthenticated ? '• Haz login para ver tus chains específicas.' : ''}
${isAuthenticated && userChainsResponse?.data?.length === 0 ? '• El usuario no tiene chains asociadas.' : ''}
      `.trim();
      
      alert(statusMessage);
      
    } catch (error) {
      console.error('🔍 Error checking database status:', error);
      alert(`❌ Error verificando la base de datos:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllChains = async () => {
    try {
      setLoading(true);
      setChainsResult(null);
      
      const response = await apiService.getChains({ limit: 5 });
      setChainsResult({
        success: true,
        message: 'Todas las chains obtenidas',
        data: response
      });
    } catch (error) {
      setChainsResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    try {
      setLoading(true);
      setProfileResult(null);
      
      // Debug: Verificar estado del token
      console.log('🔍 Debug - Token en apiService:', apiService.token);
      console.log('🔍 Debug - Usuario autenticado:', isAuthenticated);
      console.log('🔍 Debug - Usuario actual:', user);
      
      const response = await apiService.getProfile();
      setProfileResult({
        success: true,
        message: 'Perfil del usuario obtenido',
        data: response
      });
    } catch (error) {
      setProfileResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar completamente la autenticación
  const clearAllAuth = () => {
    try {
      // Limpiar apiService
      apiService.clearAuth();
      
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Limpiar estado local
      setLoginResult(null);
      setChainsResult(null);
      setProfileResult(null);
      
      // Forzar logout en AuthContext
      logout();
      
      console.log('🧹 Autenticación completamente limpiada');
      alert('✅ Autenticación completamente limpiada. localStorage y tokens eliminados.');
      
    } catch (error) {
      console.error('Error limpiando autenticación:', error);
      alert('❌ Error limpiando autenticación');
    }
  };

  // Función para verificar el estado del token
  const checkTokenStatus = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const apiTokenStatus = apiService.getTokenStatus();
    
    console.log('🔍 Token Status Check:');
    console.log('  - localStorage authToken:', token ? 'Presente' : 'Ausente');
    console.log('  - localStorage user:', userData ? 'Presente' : 'Ausente');
    console.log('  - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
    console.log('  - apiService.getTokenStatus():', apiTokenStatus);
    console.log('  - AuthContext isAuthenticated:', isAuthenticated);
    console.log('  - AuthContext user:', user);
    
    alert(`Token Status:\n- localStorage authToken: ${token ? 'Presente' : 'Ausente'}\n- apiService.token: ${apiService.token ? 'Presente' : 'Ausente'}\n- apiService.hasToken: ${apiTokenStatus.hasToken}\n- isAuthenticated: ${isAuthenticated}`);
  };

  // Función para forzar la sincronización del token
  const syncToken = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiService.setToken(token);
      console.log('🔄 Token sincronizado desde localStorage');
      alert('Token sincronizado desde localStorage');
    } else {
      alert('No hay token en localStorage');
    }
  };

  // Función para verificar la consistencia del token
  const checkTokenConsistency = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Checking token consistency...');
      console.log('  - localStorage authToken:', token ? 'Presente' : 'Ausente');
      console.log('  - localStorage user:', userData ? 'Presente' : 'Ausente');
      console.log('  - apiService.token:', apiService.token ? 'Presente' : 'Ausente');
      
      if (!token || !userData) {
        alert('❌ No hay datos de autenticación en localStorage');
        return;
      }
      
      // Try to get user profile to verify token is still valid
      try {
        const profileResponse = await apiService.getProfile();
        console.log('✅ Token is valid, user profile:', profileResponse);
        
        alert(`✅ Token válido!\nUsuario: ${profileResponse.data.username}\nToken: Activo`);
        
      } catch (error) {
        console.log('❌ Token validation failed:', error.message);
        
        if (error.message.includes('Authentication required') || error.message.includes('401')) {
          alert('❌ Token obsoleto o inválido!\n\nRecomendación: Usar "Limpiar Autenticación" y hacer login nuevamente.');
        } else {
          alert(`❌ Error validando token: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.error('🔍 Error checking token consistency:', error);
      alert(`❌ Error verificando consistencia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const ResultDisplay = ({ result, title }) => {
    if (!result) return null;
    
    return (
      <div className={`mt-4 p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <h4 className="font-semibold mb-2">{title}</h4>
        <p className="mb-2">{result.message}</p>
        <pre className="text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-60">
          {JSON.stringify(result.data || result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Test de API - User Chains
          </h1>
          <p className="text-xl text-gray-600">
            Prueba la funcionalidad de chains del usuario logueado
          </p>
        </div>

        {/* Login Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isAuthenticated ? '✅ Usuario Autenticado' : '🔐 Login de Usuario'}
          </h2>
          
          {/* Status Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Estado Actual</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Autenticado: <span className={isAuthenticated ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isAuthenticated ? 'Sí' : 'No'}</span></div>
              <div>Token: <span className={apiService.token ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{apiService.token ? 'Presente' : 'Ausente'}</span></div>
              <div>Usuario: <span className={user ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{user ? user.username : 'No establecido'}</span></div>
              <div>localStorage: <span className={localStorage.getItem('authToken') ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{localStorage.getItem('authToken') ? 'Con datos' : 'Vacío'}</span></div>
            </div>
          </div>
          
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="demo_user"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="demo123"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  {loading ? '🔄 Conectando...' : '🔐 Login'}
                </button>
                <button
                  onClick={() => setShowRegister(!showRegister)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {showRegister ? '🔒 Solo Login' : '📝 Crear Usuario'}
                </button>
              </div>
              
              {/* Registration Form */}
              {showRegister && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">📝 Crear Usuario de Prueba</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Esto creará un usuario con credenciales conocidas usando la API del backend.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {loading ? '🔄 Creando...' : '🚀 Crear test_user / test123'}
                    </button>
                    <button
                      onClick={handleCreateCreatorUser}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {loading ? '🔄 Creando...' : '🎨 Crear creator_user / creator123'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.displayName || user?.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{user?.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          )}
          
          <ResultDisplay result={loginResult} title="Resultado del Login" />
          
          {/* Post-login verification */}
          {loginResult?.success && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔍 Verificación Post-Login</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={checkTokenStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Verificar Estado del Token
                </button>
                <button
                  onClick={syncToken}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Sincronizar Token
                </button>
              </div>
            </div>
          )}
        </div>

        {/* API Testing Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Obtener Chains del Usuario
            </h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={getUserChains}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                👤 Obtener Mis Chains
              </button>
              <button
                onClick={getAllChains}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🌐 Obtener Todas las Chains
              </button>
              <button
                onClick={checkDatabaseStatus}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                💾 Verificar Estado de la Base de Datos
              </button>
            </div>
            <ResultDisplay result={chainsResult} title="Resultado de Chains" />
          </div>
        )}

        {/* Profile Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Información del Usuario
            </h2>
            <button
              onClick={getUserProfile}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-4"
            >
              👤 Obtener Perfil
            </button>
            <ResultDisplay result={profileResult} title="Resultado del Perfil" />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            📋 Instrucciones de Uso
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 mb-4">
            <li>Haz login con las credenciales de prueba (demo_user / demo123)</li>
            <li>Prueba obtener tus chains usando "Obtener Mis Chains"</li>
            <li>Compara con "Obtener Todas las Chains" para ver la diferencia</li>
            <li>Obtén tu perfil de usuario para verificar la autenticación</li>
          </ol>
          
          {/* Database Status Check - Always Available */}
          <div className="border-t border-blue-200 pt-4">
            <h4 className="text-md font-medium text-blue-800 mb-3">💾 Estado de la Base de Datos</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={checkDatabaseStatus}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                🔍 Verificar Estado de la Base de Datos
              </button>
            </div>
          </div>
          
          {/* Debug Tools - Only when authenticated */}
          {isAuthenticated && (
            <div className="border-t border-blue-200 pt-4 mt-4">
              <h4 className="text-md font-medium text-blue-800 mb-3">🔧 Herramientas de Depuración</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={checkTokenStatus}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  🔍 Verificar Token
                </button>
                <button
                  onClick={syncToken}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  🔄 Sincronizar Token
                </button>
                <button
                  onClick={clearAllAuth}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  🧹 Limpiar Autenticación
                </button>
              </div>
            </div>
          )}
          
          {/* Always Available Tools */}
          <div className="border-t border-blue-200 pt-4 mt-4">
            <h4 className="text-md font-medium text-blue-800 mb-3">🛠️ Herramientas de Mantenimiento</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={checkTokenStatus}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                🔍 Verificar Estado del Token
              </button>
              <button
                onClick={checkTokenConsistency}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                🔍 Verificar Consistencia del Token
              </button>
              <button
                onClick={clearAllAuth}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
              >
                🧹 Limpiar Autenticación (Siempre Disponible)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
