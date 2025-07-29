import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ChatBot from '@/components/ChatBot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vacation Planner - AI-Powered Travel Itineraries',
  description: 'Plan your perfect vacation with AI-generated itineraries. Simply enter your destination and duration, and get a personalized travel plan.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatBot />
      </body>
    </html>
  )
}
