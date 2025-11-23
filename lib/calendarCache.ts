// Shared cache for calendar events
export const calendarCache: Map<string, { data: any; timestamp: number }> = new Map()
export const CALENDAR_CACHE_TTL = 300000 // 5 minutes

export function clearCalendarCache() {
  calendarCache.clear()
}
