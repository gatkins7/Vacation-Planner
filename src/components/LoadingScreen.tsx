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
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + (100 / 200) // 200 intervals over ~20 seconds (100ms each)
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 3000) // Change step every 3 seconds

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="animate-bounce mb-4">
            <Plane className="h-16 w-16 text-blue-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Creating Your Itinerary
          </h2>
          <p className="text-gray-600">
            Planning your {duration}-day trip to {destination}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            <span className="font-medium">{steps[currentStep]}</span>
          </div>
        </div>

        {/* Animated Icons */}
        <div className="flex justify-center gap-4 opacity-60">
          <MapPin className="h-6 w-6 text-green-500 animate-pulse" />
          <Calendar className="h-6 w-6 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Fun Facts */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Did you know? Our AI considers over 1000+ factors to create your perfect itinerary!</p>
        </div>
      </div>
    </div>
  )
} 