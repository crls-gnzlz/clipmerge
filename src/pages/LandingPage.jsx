import React from 'react'
import { Link } from 'react-router-dom'
import ClipchainPlayer from '../components/ClipChainPlayer.jsx'
import Footer from '../components/Footer.jsx'
import { llmClips, chainMetadata } from '../data/exampleClips.js'

const LandingPage = () => {
  // Mock data for use cases
  const useCases = [
    {
      id: 1,
      title: 'Content Creators',
      description: 'Share the most engaging parts of your content across social platforms.',
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Educators',
      description: 'Build thematic lessons from videos, lectures or courses.',
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Marketing Teams',
      description: 'Curate customer testimonials and brand moments.',
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Support and Internal Training Teams',
      description: 'Create training materials and support documentation from internal videos and webinars.',
      icon: (
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ]

  // Mock data for example chains (first 3)
  const exampleChains = [
    {
      id: 'llm-tutorial',
      title: 'Learn about LLMs',
      description: 'A collection of key concepts about Large Language Models',
      clips: llmClips,
      author: chainMetadata['llm-tutorial'].author,
      createdAt: chainMetadata['llm-tutorial'].createdAt,
      tags: chainMetadata['llm-tutorial'].tags
    },

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
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Turn video moments into{' '}
                  <span className="text-primary-600">powerful collections</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Curate, merge and share the most important moments from videos, podcasts and more.
                </p>
              </div>
            </div>
            
            {/* Right side - Chain example */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <ClipchainPlayer
                  id="llm-tutorial"
                  title="Learn about LLMs"
                  description="A collection of key concepts about Large Language Models"
                  clips={llmClips}
                  author={chainMetadata['llm-tutorial'].author}
                  createdAt={chainMetadata['llm-tutorial'].createdAt}
                  tags={chainMetadata['llm-tutorial'].tags}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who is this for? Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who is Clipchain for?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're creating content, teaching, marketing, or organizing events, Clipchain helps you curate and share the moments that matter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase) => (
              <div key={useCase.id} className="text-center space-y-4 p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex justify-center">
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Page Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Crea tu propia página de contenido personalizada
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Posiciónate como experto o curador de contenido. Organiza chains relacionadas en una landing page temática perfecta para cursos, guías o recopilaciones.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-8">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Profesores que comparten clases</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Periodistas que organizan clips</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Creadores que venden cursos</span>
              </div>
            </div>
            <Link
              to="/custom"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg transition-colors duration-200 hover:underline"
            >
              Ver ejemplo de página personalizada
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Start your first Clipchain today
          </h2>
          <button className="bg-white hover:bg-gray-100 text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50">
            Create free account
          </button>
        </div>
      </section>

      {/* Example Library Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore examples
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how others are using Clipchain to curate and share meaningful content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {exampleChains.map((chain) => (
              <div key={chain.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <ClipchainPlayer
                  id={chain.id}
                  title={chain.title}
                  description={chain.description}
                  clips={chain.clips}
                  author={chain.author}
                  createdAt={chain.createdAt}
                  tags={chain.tags}
                />
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/library" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg transition-colors duration-200 hover:underline"
            >
              <span>View full library</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
