import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import AppNotification from './AppNotification.jsx'
import { Link } from 'react-router-dom'

const ClipchainPlayer = ({ title, description, clips, id, author, createdAt, tags, compact = false }) => {
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(100) // Volume state (0-100)
  const [isMuted, setIsMuted] = useState(false) // Mute state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false) // Volume slider visibility
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false) // Captions state - starts disabled
  const [hasUserInteractedWithCaptions, setHasUserInteractedWithCaptions] = useState(false) // Track if user has clicked CC button
  const [showFullscreenControls, setShowFullscreenControls] = useState(false) // Control panel visibility in fullscreen
  const [controlsTimeout, setControlsTimeout] = useState(null) // Timeout for auto-hiding controls
  const [notification, setNotification] = useState({ isVisible: false, type: 'success', title: '', message: '' })
  
  console.log('🔤 Component initialized with isCaptionsEnabled:', false)
  const iframeRef = useRef(null)
  const playerContainerRef = useRef(null) // New ref for the player container
  const overlayRef = useRef(null) // Ref for timeline overlay
  const timerRef = useRef(null)
  const volumeSliderRef = useRef(null)
  const playerRef = useRef(null)
  
  const safeClips = Array.isArray(clips) ? clips : []
  const clipsPerPage = 6 // Show 6 clips per page
  const totalPages = Math.ceil(safeClips.length / clipsPerPage)
  const currentClips = safeClips.slice(currentPage * clipsPerPage, (currentPage + 1) * clipsPerPage)
  
  const currentClip = currentClipIndex >= 0 && currentClipIndex < safeClips.length ? safeClips[currentClipIndex] : null

  // Effect to monitor captions state changes
  useEffect(() => {
    console.log('🔤 Captions state changed:', { 
      isCaptionsEnabled, 
      currentClip: currentClip?.title,
      currentTime,
      playerReady,
      currentClipIndex,
      hasClips: !!safeClips.length,
      hasUserInteractedWithCaptions
    })
  }, [isCaptionsEnabled, currentClip, currentTime, playerReady, currentClipIndex, safeClips.length, hasUserInteractedWithCaptions])

  // Function to update visible clip range
  const updateVisibleClipRange = useCallback((clipIndex) => {
    const maxClipsPerView = 10
    
    setVisibleClipRange(prevRange => {
      let start = 0
      let end = maxClipsPerView

      if (clipIndex >= maxClipsPerView) {
        // If clip is beyond the first 10, adjust the range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, safeClips.length)
      } else if (clipIndex < prevRange.start) {
        // If clip is before the current range, go back to previous range
        start = Math.max(0, prevRange.start - maxClipsPerView)
        end = Math.min(start + maxClipsPerView, safeClips.length)
      } else if (clipIndex >= prevRange.end) {
        // If clip is beyond the current range, go to next range
        start = Math.floor(clipIndex / maxClipsPerView) * maxClipsPerView
        end = Math.min(start + maxClipsPerView, safeClips.length)
      } else {
        // If clip is within the current range, don't change anything
        return prevRange
      }

      return { start, end }
    })
  }, [safeClips.length])

  // Function to format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle fullscreen toggle - move iframe between containers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        // Pause video before exiting fullscreen
        if (isPlaying) {
          setIsPlaying(false)
          sendPostMessage('pauseVideo')
        }
        document.exitFullscreen()
      } else if (e.key === ' ' && currentClip) {
        // Spacebar toggles play/pause (both in normal and fullscreen mode)
        e.preventDefault() // Prevent page scroll
        togglePlay()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, isPlaying])

  // Handle mouse movement for fullscreen controls dock
  useEffect(() => {
    if (!isFullscreen) return

    const handleMouseLeave = () => {
      // Hide controls when mouse leaves the window
      setShowFullscreenControls(false)
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [isFullscreen, controlsTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [controlsTimeout])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement
      console.log('Fullscreen change detected:', { fs, isPlaying, currentTime })
      setIsFullscreen(fs)

      if (fs && playerRef.current) {
        // Forzar resize usando la API de YouTube
        const { offsetWidth, offsetHeight } = playerContainerRef.current
        
        // Enviar comando de resize a YouTube
        if (playerRef.current?.iframe?.contentWindow?.postMessage && typeof playerRef.current.iframe.contentWindow.postMessage === 'function') {
          try {
            // Comando 1: setSize para forzar el redimensionamiento
            playerRef.current.iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setSize',
              args: [offsetWidth, offsetHeight]
            }), '*')
            console.log('✅ YouTube setSize command sent:', { width: offsetWidth, height: offsetHeight })
            
            // Comando 2: setPlaybackQuality para forzar alta calidad
            setTimeout(() => {
              if (playerRef.current?.iframe?.contentWindow?.postMessage && typeof playerRef.current.iframe.contentWindow.postMessage === 'function') {
                try {
                  playerRef.current.iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'setPlaybackQuality',
                    args: ['hd1080']
                  }), '*')
                  console.log('✅ YouTube setPlaybackQuality command sent: hd1080')
                } catch (error) {
                  console.warn('Failed to send setPlaybackQuality command:', error)
                }
              }
            }, 100)
            
            // Comando 3: Resize adicional para asegurar
            setTimeout(() => {
              if (playerRef.current?.iframe?.contentWindow?.postMessage && typeof playerRef.current.iframe.contentWindow.postMessage === 'function') {
                try {
                  playerRef.current.iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: 'setSize',
                    args: [offsetWidth, offsetHeight]
                  }), '*')
                  console.log('✅ YouTube setSize command sent again for quality assurance')
                } catch (error) {
                  console.warn('Failed to send setSize command:', error)
                }
              }
            }, 300)
            
          } catch (e) {
            console.log('❌ Could not send YouTube commands:', e)
          }
        }
        
        // También forzar resize del iframe por CSS
        const iframe = iframeRef.current && iframeRef.current.querySelector('iframe')
        if (iframe) {
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.minHeight = '100vh'
          iframe.style.objectFit = 'cover'
          iframe.offsetHeight // Force reflow
          console.log('✅ Iframe CSS resize applied for fullscreen')
        }
      } else if (!fs && playerRef.current) {
        // Restaurar tamaño normal cuando se sale del fullscreen
        const iframe = iframeRef.current && iframeRef.current.querySelector('iframe')
        if (iframe) {
          // Restaurar estilos normales
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.minHeight = compact ? '200px' : '300px'
          iframe.style.objectFit = 'contain'
          iframe.offsetHeight // Force reflow
          console.log('✅ Iframe CSS restored to normal size')
          
          // Enviar comando de resize a YouTube para el tamaño normal
          if (playerRef.current?.iframe?.contentWindow?.postMessage && typeof playerRef.current.iframe.contentWindow.postMessage === 'function') {
            try {
              const { offsetWidth, offsetHeight } = playerContainerRef.current
              playerRef.current.iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setSize',
                args: [offsetWidth, offsetHeight]
              }), '*')
              console.log('✅ YouTube setSize command sent for normal mode:', { width: offsetWidth, height: offsetHeight })
            } catch (e) {
              console.log('❌ Could not send YouTube resize command for normal mode:', e)
            }
          }
        }
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isPlaying, currentTime, compact])

  // Create player on mount only
  useEffect(() => {
    createPlayer()
  }, [])

  const createPlayer = () => {
    if (!safeClips.length) {
      console.warn('No clips available, skipping player creation')
      return
    }
    console.log('createPlayer called for:', title, 'iframeRef:', !!iframeRef.current)
    
    // Create iframe for video player
    if (iframeRef.current) {
      // Clear the container first
      iframeRef.current.innerHTML = ''
      
      console.log('Creating iframe for:', title)
      
      // Create a simple iframe with YouTube embed URL
      const iframe = document.createElement('iframe')
      iframe.width = '100%'
      iframe.height = '100%'
      iframe.frameBorder = '0'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      iframe.allowFullscreen = true
      
      // Set initial video (first clip) - disable captions initially, disable other controls
      const initialVideoId = safeClips[0].videoId
      // Enhanced parameters to remove "More videos" and other unwanted elements
      const iframeSrc = `https://www.youtube.com/embed/${initialVideoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&start=${safeClips[0].startTime}&disablekb=1&playsinline=1&cc_load_policy=0&color=white&theme=dark&loop=0&playlist=${initialVideoId}&host=https://www.youtube-nocookie.com&wmode=transparent&vq=hd1080&autohide=1&egm=0&hd=1&t=0&version=3&enablejsapi=1&playerapiid=ytplayer`
      console.log('🔤 createPlayer: Setting iframe src with enhanced parameters:', iframeSrc)
      console.log('🔤 createPlayer: Captions initially disabled (cc_load_policy=0)')
      console.log('🔤 createPlayer: YouTube embed URL parameters:', {
        videoId: initialVideoId,
        cc_load_policy: '0 (disabled)',
        enablejsapi: '1 (enabled)',
        origin: window.location.origin,
        rel: '0 (no related videos)',
        modestbranding: '1 (minimal branding)',
        controls: '0 (no native controls)',
        showinfo: '0 (no video info)',
        iv_load_policy: '3 (no annotations)',
        autohide: '1 (hide controls when not needed)',
        egm: '0 (no end game)',
        host: 'youtube-nocookie.com (privacy enhanced)'
      })
      iframe.src = iframeSrc
      
      iframeRef.current.appendChild(iframe)
      
      // Store the iframe reference
      playerRef.current = {
        iframe: iframe,
        currentVideoId: initialVideoId
      }
      
      console.log('Iframe created successfully for:', title)
    }
  }

  // Helper function to send postMessage to YouTube iframe
  const sendPostMessage = (command, args = []) => {
    console.log('📤 sendPostMessage:', { command, args, isCaptionsEnabled })
    
    // Look for iframe in the player container
    const iframe = iframeRef.current && iframeRef.current.querySelector('iframe')
    
    // Enhanced safety checks
    if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
      try {
        const message = {
          event: 'command',
          func: command,
          args: args
        }
        
        console.log('📤 Sending message to iframe:', message)
        console.log('📤 Iframe details:', {
          src: iframe.src,
          contentWindow: !!iframe.contentWindow,
          readyState: iframe.contentDocument?.readyState,
          isFullscreen: isFullscreen
        })
        
        // Send immediately without delay for better responsiveness
        iframe.contentWindow.postMessage(JSON.stringify(message), '*')
        console.log('✅ Command sent successfully to iframe')
        
        // Log the exact message sent for debugging
        if (command === 'setOption' && args[0] === 'captions') {
          console.log('🔤 Captions command sent:', {
            command,
            args,
            message: JSON.stringify(message),
            iframeSrc: iframe.src
          })
        }
      } catch (error) {
        console.error('❌ Error sending postMessage:', error)
      }
    } else {
      console.warn('❌ No iframe available for command:', command, {
        iframeRef: !!iframeRef.current,
        normalIframe: !!(iframeRef.current && iframeRef.current.querySelector('iframe')),
        hasContentWindow: !!(iframe && iframe.contentWindow),
        hasPostMessage: !!(iframe && iframe.contentWindow && iframe.contentWindow.postMessage),
        postMessageType: iframe?.contentWindow?.postMessage ? typeof iframe.contentWindow.postMessage : 'undefined'
      })
    }
  }

  // Set player as ready when iframe is created
  useEffect(() => {
    const hasIframe = iframeRef.current && iframeRef.current.querySelector('iframe')
    
    if (hasIframe) {
      setPlayerReady(true)
    }
  }, [])

  // Handle clip change
  useEffect(() => {
    console.log('Clip change effect triggered:', { currentClipIndex, playerReady, hasCurrentClip: !!currentClip })
    
    if (currentClipIndex >= 0 && currentClip) {
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
        
        // Find the iframe in the player container
        const iframe = iframeRef.current && iframeRef.current.querySelector('iframe')
        
        if (iframe) {
          // Update the iframe with the new video - enhanced parameters to remove "More videos" and other unwanted elements
          const newSrc = `https://www.youtube.com/embed/${currentClip.videoId}?enablejsapi=1&origin=${window.location.origin}&autoplay=0&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0&start=${currentClip.startTime}&disablekb=1&playsinline=1&cc_load_policy=0&color=white&theme=dark&loop=0&playlist=${currentClip.videoId}&host=https://www.youtube-nocookie.com&wmode=transparent&vq=hd1080&autohide=1&egm=0&hd=1&t=0&version=3&enablejsapi=1&playerapiid=ytplayer`
          iframe.src = newSrc
          console.log('Updated iframe src to:', newSrc)
          console.log('🔤 Clip change: Updated iframe with enhanced parameters (captions disabled)')
          console.log('🔤 Clip change: New video parameters:', {
            videoId: currentClip.videoId,
            startTime: currentClip.startTime,
            endTime: currentClip.endTime,
            cc_load_policy: '0 (disabled)',
            isCaptionsEnabled,
            rel: '0 (no related videos)',
            modestbranding: '1 (minimal branding)',
            controls: '0 (no native controls)',
            showinfo: '0 (no video info)',
            iv_load_policy: '3 (no annotations)',
            autohide: '1 (hide controls when not needed)',
            egm: '0 (no end game)',
            host: 'youtube-nocookie.com (privacy enhanced)'
          })
          
          // Additional resize if in fullscreen mode to prevent pixelation
          if (isFullscreen) {
            setTimeout(() => {
              console.log('Additional resize after clip change in fullscreen mode')
              iframe.style.width = '100%'
              iframe.style.height = '100%'
              iframe.style.minHeight = '100vh'
              iframe.style.objectFit = 'cover'
              iframe.offsetHeight
            }, 100)
          }
        }
        
        // Start playing the video after a short delay
        setTimeout(() => {
          if (currentClip) {
            // First seek to the start time
            sendPostMessage('seekTo', [currentClip.startTime, true])
            
            // Apply captions state if enabled
            if (isCaptionsEnabled && hasUserInteractedWithCaptions) {
              console.log('🔤 Clip changed, captions were enabled AND user has interacted, re-applying...')
              console.log('🔤 Re-applying captions after clip change - current state:', { isCaptionsEnabled, currentClip: currentClip?.title, hasUserInteractedWithCaptions })
              setTimeout(() => {
                console.log('🔤 Re-applying captions after clip change delay')
                console.log('🔤 Sending setOption captions track {} command')
                sendPostMessage('setOption', ['captions', 'track', {}])
                console.log('🔤 Captions re-enabled after clip change')
              }, 1000)
            } else if (isCaptionsEnabled && !hasUserInteractedWithCaptions) {
              console.log('🔤 Clip changed, captions were enabled BUT user has NOT interacted, NOT re-applying automatically')
            } else {
              console.log('🔤 Clip changed, captions were disabled, no need to re-apply')
            }
            
            // Then start playing
            setTimeout(() => {
              sendPostMessage('playVideo')
              setIsPlaying(true)
            }, 300)
          }
        }, 1000)
      } catch (error) {
        console.error('Error loading video:', error)
      }
    }
  }, [currentClipIndex, currentClip, hasUserInteractedWithCaptions])

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
    } else {
      // Clear any existing timer when not playing
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
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
          if (currentClipIndex < safeClips.length - 1) {
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
  }, [isPlaying, currentClip?.endTime, currentClipIndex, safeClips, updateVisibleClipRange, isManualNavigation])

  // Effect to periodically clean YouTube elements (especially when paused)
  useEffect(() => {
    if (!playerReady || !currentClip) return

    // Set up periodic cleanup to remove YouTube elements that appear dynamically
    const cleanupInterval = setInterval(() => {
      if (!isPlaying && playerRef.current?.iframe) {
        console.log('🔧 Periodic YouTube cleanup - video is paused, applying cleanup commands...')
        
        try {
          const iframe = playerRef.current.iframe
          
          // Check if iframe is valid before sending messages
          if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
            // Command 1: Ensure annotations are hidden
            iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setOption',
              args: ['annotations', 'show', false]
            }), '*')
            
            // Command 2: Set player size to maintain clean appearance
            if (playerContainerRef.current) {
              const { offsetWidth, offsetHeight } = playerContainerRef.current
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setSize',
                args: [offsetWidth, offsetHeight]
              }), '*')
            }
            
            // Command 3: Additional cleanup for related content
            iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setOption',
              args: ['captions', 'track', null]
            }), '*')
            
            // NEW: Inject CSS to hide YouTube elements directly
            injectYouTubeCleanupCSS(iframe)
            
            console.log('🔧 Periodic cleanup completed')
          } else {
            console.warn('🔧 Iframe not available for periodic cleanup')
          }
        } catch (error) {
          console.log('🔧 Periodic cleanup error:', error)
        }
      }
    }, 2000) // Run every 2 seconds when video is paused

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [playerReady, currentClip, isPlaying])

  // Effect to ensure timer is stopped when video is paused
  useEffect(() => {
    if (!isPlaying && timerRef.current) {
      console.log('🔧 Video paused - stopping timer to sync timeline')
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isPlaying])

  // Listen for YouTube player state changes
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if the message is from our iframe
      const normalIframe = iframeRef.current && iframeRef.current.firstChild
      
      const isFromNormalIframe = normalIframe && event.source === normalIframe.contentWindow
      
      if (isFromNormalIframe) {
        try {
          const data = JSON.parse(event.data)
          const messageSource = 'normal'
          console.log('Received message from YouTube:', data, 'from:', messageSource, 'isFullscreen:', isFullscreen)
          
          // Handle different message formats
          if (data.event === 'onStateChange') {
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (data.info === 2) { // Paused
              console.log('YouTube player paused')
              setIsPlaying(false)
              
              // Stop the time tracking when YouTube detects pause to sync timeline
              if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
              }
              
              // Apply cleanup when YouTube detects pause to remove "More videos" and other elements
              setTimeout(() => {
                console.log('🔧 YouTube state change pause detected - applying cleanup...')
                if (playerRef.current?.iframe) {
                  try {
                    const iframe = playerRef.current.iframe
                    
                    // Check if iframe is valid before sending messages
                    if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
                      // Command 1: Hide annotations
                      iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'setOption',
                        args: ['annotations', 'show', false]
                      }), '*')
                      
                      // Command 2: Set player size to maintain clean appearance
                      if (playerContainerRef.current) {
                        const { offsetWidth, offsetHeight } = playerContainerRef.current
                        iframe.contentWindow.postMessage(JSON.stringify({
                          event: 'command',
                          func: 'setSize',
                          args: [offsetWidth, offsetHeight]
                        }), '*')
                      }
                      
                      // Command 3: Additional cleanup for related content
                      iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'setOption',
                        args: ['captions', 'track', null]
                      }), '*')
                      
                      console.log('🔧 YouTube state change cleanup completed')
                    } else {
                      console.warn('🔧 Iframe not available for state change cleanup')
                    }
                  } catch (error) {
                    console.log('🔧 YouTube state change cleanup error:', error)
                  }
                }
              }, 300) // Wait 300ms for YouTube to process the state change
            } else if (data.info === 1) { // Playing
              console.log('YouTube player playing')
              setIsPlaying(true)
            } else if (data.info === 0) { // Ended
              console.log('YouTube player ended')
              setIsPlaying(false)
              // Auto-advance to next clip if available
              if (currentClipIndex < safeClips.length - 1) {
                setTimeout(() => {
                  const nextIndex = currentClipIndex + 1
                  setCurrentClipIndex(nextIndex)
                  updateVisibleClipRange(nextIndex)
                }, 1000)
              }
            } else if (data.info === 3) { // Buffering
              console.log('YouTube player buffering')
            } else if (data.info === 5) { // Cued
              console.log('YouTube player cued')
            }
          } else if (data.event === 'command' && data.func === 'pauseVideo') {
            // Handle pause command response
            console.log('Pause command executed')
            setIsPlaying(false)
          } else if (data.event === 'command' && data.func === 'playVideo') {
            // Handle play command response
            console.log('Play command executed')
            setIsPlaying(true)
          } else if (data.event === 'command' && data.func === 'seekTo') {
            // Handle seek command response
            console.log('Seek command executed')
            // The time will be updated by our own time tracking
          } else if (data.event === 'command' && data.func === 'setOption') {
            // Handle setOption command response (including captions)
            console.log('🔤 setOption command response received:', data)
            if (data.args && data.args[0] === 'captions') {
              console.log('🔤 Captions setOption response:', {
                option: data.args[0],
                value: data.args[1],
                messageSource,
                isFullscreen
              })
            }
          } else if (data.event === 'infoDelivery') {
            // Handle info delivery messages (may contain captions info)
            console.log('🔍 YouTube infoDelivery received:', data, 'from:', messageSource)
            if (data.info && typeof data.info === 'object') {
              console.log('🔍 infoDelivery details:', {
                hasCaptions: 'captions' in data.info,
                captionsInfo: data.info.captions,
                playerState: data.info.playerState,
                videoData: data.info.videoData
              })
            }
          } else {
            // Log any other messages for debugging
            console.log('🔍 Other YouTube message received:', data, 'from:', messageSource)
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
  }, [isFullscreen])

  // Additional effect to handle iframe load and set up event listeners
  useEffect(() => {
    if (playerRef.current && playerRef.current.iframe) {
      const iframe = playerRef.current.iframe
      
      // Add event listener for iframe load
      const handleIframeLoad = () => {
        console.log('Iframe loaded, setting up player state detection')
        console.log('🔤 Iframe loaded - checking if captions are available with cc_load_policy=1')
        
        // Send a message to enable state change events
        const message = {
          event: 'listening',
          func: 'addEventListener',
          args: ['onStateChange']
        }
        setTimeout(() => {
          // Check if iframe is still valid before sending message
          if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
            try {
              iframe.contentWindow.postMessage(JSON.stringify(message), '*')
              console.log('🔤 Added onStateChange listener to iframe')
            } catch (error) {
              console.warn('Failed to send message to iframe:', error)
            }
          } else {
            console.warn('Iframe not available for postMessage')
          }
        }, 1000)
        
        // Additional commands to remove unwanted YouTube elements
        setTimeout(() => {
          console.log('🔧 Applying additional YouTube cleanup commands...')
          
          // Check if iframe is still valid before sending messages
          if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
            try {
              // Command 1: Set player options to minimize UI elements
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setOption',
                args: ['captions', 'track', null]
              }), '*')
              
              // Command 2: Set additional options to hide elements
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setOption',
                args: ['annotations', 'show', false]
              }), '*')
              
              // Command 3: Set player size to ensure proper rendering
              if (playerContainerRef.current) {
                const { offsetWidth, offsetHeight } = playerContainerRef.current
                iframe.contentWindow.postMessage(JSON.stringify({
                  event: 'command',
                  func: 'setSize',
                  args: [offsetWidth, offsetHeight]
                }), '*')
              }
              
              console.log('🔧 YouTube cleanup commands applied')
            } catch (error) {
              console.warn('Failed to apply YouTube cleanup commands:', error)
            }
          } else {
            console.warn('Iframe not available for cleanup commands')
          }
        }, 1500)
      }

      iframe.addEventListener('load', handleIframeLoad)
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [playerRef.current])

  const togglePlay = () => {
    if (!currentClip) {
      // If no clip is selected, select the first clip
      console.log('No clip selected, selecting first clip')
      setCurrentClipIndex(0)
      return
    }
    
    // Toggle play/pause using YouTube's native controls
    if (isPlaying) {
      sendPostMessage('pauseVideo')
      setIsPlaying(false)
      console.log('Pausing video')
      
      // Stop the time tracking when pausing to sync timeline
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      // Apply immediate cleanup when pausing to remove "More videos" and other elements
      setTimeout(() => {
        console.log('🔧 Immediate cleanup after pausing video...')
        if (playerRef.current?.iframe) {
          try {
            const iframe = playerRef.current.iframe
            
            // Check if iframe is valid before sending messages
            if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
              // Command 1: Hide annotations immediately
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setOption',
                args: ['annotations', 'show', false]
              }), '*')
              
              // Command 2: Set player size to maintain clean appearance
              if (playerContainerRef.current) {
                const { offsetWidth, offsetHeight } = playerContainerRef.current
                iframe.contentWindow.postMessage(JSON.stringify({
                  event: 'command',
                  func: 'setSize',
                  args: [offsetWidth, offsetHeight]
                }), '*')
              }
              
              // Command 3: Additional cleanup for related content
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'setOption',
                args: ['captions', 'track', null]
              }), '*')
              
              console.log('🔧 Immediate cleanup completed after pause')
            } else {
              console.warn('🔧 Iframe not available for immediate cleanup')
            }
          } catch (error) {
            console.log('🔧 Immediate cleanup error:', error)
          }
        }
      }, 500) // Wait 500ms for YouTube to process the pause
    } else {
      // Seek to current time before playing to maintain sync
      sendPostMessage('seekTo', [currentTime, true])
      setTimeout(() => {
        sendPostMessage('playVideo')
        setIsPlaying(true)
        console.log('Playing video from time:', currentTime)
      }, 100)
    }
  }

  // Volume control functions
  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolume(clampedVolume)
    
    if (clampedVolume === 0) {
      setIsMuted(true)
      sendPostMessage('mute')
    } else {
      if (isMuted) {
        setIsMuted(false)
        sendPostMessage('unMute')
      }
      sendPostMessage('setVolume', [clampedVolume])
    }
    
    console.log('Volume changed to:', clampedVolume)
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      sendPostMessage('unMute')
      console.log('Unmuted')
    } else {
      setIsMuted(true)
      sendPostMessage('mute')
      console.log('Muted')
    }
  }

  const toggleCaptions = () => {
    console.log('🔤 === toggleCaptions function called ===')
    console.log('🔤 toggleCaptions called from:', new Error().stack?.split('\n')[2] || 'unknown location')
    const newState = !isCaptionsEnabled
    console.log('🔤 toggleCaptions called:', { 
      currentState: isCaptionsEnabled, 
      newState, 
      currentClip: currentClip?.title,
      currentTime,
      playerReady,
      isPlaying,
      hasIframe: !!(iframeRef.current && iframeRef.current.querySelector('iframe')),
    })

    // Mark that user has interacted with captions
    setHasUserInteractedWithCaptions(true)
    console.log('🔤 User has now interacted with captions, setting hasUserInteractedWithCaptions to true')
    
    // Check if player is in a valid state to receive commands
    if (!playerReady) {
      console.log('🔤 Player not ready, cannot toggle captions')
      return
    }
    
    if (!currentClip) {
      console.log('🔤 No current clip, cannot toggle captions')
      return
    }
    
    setIsCaptionsEnabled(newState)
    
    if (newState) {
      // Enable captions by setting track to empty object (default track)
      console.log('🔤 Enabling captions, sending setOption command...')
      console.log('🔤 Command details: setOption captions track {}')
      
      // Add a small delay to ensure player is ready
      setTimeout(() => {
        console.log('🔤 Sending enable captions command after delay...')
        sendPostMessage('setOption', ['captions', 'track', {}])
        console.log('🔤 Captions enabled command sent')
      }, 200)
      
      // Add additional logging to verify iframe state
      setTimeout(() => {
        const normalIframe = iframeRef.current && iframeRef.current.querySelector('iframe')
        console.log('🔤 Post-enable iframe check:', {
          normalIframe: !!normalIframe,
          normalIframeSrc: normalIframe?.src
        })
      }, 500)
    } else {
      // Disable captions by setting track to null
      console.log('🔤 Disabling captions, sending setOption command...')
      console.log('🔤 Command details: setOption captions track null')
      
      // Add a small delay to ensure player is ready
      setTimeout(() => {
        console.log('🔤 Sending disable captions command after delay...')
        sendPostMessage('setOption', ['captions', 'track', null])
        console.log('🔤 Captions disabled command sent')
      }, 200)
    }
  }

  const nextClip = useCallback(() => {
    if (!safeClips || !safeClips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex >= safeClips.length - 1) {
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
  }, [currentClipIndex, safeClips, updateVisibleClipRange])

  const previousClip = useCallback(() => {
    if (!safeClips || !safeClips.length) return
    
    setIsManualNavigation(true)
    
    if (currentClipIndex <= 0) {
      // If we're at the beginning, go to the end
      const lastIndex = safeClips.length - 1
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
  }, [currentClipIndex, safeClips, updateVisibleClipRange])

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/chain/${id}`
    navigator.clipboard.writeText(shareUrl)
    setNotification({ isVisible: true, type: 'success', title: 'Link copied!', message: 'Share this chain with others.' })
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

  const getTotalClipTime = () => {
    if (!currentClip) return 0
    return currentClip.endTime - currentClip.startTime
  }

  // Handle timeline click and drag
  const handleTimelineClick = (e) => {
    if (overlayRef.current && currentClip) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Update the current time immediately for UI responsiveness
      setCurrentTime(clampedTime)
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
      console.log('Seeking to time:', clampedTime, 'in normal mode')
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging && overlayRef.current && currentClip) {
      const rect = overlayRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const width = rect.width
      const percentage = (clickX / width) * 100
      const newTime = currentClip.startTime + (percentage / 100) * (currentClip.endTime - currentClip.startTime)
      const clampedTime = Math.max(currentClip.startTime, Math.min(currentClip.endTime, newTime))
      
      // Update the current time immediately for UI responsiveness
      setCurrentTime(clampedTime)
      
      // Use postMessage to seek
      sendPostMessage('seekTo', [clampedTime, true])
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

  // LOG para depuración
  console.log('safeClips:', safeClips)
  console.log('currentClipIndex:', currentClipIndex)

  

  return (
    <>
      <div className={`bg-white border border-gray-100 hover:bg-blue-100/30 rounded-xl shadow-md transition-all duration-300 group ${compact ? 'compact-player' : ''}`}>


        {/* Header with Logo and Copy Link */}
        <div className="flex items-center justify-between px-0 pt-4 pb-4 border-gray-100" style={{paddingLeft: '1.5rem', paddingRight: '1.5rem'}}>
          {/* Left side - Logo as link to landing */}
          <div className="flex items-center min-w-0">
            <a href="http://localhost:5173/landing" target="_blank" rel="noopener noreferrer" title="Go to Clipchain landing page">
              <img src="/logo-letters-blue.svg" alt="clipchain" className="h-6 w-auto mr-2" />
            </a>
          </div>
          
          {/* Right side - Copy Link */}
          <button
            onClick={copyLink}
            className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 active:scale-95 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ml-auto"
            aria-label="Copy share link"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Copy link</span>
          </button>
        </div>

        {/* Title and Description */}
        <div className="px-6 pb-2 text-xs text-gray-400 font-light mt-2">
          {author && (
            <Link
              to={typeof author === 'object' && author.username ? `/user/${author.username}` : `/user/${author}`}
              className="text-primary-600 hover:underline"
              title={`View ${typeof author === 'object' && author.username ? author.username : author}'s profile`}
            >
              By {typeof author === 'object' && author.username ? author.username : author}
            </Link>
          )}
          {author && createdAt && <> • </>}
          {createdAt && <>{new Date(createdAt).toLocaleDateString()}</>}
        </div>
        <div className="px-6 pb-2 text-sm text-gray-600 font-light">{description}</div>

        {/* Chapter Indicators - Moved to area above video player (pink rectangle area) */}
        <div className="flex space-x-2 px-6 pb-2">
          {safeClips.map((clip, idx) => (
            <button
              key={clip.id || idx}
              className={`flex items-center justify-center rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${compact ? 'w-5 h-5' : 'w-7 h-7'} ${idx === currentClipIndex ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'}`}
              aria-label={`Go to clip ${idx + 1}`}
              onClick={() => {
                setIsManualNavigation(true)
                setCurrentClipIndex(idx)
                updateVisibleClipRange(idx)
                setTimeout(() => setIsManualNavigation(false), 1000)
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div className="px-6 pb-2">

            <div className="mb-2 mt-2">
              {currentClip ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {currentClip.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatTime(currentClip.startTime)} - {formatTime(currentClip.endTime)} ({formatTime(currentClip.endTime - currentClip.startTime)} duration)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-left py-1 text-gray-500">
                  <p className="text-xs">Select a clip to start playing</p>
                </div>
              )}
            </div>

            {/* Player Container - This will be the target for fullscreen */}
            <div ref={playerContainerRef} className="relative">
              <div 
                className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'h-full' : 'mb-3'} youtube-embed-clean`} 
                style={{
                  // Custom CSS to hide YouTube elements including "More videos"
                  '--youtube-clean': 'true'
                }}
                data-state={isPlaying ? 'playing' : 'paused'}
              >
                <div
                  ref={iframeRef}
                  className={`w-full ${isFullscreen ? 'h-full' : 'aspect-video'}`}
                  style={{ 
                    aspectRatio: isFullscreen ? 'auto' : '16/9',
                    minHeight: isFullscreen ? '100vh' : (compact ? '200px' : '300px'),
                    // Better fullscreen sizing
                    width: '100%',
                    height: isFullscreen ? '100%' : 'auto',
                    // Ensure video fills the fullscreen container properly
                    objectFit: isFullscreen ? 'cover' : 'contain'
                  }}
                />
                
                {/* Custom Play Button Overlay */}
                {(!currentClip || !isPlaying) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-600 focus:outline-none rounded-full shadow-lg hover:scale-110 transition-all duration-200 transform"
                      title={currentClip ? 'Play' : 'Select a clip to play'}
                    >
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Transparent overlay to detect clicks when video is playing */}
                {isPlaying && currentClip && !isFullscreen && (
                  <div 
                    className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200 z-10"
                    onClick={() => {
                      console.log('User clicked on video overlay - pausing video')
                      setIsPlaying(false)
                      sendPostMessage('pauseVideo')
                      
                      // Stop the time tracking when pausing to sync timeline
                      if (timerRef.current) {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                      }
                      
                      // Apply immediate cleanup when pausing via overlay click
                      setTimeout(() => {
                        console.log('🔧 Immediate cleanup after overlay pause...')
                        if (playerRef.current?.iframe) {
                          try {
                            const iframe = playerRef.current.iframe
                            
                            // Check if iframe is valid before sending messages
                            if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
                              // Command 1: Hide annotations immediately
                              iframe.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'setOption',
                                args: ['annotations', 'show', false]
                              }), '*')
                              
                              // Command 2: Set player size to maintain clean appearance
                              if (playerContainerRef.current) {
                                const { offsetWidth, offsetHeight } = playerContainerRef.current
                                iframe.contentWindow.postMessage(JSON.stringify({
                                  event: 'command',
                                  func: 'setSize',
                                  args: [offsetWidth, offsetHeight]
                                }), '*')
                              }
                              
                              // Command 3: Additional cleanup for related content
                              iframe.contentWindow.postMessage(JSON.stringify({
                                event: 'command',
                                func: 'setOption',
                                args: ['captions', 'track', null]
                              }), '*')
                              
                              console.log('🔧 Overlay pause cleanup completed')
                            } else {
                              console.warn('🔧 Iframe not available for overlay pause cleanup')
                            }
                          } catch (error) {
                            console.log('🔧 Overlay pause cleanup error:', error)
                          }
                        }
                      }, 500) // Wait 500ms for YouTube to process the pause
                      
                      // Additional resize in fullscreen mode to improve quality
                      if (isFullscreen) {
                        const iframe = iframeRef.current && iframeRef.current.querySelector('iframe')
                        if (iframe) {
                          setTimeout(() => {
                            console.log('Additional resize after user interaction in fullscreen')
                            iframe.style.width = '100%'
                            iframe.style.height = '100%'
                            iframe.offsetHeight
                          }, 100)
                        }
                      }
                    }}
                  />
                )}

                {/* Fullscreen Overlay */}
                {isFullscreen && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Transparent overlay to detect clicks when video is playing in fullscreen */}
                    {isPlaying && currentClip && (
                      <div 
                        className="absolute inset-0 cursor-pointer pointer-events-auto"
                        onClick={() => {
                          console.log('User clicked on fullscreen video overlay - pausing video')
                          setIsPlaying(false)
                          sendPostMessage('pauseVideo')
                          
                          // Stop the time tracking when pausing to sync timeline
                          if (timerRef.current) {
                            clearInterval(timerRef.current)
                            timerRef.current = null
                          }
                          
                          // Apply immediate cleanup when pausing via fullscreen overlay click
                          setTimeout(() => {
                            console.log('🔧 Immediate cleanup after fullscreen overlay pause...')
                            if (playerRef.current?.iframe) {
                              try {
                                const iframe = playerRef.current.iframe
                                
                                // Check if iframe is valid before sending messages
                                if (iframe && iframe.contentWindow && iframe.contentWindow.postMessage && typeof iframe.contentWindow.postMessage === 'function') {
                                  // Command 1: Hide annotations immediately
                                  iframe.contentWindow.postMessage(JSON.stringify({
                                    event: 'command',
                                    func: 'setOption',
                                    args: ['annotations', 'show', false]
                                  }), '*')
                                  
                                  // Command 2: Set player size to maintain clean appearance
                                  if (playerContainerRef.current) {
                                    const { offsetWidth, offsetHeight } = playerContainerRef.current
                                    iframe.contentWindow.postMessage(JSON.stringify({
                                      event: 'command',
                                      func: 'setSize',
                                      args: [offsetWidth, offsetHeight]
                                    }), '*')
                                  }
                                  
                                  // Command 3: Additional cleanup for related content
                                  iframe.contentWindow.postMessage(JSON.stringify({
                                    event: 'command',
                                    func: 'setOption',
                                    args: ['captions', 'track', null]
                                  }), '*')
                                  
                                  console.log('🔧 Fullscreen overlay pause cleanup completed')
                                } else {
                                  console.warn('🔧 Iframe not available for fullscreen overlay cleanup')
                                }
                              } catch (error) {
                                console.log('🔧 Fullscreen overlay pause cleanup error:', error)
                              }
                            }
                          }, 500) // Wait 500ms for YouTube to process the pause
                        }}
                      />
                    )}

                    {/* Top Bar - Title and Exit */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
                      <div className="flex items-center justify-between">
                        {/* Left side - Title */}
                        <div className="flex-1">
                          <h2 className="text-white text-lg font-semibold truncate">
                            {title}
                          </h2>
                          {description && (
                            <p className="text-white/80 text-sm truncate">
                              {description}
                            </p>
                          )}
                        </div>
                        
                        {/* Right side - Exit fullscreen button */}
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 text-white hover:text-secondary-950 hover:bg-white/20 rounded-lg transition-all duration-200"
                          title="Exit fullscreen (ESC)"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Control Panel - Fixed height, no overlap with video */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm pointer-events-auto transition-all duration-300 ease-in-out ${
                        showFullscreenControls || !isPlaying ? 'translate-y-0' : 'translate-y-full'
                      }`}
                      onMouseEnter={() => {
                        // Clear timeout when entering controls area
                        if (controlsTimeout) {
                          clearTimeout(controlsTimeout)
                          setControlsTimeout(null)
                        }
                      }}
                      onMouseLeave={() => {
                        // Start timeout only when leaving controls area AND video is playing
                        if (showFullscreenControls && isPlaying) {
                          const newTimeout = setTimeout(() => {
                            setShowFullscreenControls(false)
                          }, 500)
                          setControlsTimeout(newTimeout)
                        }
                      }}
                    >
                      {/* Main Controls Section - Timeline, Controls, Clips (centered in height) */}
                      <div className="p-4">
                        {/* Timeline - At the top */}
                        <div 
                          ref={overlayRef}
                          className="relative w-full h-2.5 bg-gray-600 rounded-full cursor-pointer mb-3"
                          onClick={handleTimelineClick}
                          onMouseDown={handleMouseDown}
                        >
                          {/* Progress track */}
                          <div 
                            className="absolute left-0 top-0 h-full bg-primary-100 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${getProgressPercentage()}%` }}
                          ></div>
                          
                          {/* Progress handle */}
                          <div 
                            className="absolute top-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-2 cursor-pointer hover:scale-110 transition-transform border-2 border-white"
                            style={{ left: `${getProgressPercentage()}%` }}
                          ></div>
                        </div>

                        {/* Controls Row - All elements in one line: Timeline + Controls + Volume + Clips + CC + Time */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Left side - Playback controls + Volume */}
                          <div className="flex items-center space-x-4">
                            {/* Playback controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={previousClip}
                                className="p-2 text-white hover:text-secondary-950 hover:bg-white/20 rounded-full transition-all duration-200"
                                title="Previous clip"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                                </svg>
                              </button>
                              
                              <button
                                onClick={togglePlay}
                                className="p-2 text-white hover:text-secondary-950 hover:bg-white/20 rounded-full transition-all duration-200"
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
                                className="p-2 text-white hover:text-secondary-950 hover:bg-white/20 rounded-full transition-all duration-200"
                                title="Next clip"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                                </svg>
                              </button>
                            </div>

                            {/* Volume Controls */}
                            <div 
                              className="relative"
                              onMouseEnter={() => setShowVolumeSlider(true)}
                              onMouseLeave={() => setShowVolumeSlider(false)}
                            >
                              {/* Mute/Unmute button */}
                              <button
                                onClick={toggleMute}
                                className="p-2 text-white hover:text-secondary-950 hover:bg-white/20 rounded-full transition-all duration-200"
                                title={isMuted ? 'Unmute' : 'Mute'}
                              >
                                {isMuted || volume === 0 ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                  </svg>
                                ) : volume < 50 ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                  </svg>
                                )}
                              </button>
                              
                              {/* Volume slider - Absolute positioned to avoid layout shifts */}
                              <div 
                                className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-2 flex items-center space-x-2 transition-all duration-300 ease-in-out ${
                                  showVolumeSlider 
                                    ? 'opacity-100 visible' 
                                    : 'opacity-0 invisible'
                                }`}
                              >
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={isMuted ? 0 : volume}
                                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                                  className="w-20 h-2 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                                  style={{
                                    background: `linear-gradient(to right, #0F4C81 0%, #0F4C81 ${isMuted ? 0 : volume}%, #6b7280 ${isMuted ? 0 : volume}%, #6b7280 100%)`
                                  }}
                                  title={`Volume: ${isMuted ? 0 : volume}%`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Center - Clip Navigation */}
                          <div className="flex flex-col items-center space-y-1">
                            {/* Current Clip Title */}
                            <div className="text-center">
                              <span className="text-white/90 text-sm font-medium">
                                {currentClip ? currentClip.title : 'Select clip to start'}
                              </span>
                            </div>
                            
                            {/* Clip Navigation Pills */}
                            <div className="flex space-x-2 flex-wrap justify-center">
                              {safeClips && safeClips.length > 0 ? safeClips.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setIsManualNavigation(true)
                                    setCurrentClipIndex(index)
                                    updateVisibleClipRange(index)
                                    setTimeout(() => setIsManualNavigation(false), 1000)
                                  }}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${index === currentClipIndex ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'}`}
                                  aria-label={`Go to clip ${index + 1}`}
                                >
                                  {index + 1}
                                </button>
                              )) : (
                                <span className="text-xs text-white/70">No clips available</span>
                              )}
                            </div>
                          </div>
                           
                          {/* Right side - CC and Time */}
                          <div className="flex items-center space-x-3">
                            {/* Captions Control */}
                            <div className="w-16 flex justify-center">
                              <button
                                onClick={() => {
                                  console.log('🔤 Fullscreen CC button clicked!')
                                  toggleCaptions()
                                }}
                                className={`${isCaptionsEnabled ? 'text-white bg-secondary-950 border-secondary-950' : 'text-white hover:text-secondary-950 hover:bg-white/20 border-white/30'} border rounded-lg transition-all duration-200 px-2 py-1`}
                                title={isCaptionsEnabled ? 'Disable captions' : 'Enable captions'}
                              >
                                <span className="font-bold text-xs">CC</span>
                              </button>
                            </div>
                            

                            {/* Time info */}
                            <div className="w-16 text-right">
                              <span className="text-base text-white font-mono">
                                {currentClip ? formatTime(getRemainingTime()) : '00:00'}
                              </span>
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>

                    {/* Subtle indicator that controls are available - only show when video is playing */}
                    {!showFullscreenControls && isPlaying && (
                      <div 
                        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto"
                        onMouseEnter={() => {
                          setShowFullscreenControls(true)
                        }}
                      >
                        <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/30 transition-colors duration-200">
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 14l5-5 5 5z"/>
                            </svg>
                            <span>Hover here for controls</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Controls Section - Only visible when NOT in fullscreen */}
              {!isFullscreen && (
                <div className={`space-y-2 ${compact ? 'space-y-1' : ''}`}>
                  {/* Custom Timeline */}
                  <div 
                    ref={overlayRef}
                    className={`relative w-full bg-gray-300 rounded-full cursor-pointer ${compact ? 'h-1' : 'h-1.5'}`}
                    onClick={handleTimelineClick}
                    onMouseDown={handleMouseDown}
                  >
                    {/* Progress track */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary-100 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                    
                    {/* Progress handle */}
                    <div 
                      className={`absolute top-1/2 bg-primary-600 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1.5 cursor-pointer hover:scale-110 transition-transform border-2 border-white ${compact ? 'w-2 h-2' : 'w-3 h-3'}`}
                      style={{ left: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center justify-between">
                    {/* Playback Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={previousClip}
                        className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                        title="Previous clip"
                      >
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={togglePlay}
                        className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1.5' : 'p-2'}`}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        ) : (
                          <svg className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={nextClip}
                        className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                        title="Next clip"
                      >
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Volume Controls */}
                    <div 
                      className="flex items-center space-x-2 relative"
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      {/* Mute/Unmute button */}
                      <button
                        onClick={toggleMute}
                        className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : volume < 50 ? (
                          <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                          </svg>
                        ) : (
                          <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Volume slider - inline with the button */}
                      <div 
                        className={`flex items-center space-x-2 transition-all duration-300 ease-in-out ${
                          showVolumeSlider 
                            ? 'opacity-100 max-w-32' 
                            : 'opacity-0 max-w-0 overflow-hidden'
                        }`}
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                          className={`bg-gray-300 rounded-full appearance-none cursor-pointer slider ${compact ? 'w-12 h-1' : 'w-16 h-1.5'}`}
                          style={{
                            background: `linear-gradient(to right, #0F4C81 0%, #0F4C81 ${isMuted ? 0 : volume}%, #e5e7eb ${isMuted ? 0 : volume}%, #e5e7eb 100%)`
                          }}
                          title={`Volume: ${isMuted ? 0 : volume}%`}
                        />
                        {!compact && (
                          <span className="text-xs text-gray-600 w-8">
                            {isMuted ? 0 : volume}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time info and Captions Control */}
                    <div className="flex-1 flex items-center justify-end space-x-2">
                      {/* Fullscreen button */}
                      <button
                        onClick={toggleFullscreen}
                        className={`text-gray-700 hover:text-secondary-950 hover:bg-gray-100 rounded-full transition-all duration-200 ${compact ? 'p-1' : 'p-1.5'}`}
                        title="Enter fullscreen"
                      >
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                      </button>

                      {/* Captions Control - Fixed width to prevent jumping */}
                      <div className="w-16 flex justify-center">
                        {console.log('🔤 Rendering CC button:', { isCaptionsEnabled, currentClip: !!currentClip, playerReady })}
                        <button
                          onClick={() => {
                            console.log('🔤 CC button clicked!')
                            console.log('🔤 CC button state:', { isCaptionsEnabled, currentClip: !!currentClip, playerReady })
                            toggleCaptions()
                          }}
                          className={`${isCaptionsEnabled ? 'text-secondary-950 bg-gray-100 border-secondary-950' : 'text-gray-700 hover:text-secondary-950 hover:bg-gray-100 border-gray-300'} border rounded transition-all duration-200 ${compact ? 'px-1 py-0.5' : 'px-1 py-0.5'}`}
                          title={isCaptionsEnabled ? 'Disable captions' : 'Enable captions'}
                        >
                          <span className={`font-bold ${compact ? 'text-xs' : 'text-xs'}`} style={{ lineHeight: 'normal', fontSize: '11px', display: 'block' }}>CC</span>
                        </button>
                      </div>
                      
                      {/* Time info - Fixed width to prevent jumping */}
                      <div className="w-12 text-right">
                        <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-xs'}`} style={{ lineHeight: '1', marginTop: '1px' }}>
                          {currentClip ? formatTime(getRemainingTime()) : '00:00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
        <AppNotification
          isVisible={notification.isVisible}
          onClose={() => setNotification(n => ({ ...n, isVisible: false }))}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
      {isFullscreen && (
        <div
          className="absolute inset-0 z-30 pointer-events-auto"
          onMouseMove={() => {
            setShowFullscreenControls(true)
            if (controlsTimeout) clearTimeout(controlsTimeout)
            if (isPlaying) {
              const newTimeout = setTimeout(() => setShowFullscreenControls(false), 2000)
              setControlsTimeout(newTimeout)
            }
          }}
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false)
              sendPostMessage('pauseVideo')
            } else if (currentClip) {
              setIsPlaying(true)
              sendPostMessage('playVideo')
            }
          }}
          style={{ background: 'transparent' }}
        />
      )}
      {isFullscreen && (
        <div className={`absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm pointer-events-auto z-50 transition-all duration-300 ease-in-out ${showFullscreenControls || !isPlaying ? 'translate-y-0' : 'translate-y-full'}`}
          onMouseEnter={() => {
            if (controlsTimeout) clearTimeout(controlsTimeout)
            setShowFullscreenControls(true)
          }}
          onMouseLeave={() => {
            if (showFullscreenControls && isPlaying) {
              const newTimeout = setTimeout(() => setShowFullscreenControls(false), 1000)
              setControlsTimeout(newTimeout)
            }
          }}
        >
          {/* ...dock controls... */}
        </div>
      )}
    </>
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

