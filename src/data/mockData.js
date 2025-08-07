/**
 * Mock data for development and testing
 */

export const mockClips = [
  {
    id: '1',
    title: 'Best moment of the match',
    videoId: 'dQw4w9WgXcQ',
    startTime: 45,
    endTime: 120,
    description: 'The most spectacular goal of the match',
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['football', 'goal', 'sports']
  },
  {
    id: '2',
    title: 'React Hooks Tutorial',
    videoId: 'TNhaISOU2GU',
    startTime: 120,
    endTime: 300,
    description: 'Clear explanation of useState and useEffect',
    createdAt: '2024-01-14T15:45:00Z',
    tags: ['programming', 'react', 'javascript']
  },
  {
    id: '3',
    title: 'Funny joke',
    videoId: 'jNQXAC9IVRw',
    startTime: 30,
    endTime: 90,
    description: 'The funniest moment of the show',
    createdAt: '2024-01-13T20:15:00Z',
    tags: ['comedy', 'entertainment']
  },
  {
    id: '4',
    title: 'Cooking tutorial - Pasta',
    videoId: 'abc123def',
    startTime: 60,
    endTime: 180,
    description: 'How to make perfect pasta',
    createdAt: '2024-01-12T14:20:00Z',
    tags: ['cooking', 'pasta', 'tutorial']
  },
  {
    id: '5',
    title: 'Guitar lesson - Basic chords',
    videoId: 'xyz789ghi',
    startTime: 45,
    endTime: 150,
    description: 'Learn basic guitar chords',
    createdAt: '2024-01-11T09:15:00Z',
    tags: ['music', 'guitar', 'tutorial']
  }
]

export const mockCollections = [
  {
    id: '1',
    name: 'My favorite clips',
    description: 'A collection of my favorite moments from YouTube',
    clips: ['1', '3'],
    createdAt: '2024-01-15T10:30:00Z',
    isPublic: true
  },
  {
    id: '2',
    name: 'Programming tutorials',
    description: 'Useful clips for learning programming',
    clips: ['2'],
    createdAt: '2024-01-14T15:45:00Z',
    isPublic: true
  },
  {
    id: '3',
    name: 'Cooking & Music',
    description: 'Collection of cooking and music tutorials',
    clips: ['4', '5'],
    createdAt: '2024-01-10T12:00:00Z',
    isPublic: false
  }
]

export const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@clipmerge.com',
  avatar: 'https://via.placeholder.com/40x40',
  collections: ['1', '2', '3']
}
