'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no-code':
        return 'No confirmation code was provided in the URL.'
      case 'no-session':
        return 'Could not create a session from the confirmation code.'
      case 'expired_token':
        return 'The confirmation link has expired. Please sign up again.'
      case 'invalid_token':
        return 'The confirmation link is invalid. Please sign up again.'
      default:
        return error || 'An unknown error occurred during email confirmation.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Email Confirmation Error
          </h1>
          <p className="text-gray-600 mb-4">
            There was an issue confirming your email:
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>

        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">This could happen if:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• The confirmation link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a network issue</li>
            <li>• The link was modified or corrupted</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Try Again
          </Link>
          
          <p className="text-sm text-gray-500">
            If you continue having issues, try signing up with a different email address.
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-500">
              Error details: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 