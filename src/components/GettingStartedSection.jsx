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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Access
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            Access your workspace or explore the community library
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold">Workspace</span>
            </Link>
            
            <Link
              to="/library"
              className="flex flex-col items-center justify-center p-6 bg-white text-secondary-950 border-2 border-secondary-950 rounded-xl font-medium hover:bg-secondary-50 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-semibold">Library</span>
            </Link>
          </div>
          
          <button
            onClick={toggleVisibility}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Show onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-left mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Step 2. Getting started mission
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Follow these 3 steps to start creating your curated collections of clips
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-secondary-950 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="relative">
            <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
              step.completed 
                ? 'bg-green-100 border-green-300' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.completed 
                    ? 'bg-green-700 text-white' 
                    : 'bg-secondary-950 text-white'
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
                    <h3 className={`text-sm font-medium mb-1 ${
                      step.completed ? 'text-green-800 line-through' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs ${
                      step.completed ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Checkbox */}
                  <div className="flex-shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => toggleStep(step.id)}
                      className="w-4 h-4 text-secondary-950 focus:ring-secondary-950 border-gray-300 rounded"
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
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={toggleVisibility}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Hide onboarding
          </button>
        </div>
      )}
    </div>
  )
}

export default GettingStartedSection
