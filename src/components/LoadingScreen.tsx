'use client'

import { useState, useEffect } from 'react'
import { Plane, MapPin, Calendar, Sparkles } from 'lucide-react'

interface LoadingScreenProps {
  destination: string
  duration: string
}

export default function LoadingScreen({ destination, duration }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Analyzing your destination...",
    "Finding the best attractions...",
    "Discovering local restaurants...",
    "Planning optimal routes...",
    "Adding cultural experiences...",
    "Finalizing your perfect itinerary..."
  ]

  useEffect(() => {
    const days = parseInt(duration) || 1
    let totalLoadingTime
    
    if (days <= 2) {
      totalLoadingTime = 15000
    } else if (days <= 4) {
      totalLoadingTime = 25000
    } else {
      totalLoadingTime = 40000
    }
    
    const intervalTime = 100
    const totalIntervals = totalLoadingTime / intervalTime
    const progressIncrement = 100 / totalIntervals

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + progressIncrement
      })
    }, intervalTime)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [duration])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center">
        <div className="mb-6 sm:mb-8">
          <div className="animate-bounce mb-4">
            <Plane className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Creating Your Itinerary
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Planning your {duration}-day trip to {destination}
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-pulse" />
            <span className="font-medium text-sm sm:text-base">{steps[currentStep]}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4 opacity-60">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 animate-pulse" />
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          <p>Did you know? Our AI considers over 1000+ factors to create your perfect itinerary!</p>
        </div>
      </div>
    </div>
  )
} 