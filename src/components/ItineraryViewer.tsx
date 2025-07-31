'use client'

import { Itinerary } from '@/types/itinerary'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

interface ItineraryViewerProps {
  itinerary: Itinerary
  onBack: () => void
}

export default function ItineraryViewer({ itinerary, onBack }: ItineraryViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-3 sm:gap-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors self-start sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Back to Itineraries</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {itinerary.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{itinerary.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{itinerary.duration} day{itinerary.duration > 1 ? 's' : ''}</span>
                </div>
                <span className="text-xs sm:text-sm">
                  Created {formatDate(itinerary.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="prose prose-blue max-w-none">
              <div className="text-gray-700 leading-relaxed space-y-3">
                {itinerary.content.split('\n').map((line, index) => {
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
        </div>
      </main>
    </div>
  )
} 