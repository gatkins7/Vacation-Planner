'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Auth from '@/components/Auth'
import VacationPlanner from '@/components/VacationPlanner'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)

  useEffect(() => {
    // Check for existing session on page load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if this is a fresh login from email confirmation
      if (session?.user && window.location.search.includes('code=')) {
        setShowConfirmationMessage(true)
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        // Hide message after 5 seconds
        setTimeout(() => setShowConfirmationMessage(false), 5000)
      }
      
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // If this is from email confirmation, show success message
        if (window.location.search.includes('code=')) {
          setShowConfirmationMessage(true)
          setTimeout(() => setShowConfirmationMessage(false), 5000)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthChange = (user: User | null) => {
    setUser(user)
  }

  const handleSignOut = () => {
    setUser(null)
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Email Confirmation Success Message */}
      {showConfirmationMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <div className="text-lg">✅</div>
            <span className="font-medium">Email confirmed! Welcome to Vacation Planner!</span>
          </div>
        </div>
      )}

      {!user ? (
        <Auth onAuthChange={handleAuthChange} />
      ) : (
        <VacationPlanner user={user} onSignOut={handleSignOut} />
      )}
    </div>
  )
}
