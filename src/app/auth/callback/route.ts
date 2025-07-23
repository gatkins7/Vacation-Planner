import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    try {
      // Try to exchange the code for session
      await supabase.auth.exchangeCodeForSession(code)
      console.log('Email confirmation processed')
    } catch (error: any) {
      console.error('Error in auth callback:', error)
      // Don't show error to user, just continue to redirect
    }
  }

  // Always redirect to home page - let the main app handle auth state
  return NextResponse.redirect(`${requestUrl.origin}/`)
} 