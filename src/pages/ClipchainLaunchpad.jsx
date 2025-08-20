import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import Footer from '../components/Footer.jsx'
import apiService from '../lib/api.js'

const ClipchainLaunchpad = () => {
  const { chainId } = useParams()
  const [clipchainData, setClipchainData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    apiService.getChainById(chainId)
      .then(data => {
        // Si la respuesta viene como { success, data }, extrae data
        const chain = data && data.data ? data.data : data;
        setClipchainData(chain)
        setLoading(false)
      })
      .catch(() => {
        setClipchainData(null)
        setError('Clipchain not found')
        setLoading(false)
      })
  }, [chainId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

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

  // Utilidad para extraer videoId de una URL de YouTube
  const extractYouTubeVideoId = (url) => {
    if (!url) return '';
    const regex = /(?:v=|youtu.be\/|embed\/|\/v\/|\/e\/|watch\?v=|\&v=)([\w-]{8,})/;
    const match = url.match(regex);
    if (match && match[1]) return match[1];
    // Fallback: try to get last part after /
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  // Transform clips: [{clip: {...}, order, ...}] => [{...clip, order, ...}]
  const flatClips = Array.isArray(clipchainData.clips)
    ? clipchainData.clips
        .filter(c => c.clip)
        .sort((a, b) => a.order - b.order)
        .map(c => {
          const clip = { ...c.clip, order: c.order, transition: c.transition, transitionDuration: c.transitionDuration };
          if (!clip.videoId && clip.videoUrl) {
            clip.videoId = extractYouTubeVideoId(clip.videoUrl);
          }
          return clip;
        })
    : []

  // LOGS DE DEPURACIÓN
  console.log('clipchainData.clips (raw):', clipchainData.clips)
  console.log('flatClips (transformados):', flatClips)
  flatClips.forEach((clip, idx) => {
    console.log(`Clip[${idx}] videoUrl:`, clip.videoUrl, 'videoId:', clip.videoId)
  })

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Título Launchpad */}
          <h1 className="text-2xl font-normal text-gray-900 text-left mb-10">Clipchain Launchpad</h1>
          {/* Clipchain Player */}
          <div className="mb-12">
            <ClipchainPlayer
              id={chainId}
              title={clipchainData.title}
              description={clipchainData.description}
              clips={flatClips}
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
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 ml-6 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50"
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
