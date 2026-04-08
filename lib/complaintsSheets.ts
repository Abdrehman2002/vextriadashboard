import { getSheetsClient } from './googleClient'

const COMPLAINTS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_COMPLAINTS_SPREADSHEET_ID || '1JxVhK2uuRiYmE0VOUr2Ul6Jj7Br5qyWd91TnhzExd7o'

export interface ComplaintRow {
  rowIndex?: number
  timestamp: string
  complaintId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  complaintType: string
  priority: string
  status: string
  description: string
  assignedTo: string
  resolutionNotes: string
  dateResolved: string
}

export async function getComplaintRows(): Promise<ComplaintRow[]> {
  try {
    const sheets = getSheetsClient()

    const possibleRanges = ['Sheet1!A:Z', 'A:Z', 'Complaints!A:Z']
    let response

    for (const range of possibleRanges) {
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: COMPLAINTS_SPREADSHEET_ID,
          range,
        })
        break
      } catch (err) {
        continue
      }
    }

    if (!response) {
      console.error('Unable to fetch complaints sheet data')
      return []
    }

    const rows = response.data.values || []

    if (rows.length === 0) return []

    const headers = rows[0]
    const dataRows = rows.slice(1)

    return dataRows.map((row, index) => ({
      rowIndex: index + 2,
      timestamp: row[0] || '',
      complaintId: row[1] || '',
      customerName: row[2] || '',
      customerEmail: row[3] || '',
      customerPhone: row[4] || '',
      complaintType: row[5] || '',
      priority: row[6] || '',
      status: row[7] || '',
      description: row[8] || '',
      assignedTo: row[9] || '',
      resolutionNotes: row[10] || '',
      dateResolved: row[11] || '',
    }))
  } catch (error) {
    console.error('Error fetching complaint rows:', error)
    return []
  }
}

export async function createComplaintRow(payload: Partial<ComplaintRow>): Promise<void> {
  const sheets = getSheetsClient()

  const values = [
    payload.timestamp || new Date().toISOString(),
    payload.complaintId || `CMPL-${Date.now()}`,
    payload.customerName || '',
    payload.customerEmail || '',
    payload.customerPhone || '',
    payload.complaintType || '',
    payload.priority || '',
    payload.status || '',
    payload.description || '',
    payload.assignedTo || '',
    payload.resolutionNotes || '',
    payload.dateResolved || '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: COMPLAINTS_SPREADSHEET_ID,
    range: 'A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function updateComplaintRow(rowIndex: number, payload: Partial<ComplaintRow>): Promise<void> {
  const sheets = getSheetsClient()

  const values = [
    payload.timestamp || '',
    payload.complaintId || '',
    payload.customerName || '',
    payload.customerEmail || '',
    payload.customerPhone || '',
    payload.complaintType || '',
    payload.priority || '',
    payload.status || '',
    payload.description || '',
    payload.assignedTo || '',
    payload.resolutionNotes || '',
    payload.dateResolved || '',
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: COMPLAINTS_SPREADSHEET_ID,
    range: `A${rowIndex}:L${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function deleteComplaintRow(rowIndex: number): Promise<void> {
  const sheets = getSheetsClient()

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: COMPLAINTS_SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  })
}
