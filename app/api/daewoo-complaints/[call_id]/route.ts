import { NextResponse } from 'next/server'

const RETELL_API_KEY = 'key_52cf8f696d64009de42d4196e27c'

export async function DELETE(
  _req: Request,
  { params }: { params: { call_id: string } }
) {
  try {
    const res = await fetch(`https://api.retellai.com/v2/delete-call/${params.call_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    })

    if (res.ok || res.status === 204) {
      return NextResponse.json({ success: true })
    }

    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: err }, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 })
  }
}
