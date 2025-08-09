import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import { llmClips, notionTutorialClips, chainMetadata } from '../data/exampleClips.js'

const EmbedPage = () => {
  const { chainId } = useParams()
  const [searchParams] = useSearchParams()
  const [chainData, setChainData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get URL parameters for player customization
  const autoplay = searchParams.get('autoplay') === '1'
  const theme = searchParams.get('theme') || 'default'

  useEffect(() => {
    const fetchChainData = async () => {
      try {
        setLoading(true)
        console.log('Fetching chain data for:', chainId)
        
        // Map chainId to appropriate clips and metadata
        let clips = []
        let metadata = {
          author: 'ClipChain User',
          createdAt: new Date().toISOString(),
          tags: ['embedded', 'clips']
        }
        
        if (chainId === 'llm-tutorial') {
          clips = llmClips
          metadata = chainMetadata['llm-tutorial']
        } else if (chainId === 'notion-tutorial') {
          clips = notionTutorialClips
          metadata = chainMetadata['notion-tutorial']
        } else {
          // Default to llm clips for unknown chainIds
          clips = llmClips
        }
        
        console.log('Selected clips:', clips)
        console.log('Selected metadata:', metadata)
        console.log('Clips length:', clips.length)
        console.log('First clip:', clips[0])
        
        const mockChainData = {
          id: chainId,
          title: `Clip Chain ${chainId}`,
          description: `An embedded clip chain with ID: ${chainId}`,
          clips: clips,
          author: metadata.author,
          createdAt: metadata.createdAt,
          tags: metadata.tags
        }
        
        console.log('Created chain data:', mockChainData)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setChainData(mockChainData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching chain data:', err)
        setError('Failed to load clip chain')
        setLoading(false)
      }
    }

    if (chainId) {
      fetchChainData()
    }
  }, [chainId])

  // Apply theme styles
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  console.log('EmbedPage render state:', { loading, error, chainData, chainId })
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading clip chain...</p>
        </div>
      </div>
    )
  }

  if (error || !chainData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Clip Chain Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The clip chain with ID "{chainId}" could not be found.
          </p>
        </div>
      </div>
    )
  }

  if (!chainData.clips || chainData.clips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Clips Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This clip chain has no clips to display.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {chainData.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {chainData.description}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            <p>Author: {chainData.author}</p>
            <p>Clips: {chainData.clips.length}</p>
            <p>Tags: {chainData.tags.join(', ')}</p>
          </div>
        </div>
        
        <ClipchainPlayer
          id={chainData.id}
          title={chainData.title}
          description={chainData.description}
          clips={chainData.clips}
          author={chainData.author}
          createdAt={chainData.createdAt}
          tags={chainData.tags}
        />
      </div>
    </div>
  )
}

export default EmbedPage
