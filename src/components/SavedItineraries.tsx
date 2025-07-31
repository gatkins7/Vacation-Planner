'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Itinerary } from '@/types/itinerary'
import { MapPin, Calendar, Trash2, Eye, ArrowLeft } from 'lucide-react'

interface SavedItinerariesProps {
  user: User
  onBack: () => void
  onViewItinerary: (itinerary: Itinerary) => void
}

export default function SavedItineraries({ user, onBack, onViewItinerary }: SavedItinerariesProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchItineraries()
  }, [user.id])

  const fetchItineraries = async () => {
    try {
      setLoading(true)
      
      const savedItineraries = JSON.parse(localStorage.getItem(`itineraries_${user.id}`) || '[]')
      setItineraries(savedItineraries)
      
    } catch (error) {
      console.error('Error fetching itineraries:', error)
      setError('Failed to load saved itineraries')
    } finally {
      setLoading(false)
    }
  }

  const deleteItinerary = async (itineraryId: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) {
      return
    }

    try {
      const existingItineraries = JSON.parse(localStorage.getItem(`itineraries_${user.id}`) || '[]')
      
      const updatedItineraries = existingItineraries.filter((item: Itinerary) => item.id !== itineraryId)
      
      localStorage.setItem(`itineraries_${user.id}`, JSON.stringify(updatedItineraries))
      
      setItineraries(updatedItineraries)
      
    } catch (error) {
      console.error('Error deleting itinerary:', error)
      alert('Failed to delete itinerary. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 text-sm sm:text-base">Loading saved itineraries...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors mr-3 sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              My Saved Itineraries
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {itineraries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No saved itineraries yet
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Create your first vacation itinerary to see it here!
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
            >
              Create New Itinerary
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {itinerary.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{itinerary.destination}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{itinerary.duration} day{itinerary.duration > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Created on {formatDate(itinerary.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewItinerary(itinerary)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      View
                    </button>
                    <button
                      onClick={() => deleteItinerary(itinerary.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                    {itinerary.content.substring(0, 200)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 