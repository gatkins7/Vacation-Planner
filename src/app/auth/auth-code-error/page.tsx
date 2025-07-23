'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import ErrorContent from './ErrorContent'

export default function AuthCodeError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 