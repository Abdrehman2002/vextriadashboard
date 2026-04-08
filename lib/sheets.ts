import { getSheetsClient } from './googleClient'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!

export interface SheetRow {
  id: string
  timestamp?: string
  callType?: string
  duration?: string
  status?: string
  leadName?: string
  leadPhone?: string
  leadEmail?: string
  notes?: string
  [key: string]: any
}

export interface DashboardMetrics {
  totalCalls: number
  answeredCalls: number
  missedRevenueSaved: number
  totalRevenueSaved: number
  upcomingAppointments: number
  callsPerDay: { date: string; calls: number }[]
  revenuePerDay: { date: string; revenue: number }[]
}

export async function getSheetRows(): Promise<SheetRow[]> {
  try {
    const sheets = getSheetsClient()

    // Try multiple common sheet names
    const possibleRanges = ['Sheet1!A:Z', 'A:Z', 'Data!A:Z']
    let response

    for (const range of possibleRanges) {
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range,
        })
        break
      } catch (err) {
        // Try next range
        continue
      }
    }

    if (!response) {
      console.error('Unable to fetch sheet data with any range')
      return []
    }

    const rows = response.data.values || []

    if (rows.length === 0) return []

    const headers = rows[0]
    const dataRows = rows.slice(1)

    return dataRows.map((row, index) => {
      const obj: SheetRow = { id: (index + 2).toString() }
      headers.forEach((header, i) => {
        obj[header.toLowerCase().replace(/\s+/g, '')] = row[i] || ''
      })
      return obj
    })
  } catch (error) {
    console.error('Error fetching sheet rows:', error)
    return []
  }
}

export async function createSheetRow(payload: Partial<SheetRow>): Promise<void> {
  const sheets = getSheetsClient()

  // Get headers from the first row of the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!1:1',
  })

  const headers = response.data.values?.[0] || []

  if (headers.length === 0) {
    throw new Error('No headers found in the sheet')
  }

  // Map payload to header order
  const values = headers.map(header => {
    const key = header.toLowerCase().replace(/\s+/g, '')
    return payload[key] || ''
  })

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function updateSheetRow(id: string, payload: Partial<SheetRow>): Promise<void> {
  const sheets = getSheetsClient()

  const rows = await getSheetRows()
  const headers = Object.keys(rows[0] || {}).filter(k => k !== 'id')

  const rowIndex = parseInt(id)
  const values = headers.map(h => payload[h] !== undefined ? payload[h] : '')

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function deleteSheetRow(id: string): Promise<void> {
  const sheets = getSheetsClient()

  const rowIndex = parseInt(id) - 1

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  })
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const sheets = getSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:M',
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      return {
        totalCalls: 0,
        answeredCalls: 0,
        missedRevenueSaved: 0,
        totalRevenueSaved: 0,
        upcomingAppointments: 0,
        callsPerDay: [],
        revenuePerDay: [],
      }
    }

    // Skip header row and map data
    const dataRows = rows.slice(1).map(row => ({
      dateBooked: row[0] || '',
      appointmentDate: row[1] || '',
      appointmentTime: row[2] || '',
      day: row[3] || '',
      callerName: row[4] || '',
      callerEmail: row[5] || '',
      callerPhone: row[6] || '',
      businessName: row[7] || '',
      eventId: row[8] || '',
      status: row[9] || '',
      reminderSent: row[10] || '',
      showNoShow: row[11] || '',
      summary: row[12] || '',
    })).filter(row => row.dateBooked || row.appointmentDate || row.callerName)

    let totalCalls = 0
    const callsByDate: Record<string, number> = {}
    const appointmentsByDate: Record<string, number> = {}

    dataRows.forEach(row => {
      const dateValue = row.dateBooked
      if (!dateValue) return

      const timestamp = new Date(dateValue)
      if (isNaN(timestamp.getTime())) return

      totalCalls++

      const dateStr = timestamp.toISOString().split('T')[0]
      callsByDate[dateStr] = (callsByDate[dateStr] || 0) + 1

      // Count appointments (rows with Date Booked) for revenue calculation
      if (row.dateBooked) {
        appointmentsByDate[dateStr] = (appointmentsByDate[dateStr] || 0) + 1
      }
    })

    // answeredCalls = totalCalls (we don't track missed calls separately)
    const answeredCalls = totalCalls

    // Missed Revenue Saved = totalCalls * 300
    const missedRevenueSaved = totalCalls * 300

    // Build chart data from all dates that have data, sorted chronologically
    const allDates = [...new Set([...Object.keys(callsByDate), ...Object.keys(appointmentsByDate)])].sort()

    const callsPerDay: { date: string; calls: number }[] = []
    const revenuePerDay: { date: string; revenue: number }[] = []

    allDates.forEach(dateStr => {
      const date = new Date(dateStr)
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`

      callsPerDay.push({
        date: formattedDate,
        calls: callsByDate[dateStr] || 0,
      })

      const appointments = appointmentsByDate[dateStr] || 0
      revenuePerDay.push({
        date: formattedDate,
        revenue: appointments * 300,
      })
    })

    return {
      totalCalls,
      answeredCalls,
      missedRevenueSaved,
      totalRevenueSaved: 0, // Will be calculated in API route
      upcomingAppointments: 0, // Will be calculated in API route
      callsPerDay,
      revenuePerDay,
    }
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    return {
      totalCalls: 0,
      answeredCalls: 0,
      missedRevenueSaved: 0,
      totalRevenueSaved: 0,
      upcomingAppointments: 0,
      callsPerDay: [],
      revenuePerDay: [],
    }
  }
}
