import React from 'react'

const TutorialsSection = () => {
  const tutorials = [
    {
      id: 1,
      title: "How to create collections and clips of related content",
      description: "Learn the basics of creating your first collection and adding clips from YouTube videos.",
      imageUrl: "https://via.placeholder.com/320x180/primary-100/primary-950?text=Tutorial+1",
      videoId: "dQw4w9WgXcQ"
    },
    {
      id: 2,
      title: "How to share and embed your player",
      description: "Discover how to share your collections and embed the player on your website.",
      imageUrl: "https://via.placeholder.com/320x180/primary-100/primary-950?text=Tutorial+2",
      videoId: "TNhaISOU2GU"
    },
    {
      id: 3,
      title: "How to customize your clip player easily",
      description: "Customize the appearance and behavior of your embedded clip player.",
      imageUrl: "https://via.placeholder.com/320x180/primary-100/primary-950?text=Tutorial+3",
      videoId: "jNQXAC9IVRw"
    }
  ]

  const handleWatchTutorial = (tutorialId) => {
    // Handle tutorial watch action
    console.log(`Watching tutorial ${tutorialId}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Learn More with Tutorials
        </h2>
        <p className="text-gray-600">
          Master clipchain with our step-by-step video tutorials
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Video Preview */}
            <div className="relative">
              <img
                src={tutorial.imageUrl}
                alt={tutorial.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tutorial Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tutorial.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {tutorial.description}
              </p>
              <button
                onClick={() => handleWatchTutorial(tutorial.id)}
                className="w-full btn-primary py-2"
              >
                Watch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TutorialsSection
