'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, Wand2, LogOut, ArrowLeft, BookOpen, Save, Menu, X } from 'lucide-react'
import LoadingScreen from './LoadingScreen'
import SavedItineraries from './SavedItineraries'
import ItineraryViewer from './ItineraryViewer'
import { Itinerary } from '@/types/itinerary'

interface VacationPlannerProps {
  user: User
  onSignOut: () => void
}

type ViewMode = 'form' | 'current-itinerary' | 'saved-itineraries' | 'view-saved-itinerary'

export default function VacationPlanner({ user, onSignOut }: VacationPlannerProps) {
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState('')
  const [currentView, setCurrentView] = useState<ViewMode>('form')
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignOut()
  }

  const handleBackToForm = () => {
    setCurrentView('form')
    setItinerary('')
    setDestination('')
    setDuration('')
    setSaveMessage('')
  }

  const handleViewSavedItineraries = () => {
    setCurrentView('saved-itineraries')
    setSaveMessage('')
    setMobileMenuOpen(false)
  }

  const handleViewSavedItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setCurrentView('view-saved-itinerary')
  }

  const handleBackToSavedList = () => {
    setCurrentView('saved-itineraries')
    setSelectedItinerary(null)
  }

  const handleSaveItinerary = () => {
    if (!itinerary || !destination || !duration) return

    setSaving(true)
    setSaveMessage('')

    try {
      const newItinerary: Itinerary = {
        id: crypto.randomUUID(),
        user_id: user.id,
        destination,
        duration: parseInt(duration),
        content: itinerary,
        title: `${destination} - ${duration} Day${parseInt(duration) > 1 ? 's' : ''}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const existingItineraries = JSON.parse(localStorage.getItem(`itineraries_${user.id}`) || '[]')
      
      const alreadyExists = existingItineraries.some((item: Itinerary) => 
        item.destination === destination && 
        item.duration === parseInt(duration) && 
        item.content === itinerary
      )
      
      if (alreadyExists) {
        setSaveMessage('This itinerary is already saved!')
        setTimeout(() => setSaveMessage(''), 3000)
        setSaving(false)
        return
      }
      
      const updatedItineraries = [newItinerary, ...existingItineraries]
      
      localStorage.setItem(`itineraries_${user.id}`, JSON.stringify(updatedItineraries))
      
      setSaveMessage('Itinerary saved!')
      
      setTimeout(() => setSaveMessage(''), 3000)

    } catch (error) {
      console.error('Error saving itinerary:', error)
      setSaveMessage('Failed to save itinerary. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const generateItinerary = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !duration) return

    setLoading(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          duration: parseInt(duration)
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate itinerary')
      }

      const data = await response.json()

      if (data.itinerary) {
        setItinerary(data.itinerary)
        setCurrentView('current-itinerary')
      } else {
        throw new Error('No itinerary received')
      }

    } catch (error) {
      console.error('Error generating itinerary:', error)
      setSaveMessage('Failed to generate itinerary. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingScreen destination={destination} duration={duration} />
  }

  if (currentView === 'saved-itineraries') {
    return (
      <SavedItineraries
        user={user}
        onBack={() => setCurrentView('form')}
        onViewItinerary={handleViewSavedItinerary}
      />
    )
  }

  if (currentView === 'view-saved-itinerary' && selectedItinerary) {
    return (
      <ItineraryViewer
        itinerary={selectedItinerary}
        onBack={handleBackToSavedList}
      />
    )
  }

  const userName = user.user_metadata?.full_name || user.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                🌴 Vacation Planner
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {userName}</span>
              <button
                onClick={handleViewSavedItineraries}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                My Itineraries
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
              <div className="text-sm text-gray-600">Welcome, {userName}</div>
              <button
                onClick={handleViewSavedItineraries}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full"
              >
                <BookOpen className="h-4 w-4" />
                My Itineraries
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          {currentView === 'form' && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Plan Your Perfect Vacation
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Tell us where you're going and for how long, and we'll create a personalized itinerary for you!
                </p>
              </div>

              <form onSubmit={generateItinerary} className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Where are you going? (e.g., Paris, France)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 text-sm sm:text-base"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !destination || !duration}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  <Wand2 className="h-5 w-5" />
                  Generate Itinerary
                </button>
              </form>
            </>
          )}

          {currentView === 'current-itinerary' && itinerary && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
                  Your {duration}-Day Itinerary for {destination}
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleSaveItinerary}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleBackToForm}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Create New
                  </button>
                </div>
              </div>
              
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  saveMessage.includes('saved') || saveMessage.includes('already saved') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="prose prose-blue max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    {itinerary.split('\n').map((line, index) => {
                      const trimmedLine = line.trim()
                      
                      if (trimmedLine === '') {
                        return <div key={index} className="h-2" />
                      }
                      
                      if (trimmedLine.match(/^DAY \d+:/i)) {
                        return (
                          <h4 key={index} className="text-lg sm:text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                            {trimmedLine}
                          </h4>
                        )
                      }
                      
                      if (trimmedLine.match(/^(Morning|Afternoon|Evening|Night):/i)) {
                        return (
                          <h5 key={index} className="text-base sm:text-lg font-semibold text-gray-700 mt-4 mb-2">
                            {trimmedLine}
                          </h5>
                        )
                      }
                      
                      if (trimmedLine.match(/^(Travel Tips|Tips):/i)) {
                        return (
                          <h4 key={index} className="text-lg sm:text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                            {trimmedLine}
                          </h4>
                        )
                      }
                      
                      if (trimmedLine.match(/^(Additional Activities):/i)) {
                        return (
                          <h4 key={index} className="text-lg sm:text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-gray-200">
                            {trimmedLine}
                          </h4>
                        )
                      }
                      
                      return (
                        <p key={index} className="text-xs sm:text-sm leading-relaxed ml-2 sm:ml-4 text-gray-700">
                          {trimmedLine}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 