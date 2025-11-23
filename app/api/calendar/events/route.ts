import { NextRequest, NextResponse } from 'next/server'
import { getEvents, createEvent } from '@/lib/calendar'
import { calendarCache, CALENDAR_CACHE_TTL, clearCalendarCache } from '@/lib/calendarCache'

export const dynamic = 'force-dynamic'
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const cacheKey = `${from}-${to}`
    const cached = calendarCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CALENDAR_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const params = {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }

    const events = await getEvents(params)

    calendarCache.set(cacheKey, { data: events, timestamp: Date.now() })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching calendar events:', error)

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const cacheKey = `${from}-${to}`
    const cached = calendarCache.get(cacheKey)

    if (cached) {
      return NextResponse.json(cached.data)
    }

    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const event = await createEvent(payload)

    // Clear cache after creating event
    clearCalendarCache()

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
