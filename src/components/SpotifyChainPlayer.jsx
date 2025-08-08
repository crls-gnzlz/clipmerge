import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import CopyNotification from './CopyNotification.jsx'

const SpotifyChainPlayer = ({ title, description, clips, id, author, createdAt, tags, spotifyEpisodeId }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipIndex, setCurrentClipIndex] = useState(-1)
  const [currentTime, setCurrentTime] = useState(0)
  const [playerReady, setPlayerReady] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const iframeRef = useRef(null)
  
  const currentClip = currentClipIndex >= 0 && currentClipIndex < clips.length ? clips[currentClipIndex] : null

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    try {
      const roundedSeconds = Math.round(seconds)
      const mins = Math.floor(roundedSeconds / 60)
      const secs = roundedSeconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } catch (err) {
      return '00:00'
    }
  }

  // Function to seek to a specific clip
  const seekToClip = useCallback((clipIndex) => {
    try {
      if (clipIndex >= 0 && clipIndex < clips.length) {
        const clip = clips[clipIndex]
        setCurrentClipIndex(clipIndex)
        setCurrentTime(clip.startTime)
        setIsLoading(true)
        console.log(`Clip ${clipIndex + 1} selected: ${clip.title} at ${formatTime(clip.startTime)}`)
        
        // Recreate the iframe with the new timestamp
        if (iframeRef.current) {
          iframeRef.current.innerHTML = ''
          
          const iframe = document.createElement('iframe')
          iframe.width = '100%'
          iframe.height = '352'
          iframe.frameBorder = '0'
          iframe.allow = 'encrypted-media'
          iframe.title = 'Spotify Player'
          
          // Create Spotify embed URL with timestamp
          const baseUrl = `https://open.spotify.com/embed/episode/${spotifyEpisodeId}`
          const params = new URLSearchParams({
            'utm_source': 'generator',
            'theme': '0',
            't': clip.startTime.toString()
          })
          
          const spotifyUrl = `${baseUrl}?${params.toString()}`
          iframe.src = spotifyUrl
          
          iframeRef.current.appendChild(iframe)
          
          // Add event listener for iframe load
          iframe.onload = () => {
            console.log(`Spotify iframe loaded with timestamp: ${formatTime(clip.startTime)}`)
            setPlayerReady(true)
            setIsLoading(false)
          }
          
          iframe.onerror = () => {
            console.error('Failed to load Spotify iframe with timestamp')
            setPlayerReady(false)
            setIsLoading(false)
          }
        }
      }
    } catch (err) {
      console.error('Error seeking to clip:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }, [clips, spotifyEpisodeId])

  // Initialize Spotify iframe
  useEffect(() => {
    try {
      if (iframeRef.current) {
        iframeRef.current.innerHTML = ''
        
        const iframe = document.createElement('iframe')
        iframe.width = '100%'
        iframe.height = '352'
        iframe.frameBorder = '0'
        iframe.allow = 'encrypted-media'
        iframe.title = 'Spotify Player'
        
        // Create Spotify embed URL
        const baseUrl = `https://open.spotify.com/embed/episode/${spotifyEpisodeId}`
        const params = new URLSearchParams({
          'utm_source': 'generator',
          'theme': '0'
        })
        
        const spotifyUrl = `${baseUrl}?${params.toString()}`
        iframe.src = spotifyUrl
        
        iframeRef.current.appendChild(iframe)
        
        // Add event listener for iframe load
        iframe.onload = () => {
          console.log('Spotify iframe loaded successfully')
          setPlayerReady(true)
          setIsLoading(false)
        }
        
        iframe.onerror = () => {
          console.error('Failed to load Spotify iframe')
          setPlayerReady(false)
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('Error initializing Spotify iframe:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }, [spotifyEpisodeId])

  // Simulate time progress when playing
  useEffect(() => {
    let interval = null
    
    if (isPlaying && currentClip && currentTime < currentClip.endTime) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1
          if (newTime >= currentClip.endTime) {
            setIsPlaying(false)
            return currentClip.endTime
          }
          return newTime
        })
      }, 1000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying, currentClip, currentTime])

  const togglePlay = () => {
    try {
      if (!currentClip) {
        setCurrentClipIndex(0)
        return
      }
      
      // Since we can't control Spotify iframe directly, just log the action
      console.log('User should use Spotify controls directly')
      setIsPlaying(!isPlaying)
    } catch (err) {
      console.error('Error toggling play:', err)
      setError(err.message)
    }
  }

  const handleTimelineClick = (e) => {
    if (!currentClip || !iframeRef.current) return
    
    try {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      setCurrentTime(clampedTime)
      setIsLoading(true)
      console.log(`Seeking to time: ${formatTime(clampedTime)}`)

      // Recreate the iframe with the new timestamp
      if (iframeRef.current) {
        iframeRef.current.innerHTML = ''
        
        const iframe = document.createElement('iframe')
        iframe.width = '100%'
        iframe.height = '352'
        iframe.frameBorder = '0'
        iframe.allow = 'encrypted-media'
        iframe.title = 'Spotify Player'
        
        // Create Spotify embed URL with timestamp
        const baseUrl = `https://open.spotify.com/embed/episode/${spotifyEpisodeId}`
        const params = new URLSearchParams({
          'utm_source': 'generator',
          'theme': '0',
          't': Math.round(clampedTime).toString()
        })
        
        const spotifyUrl = `${baseUrl}?${params.toString()}`
        iframe.src = spotifyUrl
        
        iframeRef.current.appendChild(iframe)
        
        // Add event listener for iframe load
        iframe.onload = () => {
          console.log(`Spotify iframe loaded with timestamp: ${formatTime(clampedTime)}`)
          setPlayerReady(true)
          setIsLoading(false)
        }
        
        iframe.onerror = () => {
          console.error('Failed to load Spotify iframe with timestamp')
          setPlayerReady(false)
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('Error handling timeline click:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  const handleMouseDown = (e) => {
    // This function is needed for the timeline click handler to work
    // It can be empty as the click event is handled by handleTimelineClick
    handleTimelineClick(e)
  }

  const getProgressPercentage = () => {
    if (!currentClip) return 0
    const totalDuration = currentClip.endTime - currentClip.startTime
    const currentProgress = currentTime - currentClip.startTime
    const percentage = (currentProgress / totalDuration) * 100
    return Math.max(0, Math.min(100, percentage))
  }

  const getRemainingTime = () => {
    if (!currentClip) return 0
    const remaining = currentClip.endTime - currentTime
    return Math.max(0, remaining)
  }

  const nextClip = useCallback(() => {
    if (!clips || !clips.length) return
    const nextIndex = currentClipIndex < clips.length - 1 ? currentClipIndex + 1 : 0
    seekToClip(nextIndex)
  }, [clips, currentClipIndex, seekToClip])

  const previousClip = useCallback(() => {
    if (!clips || !clips.length) return
    const prevIndex = currentClipIndex > 0 ? currentClipIndex - 1 : clips.length - 1
    seekToClip(prevIndex)
  }, [clips, currentClipIndex, seekToClip])

  const copyLink = () => {
    try {
      const shareUrl = `${window.location.origin}/audio/${id}`
      navigator.clipboard.writeText(shareUrl)
      setShowCopyNotification(true)
    } catch (err) {
      console.error('Error copying link:', err)
      setError(err.message)
    }
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading Spotify player</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="bg-secondary-950 hover:bg-secondary-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <img src="/logo-blue.svg" alt="clipchain" className="h-5 brightness-110 filter group-hover:brightness-110 transition-all duration-300" />
        </div>
        
        {/* Right side - Copy Link */}
        <button
          onClick={copyLink}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-secondary-950 hover:text-white transition-all duration-200 hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm font-semibold">Copy link</span>
        </button>
      </div>

      {/* Title and Description */}
      <div className="px-3 pt-4 pb-2">
        <h2 
          className="text-xl font-bold text-gray-900 mb-1 cursor-help"
          title={tags && tags.length > 0 ? tags.join(', ') : ''}
        >
          {title}
        </h2>
        <div className="min-h-[3rem] flex flex-col justify-center">
          <p className="text-sm text-gray-600 mb-2">
            {description}
          </p>
          {(author || createdAt) && (
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {author && (
                <span className="hover:text-secondary-950 transition-colors">
                  By {author}
                </span>
              )}
              {author && createdAt && <span>•</span>}
              {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="px-3 pt-3 pb-3">
        {/* Clip information - moved above player like in ClipChainPlayer */}
        <div className="mb-2">
          {currentClip ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentClip.title}
              </h3>
              <p className="text-sm text-gray-500">
                {formatTime(currentClip.startTime)} - {formatTime(currentClip.endTime)} ({formatTime(currentClip.endTime - currentClip.startTime)} duration)
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400">Select a clip to start playing</p>
          )}
        </div>

        {/* Spotify Player */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-3">
          <div
            ref={iframeRef}
            className="w-full"
            style={{ height: '352px' }}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-white text-sm">Loading timestamp...</p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Timeline - similar to ClipChainPlayer */}
        <div className="space-y-2">
          {/* Custom Timeline */}
          <div 
            className="relative w-full h-1.5 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
            onMouseDown={handleMouseDown}
          >
            {/* Progress track */}
            <div 
              className="absolute left-0 top-0 h-full bg-secondary-950 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
            
            {/* Progress handle */}
            <div 
              className="absolute top-1/2 w-3 h-3 bg-secondary-950 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1.5 cursor-pointer hover:scale-110 transition-transform border-2 border-white"
              style={{ left: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Time display and controls in one row */}
          <div className="flex items-center justify-between">
            {/* Fixed-width container for current time */}
            <div className="w-14 text-right">
              <span className="text-xs text-gray-600">
                {currentClip ? formatTime(currentTime - currentClip.startTime) : '00:00'}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={previousClip}
                className="p-1.5 text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Previous clip"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              
              <button
                onClick={togglePlay}
                className="p-2 text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <button
                onClick={nextClip}
                className="p-1.5 text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Next clip"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
              </button>
            </div>

            {/* Fixed-width container for remaining time */}
            <div className="w-14 text-left">
              <span className="text-xs text-gray-600">
                {currentClip ? `-${formatTime(getRemainingTime())}` : '00:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                <strong>Tip:</strong> Use the Spotify controls above to play/pause.
              </p>
              <p>
                Click clip numbers below to jump to specific moments. The player will reload to the selected timestamp.
              </p>
            </div>
          </div>
        </div>

        {/* Clip indicators - moved below tip */}
        <div className="flex justify-center space-x-3 flex-wrap mb-6">
          {clips && clips.length > 0 ? clips.map((_, index) => (
            <button
              key={index}
              onClick={() => seekToClip(index)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                index === currentClipIndex 
                  ? 'bg-secondary-950 text-white border-secondary-950 shadow-lg' 
                  : 'bg-white text-gray-600 border-gray-300 hover:border-secondary-950 hover:text-secondary-950 hover:shadow-md'
              }`}
            >
              {index + 1}
            </button>
          )) : (
            <span className="text-xs text-gray-500">No clips available</span>
          )}
        </div>
      </div>

      {/* Copy Notification */}
      <CopyNotification 
        isVisible={showCopyNotification} 
        onClose={() => setShowCopyNotification(false)} 
      />
    </div>
  )
}

SpotifyChainPlayer.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  clips: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  author: PropTypes.string,
  createdAt: PropTypes.string,
  tags: PropTypes.array,
  spotifyEpisodeId: PropTypes.string.isRequired
}

export default SpotifyChainPlayer
