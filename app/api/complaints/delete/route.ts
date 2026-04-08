import { NextResponse } from 'next/server'
import { deleteComplaintRow } from '@/lib/complaintsSheets'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex } = body

    if (!rowIndex) {
      return NextResponse.json(
        { error: 'Row index is required' },
        { status: 400 }
      )
    }

    await deleteComplaintRow(rowIndex)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting complaint:', error)
    return NextResponse.json(
      { error: 'Failed to delete complaint' },
      { status: 500 }
    )
  }
}
