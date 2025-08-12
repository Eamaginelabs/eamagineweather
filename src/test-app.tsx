

function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">✨ EamagineWeather ✨</h1>
        <p className="text-2xl text-white/80 mb-8">App is Working! 🎉</p>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
          <div className="text-4xl mb-4">🌤️</div>
          <p className="text-white">
            The app is now running successfully!<br/>
            Tailwind CSS is working.<br/>
            Components are loading.<br/>
            You should see the beautiful weather app!
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestApp