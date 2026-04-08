import { NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/sheets'
import { getCalendarSummary } from '@/lib/calendar'

export const dynamic = 'force-dynamic'
export const revalidate = 30 // Cache for 30 seconds

let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 300000 // 5 minutes

export async function GET() {
  try {
    // Return cached data if still valid
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const [sheetMetrics, calendarSummary] = await Promise.all([
      getDashboardMetrics(),
      getCalendarSummary(),
    ])

    const metrics = {
      ...sheetMetrics,
    }

    // Update cache
    cache = {
      data: metrics,
      timestamp: Date.now()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching overview metrics:', error)

    // Return cached data on error if available
    if (cache) {
      return NextResponse.json(cache.data)
    }

    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
