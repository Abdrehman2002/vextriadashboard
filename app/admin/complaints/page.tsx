'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus, Pencil, Trash2, RefreshCw, AlertCircle, User, Mail, Phone,
  FileText, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  MessageSquare, Clock, MapPin, PlayCircle, Frown, Meh, Smile,
  XCircle, Ticket, Bus, CalendarDays, Hash, Armchair
} from 'lucide-react'

// ─── TICKET RECORDS ───────────────────────────────────────────────────────────
const TICKET_RECORDS = [
  { ticket_number: 'DW-2025-001', passenger_name: 'Munir Raza',     phone: '03001234567', route: 'Karachi → Lahore',     date: '20 April 2025', time: '8:00 AM',  seat: 'A-12', bus: 'BUS-447', status: 'Confirmed', notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-002', passenger_name: 'Abdur Rehman',   phone: '03211234567', route: 'Lahore → Islamabad',   date: '21 April 2025', time: '10:30 AM', seat: 'B-05', bus: 'BUS-312', status: 'Delayed',   notes: 'Delayed by 2 hours due to road works.' },
  { ticket_number: 'DW-2025-003', passenger_name: 'Usman Khan',     phone: '03451234567', route: 'Islamabad → Peshawar', date: '19 April 2025', time: '6:00 AM',  seat: 'C-08', bus: 'BUS-219', status: 'Completed', notes: 'Journey completed successfully.' },
  { ticket_number: 'DW-2025-004', passenger_name: 'Fatima Noor',    phone: '03111234567', route: 'Karachi → Hyderabad',  date: '22 April 2025', time: '2:00 PM',  seat: 'A-03', bus: 'BUS-501', status: 'Confirmed', notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-005', passenger_name: 'Bilal Hussain',  phone: '03331234567', route: 'Lahore → Multan',      date: '20 April 2025', time: '4:00 PM',  seat: 'D-11', bus: 'BUS-388', status: 'Cancelled', notes: 'Cancelled due to vehicle maintenance. Refund in process.' },
  { ticket_number: 'DW-2025-006', passenger_name: 'Ayesha Tariq',   phone: '03021234567', route: 'Multan → Karachi',     date: '23 April 2025', time: '9:00 AM',  seat: 'B-14', bus: 'BUS-274', status: 'Confirmed', notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-007', passenger_name: 'Imran Siddiqui', phone: '03121234567', route: 'Islamabad → Lahore',   date: '21 April 2025', time: '7:00 AM',  seat: 'A-07', bus: 'BUS-193', status: 'Delayed',   notes: 'Delayed by 1 hour.' },
  { ticket_number: 'DW-2025-008', passenger_name: 'Hina Baig',      phone: '03441234567', route: 'Karachi → Sukkur',     date: '24 April 2025', time: '11:00 AM', seat: 'C-02', bus: 'BUS-620', status: 'Confirmed', notes: 'On time, no issues.' },
  { ticket_number: 'DW-2025-009', passenger_name: 'Zain Ahmed',     phone: '03051234567', route: 'Peshawar → Lahore',    date: '20 April 2025', time: '5:30 AM',  seat: 'B-09', bus: 'BUS-155', status: 'Completed', notes: 'Journey completed successfully.' },
  { ticket_number: 'DW-2025-010', passenger_name: 'Maria Qureshi',  phone: '03241234567', route: 'Lahore → Karachi',     date: '25 April 2025', time: '3:00 PM',  seat: 'D-06', bus: 'BUS-431', status: 'Confirmed', notes: 'On time, no issues.' },
]

const TICKET_STATUS_CONFIG: Record<string, { color: string }> = {
  Confirmed:  { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  Delayed:    { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  Cancelled:  { color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  Completed:  { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
}

// ─── CALL LOG TYPES ───────────────────────────────────────────────────────────
interface TranscriptTurn { role: 'agent' | 'user'; content: string }
interface CallLog {
  call_id: string; call_type: string; from_number: string | null
  started_at: number; duration_seconds: number | null
  recording_url: string | null; transcript: string | null
  transcript_object: TranscriptTurn[]
  analysis: {
    caller_name?: string; caller_phone?: string; complaint_type?: string
    complaint_description?: string; route_or_date?: string
    caller_sentiment?: string; complaint_submitted?: string
    call_outcome?: string; call_summary?: string
  }
}

const SENTIMENT_CFG: Record<string, { label: string; color: string; icon: any }> = {
  calm:       { label: 'Calm',       color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',        icon: Meh },
  frustrated: { label: 'Frustrated', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',  icon: Frown },
  angry:      { label: 'Angry',      color: 'bg-red-500/20 text-red-300 border-red-500/30',           icon: XCircle },
  satisfied:  { label: 'Satisfied',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Smile },
}
const SUBMITTED_CFG: Record<string, { label: string; color: string }> = {
  yes:          { label: 'Submitted',     color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  no:           { label: 'Not Submitted', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  call_dropped: { label: 'Call Dropped',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}
const OUTCOME_CFG: Record<string, { label: string; color: string }> = {
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

// ─── GOOGLE SHEETS COMPLAINT TYPE ────────────────────────────────────────────
interface ComplaintRow {
  rowIndex?: number; timestamp: string; complaintId: string
  customerName: string; customerEmail: string; customerPhone: string
  complaintType: string; priority: string; status: string
  description: string; assignedTo: string; resolutionNotes: string; dateResolved: string
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminComplaints() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'calls' | 'manual'>('tickets')

  // Google Sheets state
  const [rows, setRows] = useState<ComplaintRow[]>([])
  const [loadingRows, setLoadingRows] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<ComplaintRow | null>(null)
  const [formData, setFormData] = useState<Partial<ComplaintRow>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Call log state
  const [calls, setCalls] = useState<CallLog[]>([])
  const [loadingCalls, setLoadingCalls] = useState(true)
  const [expandedCall, setExpandedCall] = useState<string | null>(null)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshingCalls, setRefreshingCalls] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRows = async () => {
    setLoadingRows(true)
    try {
      const res = await fetch('/api/complaints/get', { cache: 'no-store' })
      const data = await res.json()
      setRows(Array.isArray(data) ? data.reverse() : [])
    } catch (e) { console.error(e) }
    finally { setLoadingRows(false) }
  }

  const fetchCalls = async (showRefresh = false) => {
    if (showRefresh) setRefreshingCalls(true)
    else setLoadingCalls(true)
    try {
      const res = await fetch('/api/daewoo-complaints')
      const data = await res.json()
      setCalls(data.complaints || [])
    } catch (e) { console.error(e) }
    finally { setLoadingCalls(false); setRefreshingCalls(false) }
  }

  useEffect(() => { fetchRows(); fetchCalls() }, [])

  const deleteCall = async (call_id: string) => {
    if (!confirm('Delete this call record permanently?')) return
    setDeletingId(call_id)
    try {
      await fetch(`/api/daewoo-complaints/${call_id}`, { method: 'DELETE' })
      setCalls(prev => prev.filter(c => c.call_id !== call_id))
      if (expandedCall === call_id) setExpandedCall(null)
    } catch (e) { console.error(e) }
    finally { setDeletingId(null) }
  }

  const handleAdd = () => {
    setEditingRow(null)
    setFormData({ timestamp: new Date().toISOString().split('T')[0], complaintId: `CMPL-${Date.now()}`, priority: 'Medium', status: 'New' })
    setShowDialog(true)
  }
  const handleEdit = (row: ComplaintRow) => { setEditingRow(row); setFormData(row); setShowDialog(true) }
  const handleDelete = async (row: ComplaintRow) => {
    if (!confirm('Delete this complaint?')) return
    try {
      await fetch('/api/complaints/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex: row.rowIndex }) })
      fetchRows()
    } catch (e) { console.error(e) }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingRow) {
        await fetch('/api/complaints/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, rowIndex: editingRow.rowIndex }) })
      } else {
        await fetch('/api/complaints/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      }
      setShowDialog(false); fetchRows()
    } catch (e) { console.error(e) }
  }

  const getPriorityColor = (p: string) => ({ high: 'bg-red-500/20 text-red-300 border-red-500/30', medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30', low: 'bg-green-500/20 text-green-300 border-green-500/30' }[p?.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30')
  const getStatusColor = (s: string) => ({ new: 'bg-blue-500/20 text-blue-300 border-blue-500/30', 'in progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30', resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', closed: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }[s?.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30')

  const totalPages = Math.ceil(rows.length / rowsPerPage)
  const paginatedRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const filteredTickets = TICKET_RECORDS.filter(t => filterStatus === 'all' || t.status === filterStatus)

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatDur = (s: number | null) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : '—'

  const callStats = {
    total: calls.length,
    submitted: calls.filter(c => c.analysis?.complaint_submitted === 'yes').length,
    angry: calls.filter(c => ['angry', 'frustrated'].includes(c.analysis?.caller_sentiment || '')).length,
    today: calls.filter(c => new Date(c.started_at).toDateString() === new Date().toDateString()).length,
  }
  const ticketStats = {
    total: TICKET_RECORDS.length,
    confirmed: TICKET_RECORDS.filter(t => t.status === 'Confirmed').length,
    delayed: TICKET_RECORDS.filter(t => t.status === 'Delayed').length,
    cancelled: TICKET_RECORDS.filter(t => t.status === 'Cancelled').length,
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Complaints
          </h1>
          <p className="text-sm text-gray-400 mt-1">Ticket records, AI call logs & manual complaints</p>
        </div>
        {activeTab === 'calls' && (
          <button onClick={() => fetchCalls(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingCalls ? 'animate-spin' : ''}`} /> Refresh
          </button>
        )}
        {activeTab === 'manual' && (
          <div className="flex items-center gap-3">
            <Button onClick={fetchRows} variant="ghost" disabled={loadingRows} className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingRows ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
              <Plus className="h-4 w-4 mr-2" /> Add Complaint
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit flex-wrap">
        <button onClick={() => setActiveTab('tickets')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tickets' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:text-white'}`}>
          <Ticket className="h-3.5 w-3.5" /> Ticket Records
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{TICKET_RECORDS.length}</span>
        </button>
        <button onClick={() => setActiveTab('calls')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'calls' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-gray-400 hover:text-white'}`}>
          <Phone className="h-3.5 w-3.5" /> AI Call Logs
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{calls.length}</span>
        </button>
        <button onClick={() => setActiveTab('manual')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manual' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-gray-400 hover:text-white'}`}>
          <FileText className="h-3.5 w-3.5" /> Manual Complaints
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-md">{rows.length}</span>
        </button>
      </div>

      {/* ── TICKET RECORDS TAB ─────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Ticket, c: 'bg-amber-500/20', t: 'text-amber-300', h: 'hover:border-amber-500/30', v: ticketStats.total, l: 'Total Tickets' },
              { icon: CheckCircle2, c: 'bg-emerald-500/20', t: 'text-emerald-300', h: 'hover:border-emerald-500/30', v: ticketStats.confirmed, l: 'Confirmed' },
              { icon: Clock, c: 'bg-orange-500/20', t: 'text-orange-300', h: 'hover:border-orange-500/30', v: ticketStats.delayed, l: 'Delayed' },
              { icon: XCircle, c: 'bg-red-500/20', t: 'text-red-300', h: 'hover:border-red-500/30', v: ticketStats.cancelled, l: 'Cancelled' },
            ].map(({ icon: Icon, c, t, h, v, l }) => (
              <div key={l} className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:shadow-lg transition-all ${h}`}>
                <div className="mb-2"><div className={`p-2 ${c} rounded-lg w-fit`}><Icon className={`h-4 w-4 ${t}`} /></div></div>
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-fit flex-wrap">
            <span className="text-xs text-gray-400">Status:</span>
            {['all', 'Confirmed', 'Delayed', 'Cancelled', 'Completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-2 py-0.5 rounded-md transition-all ${filterStatus === s ? 'bg-white/20 text-white font-medium' : 'text-gray-400 hover:text-white'}`}>{s === 'all' ? 'All' : s}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredTickets.map(ticket => {
              const sConf = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.Confirmed
              const isExp = expandedTicket === ticket.ticket_number
              return (
                <div key={ticket.ticket_number} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                  <button onClick={() => setExpandedTicket(isExp ? null : ticket.ticket_number)} className="w-full flex items-center gap-3 p-4 text-left">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 shrink-0">
                      <p className="text-[10px] text-amber-400 font-mono font-bold">{ticket.ticket_number}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{ticket.passenger_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.route} · {ticket.date} · {ticket.time}</p>
                    </div>
                    <span className="hidden sm:block text-xs text-gray-400">{ticket.phone}</span>
                    <span className="hidden md:block text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-300">Seat {ticket.seat}</span>
                    <span className={`text-xs px-2 py-1 rounded-md border ${sConf.color}`}>{ticket.status}</span>
                    {isExp ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                  </button>
                  {isExp && (
                    <div className="border-t border-white/10 p-4 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <DC icon={Hash} label="Ticket No." value={ticket.ticket_number} />
                        <DC icon={User} label="Passenger" value={ticket.passenger_name} />
                        <DC icon={Phone} label="Phone" value={ticket.phone} />
                        <DC icon={MapPin} label="Route" value={ticket.route} />
                        <DC icon={CalendarDays} label="Date" value={ticket.date} />
                        <DC icon={Clock} label="Departure" value={ticket.time} />
                        <DC icon={Armchair} label="Seat" value={ticket.seat} />
                        <DC icon={Bus} label="Bus" value={ticket.bus} />
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /> Update</p>
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

      {/* ── AI CALL LOGS TAB ───────────────────────────────────────── */}
      {activeTab === 'calls' && (
        loadingCalls ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse border border-white/10" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Phone, c: 'bg-blue-500/20', t: 'text-blue-300', h: 'hover:border-blue-500/30', v: callStats.total, l: 'Total Calls' },
                { icon: CheckCircle2, c: 'bg-emerald-500/20', t: 'text-emerald-300', h: 'hover:border-emerald-500/30', v: callStats.submitted, l: 'Complaints Filed' },
                { icon: Frown, c: 'bg-red-500/20', t: 'text-red-300', h: 'hover:border-red-500/30', v: callStats.angry, l: 'Angry / Frustrated' },
                { icon: Clock, c: 'bg-amber-500/20', t: 'text-amber-300', h: 'hover:border-amber-500/30', v: callStats.today, l: 'Today' },
              ].map(({ icon: Icon, c, t, h, v, l }) => (
                <div key={l} className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:shadow-lg transition-all ${h}`}>
                  <div className="mb-2"><div className={`p-2 ${c} rounded-lg w-fit`}><Icon className={`h-4 w-4 ${t}`} /></div></div>
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {calls.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
                <Phone className="h-10 w-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No call logs yet</p>
                <p className="text-white/20 text-xs mt-1">Calls will appear here after Sara completes them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {calls.map(call => {
                  const S = SENTIMENT_CFG[call.analysis?.caller_sentiment || 'calm'] || SENTIMENT_CFG.calm
                  const O = OUTCOME_CFG[call.analysis?.call_outcome || 'caller_disconnected'] || OUTCOME_CFG.caller_disconnected
                  const Sub = SUBMITTED_CFG[call.analysis?.complaint_submitted || 'no'] || SUBMITTED_CFG.no
                  const SIcon = S.icon
                  const isExp = expandedCall === call.call_id
                  return (
                    <div key={call.call_id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                      <button onClick={() => setExpandedCall(isExp ? null : call.call_id)} className="w-full flex items-center gap-3 p-4 text-left">
                        <div className={`p-1.5 rounded-lg border ${S.color}`}><SIcon className="h-3.5 w-3.5" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{call.analysis?.caller_name || 'Unknown Caller'}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-xs text-gray-400">{call.started_at ? formatDate(call.started_at) : '—'} · {formatDur(call.duration_seconds)}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${call.call_type === 'web_call' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'}`}>
                              {call.call_type === 'web_call' ? 'Web Call' : call.from_number || 'Phone Call'}
                            </span>
                          </div>
                        </div>
                        {call.analysis?.complaint_type && <span className="hidden sm:block text-xs px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md">{TYPE_LABELS[call.analysis.complaint_type] || call.analysis.complaint_type}</span>}
                        <span className={`text-xs px-2 py-1 rounded-md border ${Sub.color}`}>{Sub.label}</span>
                        <span className={`hidden md:block text-xs px-2 py-1 rounded-md border ${O.color}`}>{O.label}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteCall(call.call_id) }} disabled={deletingId === call.call_id} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
                          {deletingId === call.call_id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                        {isExp ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                      </button>
                      {isExp && (
                        <div className="border-t border-white/10 p-4 space-y-4">
                          {call.analysis?.call_summary && (
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Call Summary</p>
                              <p className="text-sm text-white/80 leading-relaxed">{call.analysis.call_summary}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <DC icon={User} label="Caller" value={call.analysis?.caller_name} />
                            <DC icon={Phone} label="Phone" value={call.analysis?.caller_phone || (call.call_type !== 'web_call' ? call.from_number || undefined : 'Web Call')} />
                            <DC icon={AlertCircle} label="Type" value={call.analysis?.complaint_type ? TYPE_LABELS[call.analysis.complaint_type] || call.analysis.complaint_type : undefined} />
                            <DC icon={MapPin} label="Route / Date" value={call.analysis?.route_or_date} />
                            <DC icon={SIcon} label="Sentiment" value={S.label} badge badgeColor={S.color} />
                            <DC icon={CheckCircle2} label="Submitted" value={Sub.label} badge badgeColor={Sub.color} />
                            <DC icon={FileText} label="Outcome" value={O.label} badge badgeColor={O.color} />
                            <DC icon={Clock} label="Duration" value={formatDur(call.duration_seconds)} />
                          </div>
                          {call.analysis?.complaint_description && (
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5"><FileText className="h-3 w-3" /> Description</p>
                              <p className="text-sm text-white/70 bg-white/5 rounded-lg p-3 border border-white/10">{call.analysis.complaint_description}</p>
                            </div>
                          )}
                          {call.transcript_object?.length > 0 ? (
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Transcript</p>
                              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {call.transcript_object.map((turn, i) => (
                                  <div key={i} className={`flex gap-2 ${turn.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${turn.role === 'agent' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-100' : 'bg-blue-500/10 border border-blue-500/20 text-blue-100'}`}>
                                      <span className={`text-[10px] font-semibold block mb-0.5 ${turn.role === 'agent' ? 'text-orange-400' : 'text-blue-400'}`}>{turn.role === 'agent' ? 'Sara' : 'Caller'}</span>
                                      {turn.content}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : call.transcript ? (
                            <div>
                              <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Transcript</p>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                                <p className="text-sm text-white/70 whitespace-pre-wrap">{call.transcript}</p>
                              </div>
                            </div>
                          ) : null}
                          {call.recording_url && (
                            <a href={call.recording_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors">
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
        )
      )}

      {/* ── MANUAL COMPLAINTS TAB (Google Sheets) ─────────────────── */}
      {activeTab === 'manual' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6">
            <div className="overflow-x-auto -mx-6">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#120A24]">
                    {['Timestamp','ID','Customer','Type','Priority','Status','Description','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#0B0715]">
                  {loadingRows ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {[...Array(8)].map((_, j) => <td key={j} className="py-4 px-6"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>)}
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center">
                      <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-sm font-medium text-white/40">No complaints yet</p>
                    </td></tr>
                  ) : paginatedRows.map(row => (
                    <tr key={row.complaintId} onClick={() => handleEdit(row)} className="border-b border-gray-800 hover:bg-[#120A24] transition-all cursor-pointer group">
                      <td className="py-4 px-6"><div className="flex items-center gap-2 text-sm text-gray-300"><Calendar className="h-3.5 w-3.5 text-red-400" />{row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '-'}</div></td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-mono">{row.complaintId || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-blue-400" /><span className="text-sm font-semibold text-white">{row.customerName || '-'}</span></div>
                          <div className="flex items-center gap-2 text-xs text-gray-400"><Mail className="h-3 w-3 text-emerald-400" />{row.customerEmail || '-'}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400"><Phone className="h-3 w-3 text-blue-400" />{row.customerPhone || '-'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-300">{row.complaintType || '-'}</td>
                      <td className="py-4 px-6"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(row.priority)}`}><AlertCircle className="h-3 w-3" />{row.priority || '-'}</span></td>
                      <td className="py-4 px-6"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}><CheckCircle2 className="h-3 w-3" />{row.status || '-'}</span></td>
                      <td className="py-4 px-6 text-xs text-gray-400 max-w-xs truncate">{row.description || '-'}</td>
                      <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="hover:bg-blue-500/20 hover:text-blue-300 border border-transparent hover:border-blue-500/30"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} className="hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10">
                <p className="text-sm text-gray-400">Showing <span className="font-medium text-white">{(currentPage-1)*rowsPerPage+1}</span> to <span className="font-medium text-white">{Math.min(currentPage*rowsPerPage, rows.length)}</span> of <span className="font-medium text-white">{rows.length}</span></p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage-1))} disabled={currentPage===1} className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 disabled:opacity-30">Previous</Button>
                  {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded text-sm font-medium transition-all ${currentPage===p ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{p}</button>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage+1))} disabled={currentPage===totalPages} className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 disabled:opacity-30">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRow ? 'Edit Complaint' : 'Add Complaint'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Customer Name *</Label><Input value={formData.customerName||''} onChange={e => setFormData({...formData, customerName:e.target.value})} required /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={formData.customerPhone||''} onChange={e => setFormData({...formData, customerPhone:e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.customerEmail||''} onChange={e => setFormData({...formData, customerEmail:e.target.value})} /></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Complaint Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Type *</Label><Input value={formData.complaintType||''} onChange={e => setFormData({...formData, complaintType:e.target.value})} required /></div>
                  <div className="space-y-2"><Label>Priority</Label>
                    <select value={formData.priority||'Medium'} onChange={e => setFormData({...formData, priority:e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white">
                      {['Low','Medium','High'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Status</Label>
                    <select value={formData.status||'New'} onChange={e => setFormData({...formData, status:e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white">
                      {['New','In Progress','Resolved','Closed'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description *</Label><Textarea rows={4} value={formData.description||''} onChange={e => setFormData({...formData, description:e.target.value})} required /></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Resolution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Assigned To</Label><Input value={formData.assignedTo||''} onChange={e => setFormData({...formData, assignedTo:e.target.value})} /></div>
                  <div className="space-y-2"><Label>Date Resolved</Label><Input type="date" value={formData.dateResolved||''} onChange={e => setFormData({...formData, dateResolved:e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Resolution Notes</Label><Textarea rows={3} value={formData.resolutionNotes||''} onChange={e => setFormData({...formData, resolutionNotes:e.target.value})} /></div>
              </div>
            </div>
            <DialogFooter>
              {editingRow && <Button type="button" variant="destructive" onClick={() => { handleDelete(editingRow); setShowDialog(false) }}>Delete</Button>}
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-red-500 to-pink-600">{editingRow ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DC({ icon: Icon, label, value, badge, badgeColor }: { icon: any; label: string; value?: string; badge?: boolean; badgeColor?: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"><Icon className="h-3 w-3" /> {label}</p>
      {value ? badge ? <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${badgeColor}`}>{value}</span> : <p className="text-sm font-medium text-white">{value}</p> : <p className="text-sm text-white/30">—</p>}
    </div>
  )
}
