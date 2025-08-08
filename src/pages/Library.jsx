import React from 'react'
import { Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import { llmClips, notionTutorialClips } from '../data/exampleClips.js'

const Library = () => {
  // Create 15 clips for the example
  const createExtendedClips = (baseClips, count = 15) => {
    const extendedClips = []
    for (let i = 0; i < count; i++) {
      const baseClip = baseClips[i % baseClips.length]
      extendedClips.push({
        ...baseClip,
        id: `${baseClip.id}-${i}`,
        title: `${baseClip.title} ${i + 1}`,
        startTime: baseClip.startTime + (i * 30),
        endTime: baseClip.endTime + (i * 30)
      })
    }
    return extendedClips
  }

  // Mock data for library examples - in a real app, this would come from an API
  const libraryExamples = [
    {
      id: 'llm-tutorial',
      title: 'Learn about LLMs',
      description: 'A comprehensive collection of key concepts about Large Language Models, covering everything from basics to advanced topics.',
      clips: createExtendedClips(llmClips, 15),
      author: 'AI Enthusiast',
      createdAt: '2024-01-15',
      tags: ['Education', 'AI', 'Technology']
    },
    {
      id: 'notion-tutorial',
      title: 'Master Notion Basics',
      description: 'Learn how to use Notion effectively with clips from different tutorials combined in one place.',
      clips: notionTutorialClips,
      author: 'Productivity Pro',
      createdAt: '2024-01-10',
      tags: ['Productivity', 'Tutorial']
    },
    {
      id: 'react-basics',
      title: 'React Fundamentals',
      description: 'Essential React concepts for beginners and intermediate developers.',
      clips: llmClips, // Reusing for demo
      author: 'Code Master',
      createdAt: '2024-01-08',
      tags: ['Coding', 'React', 'JavaScript']
    },
    {
      id: 'javascript-essentials',
      title: 'JavaScript Essentials',
      description: 'Core JavaScript concepts and best practices for modern web development.',
      clips: notionTutorialClips, // Reusing for demo
      author: 'JS Developer',
      createdAt: '2024-01-05',
      tags: ['Coding', 'JavaScript']
    },
    {
      id: 'css-mastery',
      title: 'CSS Mastery',
      description: 'Advanced CSS techniques and modern layouts for professional web design.',
      clips: llmClips, // Reusing for demo
      author: 'Design Expert',
      createdAt: '2024-01-03',
      tags: ['Design', 'CSS', 'Frontend']
    },
    {
      id: 'python-basics',
      title: 'Python Basics',
      description: 'Introduction to Python programming language with practical examples.',
      clips: notionTutorialClips, // Reusing for demo
      author: 'Python Guru',
      createdAt: '2024-01-01',
      tags: ['Coding', 'Python', 'Education']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Clipchain library
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover curated clipchains created by our community. Find inspiration and learn from others.
          </p>
        </div>

        {/* Library Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryExamples.map((example) => (
            <div key={example.id} className="w-full">
              <ClipchainPlayer
                id={example.id}
                title={example.title}
                description={example.description}
                clips={example.clips}
                author={example.author}
                createdAt={example.createdAt}
                tags={example.tags}
              />
            </div>
          ))}
        </div>

        {/* Empty State (if no examples) */}
        {libraryExamples.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No examples yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to create and share a clipchain with the community!
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-colors duration-200"
            >
              Create Your First Clipchain
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Library
