import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppNotification from './AppNotification.jsx'
import apiService from '../lib/api.js'

const LOCAL_STORAGE_KEY = 'clipchain_onboarding_steps_v2'

const baseSteps = [
  {
    id: 1,
    number: "1",
    title: "Create your first clip",
  },
  {
    id: 2,
    number: "2",
    title: "Create a Chain",
  },
  {
    id: 3,
    number: "3",
    title: "Add more clips to your Chain",
  }
]

const getDescriptions = (handleAction) => ([
  <span key="desc1">
    Select a YouTube video, choose starting and ending points, give it a name and a short description.
    <div className="mt-3">
      <button
        onClick={() => handleAction(0, '/create')}
        className="inline-flex items-center px-3 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 hover:text-primary-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        style={{ textDecoration: 'none' }}
      >
        Go to Create Clip
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    </div>
  </span>,
  <span key="desc2">
    Create a new Chain and include your first clip there to start organizing your content.
    <div className="mt-3">
      <button
        onClick={() => handleAction(1, '/create-chain')}
        className="inline-flex items-center px-3 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 hover:text-primary-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        style={{ textDecoration: 'none' }}
      >
        Go to Create Chain
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    </div>
  </span>,
  <span key="desc3">
    Go to your Chain and create a second clip that will be merged with the previous one. You can also use the <b>"Create and Chain"</b> button in the Create Clip page to add directly.
    <div className="mt-3">
      <button
        onClick={() => handleAction(2, '/create')}
        className="inline-flex items-center px-3 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 hover:text-primary-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        style={{ textDecoration: 'none' }}
      >
        Create and Chain
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </button>
    </div>
  </span>
])

const GettingStartedSection = ({ user, updateUser }) => {
  // Estado: solo array de booleanos
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === baseSteps.length) {
          return parsed
        }
      } catch {}
    }
    return [false, false, false]
  })

  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'success' })

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completed))
    // Si todos los pasos están completos y el usuario está autenticado y no tiene el flag, márcalo en backend y contexto
    if (completed.every(Boolean) && user && !user.onboardingCompleted) {
      apiService.updateProfile({ onboardingCompleted: true })
        .then(() => {
          updateUser({ ...user, onboardingCompleted: true })
        })
        .catch(() => {})
    }
  }, [completed, user, updateUser])

  // Handler para marcar como completado y navegar
  const handleAction = (idx, to) => {
    setCompleted(prev => {
      if (prev[idx]) return prev // ya estaba marcado
      const updated = [...prev]
      updated[idx] = true
      return updated
    })
    window.location.href = to
  }

  const descriptions = getDescriptions(handleAction)
  const steps = baseSteps.map((step, idx) => ({
    ...step,
    description: descriptions[idx],
    completed: completed[idx],
  }))

  // Elimina toda la lógica y renderizado de isHidden, toggleVisibility y los botones relacionados
  // No uses isHidden ni toggleVisibility

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

  // Renderiza solo si no están todos los pasos completados
  if (user && user.onboardingCompleted) return null;
  if (completed.every(Boolean)) return null;

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
        {steps.map((step, idx) => (
          <div key={step.id} className="relative">
            <div className={`flex items-start space-x-4 p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
              step.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-semibold shadow-sm ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : 'bg-primary-600 text-white'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <h3 className={`text-base font-semibold mb-2 ${
                      step.completed ? 'text-green-800 line-through' : 'text-primary-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed font-light ${
                      step.completed ? 'text-green-700' : 'text-primary-800'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {/* Checkbox */}
                  <div className="flex-shrink-0 ml-4 mt-1">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => {
                        setCompleted(prev => {
                          const updated = [...prev]
                          const wasCompleted = updated[idx]
                          updated[idx] = !updated[idx]
                          // Solo mostrar notificación si se marca (no si se desmarca)
                          if (!wasCompleted && !updated[idx]) return updated
                          if (!wasCompleted && updated[idx]) {
                            setNotification({
                              isVisible: true,
                              message: idx === 2
                                ? 'Well done! You can now share or embed your clipchains in your website, blog, etc.'
                                : `Step ${step.number} completed, go for the next!`,
                              type: 'success'
                            })
                            setTimeout(() => setNotification(n => ({ ...n, isVisible: false })), 2500)
                          }
                          return updated
                        })
                      }}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-primary-200 rounded transition-colors duration-200 cursor-pointer"
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
      <AppNotification
        isVisible={notification.isVisible}
        onClose={() => setNotification(n => ({ ...n, isVisible: false }))}
        type={notification.type}
        title={notification.message}
        message={''}
      />
    </div>
  )
}

export default GettingStartedSection
