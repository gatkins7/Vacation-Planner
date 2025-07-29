import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: itineraries, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching itineraries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch itineraries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ itineraries })

  } catch (error: any) {
    console.error('Error in itineraries API route:', error)
    return NextResponse.json(
      { error: `Failed to fetch itineraries: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const itineraryId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!itineraryId || !userId) {
      return NextResponse.json(
        { error: 'Itinerary ID and User ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', itineraryId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting itinerary:', error)
      return NextResponse.json(
        { error: 'Failed to delete itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error in delete itinerary API route:', error)
    return NextResponse.json(
      { error: `Failed to delete itinerary: ${error.message}` },
      { status: 500 }
    )
  }
} 