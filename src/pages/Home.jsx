import React from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import RecentChainsSection from '../components/RecentChainsSection.jsx'
import { llmClips, chainMetadata } from '../data/exampleClips.js'

const Home = () => {
  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gradient-to-br from-primary-50 to-white">
        {/* Welcome Message */}
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 pt-4 pb-2">
          <div className="flex items-center justify-center mb-1">
            <div className="flex items-center space-x-3">
              <img src="/logo-blue.svg" alt="Clipchain" className="h-7 w-7" />
              <h1 className="text-2xl font-semibold text-gray-800">
                Welcome to Clipchain!
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Clipchain Examples */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-4 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Step 1. See Clipchain in action
                </h2>
                <p className="text-gray-600 mb-8 text-sm">
                  Here you can see an example of how Clipchain works. Start selecting any clip to see the content.
                </p>
                
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
