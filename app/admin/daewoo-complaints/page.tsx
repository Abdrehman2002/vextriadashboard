'use client'

import { useEffect, useState } from 'react'
import {
  Phone, User, RefreshCw, ChevronDown, ChevronUp,
  MessageSquare, AlertCircle, CheckCircle2, Clock,
  MapPin, PlayCircle, FileText, Frown, Meh, Smile,
  XCircle, Trash2, Ticket, Bus, CalendarDays, Hash, Armchair
} from 'lucide-react'

// ─── TICKET RECORDS (mock data) ───────────────────────────────────────────────
const TICKET_RECORDS = [
  { ticket_number: 'DW-2025-001', passenger_name: 'Munir Raza',      phone: '03001234567', route: 'Karachi → Lahore',       date: '20 April 2025', time: '8:00 AM',  seat: 'A-12', bus: 'BUS-447', status: 'Confirmed',  notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-002', passenger_name: 'Abdur Rehman',    phone: '03211234567', route: 'Lahore → Islamabad',     date: '21 April 2025', time: '10:30 AM', seat: 'B-05', bus: 'BUS-312', status: 'Delayed',    notes: 'Delayed by 2 hours due to road works.' },
  { ticket_number: 'DW-2025-003', passenger_name: 'Usman Khan',      phone: '03451234567', route: 'Islamabad → Peshawar',   date: '19 April 2025', time: '6:00 AM',  seat: 'C-08', bus: 'BUS-219', status: 'Completed',  notes: 'Journey completed successfully.' },
  { ticket_number: 'DW-2025-004', passenger_name: 'Fatima Noor',     phone: '03111234567', route: 'Karachi → Hyderabad',    date: '22 April 2025', time: '2:00 PM',  seat: 'A-03', bus: 'BUS-501', status: 'Confirmed',  notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-005', passenger_name: 'Bilal Hussain',   phone: '03331234567', route: 'Lahore → Multan',        date: '20 April 2025', time: '4:00 PM',  seat: 'D-11', bus: 'BUS-388', status: 'Cancelled',  notes: 'Cancelled due to vehicle maintenance. Refund in process.' },
  { ticket_number: 'DW-2025-006', passenger_name: 'Ayesha Tariq',    phone: '03021234567', route: 'Multan → Karachi',       date: '23 April 2025', time: '9:00 AM',  seat: 'B-14', bus: 'BUS-274', status: 'Confirmed',  notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-007', passenger_name: 'Imran Siddiqui',  phone: '03121234567', route: 'Islamabad → Lahore',     date: '21 April 2025', time: '7:00 AM',  seat: 'A-07', bus: 'BUS-193', status: 'Delayed',    notes: 'Delayed by 1 hour.' },
  { ticket_number: 'DW-2025-008', passenger_name: 'Hina Baig',       phone: '03441234567', route: 'Karachi → Sukkur',       date: '24 April 2025', time: '11:00 AM', seat: 'C-02', bus: 'BUS-620', status: 'Confirmed',  notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-009', passenger_name: 'Zain Ahmed',      phone: '03051234567', route: 'Peshawar → Lahore',      date: '20 April 2025', time: '5:30 AM',  seat: 'B-09', bus: 'BUS-155', status: 'Completed',  notes: 'Journey completed successfully.' },
  { ticket_number: 'DW-2025-010', passenger_name: 'Maria Qureshi',   phone: '03241234567', route: 'Lahore → Karachi',       date: '25 April 2025', time: '3:00 PM',  seat: 'D-06', bus: 'BUS-431', status: 'Confirmed',  notes: 'On time, no issues.' },
]

const STATUS_CONFIG: Record<string, { color: string }> = {
  Confirmed:  { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Delayed:    { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  Cancelled:  { color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  Completed:  { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
}

// ─── CALL LOG TYPES ────────────────────────────────────────────────────────────
interface TranscriptTurn { role: 'agent' | 'user'; content: string }

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
  calm:       { label: 'Calm',       color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',        icon: Meh },
  frustrated: { label: 'Frustrated', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',  icon: Frown },
  angry:      { label: 'Angry',      color: 'bg-red-500/20 text-red-300 border-red-500/30',           icon: XCircle },
  satisfied:  { label: 'Satisfied',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Smile },
}
const SUBMITTED_CONFIG: Record<string, { label: string; color: string }> = {
  yes:          { label: 'Submitted',     color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  no:           { label: 'Not Submitted', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  call_dropped: { label: 'Call Dropped',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}
const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  complaint_filed:          { label: 'Filed',           color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  caller_disconnected:      { label: 'Disconnected',    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  refused_to_share_details: { label: 'Refused Details', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  wrong_number:             { label: 'Wrong Number',    color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  transferred_to_human:     { label: 'Transferred',     color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
}
const TYPE_LABELS: Record<string, string> = {
  bus_delay: 'Bus Delay', staff_behavior: 'Staff Behavior',
  ticket_issue: 'Ticket Issue', refund: 'Refund', luggage: 'Luggage', other: 'Other',
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DaewooTicketsPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'calls'>('tickets')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCall, setExpandedCall] = useState<string | null>(null)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterOutcome, setFilterOutcome] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchComplaints = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/daewoo-complaints')
      const data = await res.json()
      setComplaints(data.complaints || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const deleteComplaint = async (call_id: string) => {
    if (!confirm('Delete this call record permanently?')) return
    setDeletingId(call_id)
    try {
      await fetch(`/api/daewoo-complaints/${call_id}`, { method: 'DELETE' })
      setComplaints(prev => prev.filter(c => c.call_id !== call_id))
      if (expandedCall === call_id) setExpandedCall(null)
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }

  useEffect(() => { fetchComplaints() }, [])

  const filteredCalls = complaints.filter(c => {
    const t = c.analysis?.complaint_type || 'other'
    const o = c.analysis?.call_outcome || 'caller_disconnected'
    return (filterType === 'all' || t === filterType) && (filterOutcome === 'all' || o === filterOutcome)
  })

  const filteredTickets = TICKET_RECORDS.filter(t =>
    filterStatus === 'all' || t.status === filterStatus
  )

  const callStats = {
    total: complaints.length,
    submitted: complaints.filter(c => c.analysis?.complaint_submitted === 'yes').length,
    angry: complaints.filter(c => ['angry','frustrated'].includes(c.analysis?.caller_sentiment || '')).length,
    today: complaints.filter(c => new Date(c.started_at).toDateString() === new Date().toDateString()).length,
  }

  const ticketStats = {
    total: TICKET_RECORDS.length,
    confirmed: TICKET_RECORDS.filter(t => t.status === 'Confirmed').length,
    delayed: TICKET_RECORDS.filter(t => t.status === 'Delayed').length,
    cancelled: TICKET_RECORDS.filter(t => t.status === 'Cancelled').length,
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatDuration = (s: number | null) => {
    if (!s) return '—'
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Daewoo Tickets
          </h1>
          <p className="text-xs text-gray-400 mt-1">Sara · Ticket records & call logs</p>
        </div>
        {activeTab === 'calls' && (
          <button
            onClick={() => fetchComplaints(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'tickets'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Ticket className="h-3.5 w-3.5" />
          Ticket Records
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{TICKET_RECORDS.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'calls'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          Call Logs
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{complaints.length}</span>
        </button>
      </div>

      {/* ── TICKET RECORDS TAB ─────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Ticket} iconColor="bg-amber-500/20" iconText="text-amber-300" borderHover="hover:border-amber-500/30 hover:shadow-amber-500/10" value={ticketStats.total} label="Total Tickets" />
            <StatCard icon={CheckCircle2} iconColor="bg-emerald-500/20" iconText="text-emerald-300" borderHover="hover:border-emerald-500/30 hover:shadow-emerald-500/10" value={ticketStats.confirmed} label="Confirmed" />
            <StatCard icon={Clock} iconColor="bg-orange-500/20" iconText="text-orange-300" borderHover="hover:border-orange-500/30 hover:shadow-orange-500/10" value={ticketStats.delayed} label="Delayed" />
            <StatCard icon={XCircle} iconColor="bg-red-500/20" iconText="text-red-300" borderHover="hover:border-red-500/30 hover:shadow-red-500/10" value={ticketStats.cancelled} label="Cancelled" />
          </div>

          {/* Filter by status */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-fit flex-wrap">
            <span className="text-xs text-gray-400">Status:</span>
            {['all', 'Confirmed', 'Delayed', 'Cancelled', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-2 py-0.5 rounded-md transition-all ${
                  filterStatus === s ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="space-y-2">
            {filteredTickets.map((ticket) => {
              const sConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.Confirmed
              const isExpanded = expandedTicket === ticket.ticket_number
              return (
                <div key={ticket.ticket_number} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.ticket_number)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    {/* Ticket number */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 shrink-0">
                      <p className="text-[10px] text-amber-400 font-mono font-bold">{ticket.ticket_number}</p>
                    </div>

                    {/* Name + route */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{ticket.passenger_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.route} · {ticket.date} · {ticket.time}</p>
                    </div>

                    {/* Phone */}
                    <span className="hidden sm:block text-xs text-gray-400">{ticket.phone}</span>

                    {/* Seat */}
                    <span className="hidden md:block text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-300">
                      Seat {ticket.seat}
                    </span>

                    {/* Status badge */}
                    <span className={`text-xs px-2 py-1 rounded-md border ${sConf.color}`}>
                      {ticket.status}
                    </span>

                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    }
                  </button>

                  {/* Expanded ticket detail */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <DataCell icon={Hash}        label="Ticket Number"  value={ticket.ticket_number} />
                        <DataCell icon={User}        label="Passenger"      value={ticket.passenger_name} />
                        <DataCell icon={Phone}       label="Phone"          value={ticket.phone} />
                        <DataCell icon={MapPin}      label="Route"          value={ticket.route} />
                        <DataCell icon={CalendarDays} label="Date"          value={ticket.date} />
                        <DataCell icon={Clock}       label="Departure"      value={ticket.time} />
                        <DataCell icon={Armchair}    label="Seat"           value={ticket.seat} />
                        <DataCell icon={Bus}         label="Bus Number"     value={ticket.bus} />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3" /> Update / Notes
                        </p>
                        <p className="text-sm text-white/80">{ticket.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── CALL LOGS TAB ──────────────────────────────────────────── */}
      {activeTab === 'calls' && (
        <>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse border border-white/10" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Phone} iconColor="bg-blue-500/20" iconText="text-blue-300" borderHover="hover:border-blue-500/30 hover:shadow-blue-500/10" value={callStats.total} label="Total Calls" />
                <StatCard icon={CheckCircle2} iconColor="bg-emerald-500/20" iconText="text-emerald-300" borderHover="hover:border-emerald-500/30 hover:shadow-emerald-500/10" value={callStats.submitted} label="Complaints Filed" />
                <StatCard icon={Frown} iconColor="bg-red-500/20" iconText="text-red-300" borderHover="hover:border-red-500/30 hover:shadow-red-500/10" value={callStats.angry} label="Angry / Frustrated" />
                <StatCard icon={Clock} iconColor="bg-amber-500/20" iconText="text-amber-300" borderHover="hover:border-amber-500/30 hover:shadow-amber-500/10" value={callStats.today} label="Today" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-wrap">
                  <span className="text-xs text-gray-400">Type:</span>
                  {['all', 'bus_delay', 'staff_behavior', 'ticket_issue', 'refund', 'luggage', 'other'].map(t => (
                    <button key={t} onClick={() => setFilterType(t)} className={`text-xs px-2 py-0.5 rounded-md transition-all ${filterType === t ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:text-white'}`}>
                      {t === 'all' ? 'All' : TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-400">Outcome:</span>
                  {['all', 'complaint_filed', 'caller_disconnected', 'transferred_to_human'].map(o => (
                    <button key={o} onClick={() => setFilterOutcome(o)} className={`text-xs px-2 py-0.5 rounded-md transition-all ${filterOutcome === o ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:text-white'}`}>
                      {o === 'all' ? 'All' : OUTCOME_CONFIG[o]?.label || o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call list */}
              {filteredCalls.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                  <FileText className="h-10 w-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No call logs found</p>
                  <p className="text-white/20 text-xs mt-1">Calls will appear here after Sara completes them</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCalls.map((complaint) => {
                    const sentiment = complaint.analysis?.caller_sentiment || 'calm'
                    const outcome = complaint.analysis?.call_outcome || 'caller_disconnected'
                    const submitted = complaint.analysis?.complaint_submitted || 'no'
                    const SConfig = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.calm
                    const OConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.caller_disconnected
                    const SubConfig = SUBMITTED_CONFIG[submitted] || SUBMITTED_CONFIG.no
                    const SIcon = SConfig.icon
                    const isExpanded = expandedCall === complaint.call_id

                    return (
                      <div key={complaint.call_id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                        <button
                          onClick={() => setExpandedCall(isExpanded ? null : complaint.call_id)}
                          className="w-full flex items-center gap-3 p-4 text-left"
                        >
                          <div className={`p-1.5 rounded-lg border ${SConfig.color}`}><SIcon className="h-3.5 w-3.5" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{complaint.analysis?.caller_name || 'Unknown Caller'}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <p className="text-xs text-gray-400">{complaint.started_at ? formatDate(complaint.started_at) : '—'} · {formatDuration(complaint.duration_seconds)}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${complaint.call_type === 'web_call' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'}`}>
                                {complaint.call_type === 'web_call' ? 'Web Call' : complaint.from_number || 'Phone Call'}
                              </span>
                            </div>
                          </div>
                          {complaint.analysis?.complaint_type && (
                            <span className="hidden sm:block text-xs px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md">
                              {TYPE_LABELS[complaint.analysis.complaint_type] || complaint.analysis.complaint_type}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-md border ${SubConfig.color}`}>{SubConfig.label}</span>
                          <span className={`hidden md:block text-xs px-2 py-1 rounded-md border ${OConfig.color}`}>{OConfig.label}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteComplaint(complaint.call_id) }}
                            disabled={deletingId === complaint.call_id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                            title="Delete record"
                          >
                            {deletingId === complaint.call_id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-white/10 p-4 space-y-4">
                            {complaint.analysis?.call_summary && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Call Summary</p>
                                <p className="text-sm text-white/80 leading-relaxed">{complaint.analysis.call_summary}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              <DataCell icon={User} label="Caller Name" value={complaint.analysis?.caller_name} />
                              <DataCell icon={Phone} label="Phone Number" value={complaint.analysis?.caller_phone || (complaint.call_type !== 'web_call' ? complaint.from_number || undefined : 'Web Call')} />
                              <DataCell icon={AlertCircle} label="Complaint Type" value={complaint.analysis?.complaint_type ? TYPE_LABELS[complaint.analysis.complaint_type] || complaint.analysis.complaint_type : undefined} />
                              <DataCell icon={MapPin} label="Route / Date" value={complaint.analysis?.route_or_date} />
                              <DataCell icon={SIcon} label="Sentiment" value={SConfig.label} badge badgeColor={SConfig.color} />
                              <DataCell icon={CheckCircle2} label="Submitted" value={SubConfig.label} badge badgeColor={SubConfig.color} />
                              <DataCell icon={FileText} label="Outcome" value={OConfig.label} badge badgeColor={OConfig.color} />
                              <DataCell icon={Clock} label="Duration" value={formatDuration(complaint.duration_seconds)} />
                            </div>
                            {complaint.analysis?.complaint_description && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5"><FileText className="h-3 w-3" /> Complaint Description</p>
                                <p className="text-sm text-white/70 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">{complaint.analysis.complaint_description}</p>
                              </div>
                            )}
                            {complaint.transcript_object?.length > 0 ? (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Call Transcript</p>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                  {complaint.transcript_object.map((turn, i) => (
                                    <div key={i} className={`flex gap-2 ${turn.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
                                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${turn.role === 'agent' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-100' : 'bg-blue-500/10 border border-blue-500/20 text-blue-100'}`}>
                                        <span className={`text-[10px] font-semibold block mb-0.5 ${turn.role === 'agent' ? 'text-orange-400' : 'text-blue-400'}`}>{turn.role === 'agent' ? 'Sara' : 'Caller'}</span>
                                        {turn.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : complaint.transcript ? (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Call Transcript</p>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                                  <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{complaint.transcript}</p>
                                </div>
                              </div>
                            ) : null}
                            {complaint.recording_url && (
                              <a href={complaint.recording_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors">
                                <PlayCircle className="h-3.5 w-3.5" /> Listen to recording
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconColor, iconText, borderHover, value, label }: {
  icon: any; iconColor: string; iconText: string; borderHover: string; value: number; label: string
}) {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-lg transition-all ${borderHover}`}>
      <div className="mb-2"><div className={`p-2 ${iconColor} rounded-lg w-fit`}><Icon className={`h-4 w-4 ${iconText}`} /></div></div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function DataCell({ icon: Icon, label, value, badge, badgeColor }: {
  icon: any; label: string; value?: string; badge?: boolean; badgeColor?: string
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"><Icon className="h-3 w-3" /> {label}</p>
      {value
        ? badge
          ? <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${badgeColor}`}>{value}</span>
          : <p className="text-sm font-medium text-white">{value}</p>
        : <p className="text-sm text-white/30">—</p>
      }
    </div>
  )
}
