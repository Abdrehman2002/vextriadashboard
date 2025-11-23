import { NextRequest, NextResponse } from 'next/server'
import { getCalendarClient } from '@/lib/googleCalendarClient'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    const calendar = getCalendarClient()

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items?.map((event) => ({
      id: event.id,
      title: event.summary || 'Untitled',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      location: event.location || '',
    }))

    return NextResponse.json(events || [])
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
