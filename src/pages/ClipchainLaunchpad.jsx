import React from 'react'
import { useParams, Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import Footer from '../components/Footer.jsx'
import { llmClips, notionTutorialClips, chainMetadata } from '../data/exampleClips.js'

const ClipchainLaunchpad = () => {
  const { chainId } = useParams()
  
  // Mock data - in a real app, this would fetch from an API based on chainId
  const getClipchainData = (id) => {
    const clipchains = {
      'llm-tutorial': {
        title: 'Learn about LLMs',
        description: 'A collection of key concepts about Large Language Models',
        clips: llmClips,
        author: chainMetadata['llm-tutorial'].author,
        createdAt: chainMetadata['llm-tutorial'].createdAt,
        tags: chainMetadata['llm-tutorial'].tags
      },
      'notion-tutorial': {
        title: 'Master Notion Basics',
        description: 'Learn how to use Notion effectively with clips from different tutorials combined in one place',
        clips: notionTutorialClips,
        author: chainMetadata['notion-tutorial'].author,
        createdAt: chainMetadata['notion-tutorial'].createdAt,
        tags: chainMetadata['notion-tutorial'].tags
      }
    }
    
    return clipchains[id] || null
  }
  
  const clipchainData = getClipchainData(chainId)
  
  if (!clipchainData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Clipchain not found</h1>
          <p className="text-gray-600">The clipchain you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo and Tagline */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-left">
            <div className="flex justify-start mb-1">
              <img src="/logo2.svg" alt="Clipchain" className="h-6 w-auto" />
            </div>
            <h1 className="text-xs font-medium text-gray-700 leading-tight">
              Turn video moments into powerful collections
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Clipchain Player */}
          <div className="mb-12">
            <ClipchainPlayer
              id={chainId}
              title={clipchainData.title}
              description={clipchainData.description}
              clips={clipchainData.clips}
              author={clipchainData.author}
              createdAt={clipchainData.createdAt}
              tags={clipchainData.tags}
            />
          </div>
          
          {/* Library Section */}
          <div className="text-center">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Discover more clipchains
                  </h2>
                  <p className="text-gray-600">
                    Explore our library of curated video collections created by the community
                  </p>
                </div>
                
                <Link 
                  to="/library" 
                  className="text-secondary-950 hover:text-secondary-700 font-medium transition-colors duration-200 ml-6 hover:underline"
                >
                  Browse Library
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ClipchainLaunchpad
