import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import CopyNotification from './CopyNotification.jsx'

const ClipchainPlayer = ({ title, description, clips, id }) => {
  const playerId = `youtube-player-${id}`
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipIndex, setCurrentClipIndex] = useState(-1) // Start with no clip selected
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const iframeRef = useRef(null)
  const timerRef = useRef(null)
  const overlayRef = useRef(null)
  const playerRef = useRef(null)

  const currentClip = currentClipIndex >= 0 ? clips[currentClipIndex] : null

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
      setVideoLoaded(true)
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
      setVideoLoaded(false)
      
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

  // Simple timer to track playback time
  useEffect(() => {
    if (isPlaying && currentClip) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1
          
          // Check if we've reached the end time
          if (newTime >= currentClip.endTime) {
            setIsPlaying(false)
            clearInterval(timerRef.current)
            // Auto-advance to next clip if available
            if (currentClipIndex < clips.length - 1) {
              setTimeout(() => {
                const nextIndex = currentClipIndex + 1
                setCurrentClipIndex(nextIndex)
                setIsPlaying(false)
              }, 1000)
            }
            return currentClip.endTime
          }
          
          return newTime
        })
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
  }, [isPlaying, currentClip?.endTime, currentClipIndex, clips.length])

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
    console.log('Next clip clicked, current index:', currentClipIndex)
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    const nextIndex = (currentClipIndex + 1) % clips.length
    console.log('Setting next index to:', nextIndex)
    setCurrentClipIndex(nextIndex)
    // Don't set isPlaying to false here - let the clip change effect handle it
  }, [currentClipIndex, clips.length])

  const previousClip = useCallback(() => {
    console.log('Previous clip clicked, current index:', currentClipIndex)
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    const prevIndex = (currentClipIndex - 1 + clips.length) % clips.length
    console.log('Setting previous index to:', prevIndex)
    setCurrentClipIndex(prevIndex)
    // Don't set isPlaying to false here - let the clip change effect handle it
  }, [currentClipIndex, clips.length])

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
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-200 hover:border-gray-300 transition-all duration-300">
      {/* Header with Logo and Copy Link */}
      <div className="flex items-center justify-between p-3 border-b border-gray-300 hover:border-gray-400 transition-colors duration-300">
        {/* Left side - Logo */}
        <img src="/logo.svg" alt="clipchain" className="h-5" />
        
        {/* Right side - Copy Link */}
        <button
          onClick={copyLink}
          className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-primary-950 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Copy link</span>
        </button>
      </div>

      {/* Title and Description */}
      <div className="px-3 pt-4 pb-2">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {title}
        </h2>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>

      {/* Video Player */}
      <div className="px-3 pt-3 pb-3">
          {/* Chapter Indicators at the top */}
          <div className="flex space-x-2 mb-3">
            {clips.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('Clicked clip:', index, 'player ready:', playerReady)
                  setCurrentClipIndex(index)
                }}
                className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                  index === currentClipIndex 
                    ? 'bg-primary-950 text-white border-primary-950' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

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
              <p className="text-sm text-gray-500">Select a clip to start playing</p>
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
                className="absolute left-0 top-0 h-full bg-primary-950 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
              
              {/* Progress handle */}
              <div 
                className="absolute top-1/2 w-3 h-3 bg-primary-950 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1.5 cursor-pointer hover:scale-110 transition-transform border-2 border-white"
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
                    className="p-1.5 text-gray-700 hover:text-primary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
                    title="Previous clip"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="p-2 text-gray-700 hover:text-primary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
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
                    className="p-1.5 text-gray-700 hover:text-primary-950 hover:bg-gray-100 rounded-full transition-all duration-200"
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
}

export default ClipchainPlayer
