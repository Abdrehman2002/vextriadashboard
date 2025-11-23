import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/googleCalendarClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const calendar = getCalendarClient()

    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}
