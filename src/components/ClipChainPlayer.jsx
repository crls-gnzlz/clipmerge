import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import CopyNotification from './CopyNotification.jsx'
import { Link } from 'react-router-dom'

const ClipchainPlayer = ({ title, description, clips, id, author, createdAt, tags }) => {
  const playerId = `youtube-player-${id}`
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipIndex, setCurrentClipIndex] = useState(-1)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [visibleClipRange, setVisibleClipRange] = useState({ start: 0, end: 10 })
  const [isManualNavigation, setIsManualNavigation] = useState(false)
  
  const iframeRef = useRef(null)
  const timerRef = useRef(null)
  const overlayRef = useRef(null)
  const playerRef = useRef(null)
  
  const clipsPerPage = 6 // Show 6 clips per page
  const totalPages = Math.ceil(clips.length / clipsPerPage)
  const currentClips = clips.slice(currentPage * clipsPerPage, (currentPage + 1) * clipsPerPage)
  
  const currentClip = currentClipIndex >= 0 && currentClipIndex < clips.length ? clips[currentClipIndex] : null

  // Function to update visible clip range
  const updateVisibleClipRange = useCallback((clipIndex) => {
    const maxClipsPerView = 10
    
    setVisibleClipRange(prevRange => {
      let start = 0
      let end = maxClipsPerView

      if (clipIndex >= maxClipsPerView) {
        // If clip is beyond the first 10, adjust the range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, clips.length)
      } else if (clipIndex < prevRange.start) {
        // If clip is before the current range, go back to previous range
        start = Math.max(0, prevRange.start - maxClipsPerView)
        end = Math.min(start + maxClipsPerView, clips.length)
      } else if (clipIndex >= prevRange.end) {
        // If clip is beyond the current range, go to next range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, clips.length)
      } else {
        // If clip is within the current range, don't change anything
        return prevRange
      }

      return { start, end }
    })
  }, [clips.length])

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    const roundedSeconds = Math.round(seconds)
    const mins = Math.floor(roundedSeconds / 60)
    const secs = roundedSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Create player on mount
  useEffect(() => {
    createPlayer()
  }, [])

  const createPlayer = () => {
    console.log('createPlayer called for:', title, 'iframeRef:', !!iframeRef.current)
    
    if (iframeRef.current) {
      // Clear the container first
      iframeRef.current.innerHTML = ''
      
      console.log('Creating simple iframe for:', title)
      
      // Create a simple iframe with YouTube embed URL
      const iframe = document.createElement('iframe')
      iframe.width = '100%'
      iframe.height = '256'
      iframe.frameBorder = '0'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullscreen = true
      
      // Set initial video (first clip) - hide controls and branding
      const initialVideoId = clips[0].videoId
      iframe.src = `https://www.youtube.com/embed/${initialVideoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0`
      
      iframeRef.current.appendChild(iframe)
      
      // Store the iframe reference
      playerRef.current = {
        iframe: iframe,
        currentVideoId: initialVideoId
      }
      
      console.log('Simple iframe created successfully for:', title)
    } else {
      console.log('Cannot create iframe - iframeRef:', !!iframeRef.current)
    }
  }

  // Helper function to send postMessage to YouTube iframe
  const sendPostMessage = (command, args = []) => {
    if (playerRef.current && playerRef.current.iframe) {
      try {
        const iframe = playerRef.current.iframe
        console.log('Sending command to iframe:', command, args)
        
        if (iframe.contentWindow) {
          const message = {
            event: 'command',
            func: command,
            args: args
          }
          console.log('Sending postMessage to iframe:', message)
          
          // Add a small delay to ensure iframe is ready
          setTimeout(() => {
            iframe.contentWindow.postMessage(JSON.stringify(message), '*')
          }, 100)
        } else {
          console.error('Iframe contentWindow not available')
        }
      } catch (error) {
        console.error('Error sending postMessage:', error)
      }
    } else {
      console.error('Player or iframe not available')
    }
  }

  // Set player as ready when iframe is created
  useEffect(() => {
    if (playerRef.current && playerRef.current.iframe) {
      setPlayerReady(true)
    }
  }, [playerRef.current])

  // Handle clip change
  useEffect(() => {
    console.log('Clip change effect triggered:', { currentClipIndex, playerReady, hasPlayer: !!playerRef.current, hasLoadVideo: !!(playerRef.current && playerRef.current.loadVideoById), hasCueVideo: !!(playerRef.current && playerRef.current.cueVideoById), hasCurrentClip: !!currentClip })
    
    if (playerRef.current && playerReady && currentClipIndex >= 0 && currentClip) {
      // Clear any existing timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Reset current time to start of clip
      setCurrentTime(currentClip.startTime)
      setIsPlaying(false)
      
              // Try to load new video by changing iframe src
        try {
          console.log('Loading video:', currentClip.videoId, 'for clip:', currentClip.title)
          
          // Change the iframe src to load the new video
          if (playerRef.current && playerRef.current.iframe) {
            const iframe = playerRef.current.iframe
            const newSrc = `https://www.youtube.com/embed/${currentClip.videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&start=${currentClip.startTime}`
            iframe.src = newSrc
            playerRef.current.currentVideoId = currentClip.videoId
            console.log('Changed iframe src to:', newSrc)
            
            // Start playing the video
            setIsPlaying(true)
          }
        } catch (error) {
          console.error('Error loading video:', error)
        }
    }
  }, [currentClipIndex, playerReady])

  // Effect to handle time updates when playing
  useEffect(() => {
    if (isPlaying && currentClip) {
      const interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1
          if (newTime >= currentClip.endTime) {
            clearInterval(interval)
            return currentClip.endTime
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentClip])

  // Effect to handle clip changes and auto-advance
  useEffect(() => {
    if (isPlaying && currentClip && !isManualNavigation) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Set up timer to check if clip has ended
      timerRef.current = setInterval(() => {
        if (currentTime >= currentClip.endTime) {
          console.log('Clip ended, advancing to next')
          clearInterval(timerRef.current)
          
          // Auto-advance to next clip if available
          if (currentClipIndex < clips.length - 1) {
            setTimeout(() => {
              const nextIndex = currentClipIndex + 1
              setCurrentClipIndex(nextIndex)
              updateVisibleClipRange(nextIndex)
            }, 1000)
          } else {
            // If we're at the last clip, stop
            setIsPlaying(false)
          }
        }
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, currentClip?.endTime, currentClipIndex, clips, updateVisibleClipRange, isManualNavigation])

  // Listen for YouTube player state changes
  useEffect(() => {
    const handleMessage = (event) => {
      // Only handle messages from our iframe
      if (playerRef.current && playerRef.current.iframe && event.source === playerRef.current.iframe.contentWindow) {
        try {
          const data = JSON.parse(event.data)
          console.log('Received message from YouTube:', data)
          
          // Handle different message formats
          if (data.event === 'onStateChange') {
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (data.info === 2) { // Paused
              console.log('YouTube player paused')
              setIsPlaying(false)
            } else if (data.info === 1) { // Playing
              console.log('YouTube player playing')
              setIsPlaying(true)
            }
          } else if (data.event === 'command' && data.func === 'pauseVideo') {
            // Handle pause command response
            console.log('Pause command executed')
            setIsPlaying(false)
          } else if (data.event === 'command' && data.func === 'playVideo') {
            // Handle play command response
            console.log('Play command executed')
            setIsPlaying(true)
          }
        } catch (error) {
          // Ignore non-JSON messages
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Additional effect to handle iframe load and set up event listeners
  useEffect(() => {
    if (playerRef.current && playerRef.current.iframe) {
      const iframe = playerRef.current.iframe
      
      // Add event listener for iframe load
      const handleIframeLoad = () => {
        console.log('Iframe loaded, setting up player state detection')
        // Send a message to enable state change events
        const message = {
          event: 'listening',
          func: 'addEventListener',
          args: ['onStateChange']
        }
        setTimeout(() => {
          iframe.contentWindow.postMessage(JSON.stringify(message), '*')
        }, 1000)
      }

      iframe.addEventListener('load', handleIframeLoad)
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [playerRef.current])

  const togglePlay = () => {
    if (playerRef.current && playerRef.current.iframe) {
      if (!currentClip) {
        // If no clip is selected, select the first clip
        console.log('No clip selected, selecting first clip')
        setCurrentClipIndex(0)
        return
      }
      
      if (isPlaying) {
        // Use postMessage to pause
        sendPostMessage('pauseVideo')
        setIsPlaying(false)
        console.log('Pausing video')
      } else {
        // Use postMessage to play
        sendPostMessage('playVideo')
        setIsPlaying(true)
        console.log('Playing video')
      }
    } else {
      console.log('Player not ready')
    }
  }

  const nextClip = useCallback(() => {
    if (!clips || !clips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex >= clips.length - 1) {
      // If we're at the end, go to the beginning
      setCurrentClipIndex(0)
      updateVisibleClipRange(0)
    } else {
      const nextIndex = currentClipIndex + 1
      console.log('Setting next index to:', nextIndex)
      setCurrentClipIndex(nextIndex)
      updateVisibleClipRange(nextIndex)
    }
    
    // Reset the flag after a short delay
    setTimeout(() => setIsManualNavigation(false), 1000)
  }, [currentClipIndex, clips, updateVisibleClipRange])

  const previousClip = useCallback(() => {
    if (!clips || !clips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex <= 0) {
      // If we're at the beginning, go to the end
      const lastIndex = clips.length - 1
      setCurrentClipIndex(lastIndex)
      updateVisibleClipRange(lastIndex)
    } else {
      const prevIndex = currentClipIndex - 1
      console.log('Setting previous index to:', prevIndex)
      setCurrentClipIndex(prevIndex)
      updateVisibleClipRange(prevIndex)
    }
    
    // Reset the flag after a short delay
    setTimeout(() => setIsManualNavigation(false), 1000)
  }, [currentClipIndex, clips, updateVisibleClipRange])

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/chain/${id}`
    navigator.clipboard.writeText(shareUrl)
    setShowCopyNotification(true)
  }

  // Calculate progress percentage for the clip
  const getProgressPercentage = () => {
    if (!currentClip) return 0
    const totalDuration = currentClip.endTime - currentClip.startTime
    const currentProgress = currentTime - currentClip.startTime
    return Math.min((currentProgress / totalDuration) * 100, 100)
  }

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!currentClip) return 0
    const remaining = currentClip.endTime - currentTime
    return Math.max(0, remaining)
  }

  // Handle timeline click and drag
  const handleTimelineClick = (e) => {
    if (overlayRef.current && playerRef.current && currentClip) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
      setCurrentTime(clampedTime)
      console.log('Seeking to time:', clampedTime)
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging && overlayRef.current && playerRef.current && currentClip) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
      setCurrentTime(clampedTime)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, currentClip])

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-200 hover:border-gray-300 transition-all duration-300 group">
      {/* Header with Logo and Copy Link */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 hover:border-gray-400 transition-colors duration-300">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <img src="/logo2.svg" alt="clipchain" className="h-5 brightness-110 filter group-hover:brightness-110 transition-all duration-300" />
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
          title={tags && tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}
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
                <Link 
                  to={`/user/${author}`} 
                  className="hover:text-secondary-950 hover:underline transition-colors"
                >
                  By {author}
                </Link>
              )}
              {author && createdAt && <span>•</span>}
              {createdAt && <span>{new Date(createdAt).toLocaleDateString()}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="px-3 pt-3 pb-3">
          {/* Chapter Indicators at the top */}
          <div className="flex flex-col space-y-2">
            {/* Clip indicators */}
            <div className="flex space-x-2 flex-wrap">
              {clips && clips.length > 0 ? clips.slice(visibleClipRange.start, visibleClipRange.end).map((_, index) => {
                const actualIndex = visibleClipRange.start + index
                return (
                  <button
                    key={actualIndex}
                    onClick={() => {
                      console.log('Clicked clip:', actualIndex, 'player ready:', playerReady)
                      setIsManualNavigation(true)
                      setCurrentClipIndex(actualIndex)
                      updateVisibleClipRange(actualIndex)
                      setTimeout(() => setIsManualNavigation(false), 1000)
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      actualIndex === currentClipIndex 
                        ? 'bg-secondary-950 text-white border-secondary-950' 
                        : 'bg-white text-gray-600 border-gray-300 hover:border-secondary-950 hover:text-secondary-950'
                    }`}
                  >
                    {actualIndex + 1}
                  </button>
                )
              }) : (
                <span className="text-xs text-gray-500">No clips available</span>
              )}
            </div>
          </div>

          <div className="mb-2 mt-4">
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

          <div className="relative bg-black rounded-lg overflow-hidden mb-3">
            <div
              ref={iframeRef}
              className="w-full h-64"
            />
            
            {/* Custom Play Button Overlay */}
            {(!currentClip || !isPlaying) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={togglePlay}
                  className="p-4 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110"
                  title={currentClip ? 'Play' : 'Select a clip to play'}
                >
                  <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Transparent overlay to detect clicks when video is playing */}
            {isPlaying && currentClip && (
              <div 
                className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200"
                onClick={() => {
                  console.log('User clicked on video overlay - pausing video')
                  setIsPlaying(false)
                  sendPostMessage('pauseVideo')
                }}
                title="Click to pause"
              />
            )}
          </div>

          {/* Controls Section - More compact */}
          <div className="space-y-2">
            {/* Custom Timeline */}
            <div 
              ref={overlayRef}
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
      </div>
      <CopyNotification
        isVisible={showCopyNotification}
        onClose={() => setShowCopyNotification(false)}
      />
    </div>
  )
}

ClipchainPlayer.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  clips: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    videoId: PropTypes.string.isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
  })).isRequired,
  author: PropTypes.string,
  createdAt: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
}

export default ClipchainPlayer
