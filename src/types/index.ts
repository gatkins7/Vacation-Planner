export interface VacationPlan {
  id?: string
  userId: string
  destination: string
  duration: number
  itinerary: string
  createdAt?: string
}

export interface User {
  id: string
  email: string
}

export interface ItineraryDay {
  day: number
  activities: Activity[]
}

export interface Activity {
  time: string
  title: string
  description: string
  location?: string
} 