import React, { useState, useRef, useEffect, useCallback } from 'react'

const TestPlayerSection = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentClipIndex, setCurrentClipIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const iframeRef = useRef(null)
  const timerRef = useRef(null)
  const overlayRef = useRef(null)
  const playerRef = useRef(null)

  const clips = [
    { 
      id: 1, 
      title: "LLM introduction", 
      videoId: "7xTGNNLPyMI",
      startTime: 82, // 1:22 in seconds
      endTime: 145   // 2:25 in seconds
    },
    { 
      id: 2, 
      title: "Tokenization keys", 
      videoId: "7xTGNNLPyMI",
      startTime: 232, // 3:52 in seconds
      endTime: 375    // 6:15 in seconds
    },
    { 
      id: 3, 
      title: "Reinforcement learning", 
      videoId: "7xTGNNLPyMI",
      startTime: 762, // 12:42 in seconds
      endTime: 1405   // 23:25 in seconds
    }
  ]

  const currentClip = clips[currentClipIndex]

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    const roundedSeconds = Math.round(seconds)
    const mins = Math.floor(roundedSeconds / 60)
    const secs = roundedSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize YouTube Player API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer()
      } else {
        // Load YouTube Player API if not already loaded
        if (!window.YT) {
          const tag = document.createElement('script')
          tag.src = 'https://www.youtube.com/iframe_api'
          const firstScriptTag = document.getElementsByTagName('script')[0]
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        }

        // Set up the callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          createPlayer()
        }
      }
    }

    loadYouTubeAPI()

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
    }
  }, [])

  const createPlayer = () => {
    if (iframeRef.current && window.YT) {
      playerRef.current = new window.YT.Player(iframeRef.current, {
        height: '256',
        width: '100%',
        videoId: currentClip.videoId,
        playerVars: {
          autoplay: 0,
          start: currentClip.startTime,
          rel: 0,
          modestbranding: 1,
          controls: 1
        },
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady
        }
      })
    }
  }

  const onPlayerReady = (event) => {
    setPlayerReady(true)
    // Seek to start time when player is ready
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(currentClip.startTime)
    }
  }

  const onPlayerStateChange = (event) => {
    // Update playing state based on YouTube player state
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false)
    }
  }

  // Handle clip change
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && playerReady) {
      // Clear any existing timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Reset current time to start of clip
      setCurrentTime(currentClip.startTime)
      setIsPlaying(false)
      
      // Load new video and seek to start time
      playerRef.current.loadVideoById({
        videoId: currentClip.videoId,
        startSeconds: currentClip.startTime
      })
    }
  }, [currentClipIndex, playerReady])

  // Timer to track playback and sync with YouTube player
  useEffect(() => {
    if (isPlaying && playerRef.current && playerReady) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const playerTime = playerRef.current.getCurrentTime()
          setCurrentTime(playerTime)
          
          // Check if we've reached the end time
          if (playerTime >= currentClip.endTime) {
            playerRef.current.pauseVideo()
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
  }, [isPlaying, currentClip.endTime, playerReady])

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const nextClip = useCallback(() => {
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    const nextIndex = (currentClipIndex + 1) % clips.length
    setCurrentClipIndex(nextIndex)
    setIsPlaying(false)
  }, [currentClipIndex])

  const previousClip = useCallback(() => {
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    const prevIndex = (currentClipIndex - 1 + clips.length) % clips.length
    setCurrentClipIndex(prevIndex)
    setIsPlaying(false)
  }, [currentClipIndex])

  const copyLink = () => {
    const shareUrl = `https://clipchain.com/share/collection/123`
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied to clipboard!')
  }

  // Calculate progress percentage for the clip
  const getProgressPercentage = () => {
    const totalDuration = currentClip.endTime - currentClip.startTime
    const currentProgress = currentTime - currentClip.startTime
    return Math.min((currentProgress / totalDuration) * 100, 100)
  }

  // Calculate remaining time
  const getRemainingTime = () => {
    const remaining = currentClip.endTime - currentTime
    return Math.max(0, remaining)
  }

  // Handle timeline click and drag
  const handleTimelineClick = (e) => {
    if (overlayRef.current && playerRef.current) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      if (playerRef.current.seekTo) {
        playerRef.current.seekTo(clampedTime)
        setCurrentTime(clampedTime)
      }
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging && overlayRef.current && playerRef.current) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      if (playerRef.current.seekTo) {
        playerRef.current.seekTo(clampedTime)
        setCurrentTime(clampedTime)
      }
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test how clipchain actually works!
        </h2>
        <p className="text-gray-600">
          Try our player below to see it in action. Here you can see a collection of clips merged with our platform
        </p>
      </div>

      {/* Embed-style Player Card */}
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

                    {/* Video Player */}
                    <div className="px-3 pt-3 pb-3">
                      {/* Chapter Indicators at the top */}
                      <div className="flex space-x-2 mb-3">
                        {clips.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (timerRef.current) {
                                clearInterval(timerRef.current)
                              }
                              setCurrentClipIndex(index)
                              setIsPlaying(false)
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
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentClip.title} <span className="text-sm text-gray-500 font-normal">({currentClipIndex + 1}/{clips.length})</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatTime(currentClip.startTime)} - {formatTime(currentClip.endTime)} ({formatTime(currentClip.endTime - currentClip.startTime)} duration)
                        </p>
                      </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden mb-3">
              <div
                ref={iframeRef}
                className="w-full h-64"
              />
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
                  <span className="text-xs text-gray-600">{formatTime(currentTime - currentClip.startTime)}</span>
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
                  <span className="text-xs text-gray-600">-{formatTime(getRemainingTime())}</span>
                </div>
              </div>
            </div>
          </div>


      </div>
    </div>
  )
}

export default TestPlayerSection
