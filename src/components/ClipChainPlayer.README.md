# ClipChainPlayer Component (ChainPlayer)

## Overview

The `ClipChainPlayer` is a custom React component designed to play a sequence of video clips (a "chain") from YouTube, with advanced controls and a minimal, elegant UI. It is the gold standard for video playback in the Clipchain app, supporting precise navigation, custom overlays, and a fully branded experience.

---

## Features

- **Plays a chain of YouTube video clips** with custom start/end times per clip.
- **Custom timeline bar** for precise seeking within the current clip.
- **Clip navigation pills** for jumping between clips.
- **Playback controls**: play/pause, next/previous clip.
- **Volume control**: mute/unmute, slider (shows on hover).
- **Captions (CC) toggle**: enable/disable YouTube captions.
- **Fullscreen mode**: immersive playback with docked controls.
- **Branded overlays**: custom play/pause overlay, Clipchain logo.
- **Copy share link**: easy sharing of the chain.
- **Responsive and accessible**: keyboard navigation, focus rings, ARIA labels.
- **Design system compliant**: colors, spacing, typography, and states.

---

## Props

```
<ClipChainPlayer
  id={string}                // Unique chain ID
  title={string}             // Chain title
  description={string}       // Chain description
  clips={[                  // Array of clip objects
    {
      id: string | number,
      title: string,
      videoId: string,       // YouTube video ID
      startTime: number,     // Start time in seconds
      endTime: number        // End time in seconds
    },
    ...
  ]}
  author={string}            // (optional) Author name
  createdAt={string}         // (optional) ISO date string
  tags={[string]}            // (optional) Array of tags
  compact={boolean}          // (optional) Compact mode
/>
```

---

## UI Breakdown

### 1. Header
- **Logo**: Clipchain logo (left)
- **Title**: Chain title (center/left)
- **Copy Link**: Button to copy the shareable chain URL (right)

### 2. Meta
- **Author**: Displayed if provided
- **Date**: Creation date
- **Description**: Short description of the chain

### 3. Clip Navigation Pills
- Pills numbered for each clip in the chain
- Highlighted for the current clip
- Click to jump to a specific clip

### 4. Video Player Area
- **YouTube embed**: Custom iframe with all native controls hidden
- **Custom overlay**: Large play button when paused, darkened background
- **Clickable overlay**: Clicking anywhere on the video toggles play/pause
- **In fullscreen**: Overlay and controls adapt for immersive experience

### 5. Timeline Bar
- **Custom progress bar**: Shows current position within the clip
- **Draggable handle**: Seek to any point in the current clip
- **Finer height**: `h-1` for a minimal look

### 6. Controls Dock
- **Playback**: Previous, Play/Pause, Next
- **Volume**: Mute/unmute button, slider appears on hover
- **Captions (CC)**: Toggle YouTube captions
- **Fullscreen**: Enter/exit fullscreen
- **Time**: Remaining time in the current clip
- **Dock in fullscreen**: Always visible when paused, appears on mouse move when playing

### 7. AppNotification
- **Feedback**: Success/error/info popups (e.g., "Link copied!")
- **Position**: Centered at the top of the player

---

## Overlay Layer (Custom Play/Pause Control)

A key feature of the `ClipChainPlayer` is the use of a custom overlay layer above the video area (both in normal and fullscreen modes). This overlay:

- **Captures all clicks/taps** on the video area, allowing users to play or pause the video by clicking anywhere on the video (not just the play button).
- **Synchronizes all player state** (play/pause, timeline, overlays) with the app's React state, ensuring that the timeline, controls, and UI always reflect the true playback state.
- **Works in both normal and fullscreen modes**, providing a consistent experience across devices and screen sizes.
- **Replaces the default YouTube controls** for a seamless, branded, and minimal interface.
- **Essential for timeline correlation**: By handling all play/pause actions through this overlay, the component ensures that the custom timeline, pills, and all advanced features remain perfectly in sync with the actual video playback.

**Implementation Note:**
- The overlay is a transparent (or semi-transparent when paused) `div` that sits above the YouTube iframe. It uses `pointer-events` to capture user interactions and triggers the custom play/pause logic in the component.
- In fullscreen, the overlay also ensures the controls dock appears on mouse movement and that all interactions are handled by the app, not the native YouTube player.

---

## User Interactions

- **Play/Pause**: Click the play button or anywhere on the video area
- **Seek**: Click or drag on the timeline bar
- **Next/Previous**: Use the arrow buttons to navigate clips
- **Volume**: Hover over the volume icon to reveal the slider
- **Captions**: Click "CC" to toggle captions
- **Fullscreen**: Click the fullscreen icon or press `ESC` to exit
- **Clip Pills**: Click a pill to jump to that clip
- **Copy Link**: Click the copy button to copy the chain URL
- **Keyboard**: Spacebar toggles play/pause, `ESC` exits fullscreen
- **All clicks/taps on the video area are handled by a custom overlay, not the YouTube player, to ensure perfect sync between UI and playback state.**

---

## Accessibility

- All interactive elements have `aria-label` and `title` attributes
- Focus rings and keyboard navigation are supported
- Buttons are large enough for touch and mouse users
- Color contrast meets accessibility standards

---

## Design System Notes

- **Colors**: Uses `primary`, `secondary`, and neutral palette from the design system
- **Typography**: Font sizes and weights match app standards
- **Spacing**: Consistent padding, margins, and rounded corners
- **States**: Hover, focus, and active states for all controls
- **Responsiveness**: Adapts to mobile, tablet, and desktop
- **No uppercase**: Labels and headers use sentence case

---

## Advanced Behaviors

- **Fullscreen Dock**: The controls dock in fullscreen is always visible when paused, and appears on mouse movement when playing. An invisible overlay ensures mouse events are captured anywhere on the video.
- **Overlay Play/Pause**: Clicking anywhere on the video toggles play/pause, not just the button.
- **YouTube API**: Uses `postMessage` to control playback, volume, captions, and quality.
- **Cleanup**: Periodically removes unwanted YouTube overlays (annotations, "more videos") for a clean look.
- **Clip Navigation**: Pills and arrows allow fast, precise navigation between clips.

---

## Example Usage

```
import ClipChainPlayer from './ClipChainPlayer'

<ClipChainPlayer
  id="abc123"
  title="My Favorite Moments"
  description="A curated chain of the best moments."
  clips={[
    { id: 1, title: 'Intro', videoId: 'dQw4w9WgXcQ', startTime: 0, endTime: 30 },
    { id: 2, title: 'Highlight', videoId: 'dQw4w9WgXcQ', startTime: 45, endTime: 90 }
  ]}
  author="Jane Doe"
  createdAt="2024-06-01T12:00:00Z"
  tags={["music", "funny"]}
/>
```

---

## Maintenance & Extension

- To add new features, follow the design system and keep all controls accessible.
- For bug fixes, test in both normal and fullscreen modes.
- For design changes, consult `DESIGN_SYSTEM.md` and update this README as needed.

---

## Contact

For questions or improvements, contact the Clipchain frontend team.
