import React from 'react'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import GettingStartedSection from '../components/GettingStartedSection.jsx'
import { llmClips, notionTutorialClips, chainMetadata } from '../data/exampleClips.js'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Clipchain Examples */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                See Clipchain in Action
              </h2>
              <p className="text-gray-600 mb-6">
                Here you can see some examples of how Clipchain works. Each box below contains a curated collection of video clips that you can browse and play through.
              </p>
              
              <div className="space-y-6">
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
            </div>
          </div>
          
          {/* Right Column - Getting Started Section */}
          <div className="order-1 lg:order-2">
            <GettingStartedSection />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
