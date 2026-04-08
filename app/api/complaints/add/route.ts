import { NextResponse } from 'next/server'
import { createComplaintRow } from '@/lib/complaintsSheets'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Add timestamp and complaintId if not provided
    if (!body.timestamp) {
      body.timestamp = new Date().toISOString()
    }
    if (!body.complaintId) {
      body.complaintId = `CMPL-${Date.now()}`
    }

    await createComplaintRow(body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding complaint:', error)
    return NextResponse.json(
      { error: 'Failed to add complaint' },
      { status: 500 }
    )
  }
}
