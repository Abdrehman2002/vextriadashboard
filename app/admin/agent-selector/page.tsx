'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, CheckCircle, PhoneOff, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RetellWebClient } from 'retell-client-js-sdk'

interface Agent {
  id: string
  name: string
  description: string
  agentId: string
  features: string[]
}

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'AutoCare Receptionist',
    description: 'Takes service & maintenance bookings',
    agentId: 'agent_68d22a69f45a3ee37168684831',
    features: ['Schedule repairs', 'Service history', 'Emergency handling'],
  },
  {
    id: '2',
    name: 'Real Estate Receptionist',
    description: 'Handles buyer & seller inquiries',
    agentId: 'agent_71d88e63296903b65f6dc0d372',
    features: ['Property tours', 'Price inquiries', 'Agent scheduling'],
  },
  {
    id: '3',
    name: 'Medical Receptionist',
    description: 'Books appointments, routes patients',
    agentId: 'agent_8ce17d51123f73b631cb29c6e0',
    features: ['Appointments', 'Insurance', 'Prescriptions'],
  },
  {
    id: '4',
    name: 'Law Firm Receptionist',
    description: 'Screens legal clients & schedules consults',
    agentId: 'agent_2c8c98f3046de28c6c9d7fa086',
    features: ['Case screening', 'Consultations', 'Documents'],
  },
  {
    id: '5',
    name: 'Spa/Salon Receptionist',
    description: 'Manages spa & salon bookings',
    agentId: 'agent_26634c1417075ff72793ffe658',
    features: ['Service booking', 'Stylist selection', 'Packages'],
  },
  {
    id: '6',
    name: 'Fitness/Gym Receptionist',
    description: 'Handles gym tours & memberships',
    agentId: 'agent_6ecbb6ef0fa72411251e18a0a1',
    features: ['Memberships', 'Class booking', 'Trainers'],
  },
]

export default function AgentSelectorPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [activeAgentLabel, setActiveAgentLabel] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Retell web call state
  const [isStartingCall, setIsStartingCall] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callInfo, setCallInfo] = useState<any>(null)
  const [callStatus, setCallStatus] = useState<string>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)

  const retellWebClientRef = useRef<RetellWebClient | null>(null)

  useEffect(() => {
    retellWebClientRef.current = new RetellWebClient()
    const client = retellWebClientRef.current

    client.on('call_started', () => {
      console.log('Call started')
      setCallStatus('ongoing')
      setIsCallActive(true)
    })

    client.on('call_ended', () => {
      console.log('Call ended')
      setCallStatus('ended')
      setIsCallActive(false)
      setCallInfo(null)
      setIsAgentSpeaking(false)
    })

    client.on('agent_start_talking', () => {
      console.log('Agent started talking')
      setIsAgentSpeaking(true)
    })

    client.on('agent_stop_talking', () => {
      console.log('Agent stopped talking')
      setIsAgentSpeaking(false)
    })

    client.on('error', (error) => {
      console.error('Retell error:', error)
      setCallError(`Call error: ${error.message || 'Unknown error'}`)
      setIsCallActive(false)
    })

    return () => {
      if (retellWebClientRef.current) {
        retellWebClientRef.current.stopCall()
      }
    }
  }, [])

  const handleSaveActiveAgent = async () => {
    if (!selectedAgentId) return

    setIsSaving(true)
    setSaveError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('https://corah.app.n8n.cloud/webhook-test/agent-selector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setActiveAgentId(data.activeAgentId)
        setActiveAgentLabel(data.activeAgentLabel)
        setSuccessMessage(`Active agent updated to ${data.activeAgentLabel}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      } else {
        setSaveError(data.message || 'Failed to update active agent')
      }
    } catch (error) {
      console.error('Error saving active agent:', error)
      setSaveError('Network error while updating active agent. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartWebCall = async () => {
    if (!selectedAgentId || !retellWebClientRef.current) return

    setIsStartingCall(true)
    setCallError(null)
    setCallStatus('connecting')

    try {
      const response = await fetch('/api/create-web-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: selectedAgentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create web call')
      }

      setCallInfo(data)

      await retellWebClientRef.current.startCall({
        accessToken: data.access_token,
      })

      console.log('Web call started successfully')
    } catch (error) {
      console.error('Error starting web call:', error)
      setCallError(error instanceof Error ? error.message : 'Failed to start web call')
      setCallStatus('error')
      setIsCallActive(false)
    } finally {
      setIsStartingCall(false)
    }
  }

  const handleEndCall = () => {
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall()
    }
    setIsCallActive(false)
    setCallInfo(null)
    setCallError(null)
    setCallStatus('idle')
    setIsAgentSpeaking(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const selectedAgent = AGENTS.find(agent => agent.agentId === selectedAgentId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/10">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent">
          Agent Selector
        </h1>
        <p className="text-sm text-gray-300">
          Choose which AI receptionist should handle calls on your Twilio number, or test any agent with a web call.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
          <p className="text-sm font-medium">Error: {saveError}</p>
        </div>
      )}

      {/* Call Error Message */}
      {callError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
          <p className="text-sm font-medium">Call Error: {callError}</p>
        </div>
      )}

      {/* Active Call Interface - Corah Branded */}
      {isCallActive && (
        <Card className="border-[#000000] border-2">
          <div className="bg-[#000000] text-white px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Clario Logo Circle */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg p-3">
                  <img
                    src="/assets/favicon.svg"
                    alt="Clario Logo"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Speaking with</p>
                  <h2 className="text-xl font-bold">Clario AI</h2>
                  <p className="text-sm text-gray-400">{selectedAgent?.name || 'Agent'}</p>
                </div>
              </div>
              <Button
                onClick={handleEndCall}
                variant="outline"
                size="sm"
                className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>

            {/* Audio Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all",
                    isAgentSpeaking ? "bg-green-400" : "bg-gray-600"
                  )}
                  style={{
                    height: isAgentSpeaking ? `${Math.random() * 50 + 20}%` : '30%',
                  }}
                />
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isAgentSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-500"
              )} />
              <span className="text-sm">
                {isAgentSpeaking ? 'Clario is speaking...' : 'Listening...'}
              </span>
            </div>

            {/* Mute Button */}
            <div className="flex justify-center">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className={cn(
                  isMuted
                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                    : "bg-white text-black hover:bg-gray-100"
                )}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </div>

          <CardContent className="pt-4">
            {callInfo && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Call ID</p>
                  <p className="font-mono text-xs truncate">{callInfo.call_id}</p>
                </div>
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium capitalize">{callStatus}</p>
                </div>
                <div className="p-3 bg-[#F8F6F2] rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Powered by</p>
                  <p className="font-bold">Clario</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Currently Active Agent */}
      {activeAgentLabel && !isCallActive && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-300/70 uppercase tracking-wide mb-1">Currently Active Agent</p>
              <p className="text-base font-semibold text-white">{activeAgentLabel}</p>
              <p className="text-xs text-white/30 font-mono mt-1">{activeAgentId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent) => {
          const isSelected = selectedAgentId === agent.agentId
          const isActive = activeAgentId === agent.agentId

          return (
            <div
              key={agent.id}
              className={cn(
                'group relative cursor-pointer transition-all duration-300',
                'bg-white/5 backdrop-blur-md border rounded-2xl p-6',
                'shadow-[0_0_20px_rgba(0,0,0,0.4)]',
                'hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
                isSelected && !isActive && 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_rgba(168,85,247,0.4)]',
                isActive && 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
                !isSelected && !isActive && 'border-white/10 hover:border-blue-500/30'
              )}
              onClick={() => !isCallActive && setSelectedAgentId(agent.agentId)}
            >
              {/* Selected/Active Badge */}
              {isActive && (
                <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Active Agent
                </div>
              )}
              {isSelected && !isActive && (
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-4 mb-5">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    isActive ? "bg-emerald-500/20" : isSelected ? "bg-blue-500/20" : "bg-white/10"
                  )}>
                    <Phone className={cn(
                      "h-5 w-5",
                      isActive ? "text-emerald-300" : isSelected ? "text-blue-300" : "text-gray-400"
                    )} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Agent ID - Subtle */}
              <div className="pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors">
                <p className="text-[10px] text-white/20 font-mono truncate group-hover:text-white/30 transition-colors">
                  {agent.agentId}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-white/10">
        <p className="text-sm text-gray-400">
          {selectedAgent ? (
            <>Selected: <span className="text-white font-medium">{selectedAgent.name}</span></>
          ) : (
            'Select an agent to test or activate'
          )}
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={handleStartWebCall}
            disabled={!selectedAgentId || isStartingCall || isCallActive}
            variant="ghost"
            className="flex-1 sm:flex-none min-w-[160px] h-11 border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30"
          >
            {isStartingCall ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Starting...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Test Call
              </>
            )}
          </Button>

          <Button
            onClick={handleSaveActiveAgent}
            disabled={!selectedAgentId || isSaving || isCallActive}
            className="flex-1 sm:flex-none min-w-[180px] h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/30 disabled:opacity-30"
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Active Agent
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
