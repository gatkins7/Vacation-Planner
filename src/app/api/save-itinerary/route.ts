import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { destination, duration, content, userId, sessionToken } = await req.json()

    if (!destination || !duration || !content || !userId || !sessionToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create authenticated Supabase client with user's session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${sessionToken}`
          }
        }
      }
    )

    const title = `${destination} - ${duration} Day${duration > 1 ? 's' : ''}`
    const { data: savedItinerary, error: saveError } = await supabase
      .from('itineraries')
      .insert({
        user_id: userId,
        destination,
        duration,
        content,
        title
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving itinerary:', saveError)
      return NextResponse.json(
        { error: 'Failed to save itinerary', details: saveError.message },
        { status: 500 }
      )
    }

    console.log('Itinerary saved successfully:', savedItinerary.id)
    return NextResponse.json({ 
      success: true, 
      itineraryId: savedItinerary.id,
      message: 'Itinerary saved successfully!'
    })

  } catch (error: any) {
    console.error('Error in save-itinerary API route:', error)
    return NextResponse.json(
      { error: `Failed to save itinerary: ${error.message}` },
      { status: 500 }
    )
  }
} 