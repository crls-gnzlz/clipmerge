import React, { useState } from 'react'

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

  const completedSteps = steps.filter(step => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const toggleStep = (stepId) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-left mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Getting Started Mission
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Follow these 3 steps to start creating your curated collections of clips
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary-950 h-2 rounded-full transition-all duration-300 ease-in-out"
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
                ? 'bg-green-50 border-green-200' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}>
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-950 text-white'
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
                      step.completed ? 'text-green-600' : 'text-gray-600'
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
                      className="w-4 h-4 text-primary-950 focus:ring-primary-950 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GettingStartedSection
