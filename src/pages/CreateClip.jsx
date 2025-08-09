import React, { useState } from 'react'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import EmbedCodeGenerator from '../components/EmbedCodeGenerator.jsx'
import { llmClips, chainMetadata } from '../data/exampleClips.js'

const CreateClip = () => {
  const [mode, setMode] = useState('edit') // 'edit' or 'embed'
  
  // Example chain data for preview
  const exampleChain = {
    id: 'llm-tutorial',
    title: 'Learn about LLMs',
    description: 'A collection of key concepts about Large Language Models',
    clips: llmClips,
    author: chainMetadata['llm-tutorial'].author,
    createdAt: chainMetadata['llm-tutorial'].createdAt,
    tags: chainMetadata['llm-tutorial'].tags
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Clip</h1>
              <p className="text-gray-600 mt-2">
                {mode === 'edit' 
                  ? 'Create and edit your video clips' 
                  : 'Generate embed code for your Clipchain'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setMode('edit')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'edit'
                  ? 'bg-secondary-950 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Mode</span>
              </div>
            </button>
            <button
              onClick={() => setMode('embed')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'embed'
                  ? 'bg-secondary-950 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Embed Mode</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content based on mode */}
        {mode === 'edit' ? (
          /* Edit Mode */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Mode Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                This is where you'll be able to create and edit video clips. For now, you can use Embed Mode to generate embed codes for existing chains.
              </p>
              <button
                onClick={() => setMode('embed')}
                className="inline-flex items-center px-6 py-3 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-colors duration-200"
              >
                Try Embed Mode
              </button>
            </div>
          </div>
        ) : (
          /* Embed Mode */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left side - Live Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
                <p className="text-sm text-gray-600">
                  This is how your embedded Clipchain will look on external websites
                </p>
              </div>
              
              {/* Preview Container */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 ml-2">Preview - {exampleChain.title}</span>
                  </div>
                </div>
                <div className="p-4">
                  <ClipchainPlayer
                    id={exampleChain.id}
                    title={exampleChain.title}
                    description={exampleChain.description}
                    clips={exampleChain.clips}
                    author={exampleChain.author}
                    createdAt={exampleChain.createdAt}
                    tags={exampleChain.tags}
                  />
                </div>
              </div>
            </div>

            {/* Right side - Embed Code Generator */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <EmbedCodeGenerator 
                chainId={exampleChain.id}
                playerOptions={{
                  width: '640',
                  height: '360',
                  autoplay: false,
                  theme: 'default'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateClip


