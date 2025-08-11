import React from 'react'
import { Link } from 'react-router-dom'
import LayoutWithSidebar from '../components/LayoutWithSidebar.jsx'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import RecentChainsSection from '../components/RecentChainsSection.jsx'
import { llmClips, notionTutorialClips, chainMetadata } from '../data/exampleClips.js'

const Home = () => {
  return (
    <LayoutWithSidebar>
      <div className="min-h-full bg-gradient-to-br from-primary-50 to-white">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Clipchain Examples */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Step 1. See clipchain in action
                </h2>
                <p className="text-gray-600 mb-8 text-sm">
                  Here you can see some examples of how Clipchain works. Each box below contains a curated collection of video clips that you can browse and play through.
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
                  <ClipchainPlayer 
                    id="notion-tutorial"
                    title="Master Notion Basics"
                    description="Learn how to use Notion effectively with clips from different tutorials combined in one place"
                    clips={notionTutorialClips}
                    author={chainMetadata['notion-tutorial'].author}
                    createdAt={chainMetadata['notion-tutorial'].createdAt}
                    tags={chainMetadata['notion-tutorial'].tags}
                  />
                </div>
                
                {/* Library Link */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link 
                    to="/library" 
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline text-lg"
                  >
                    <span>Explore more clipchains in our public Library</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
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
