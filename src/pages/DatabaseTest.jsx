import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api.js';

const DatabaseTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [chains, setChains] = useState([]);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chains');
  const [showUserChainsOnly, setShowUserChainsOnly] = useState(true);

  useEffect(() => {
    loadData();
  }, [showUserChainsOnly, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar chains y clips en paralelo
      let chainsResponse;
      
      if (showUserChainsOnly && isAuthenticated && user) {
        // Cargar chains del usuario logueado
        chainsResponse = await apiService.getUserChains();
      } else {
        // Cargar chains generales
        chainsResponse = await apiService.getChains({ limit: 20 });
      }

      const clipsResponse = await apiService.getClips({ limit: 20 });

      setChains(chainsResponse.data || []);
      setClips(clipsResponse.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const toggleUserChains = () => {
    setShowUserChainsOnly(!showUserChainsOnly);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos desde la base de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Conexión</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Prueba de Base de Datos
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Verificando la conexión entre Frontend, Backend y MongoDB
          </p>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    {user.displayName || user.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {showUserChainsOnly ? 'Mostrando solo tus chains' : 'Mostrando chains generales'}
                </p>
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {chains.length}
              </div>
              <div className="text-gray-600">
                {showUserChainsOnly && isAuthenticated ? 'Tus Chains' : 'Chains Encontradas'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {clips.length}
              </div>
              <div className="text-gray-600">Clips Encontrados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ✅
              </div>
              <div className="text-gray-600">Conexión Exitosa</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isAuthenticated && user && (
              <button
                onClick={toggleUserChains}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  showUserChainsOnly
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {showUserChainsOnly ? '🔍 Ver Chains Generales' : '👤 Ver Mis Chains'}
              </button>
            )}
            
            <button
              onClick={refreshData}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Actualizar Datos
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('chains')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chains'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chains ({chains.length})
                {showUserChainsOnly && isAuthenticated && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Mis Chains
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('clips')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Clips ({clips.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'chains' ? (
              <ChainsTab 
                chains={chains} 
                showUserChainsOnly={showUserChainsOnly}
                currentUser={user}
              />
            ) : (
              <ClipsTab clips={clips} />
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                Conexión a Base de Datos Exitosa
              </h3>
              <p className="text-green-700">
                El frontend se está comunicando correctamente con el backend y MongoDB.
                {showUserChainsOnly && isAuthenticated 
                  ? ` Se han cargado ${chains.length} de tus chains y ${clips.length} clips.`
                  : ` Se han cargado ${chains.length} chains y ${clips.length} clips.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar las Chains
const ChainsTab = ({ chains, showUserChainsOnly, currentUser }) => {
  if (chains.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {showUserChainsOnly ? 'No tienes Chains' : 'No hay Chains'}
        </h3>
        <p className="text-gray-500">
          {showUserChainsOnly 
            ? 'Aún no has creado ninguna chain. ¡Comienza creando tu primera chain!'
            : 'No se encontraron chains en la base de datos.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chains.map((chain) => (
        <div key={chain._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {chain.name}
                </h3>
                {showUserChainsOnly && currentUser && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Mi Chain
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">{chain.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {chain.tags && chain.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>📊 {chain.clips?.length || 0} clips</span>
                <span>⏱️ {chain.totalDuration || 0}s</span>
                <span>👁️ {chain.views || 0} vistas</span>
                <span>📅 {new Date(chain.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="ml-4 text-right">
              <div className="text-sm text-gray-500 mb-1">
                {chain.author?.username || 'Usuario'}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                chain.isPublic 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {chain.isPublic ? 'Público' : 'Privado'}
              </div>
              {chain.category && (
                <div className="mt-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {chain.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar los Clips
const ClipsTab = ({ clips }) => {
  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay Clips</h3>
        <p className="text-gray-500">No se encontraron clips en la base de datos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clips.map((clip) => (
        <div key={clip._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {clip.title}
              </h3>
              <p className="text-gray-600 mb-3">{clip.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {clip.tags && clip.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>⏱️ {clip.duration || 0}s</span>
                <span>👁️ {clip.views || 0} vistas</span>
                <span>❤️ {clip.likes || 0} likes</span>
                <span>📅 {new Date(clip.createdAt).toLocaleDateString()}</span>
              </div>

              {clip.videoId && (
                <div className="mt-3">
                  <span className="text-sm text-gray-500">Video ID: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {clip.videoId}
                  </code>
                </div>
              )}
            </div>
            
            <div className="ml-4 text-right">
              <div className="text-sm text-gray-500 mb-1">
                {clip.author?.username || 'Usuario'}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                clip.isPublic 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {clip.isPublic ? 'Público' : 'Privado'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DatabaseTest;
