import { NextResponse } from 'next/server'

const RETELL_API_KEY = 'key_52cf8f696d64009de42d4196e27c'
const EFU_AGENT_ID = 'agent_9ef5162f1944a32b558cbf5b12'

export async function GET() {
  try {
    const res = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        filter_criteria: { agent_id: [EFU_AGENT_ID] },
        limit: 100,
        sort_order: 'descending',
      }),
    })

    const data = await res.json()
    const calls = Array.isArray(data) ? data : (data.calls || [])

    const leads = calls.map((call: any) => ({
      call_id: call.call_id,
      call_type: call.call_type || 'web_call',
      from_number: call.from_number || null,
      to_number: call.to_number || null,
      started_at: call.start_timestamp,
      duration_seconds: call.end_timestamp && call.start_timestamp
        ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
        : null,
      recording_url: call.recording_url || null,
      transcript: call.transcript || null,
      transcript_object: call.transcript_object || [],
      analysis: call.call_analysis?.custom_analysis_data || {},
    }))

    return NextResponse.json({ leads })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
