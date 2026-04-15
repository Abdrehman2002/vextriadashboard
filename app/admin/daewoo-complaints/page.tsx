'use client'

import { useEffect, useState } from 'react'
import {
  Phone, User, RefreshCw, ChevronDown, ChevronUp,
  MessageSquare, AlertCircle, CheckCircle2, Clock,
  MapPin, PlayCircle, FileText, Frown, Meh, Smile, XCircle
} from 'lucide-react'

interface TranscriptTurn {
  role: 'agent' | 'user'
  content: string
}

interface Complaint {
  call_id: string
  call_type: string
  from_number: string | null
  to_number: string | null
  started_at: number
  duration_seconds: number | null
  recording_url: string | null
  transcript: string | null
  transcript_object: TranscriptTurn[]
  analysis: {
    caller_name?: string
    caller_phone?: string
    complaint_type?: string
    complaint_description?: string
    route_or_date?: string
    caller_sentiment?: 'calm' | 'frustrated' | 'angry' | 'satisfied'
    complaint_submitted?: 'yes' | 'no' | 'call_dropped'
    call_outcome?: string
    call_summary?: string
  }
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  calm:       { label: 'Calm',        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',     icon: Meh },
  frustrated: { label: 'Frustrated',  color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Frown },
  angry:      { label: 'Angry',       color: 'bg-red-500/20 text-red-300 border-red-500/30',        icon: XCircle },
  satisfied:  { label: 'Satisfied',   color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Smile },
}

const SUBMITTED_CONFIG: Record<string, { label: string; color: string }> = {
  yes:          { label: 'Submitted',    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  no:           { label: 'Not Submitted', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  call_dropped: { label: 'Call Dropped', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  complaint_filed:        { label: 'Filed',              color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  caller_disconnected:    { label: 'Disconnected',       color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  refused_to_share_details: { label: 'Refused Details', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  wrong_number:           { label: 'Wrong Number',       color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  transferred_to_human:   { label: 'Transferred',        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
}

const TYPE_LABELS: Record<string, string> = {
  bus_delay:       'Bus Delay',
  staff_behavior:  'Staff Behavior',
  ticket_issue:    'Ticket Issue',
  refund:          'Refund',
  luggage:         'Luggage',
  other:           'Other',
}

export default function DaewooComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchComplaints = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/daewoo-complaints')
      const data = await res.json()
      setComplaints(data.complaints || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchComplaints() }, [])

  const filtered = complaints.filter(c => {
    const t = c.analysis?.complaint_type || 'other'
    const o = c.analysis?.call_outcome || 'caller_disconnected'
    return (filterType === 'all' || t === filterType) &&
           (filterOutcome === 'all' || o === filterOutcome)
  })

  const stats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.analysis?.complaint_submitted === 'yes').length,
    angry: complaints.filter(c => c.analysis?.caller_sentiment === 'angry' || c.analysis?.caller_sentiment === 'frustrated').length,
    today: complaints.filter(c => {
      const d = new Date(c.started_at)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    }).length,
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const formatDuration = (s: number | null) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse border border-white/10" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse border border-white/10" />
      ))}
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Daewoo Complaints
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sara · Live call data · {complaints.length} total complaints
          </p>
        </div>
        <button
          onClick={() => fetchComplaints(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Phone className="h-4 w-4 text-blue-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Complaints</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.submitted}</p>
          <p className="text-xs text-gray-400 mt-0.5">Successfully Filed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg"><Frown className="h-4 w-4 text-red-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.angry}</p>
          <p className="text-xs text-gray-400 mt-0.5">Angry / Frustrated</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg"><Clock className="h-4 w-4 text-amber-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.today}</p>
          <p className="text-xs text-gray-400 mt-0.5">Today</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-wrap">
          <span className="text-xs text-gray-400">Type:</span>
          {['all', 'bus_delay', 'staff_behavior', 'ticket_issue', 'refund', 'luggage', 'other'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2 py-0.5 rounded-md transition-all ${
                filterType === t
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-400">Outcome:</span>
          {['all', 'complaint_filed', 'caller_disconnected', 'transferred_to_human'].map(o => (
            <button
              key={o}
              onClick={() => setFilterOutcome(o)}
              className={`text-xs px-2 py-0.5 rounded-md transition-all ${
                filterOutcome === o
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {o === 'all' ? 'All' : OUTCOME_CONFIG[o]?.label || o}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
          <FileText className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No complaints found</p>
          <p className="text-white/20 text-xs mt-1">Calls will appear here after Sara completes them</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((complaint) => {
            const sentiment = complaint.analysis?.caller_sentiment || 'calm'
            const outcome = complaint.analysis?.call_outcome || 'caller_disconnected'
            const submitted = complaint.analysis?.complaint_submitted || 'no'
            const SConfig = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.calm
            const OConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.caller_disconnected
            const SubConfig = SUBMITTED_CONFIG[submitted] || SUBMITTED_CONFIG.no
            const SIcon = SConfig.icon
            const isExpanded = expandedId === complaint.call_id

            return (
              <div
                key={complaint.call_id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : complaint.call_id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Sentiment icon */}
                  <div className={`p-1.5 rounded-lg border ${SConfig.color}`}>
                    <SIcon className="h-3.5 w-3.5" />
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {complaint.analysis?.caller_name || 'Unknown Caller'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {complaint.started_at ? formatDate(complaint.started_at) : '—'} · {formatDuration(complaint.duration_seconds)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        complaint.call_type === 'web_call'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      }`}>
                        {complaint.call_type === 'web_call' ? 'Web Call' : complaint.from_number || 'Phone Call'}
                      </span>
                    </div>
                  </div>

                  {/* Complaint type */}
                  {complaint.analysis?.complaint_type && (
                    <span className="hidden sm:block text-xs px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md">
                      {TYPE_LABELS[complaint.analysis.complaint_type] || complaint.analysis.complaint_type}
                    </span>
                  )}

                  {/* Submitted badge */}
                  <span className={`text-xs px-2 py-1 rounded-md border ${SubConfig.color}`}>
                    {SubConfig.label}
                  </span>

                  {/* Outcome badge */}
                  <span className={`hidden md:block text-xs px-2 py-1 rounded-md border ${OConfig.color}`}>
                    {OConfig.label}
                  </span>

                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  }
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 space-y-4">

                    {/* Summary */}
                    {complaint.analysis?.call_summary && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Summary
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">{complaint.analysis.call_summary}</p>
                      </div>
                    )}

                    {/* Data grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <DataCell icon={User} label="Caller Name" value={complaint.analysis?.caller_name} />
                      <DataCell icon={Phone} label="Phone Number" value={
                        complaint.analysis?.caller_phone ||
                        (complaint.call_type !== 'web_call' ? complaint.from_number || undefined : undefined) ||
                        (complaint.call_type === 'web_call' ? 'Web Call' : undefined)
                      } />
                      <DataCell icon={AlertCircle} label="Complaint Type" value={
                        complaint.analysis?.complaint_type
                          ? TYPE_LABELS[complaint.analysis.complaint_type] || complaint.analysis.complaint_type
                          : undefined
                      } />
                      <DataCell icon={MapPin} label="Route / Date" value={complaint.analysis?.route_or_date} />
                      <DataCell icon={SIcon} label="Sentiment" value={SConfig.label} badge badgeColor={SConfig.color} />
                      <DataCell icon={CheckCircle2} label="Submitted" value={SubConfig.label} badge badgeColor={SubConfig.color} />
                      <DataCell icon={FileText} label="Outcome" value={OConfig.label} badge badgeColor={OConfig.color} />
                      <DataCell icon={Clock} label="Duration" value={formatDuration(complaint.duration_seconds)} />
                    </div>

                    {/* Complaint description */}
                    {complaint.analysis?.complaint_description && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                          <FileText className="h-3 w-3" /> Complaint Description
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">
                          {complaint.analysis.complaint_description}
                        </p>
                      </div>
                    )}

                    {/* Transcript */}
                    {complaint.transcript_object && complaint.transcript_object.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Transcript
                        </p>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {complaint.transcript_object.map((turn, i) => (
                            <div key={i} className={`flex gap-2 ${turn.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                                turn.role === 'agent'
                                  ? 'bg-orange-500/10 border border-orange-500/20 text-orange-100'
                                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
                              }`}>
                                <span className={`text-[10px] font-semibold block mb-0.5 ${turn.role === 'agent' ? 'text-orange-400' : 'text-blue-400'}`}>
                                  {turn.role === 'agent' ? 'Sara' : 'Caller'}
                                </span>
                                {turn.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : complaint.transcript ? (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Transcript
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                          <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{complaint.transcript}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Recording */}
                    {complaint.recording_url && (
                      <a
                        href={complaint.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        Listen to recording
                      </a>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DataCell({
  icon: Icon, label, value, badge, badgeColor
}: {
  icon: any
  label: string
  value?: string
  badge?: boolean
  badgeColor?: string
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      {value ? (
        badge ? (
          <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${badgeColor}`}>{value}</span>
        ) : (
          <p className="text-sm font-medium text-white">{value}</p>
        )
      ) : (
        <p className="text-sm text-white/30">—</p>
      )}
    </div>
  )
}
