import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const GettingStartedSection = () => {
  const [steps, setSteps] = useState([
    {
      id: 1,
      number: "1",
      title: "Create your first clip",
      description: "Select a YouTube video, choose starting and ending points, give it a name and a short description.",
      completed: false
    },
    {
      id: 2,
      number: "2",
      title: "Create a collection",
      description: "Create a new collection and include your first clip there to start organizing your content.",
      completed: false
    },
    {
      id: 3,
      number: "3",
      title: "Merge a second clip in your collection",
      description: "Go to your collection and create a second clip that will be merged with the previous one.",
      completed: false
    }
  ])
  const [isHidden, setIsHidden] = useState(false)

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100
  const allStepsCompleted = completedSteps === steps.length

  const toggleStep = (stepId) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    )
  }

  const toggleVisibility = () => {
    setIsHidden(!isHidden)
  }

  // If hidden, show access buttons
  if (isHidden) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Quick Access
          </h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed max-w-2xl mx-auto">
            Access your workspace or explore the community library
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Workspace
            </Link>
            
            <Link
              to="/library"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Library
            </Link>
          </div>
          
          <button
            onClick={toggleVisibility}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded px-2 py-1"
          >
            Show onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="text-left mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-3">
          Getting started mission
        </h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Follow these 3 steps to start creating your curated collections of clips
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 font-light">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <div className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-200 ${
              step.completed 
                ? 'bg-green-50 border-green-200' 
                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}>
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-600 text-white' 
                    : 'bg-primary-600 text-white'
                }`}>
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium mb-2 ${
                      step.completed ? 'text-green-800 line-through' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      step.completed ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Checkbox */}
                  <div className="flex-shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => toggleStep(step.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hide Onboarding Button - Only show when all steps are completed */}
      {allStepsCompleted && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={toggleVisibility}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Hide onboarding
          </button>
        </div>
      )}
    </div>
  )
}

export default GettingStartedSection
