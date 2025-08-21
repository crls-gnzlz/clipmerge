import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import RecentChainsSection from '../components/RecentChainsSection.jsx'
import apiService from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const Home = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [superadminChain, setSuperadminChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ID del chain del superadmin que queremos mostrar
  const SUPERADMIN_CHAIN_ID = '68a6d7cf8901a29893fd24c4';

  // Cargar el chain del superadmin
  useEffect(() => {
    const loadSuperadminChain = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔗 Loading superadmin chain with ID:', SUPERADMIN_CHAIN_ID);
        const data = await apiService.getChainById(SUPERADMIN_CHAIN_ID);
        // Si la respuesta viene como { success, data }, extrae data
        const chain = data && data.data ? data.data : data;
        console.log('🔗 Superadmin chain loaded:', chain);
        setSuperadminChain(chain);
      } catch (err) {
        console.error('❌ Error loading superadmin chain:', err);
        setError('Could not load demo clipchain');
      } finally {
        setLoading(false);
      }
    };

    loadSuperadminChain();
  }, []);

  // Utilidad para extraer videoId de una URL de YouTube (igual que en Launchpad)
  const extractYouTubeVideoId = (url) => {
    if (!url) return '';
    const regex = /(?:v=|youtu.be\/|embed\/|\/v\/|\/e\/|watch\?v=|\&v=)([\w-]{8,})/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];
    // Fallback: try to get last part after /
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  // Transform clips: [{clip: {...}, order, ...}] => [{...clip, order, ...}] (igual que en Launchpad)
  const flatClips = superadminChain && Array.isArray(superadminChain.clips)
    ? superadminChain.clips
        .filter(c => c.clip)
        .sort((a, b) => a.order - b.order)
        .map(c => {
          const clip = { ...c.clip, order: c.order, transition: c.transition, transitionDuration: c.transitionDuration };
          if (!clip.videoId && clip.videoUrl) {
            clip.videoId = extractYouTubeVideoId(clip.videoUrl);
          }
          return clip;
        })
    : [];

  // Logs de depuración para los clips
  useEffect(() => {
    if (superadminChain) {
      console.log('🔗 Superadmin chain clips (raw):', superadminChain.clips);
      console.log('🔗 Flat clips (transformed):', flatClips);
      flatClips.forEach((clip, idx) => {
        console.log(`🔗 Clip[${idx}] videoUrl:`, clip.videoUrl, 'videoId:', clip.videoId);
      });
    }
  }, [superadminChain, flatClips]);
  
  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-white">

        
        {/* Welcome Message */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/logo-blue.svg" alt="Clipchain" className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-light text-gray-900">
                Welcome to Clipchain
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Organize and share your favorite video moments with powerful clip collections
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Clipchain Examples */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300">
                <div className="mb-8">
                  <h2 className="text-xl font-medium text-gray-900 mb-3">
                    See Clipchain in action
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Experience how Clipchain works with this real clipchain example. This is the actual chain that you can interact with to consume the different clips designed to explain specific content moments.
                  </p>
                </div>
                
                {/* Superadmin Clipchain Demo - Clipchain real que se puede manipular */}
                <div className="space-y-8">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading demo clipchain...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Demo Clipchain Unavailable</h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <Link 
                        to={`/chain/${SUPERADMIN_CHAIN_ID}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Chain Launchpad
                      </Link>
                    </div>
                  ) : superadminChain ? (
                    <>
                      <ClipchainPlayer 
                        id={SUPERADMIN_CHAIN_ID}
                        title={superadminChain.title}
                        description={superadminChain.description}
                        clips={flatClips}
                        author={superadminChain.author}
                        createdAt={superadminChain.createdAt}
                        tags={superadminChain.tags}
                      />
                      
                      {/* Link to full chain page */}
                      <div className="text-center">
                        <Link 
                          to={`/chain/${SUPERADMIN_CHAIN_ID}`}
                          className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all duration-200 text-sm font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Chain Launchpad
                        </Link>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Right Column - Getting Started Section + Recent Chains */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                {isAuthenticated && user && user.onboardingCompleted !== true && (
                  <GettingStartedSection user={user} updateUser={updateUser} />
                )}
                <RecentChainsSection />
                {/* Tutoriales - Bloque de acceso a vídeos */}
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Tutorials</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <a
                      href="#"
                      className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 group"
                      tabIndex={0}
                    >
                      <span className="flex-shrink-0 w-10 h-10 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary-500 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                          <rect width="20" height="14" x="2" y="5" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">How to embed my clipchain in an external web or blog</h3>
                        <p className="text-xs text-gray-600 font-light">Learn how to integrate your clipchains into your own website or blog with a simple embed.</p>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 group"
                      tabIndex={0}
                    >
                      <span className="flex-shrink-0 w-10 h-10 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary-500 group-hover:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" />
                          <rect width="20" height="14" x="2" y="5" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">How to create my own content web with clipchains</h3>
                        <p className="text-xs text-gray-600 font-light">Discover how to build a personal content site powered by your curated clip collections.</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

export default Home
