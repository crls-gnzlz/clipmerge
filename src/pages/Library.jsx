import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import Footer from '../components/Footer.jsx'

const Library = () => {
  // Mock data for library examples - in a real app, this would come from an API
  const libraryExamples = [
    {
      id: 'python-data-science',
      title: 'Python Data Science',
      description: 'Learn data science with Python through practical examples and real-world applications.',
      clips: [
        {
          id: 1,
          title: "Pandas Basics",
          videoId: "dcqPhpY7tWk",
          startTime: 60,
          endTime: 240
        },
        {
          id: 2,
          title: "Data Visualization with Matplotlib",
          videoId: "dcqPhpY7tWk",
          startTime: 240,
          endTime: 420
        },
        {
          id: 3,
          title: "NumPy Arrays",
          videoId: "dcqPhpY7tWk",
          startTime: 420,
          endTime: 600
        },
        {
          id: 4,
          title: "Data Cleaning Techniques",
          videoId: "dcqPhpY7tWk",
          startTime: 600,
          endTime: 780
        }
      ],
      author: 'Data Scientist',
      createdAt: '2024-01-12',
      tags: ['Python', 'Data Science', 'Pandas', 'NumPy']
    },
    {
      id: 'economics-basics',
      title: 'Economics Fundamentals',
      description: 'Understand the core principles of economics through engaging explanations and real-world examples.',
      clips: [
        {
          id: 1,
          title: "Supply and Demand",
          videoId: "V0tIOqU7m-c",
          startTime: 45,
          endTime: 225
        },
        {
          id: 2,
          title: "Market Equilibrium",
          videoId: "V0tIOqU7m-c",
          startTime: 225,
          endTime: 405
        },
        {
          id: 3,
          title: "Elasticity of Demand",
          videoId: "V0tIOqU7m-c",
          startTime: 405,
          endTime: 585
        },
        {
          id: 4,
          title: "Price Controls",
          videoId: "V0tIOqU7m-c",
          startTime: 585,
          endTime: 765
        }
      ],
      author: 'Economics Professor',
      createdAt: '2024-01-10',
      tags: ['Economics', 'Education', 'Finance', 'Business']
    },
    {
      id: 'javascript-modern',
      title: 'Modern JavaScript',
      description: 'Explore modern JavaScript features including ES6+, async/await, and functional programming.',
      clips: [
        {
          id: 1,
          title: "ES6+ Features",
          videoId: "W6NZfCO5SIk",
          startTime: 180,
          endTime: 360
        },
        {
          id: 2,
          title: "Async/Await Patterns",
          videoId: "W6NZfCO5SIk",
          startTime: 360,
          endTime: 540
        },
        {
          id: 3,
          title: "Promises Deep Dive",
          videoId: "W6NZfCO5SIk",
          startTime: 540,
          endTime: 720
        },
        {
          id: 4,
          title: "Functional Programming",
          videoId: "W6NZfCO5SIk",
          startTime: 720,
          endTime: 900
        }
      ],
      author: 'JS Expert',
      createdAt: '2024-01-08',
      tags: ['JavaScript', 'ES6', 'Async', 'Programming']
    },
    {
      id: 'machine-learning-intro',
      title: 'Machine Learning Basics',
      description: 'Introduction to machine learning concepts, algorithms, and practical applications.',
      clips: [
        {
          id: 1,
          title: "What is Machine Learning?",
          videoId: "KNAWp2S3w94",
          startTime: 30,
          endTime: 210
        },
        {
          id: 2,
          title: "Supervised vs Unsupervised Learning",
          videoId: "KNAWp2S3w94",
          startTime: 210,
          endTime: 390
        },
        {
          id: 3,
          title: "Linear Regression",
          videoId: "KNAWp2S3w94",
          startTime: 390,
          endTime: 570
        },
        {
          id: 4,
          title: "Classification Algorithms",
          videoId: "KNAWp2S3w94",
          startTime: 570,
          endTime: 750
        }
      ],
      author: 'ML Engineer',
      createdAt: '2024-01-05',
      tags: ['Machine Learning', 'AI', 'Data Science', 'Python']
    },
    {
      id: 'web-development',
      title: 'Web Development',
      description: 'Complete web development course covering HTML, CSS, and JavaScript fundamentals.',
      clips: [
        {
          id: 1,
          title: "HTML Structure",
          videoId: "UB1O30fR-EE",
          startTime: 60,
          endTime: 240
        },
        {
          id: 2,
          title: "CSS Styling",
          videoId: "UB1O30fR-EE",
          startTime: 240,
          endTime: 420
        },
        {
          id: 3,
          title: "JavaScript Basics",
          videoId: "UB1O30fR-EE",
          startTime: 420,
          endTime: 600
        },
        {
          id: 4,
          title: "Responsive Design",
          videoId: "UB1O30fR-EE",
          startTime: 600,
          endTime: 780
        }
      ],
      author: 'Web Developer',
      createdAt: '2024-01-03',
      tags: ['Web Development', 'HTML', 'CSS', 'JavaScript']
    }
  ]

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter examples based on search term
  const filteredExamples = useMemo(() => {
    return libraryExamples.filter(example => {
      // Text search - search in title, description, author, and tags
      const searchLower = debouncedSearchTerm.toLowerCase()
      const matchesSearch = debouncedSearchTerm === '' || 
        example.title.toLowerCase().includes(searchLower) ||
        example.description.toLowerCase().includes(searchLower) ||
        example.author.toLowerCase().includes(searchLower) ||
        example.tags.some(tag => tag.toLowerCase().includes(searchLower))

      return matchesSearch
    })
  }, [libraryExamples, debouncedSearchTerm])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      <div className="flex-1">
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

          {/* Search Section */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search chains, descriptions, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-secondary-950 focus:border-secondary-950"
              />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredExamples.length} of {libraryExamples.length} chains found
              </p>
              {debouncedSearchTerm && (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{debouncedSearchTerm}"
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-secondary-950 hover:text-secondary-900 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Library Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExamples.map((example) => (
              <div key={example.id} className="w-full">
                <ClipchainPlayer
                  id={example.id}
                  title={example.title}
                  description={example.description}
                  clips={example.clips}
                  author={example.author}
                  createdAt={example.createdAt}
                  tags={example.tags}
                  compact={true}
                />
              </div>
            ))}
          </div>

          {/* Empty State (if no examples match filters) */}
          {filteredExamples.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chains found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchTerm 
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Be the first to create and share a clipchain with the community!"
                }
              </p>
              {debouncedSearchTerm ? (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-6 py-3 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-colors duration-200"
                >
                  Clear search
                </button>
              ) : (
                <Link
                  to="/create"
                  className="inline-flex items-center px-6 py-3 bg-secondary-950 text-white rounded-lg font-medium hover:bg-secondary-900 transition-colors duration-200"
                >
                  Create Your First Clipchain
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Library
