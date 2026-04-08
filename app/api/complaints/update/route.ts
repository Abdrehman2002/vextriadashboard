import { NextResponse } from 'next/server'
import { updateComplaintRow } from '@/lib/complaintsSheets'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, ...data } = body

    if (!rowIndex) {
      return NextResponse.json(
        { error: 'Row index is required' },
        { status: 400 }
      )
    }

    await updateComplaintRow(rowIndex, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}
