import React from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import RecentChainsSection from '../components/RecentChainsSection.jsx'
import { llmClips, chainMetadata } from '../data/exampleClips.js'
import { useAuth } from '../contexts/AuthContext.jsx'
const Home = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  
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
                    Experience how Clipchain works with this interactive example. Select any clip to see the content and navigate through the chain.
                  </p>
                </div>
                
                <div className="space-y-8">
                  <ClipchainPlayer 
                    id="llm-tutorial"
                    title="Learn about LLMs"
                    description="A collection of key concepts about Large Language Models"
                    clips={llmClips}
                    author={chainMetadata['llm-tutorial'].author}
                    createdAt={chainMetadata['llm-tutorial'].createdAt}
                    tags={chainMetadata['llm-tutorial'].tags}
                  />
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
