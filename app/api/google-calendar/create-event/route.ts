import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/googleCalendarClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, start, end, location } = body

    const calendar = getCalendarClient()

    const event = {
      summary: title,
      description: description || '',
      location: location || '',
      start: {
        dateTime: start,
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: end,
        timeZone: 'America/Chicago',
      },
    }

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    })

    return NextResponse.json({
      id: response.data.id,
      title: response.data.summary,
      description: response.data.description,
      start: response.data.start?.dateTime,
      end: response.data.end?.dateTime,
      location: response.data.location,
    })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
