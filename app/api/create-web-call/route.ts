import { NextRequest, NextResponse } from 'next/server'
import Retell from 'retell-sdk'

// Agents that use the new Retell API key
const NEW_KEY_AGENTS = [
  'agent_9ef5162f1944a32b558cbf5b12', // EFU Sale Agent
  'agent_d3a07b125c9d6f8a5a1c16a7d7', // DAWEOO Support Agent
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent_id } = body

    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id is required' },
        { status: 400 }
      )
    }

    // Use the correct API key based on which agent is being called
    const apiKey = NEW_KEY_AGENTS.includes(agent_id)
      ? process.env.RETELL_API_KEY_NEW!
      : process.env.RETELL_API_KEY!

    const client = new Retell({ apiKey })

    const webCallResponse = await client.call.createWebCall({
      agent_id: agent_id,
    })

    // STEP 4: Return the response to the frontend
    // The frontend will use access_token to load the Retell iframe
    return NextResponse.json({
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id,
      call_status: webCallResponse.call_status,
    })
  } catch (error) {
    console.error('Error creating web call:', error)

    // Handle Retell API errors gracefully
    return NextResponse.json(
      {
        error: 'Failed to create web call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
