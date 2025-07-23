'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, Wand2, LogOut } from 'lucide-react'
import LoadingScreen from './LoadingScreen'

interface VacationPlannerProps {
  user: User
  onSignOut: () => void
}

export default function VacationPlanner({ user, onSignOut }: VacationPlannerProps) {
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState('')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignOut()
  }

  const generateItinerary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !duration) return

    setLoading(true)
    try {
      // Show loading screen for ~36 seconds minimum
      const startTime = Date.now()
      
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          duration: parseInt(duration),
          userId: user.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()
      
      // Ensure minimum loading time of 20 seconds
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 20000 - elapsedTime)
      
      await new Promise(resolve => setTimeout(resolve, remainingTime))
      
      setItinerary(data.itinerary)
      
    } catch (error) {
      console.error('Error generating itinerary:', error)
      alert('Failed to generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading screen while generating
  if (loading) {
    return <LoadingScreen destination={destination} duration={duration} />
  }

  // Get user's name from metadata or fallback to email
  const userName = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                🌴 Vacation Planner
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {userName}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Plan Your Perfect Vacation
            </h2>
            <p className="text-gray-600">
              Tell us where you're going and for how long, and we'll create a personalized itinerary for you!
            </p>
          </div>

          {/* Planning Form */}
          <form onSubmit={generateItinerary} className="space-y-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where are you going? (e.g., Paris, France)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="How many days?"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !destination || !duration}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="h-5 w-5" />
              Generate Itinerary
            </button>
          </form>

          {/* Itinerary Display */}
          {itinerary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Your {duration}-Day Itinerary for {destination}
              </h3>
              <div className="prose prose-blue max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-3">
                  {itinerary.split('\n').map((line, index) => {
                    const trimmedLine = line.trim()
                    
                    // Skip empty lines
                    if (trimmedLine === '') {
                      return <div key={index} className="h-2" />
                    }
                    
                    // Day headers (📅 DAY 1:, 📅 DAY 2:, etc.)
                    if (trimmedLine.match(/^📅\s*DAY \d+:/i) || trimmedLine.match(/^DAY \d+:/i)) {
                      return (
                        <h4 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                          {trimmedLine}
                        </h4>
                      )
                    }
                    
                    // Time period headers (🌅 Morning:, ☀️ Afternoon:, 🌙 Evening:)
                    if (trimmedLine.match(/^(🌅|☀️|🌙)\s*(Morning|Afternoon|Evening|Night):/i) || trimmedLine.match(/^(Morning|Afternoon|Evening|Night):/i)) {
                      return (
                        <h5 key={index} className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                          {trimmedLine}
                        </h5>
                      )
                    }
                    
                    // Travel Tips header (💡 Travel Tips:)
                    if (trimmedLine.match(/^(💡\s*)?(Travel Tips|Tips):/i)) {
                      return (
                        <h4 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                          {trimmedLine}
                        </h4>
                      )
                    }
                    
                    // Additional Activities header (Additional Activities:)
                    if (trimmedLine.match(/^(Additional Activities):/i)) {
                      return (
                        <h4 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                          {trimmedLine}
                        </h4>
                      )
                    }
                    
                    // Regular content
                    return (
                      <p key={index} className="text-sm leading-relaxed ml-4 text-gray-700">
                        {trimmedLine}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 