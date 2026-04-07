'use client'

import { useEffect, useState } from 'react'
import {
  Phone, User, TrendingUp, Calendar, RefreshCw,
  ChevronDown, ChevronUp, Shield, Flame, Snowflake,
  ThermometerSun, AlertCircle, CheckCircle2, Clock,
  MessageSquare, DollarSign, Users, Target, PlayCircle
} from 'lucide-react'

interface TranscriptTurn {
  role: 'agent' | 'user'
  content: string
  words?: { word: string; start: number; end: number }[]
}

interface Lead {
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
    prospect_name?: string
    callback_time?: string
    income_bracket?: string
    number_of_dependents?: number
    existing_insurance?: string
    plan_recommended?: string
    objections_raised?: string
    lead_quality?: 'hot' | 'warm' | 'cold' | 'unqualified'
    call_outcome?: string
    call_summary?: string
  }
}

const QUALITY_CONFIG = {
  hot: { label: 'Hot', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: Flame },
  warm: { label: 'Warm', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: ThermometerSun },
  cold: { label: 'Cold', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Snowflake },
  unqualified: { label: 'Unqualified', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: AlertCircle },
}

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  callback_booked: { label: 'Callback Booked', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  whatsapp_followup: { label: 'WhatsApp Follow-up', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  not_interested: { label: 'Not Interested', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  already_insured: { label: 'Already Insured', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  call_back_later: { label: 'Call Back Later', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  hung_up: { label: 'Hung Up', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

export default function EFULeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterQuality, setFilterQuality] = useState<string>('all')
  const [filterOutcome, setFilterOutcome] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeads = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/efu-leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchLeads() }, [])

  const filtered = leads.filter(l => {
    const q = l.analysis?.lead_quality || 'unqualified'
    const o = l.analysis?.call_outcome || 'hung_up'
    return (filterQuality === 'all' || q === filterQuality) &&
           (filterOutcome === 'all' || o === filterOutcome)
  })

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.analysis?.lead_quality === 'hot').length,
    callbacks: leads.filter(l => l.analysis?.call_outcome === 'callback_booked').length,
    conversion: leads.length > 0
      ? Math.round((leads.filter(l => l.analysis?.call_outcome === 'callback_booked').length / leads.length) * 100)
      : 0,
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500 bg-clip-text text-transparent">
            EFU Insurance Leads
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ayesha · Live call data · {leads.length} total leads
          </p>
        </div>
        <button
          onClick={() => fetchLeads(true)}
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
          <p className="text-xs text-gray-400 mt-0.5">Total Leads</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg"><Flame className="h-4 w-4 text-red-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.hot}</p>
          <p className="text-xs text-gray-400 mt-0.5">Hot Leads</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.callbacks}</p>
          <p className="text-xs text-gray-400 mt-0.5">Callbacks Booked</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Target className="h-4 w-4 text-purple-300" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.conversion}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Conversion Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-400">Quality:</span>
          {['all', 'hot', 'warm', 'cold', 'unqualified'].map(q => (
            <button
              key={q}
              onClick={() => setFilterQuality(q)}
              className={`text-xs px-2 py-0.5 rounded-md transition-all capitalize ${
                filterQuality === q
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-400">Outcome:</span>
          {['all', 'callback_booked', 'not_interested', 'call_back_later'].map(o => (
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

      {/* Leads List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
          <Phone className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No leads found</p>
          <p className="text-white/20 text-xs mt-1">Calls will appear here after Ayesha completes them</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const quality = lead.analysis?.lead_quality || 'unqualified'
            const outcome = lead.analysis?.call_outcome || 'hung_up'
            const QConfig = QUALITY_CONFIG[quality] || QUALITY_CONFIG.unqualified
            const OConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.hung_up
            const QIcon = QConfig.icon
            const isExpanded = expandedId === lead.call_id

            return (
              <div
                key={lead.call_id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lead.call_id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Quality dot */}
                  <div className={`p-1.5 rounded-lg border ${QConfig.color}`}>
                    <QIcon className="h-3.5 w-3.5" />
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {lead.analysis?.prospect_name || 'Unknown Prospect'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {lead.started_at ? formatDate(lead.started_at) : '—'} · {formatDuration(lead.duration_seconds)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        lead.call_type === 'web_call'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                      }`}>
                        {lead.call_type === 'web_call' ? 'Web Call' : lead.from_number || 'Phone Call'}
                      </span>
                    </div>
                  </div>

                  {/* Plan */}
                  {lead.analysis?.plan_recommended && lead.analysis.plan_recommended !== 'none' && (
                    <span className="hidden sm:block text-xs px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-md">
                      {lead.analysis.plan_recommended}
                    </span>
                  )}

                  {/* Income */}
                  {lead.analysis?.income_bracket && (
                    <span className="hidden md:block text-xs text-gray-400">
                      PKR {lead.analysis.income_bracket}
                    </span>
                  )}

                  {/* Outcome badge */}
                  <span className={`text-xs px-2 py-1 rounded-md border ${OConfig.color}`}>
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
                    {lead.analysis?.call_summary && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Summary
                        </p>
                        <p className="text-sm text-white/80 leading-relaxed">{lead.analysis.call_summary}</p>
                      </div>
                    )}

                    {/* Data grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <DataCell icon={User} label="Name" value={lead.analysis?.prospect_name} />
                      <DataCell icon={Phone} label="Contact" value={lead.call_type === 'web_call' ? 'Web Call' : (lead.from_number || 'Phone Call')} />
                      <DataCell icon={DollarSign} label="Income" value={lead.analysis?.income_bracket ? `PKR ${lead.analysis.income_bracket}` : undefined} />
                      <DataCell icon={Users} label="Dependents" value={lead.analysis?.number_of_dependents?.toString()} />
                      <DataCell icon={Shield} label="Existing Cover" value={lead.analysis?.existing_insurance?.replace('_', ' ')} />
                      <DataCell icon={Target} label="Plan" value={lead.analysis?.plan_recommended} />
                      <DataCell icon={Calendar} label="Callback Time" value={lead.analysis?.callback_time} />
                      <DataCell icon={TrendingUp} label="Lead Quality" value={lead.analysis?.lead_quality} badge badgeColor={QConfig.color} />
                      <DataCell icon={CheckCircle2} label="Outcome" value={OConfig.label} badge badgeColor={OConfig.color} />
                    </div>

                    {/* Objections */}
                    {lead.analysis?.objections_raised && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3" /> Objections Raised
                        </p>
                        <p className="text-sm text-white/70">{lead.analysis.objections_raised}</p>
                      </div>
                    )}

                    {/* Transcript */}
                    {lead.transcript_object && lead.transcript_object.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Transcript
                        </p>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {lead.transcript_object.map((turn, i) => (
                            <div key={i} className={`flex gap-2 ${turn.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                                turn.role === 'agent'
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100'
                                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
                              }`}>
                                <span className={`text-[10px] font-semibold block mb-0.5 ${turn.role === 'agent' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                  {turn.role === 'agent' ? 'Ayesha' : 'Prospect'}
                                </span>
                                {turn.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : lead.transcript ? (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" /> Call Transcript
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                          <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{lead.transcript}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Recording */}
                    {lead.recording_url && (
                      <a
                        href={lead.recording_url}
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
          <p className="text-sm font-medium text-white capitalize">{value}</p>
        )
      ) : (
        <p className="text-sm text-white/30">—</p>
      )}
    </div>
  )
}
