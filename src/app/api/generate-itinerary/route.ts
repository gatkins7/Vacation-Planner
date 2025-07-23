import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { destination, duration, userId } = await req.json()

    console.log('API Request received:', { destination, duration, userId })

    if (!destination || !duration) {
      return NextResponse.json(
        { error: 'Destination and duration are required' },
        { status: 400 }
      )
    }

    // Check if API key is available
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    console.log('DeepSeek API Key available:', apiKey ? 'Yes' : 'No')

    const prompt = `Create a ${duration}-day vacation itinerary for ${destination}. 

Format: Plain text with clear structure and emojis for visual appeal.

Structure:
- Use "📅 DAY 1:", "📅 DAY 2:", etc. for day headers (all caps)
- Use emojis for time periods: "🌅 Morning:", "☀️ Afternoon:", "🌙 Evening:" 
- Include relevant emojis for activities (🏛️ museums, 🍽️ restaurants, 🏖️ beaches, etc.)
- Add practical travel tips at the end with 💡 Travel Tips:

Example format:
📅 DAY 1: Arrival
🌅 Morning: Check into hotel 🏨 and explore nearby area
☀️ Afternoon: Visit main attractions 🏛️ and city center  
🌙 Evening: Dinner at local restaurant 🍽️

Keep it detailed and informative. Focus on must-see highlights, restaurants, and practical advice. Use emojis to make activities more engaging and fun!`

    console.log('Making request to DeepSeek API...')

    // Create a timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a travel planner. Create concise, practical itineraries in plain text format. No markdown formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2500, // Increased for longer itineraries with emojis
          temperature: 0.3, // Lower for more focused output
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('DeepSeek API Response Status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API Error Response:', errorText)
        
        // If DeepSeek fails, return a basic itinerary
        if (response.status === 504 || response.status >= 500) {
          return generateFallbackItinerary(destination, duration)
        }
        
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('DeepSeek API Success - Response received')

      let itinerary = data.choices?.[0]?.message?.content

      if (!itinerary) {
        console.error('No itinerary content in response')
        return generateFallbackItinerary(destination, duration)
      }

      console.log('Generated itinerary length:', itinerary.length)

      // Clean up any remaining markdown formatting
      itinerary = itinerary
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
        .replace(/^#{1,6}\s+/gm, '')     // Remove headers # ## ###
        .replace(/`([^`]+)`/g, '$1')     // Remove inline code `text`
        .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
        .replace(/^\s*[-*+]\s+/gm, '• ') // Convert markdown lists to bullets

      console.log('Successfully generated itinerary')
      return NextResponse.json({ itinerary })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('DeepSeek API request timed out')
        return generateFallbackItinerary(destination, duration)
      }
      
      throw fetchError
    }

  } catch (error: any) {
    console.error('Error in API route:', error)
    console.error('Error stack:', error.stack)
    
    // Return fallback for any error
    if (error.message.includes('destination') && error.message.includes('duration')) {
      const { destination, duration } = await req.json()
      return generateFallbackItinerary(destination, duration)
    }
    
    return NextResponse.json(
      { error: `Failed to generate itinerary: ${error.message}` },
      { status: 500 }
    )
  }
}

// Fallback function for when DeepSeek API fails
function generateFallbackItinerary(destination: string, duration: number) {
  console.log('Generating fallback itinerary for:', destination, duration)
  
  const itinerary = `${duration}-Day Itinerary for ${destination}

📅 DAY 1: Arrival and Exploration
🌅 Morning: Arrive and check into accommodation 🏨
☀️ Afternoon: Explore the city center and main attractions 🏛️
🌙 Evening: Try local cuisine at a recommended restaurant 🍽️

${duration > 1 ? `📅 DAY 2: Cultural Highlights
🌅 Morning: Visit museums and cultural sites 🏛️🎨
☀️ Afternoon: Walking tour of historic areas 🚶‍♂️🏰  
🌙 Evening: Experience local nightlife or entertainment 🎭🍻

` : ''}${duration > 2 ? `📅 DAY 3: Natural Attractions
🌅 Morning: Explore parks, gardens, or natural landmarks 🌳🌺
☀️ Afternoon: Outdoor activities or scenic viewpoints 🏞️📸
🌙 Evening: Relax and enjoy local atmosphere ☕🌆

` : ''}${duration > 3 ? `📅 DAY 4: Shopping and Local Life
🌅 Morning: Visit local markets and shopping areas 🛍️🏪
☀️ Afternoon: Experience neighborhood life and cafes ☕🏘️
🌙 Evening: Farewell dinner at a special restaurant 🍽️✨

` : ''}${duration > 4 ? `📅 DAYS 5-${duration}: Extended Exploration
🌅 Morning: Discover hidden gems and off-the-beaten-path locations 💎🗺️
☀️ Afternoon: Take day trips to nearby attractions 🚗🏔️
🌙 Evening: Try various local foods and specialties 🍜🥘

🎯 Additional Activities:
- Immerse yourself in local traditions and customs 🎭
- Collect souvenirs and memories 🎁📸
- Experience different neighborhoods 🏘️

` : ''}💡 Travel Tips:
- Research local transportation options 🚇🚌
- Learn basic phrases in the local language 🗣️📖
- Check weather conditions and pack accordingly 🌤️👕
- Keep important documents and emergency contacts handy 📋📞
- Respect local customs and traditions 🙏🌍

Note: This is a basic itinerary template. For a more detailed and personalized plan, please try again or consult local travel guides.`

  return NextResponse.json({ 
    itinerary,
    fallback: true 
  })
} 