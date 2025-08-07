import React, { useState, useRef } from 'react'

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const iframeRef = useRef(null)

  // Sample videos - you can replace these with actual video IDs
  const videos = [
    { id: 'dQw4w9WgXcQ', title: 'Sample Video 1' },
    { id: 'TNhaISOU2GU', title: 'Sample Video 2' },
    { id: 'jNQXAC9IVRw', title: 'Sample Video 3' }
  ]

  const currentVideo = videos[currentVideoIndex]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    setIsPlaying(true)
  }

  const previousVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)
    setIsPlaying(true)
  }

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        iframeRef.current.requestFullscreen()
      }
    }
  }

  const getEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900">{currentVideo.title}</h3>
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl(currentVideo.id)}
          title={currentVideo.title}
          className="w-full h-48 sm:h-56"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      
      <div className="flex items-center justify-center space-x-2 mt-3">
        <button
          onClick={previousVideo}
          className="p-2 text-gray-600 hover:text-primary-950 transition-colors"
          title="Previous video"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={togglePlay}
          className="p-2 bg-primary-950 text-white rounded-full hover:bg-primary-900 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={nextVideo}
          className="p-2 text-gray-600 hover:text-primary-950 transition-colors"
          title="Next video"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="p-2 text-gray-600 hover:text-primary-950 transition-colors ml-2"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentVideoIndex(index)
                setIsPlaying(true)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentVideoIndex ? 'bg-primary-950' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
