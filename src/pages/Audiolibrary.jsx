import React from 'react'
import SpotifyChainPlayer from '../components/SpotifyChainPlayer.jsx'

const Audiolibrary = () => {
  // Mock data for the Todopoderosos podcast
  const todopoderososChain = {
    id: 'todopoderosos-119',
    title: 'TODOPODEROSOS #119 - Somos lo que comemos y la cortina',
    description: 'Los Todopoderosos se han ido de vacaciones, pero han dejado sus cuatro sombreros en el Espacio Fundación Telefónica. Como en un buen fin de curso, el último día de cole fue una fiesta.',
    author: 'Todopoderosos',
    createdAt: '2024-07-09',
    tags: ['Podcast', 'Humor', 'Cultura', 'Entretenimiento'],
    spotifyEpisodeId: '3eQGUGKMUgQ1szkVnj0Wyb',
    clips: [
      {
        id: 1,
        title: 'Introducción y presentación del episodio',
        startTime: 0, // 0:00
        endTime: 180, // 3:00
        description: 'Presentación del episodio y contexto sobre las vacaciones de los Todopoderosos'
      },
      {
        id: 2,
        title: 'Somos lo que comemos - Primera parte',
        startTime: 180, // 3:00
        endTime: 600, // 10:00
        description: 'Discusión sobre la relación entre alimentación y personalidad'
      },
      {
        id: 3,
        title: 'La cortina y su significado',
        startTime: 600, // 10:00
        endTime: 900, // 15:00
        description: 'Análisis humorístico sobre las cortinas y su importancia'
      },
      {
        id: 4,
        title: 'Cierre y reflexiones finales',
        startTime: 900, // 15:00
        endTime: 1200, // 20:00
        description: 'Conclusiones y reflexiones finales del episodio'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Library</h1>
          <p className="text-gray-600">
            Prueba experimental del reproductor de audio para Spotify
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <SpotifyChainPlayer
            title={todopoderososChain.title}
            description={todopoderososChain.description}
            clips={todopoderososChain.clips}
            id={todopoderososChain.id}
            author={todopoderososChain.author}
            createdAt={todopoderososChain.createdAt}
            tags={todopoderososChain.tags}
            spotifyEpisodeId={todopoderososChain.spotifyEpisodeId}
          />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Notas de desarrollo</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta es una prueba experimental del reproductor de audio para Spotify</li>
            <li>• Utiliza la API de Spotify Web Playback SDK</li>
            <li>• Los clips están configurados para momentos específicos del podcast</li>
            <li>• Funcionalidad: reproducción, navegación entre clips, controles de tiempo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Audiolibrary
