import { NextResponse } from 'next/server'
import { getComplaintRows } from '@/lib/complaintsSheets'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const complaints = await getComplaintRows()
    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}
