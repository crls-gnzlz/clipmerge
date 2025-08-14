import React from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import RecentChainsSection from '../components/RecentChainsSection.jsx'
import { llmClips, chainMetadata } from '../data/exampleClips.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Debug Info - Temporary */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔍 Debug: Auth Context Status</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>isAuthenticated: {isAuthenticated ? '✅ true' : '❌ false'}</p>
              <p>isLoading: {isLoading ? '🔄 true' : '⏸️ false'}</p>
              <p>User: {user ? `✅ ${user.username} (${user.email})` : '❌ null'}</p>
            </div>
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <img src="/logo-blue.svg" alt="Clipchain" className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-light text-gray-900">
                Welcome to Clipchain
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Organize, curate, and share your favorite video moments with intelligent clip chains
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Clipchain Examples */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md hover:border-gray-200 transition-all duration-300">
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
                <GettingStartedSection />
                <RecentChainsSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

export default Home
