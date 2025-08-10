import React from 'react'
import { Link } from 'react-router-dom'
import ClipChainPlayer from '../components/ClipChainPlayer.jsx'

const CustomPage = () => {
  // Datos de ejemplo para un curso de "Introducción a la Programación Web"
  const courseData = {
    title: "Introducción a la Programación Web",
    instructor: "Dr. María García",
    description: "Un curso completo para aprender los fundamentos de la programación web moderna, desde HTML hasta JavaScript avanzado.",
    duration: "8 semanas",
    students: "1,247 estudiantes",
    rating: 4.8,
    chains: [
      {
        id: "web-fundamentals",
        title: "Fundamentos de HTML y CSS",
        description: "Aprende los pilares básicos de la web: HTML para estructura y CSS para diseño.",
        author: "Dr. María García",
        createdAt: "2024-01-15",
        tags: ["HTML", "CSS", "Básico"],
        clips: [
          {
            id: 1,
            title: "¿Qué es HTML?",
            videoId: "UB1O30fR-EE",
            startTime: 120,
            endTime: 180
          },
          {
            id: 2,
            title: "Estructura básica de una página",
            videoId: "UB1O30fR-EE",
            startTime: 240,
            endTime: 300
          },
          {
            id: 3,
            title: "Introducción a CSS",
            videoId: "UB1O30fR-EE",
            startTime: 360,
            endTime: 420
          }
        ]
      },
      {
        id: "javascript-basics",
        title: "JavaScript para Principiantes",
        description: "Domina los conceptos fundamentales de JavaScript: variables, funciones y control de flujo.",
        author: "Dr. María García",
        createdAt: "2024-01-20",
        tags: ["JavaScript", "Programación", "Intermedio"],
        clips: [
          {
            id: 1,
            title: "Variables y tipos de datos",
            videoId: "W6NZfCO5SIk",
            startTime: 60,
            endTime: 120
          },
          {
            id: 2,
            title: "Funciones en JavaScript",
            videoId: "W6NZfCO5SIk",
            startTime: 180,
            endTime: 240
          },
          {
            id: 3,
            title: "Control de flujo: if/else",
            videoId: "W6NZfCO5SIk",
            startTime: 300,
            endTime: 360
          }
        ]
      },
      {
        id: "react-intro",
        title: "Introducción a React",
        description: "Descubre React, la biblioteca más popular para construir interfaces de usuario modernas.",
        author: "Dr. María García",
        createdAt: "2024-01-25",
        tags: ["React", "Frontend", "Avanzado"],
        clips: [
          {
            id: 1,
            title: "¿Por qué React?",
            videoId: "bMknfKXIFA8",
            startTime: 90,
            endTime: 150
          },
          {
            id: 2,
            title: "Tu primer componente",
            videoId: "bMknfKXIFA8",
            startTime: 210,
            endTime: 270
          },
          {
            id: 3,
            title: "Props y estado",
            videoId: "bMknfKXIFA8",
            startTime: 330,
            endTime: 390
          }
        ]
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo-blue.svg" alt="clipchain" className="h-8 brightness-110 filter" />
              <div className="text-sm text-gray-500">
                Página de ejemplo • {courseData.instructor}
              </div>
            </div>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-secondary-950 transition-colors"
            >
              ← Volver a ClipChain
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-950 to-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-xl text-gray-200 mb-6 max-w-3xl mx-auto">
              {courseData.description}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>{courseData.instructor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{courseData.students} inscritos</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{courseData.rating}/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contenido del Curso</h2>
          <p className="text-gray-600">
            Este curso está organizado en lecciones temáticas, cada una con clips seleccionados de diferentes videos para maximizar tu aprendizaje.
          </p>
        </div>

        <div className="space-y-8">
          {courseData.chains.map((chain, index) => (
            <div key={chain.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-secondary-100 text-secondary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Lección {index + 1}
                      </span>
                      {chain.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{chain.title}</h3>
                    <p className="text-gray-600 mb-4">{chain.description}</p>
                  </div>
                </div>
                
                <ClipChainPlayer
                  id={chain.id}
                  title={chain.title}
                  description={chain.description}
                  clips={chain.clips}
                  author={chain.author}
                  createdAt={chain.createdAt}
                  tags={chain.tags}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Te gusta este formato?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Crea tu propia página personalizada para organizar y compartir contenido educativo, 
              periodístico o de cualquier tema que domines.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary-950 hover:bg-secondary-900 transition-colors"
            >
              Crear mi página personalizada
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo-blue.svg" alt="clipchain" className="h-6 brightness-110 filter" />
              <span className="text-sm text-gray-400">
                Powered by ClipChain
              </span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 ClipChain. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomPage

