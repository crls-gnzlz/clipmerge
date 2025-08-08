import React from 'react'
import { useParams } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import { llmClips, notionTutorialClips } from '../data/exampleClips.js'

const ClipchainLaunchpad = () => {
  const { chainId } = useParams()
  
  // Mock data - in a real app, this would fetch from an API based on chainId
  const getClipchainData = (id) => {
    const clipchains = {
      'llm-tutorial': {
        title: 'Learn about LLMs',
        description: 'A collection of key concepts about Large Language Models',
        clips: llmClips
      },
      'notion-tutorial': {
        title: 'Master Notion Basics',
        description: 'Learn how to use Notion effectively with clips from different tutorials combined in one place',
        clips: notionTutorialClips
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
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Clipchain Player */}
        <div className="mb-12">
          <ClipchainPlayer
            id={chainId}
            title={clipchainData.title}
            description={clipchainData.description}
            clips={clipchainData.clips}
          />
        </div>
        
        {/* Signup Section */}
        <div className="text-center">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create your own clipchains
            </h2>
            <p className="text-gray-600 mb-6">
              Join clipchain and start creating your own curated video collections
            </p>
            
            <div className="space-y-3">
              <button className="w-full bg-primary-950 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-900 transition-colors duration-200">
                Sign up for free
              </button>
              <button className="w-full bg-white text-primary-950 border border-primary-950 py-3 px-6 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200">
                Log in
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClipchainLaunchpad
