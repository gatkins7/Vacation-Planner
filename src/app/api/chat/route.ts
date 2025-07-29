import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
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

    const prompt = `You are a friendly vacation planning assistant. You help users with:
- Travel destination recommendations
- Trip planning advice
- Local attractions and activities
- Travel tips and best practices
- Restaurant and accommodation suggestions
- Budget planning for trips
- Cultural information about destinations

Keep responses helpful, concise, and friendly. If asked about topics unrelated to travel/vacation planning, politely redirect the conversation back to travel topics.

IMPORTANT: Respond in plain text only. Do not use any markdown formatting like **bold**, *italic*, # headers, or code blocks.

User question: ${message}`

    console.log('Making request to DeepSeek API for chat...')

    // Create a timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

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
              content: 'You are a helpful vacation planning assistant. Keep responses conversational, under 100 words, and in plain text only. No markdown formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.5,
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('DeepSeek API Error:', response.status)
        // Return fallback response
        return NextResponse.json({ 
          message: "I'm having trouble connecting right now. Try asking me about travel destinations, trip planning, or vacation activities!" 
        })
      }

      const data = await response.json()
      const aiMessage = data.choices?.[0]?.message?.content

      if (!aiMessage) {
        console.error('No message content in response')
        return NextResponse.json({ 
          message: "I'm here to help with your travel planning! Ask me about destinations, activities, or travel tips." 
        })
      }

      console.log('Chat response generated successfully')
      
      // Clean up markdown formatting
      const cleanMessage = aiMessage
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
        .replace(/^#{1,6}\s+/gm, '')     // Remove headers # ## ###
        .replace(/`([^`]+)`/g, '$1')     // Remove inline code `text`
        .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
        .replace(/^\s*[-*+]\s+/gm, '• ') // Convert markdown lists to bullets
        .trim()
      
      return NextResponse.json({ message: cleanMessage })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('DeepSeek API request timed out')
        return NextResponse.json({ 
          message: "Sorry, that took too long! Try asking me something about your vacation plans." 
        })
      }
      
      throw fetchError
    }

  } catch (error: any) {
    console.error('Error in chat API route:', error)
    
    return NextResponse.json({
      message: "I'm your travel assistant! Ask me about destinations, trip planning, activities, or travel tips and I'll be happy to help!"
    })
  }
} 