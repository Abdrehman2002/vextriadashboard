'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, RefreshCw, Calendar, Phone, Mail, User, Building2, Clock, CheckCircle } from 'lucide-react'

interface SheetRow {
  rowIndex?: number
  dateBooked: string
  appointmentDate: string
  appointmentTime: string
  day: string
  callerName: string
  callerEmail: string
  callerPhone: string
  businessName: string
  eventId: string
  status: string
  reminderSent: string
  showNoShow: string
}

export default function AdminData() {
  const [rows, setRows] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'normal' | 'sheets'>('normal')
  const [showDialog, setShowDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null)
  const [formData, setFormData] = useState<Partial<SheetRow>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sheets/get', { cache: 'no-store' })
      const data = await res.json()
      // Reverse the array so newest entries appear first
      setRows(Array.isArray(data) ? data.reverse() : [])
    } catch (error) {
      console.error('Error fetching rows:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const handleAdd = () => {
    setEditingRow(null)
    setFormData({
      dateBooked: new Date().toISOString().split('T')[0],
      appointmentDate: '',
      appointmentTime: '',
      day: '',
      callerName: '',
      callerEmail: '',
      callerPhone: '',
      businessName: '',
      eventId: `EVT-${Date.now()}`,
      status: '',
      reminderSent: '',
      showNoShow: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (row: SheetRow) => {
    setEditingRow(row)
    setFormData(row)
    setShowDialog(true)
  }

  const handleDelete = async (row: SheetRow) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      await fetch('/api/sheets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: row.eventId, rowIndex: row.rowIndex }),
      })
      fetchRows()
    } catch (error) {
      console.error('Error deleting row:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingRow) {
        await fetch('/api/sheets/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/sheets/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setShowDialog(false)
      fetchRows()
    } catch (error) {
      console.error('Error saving row:', error)
    }
  }

  const headers = [
    'dateBooked',
    'appointmentDate',
    'appointmentTime',
    'day',
    'callerName',
    'callerEmail',
    'callerPhone',
    'businessName',
    'eventId',
    'status',
    'reminderSent',
    'showNoShow',
  ]

  const formatHeaderName = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  // Pagination calculations
  const totalPages = Math.ceil(rows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedRows = rows.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header with Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent">
            Appointments & Bookings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage all your appointment data</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchRows}
            variant="ghost"
            disabled={loading}
            className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {activeTab === 'normal' && (
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 bg-white/5 rounded-t-2xl p-1">
        <button
          onClick={() => setActiveTab('normal')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'normal'
              ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-500 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Normal View
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'sheets'
              ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-500 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Google Sheets View
        </button>
      </div>

      {activeTab === 'normal' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6">
            <div className="overflow-x-auto -mx-6">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#120A24]">
                    {headers.map((header) => (
                      <th key={header} className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
                        {formatHeaderName(header)}
                      </th>
                    ))}
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-blue-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0B0715]">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {[...Array(headers.length || 4)].map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 bg-white/10 rounded animate-pulse" />
                          </td>
                        ))}
                        <td className="py-4 px-6">
                          <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="w-12 h-12 text-white/20" />
                          <p className="text-sm font-medium text-white/40">No appointments yet</p>
                          <p className="text-xs text-white/30">Click "Add Row" to create your first appointment</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => (
                      <tr
                        key={row.eventId}
                        onClick={() => handleEdit(row)}
                        className={`border-b border-gray-800 hover:bg-[#120A24] transition-all duration-200 cursor-pointer group ${
                          index % 2 === 0 ? 'bg-[#0B0715]' : 'bg-[#0B0715]'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-blue-400" />
                            {row.dateBooked || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-blue-400" />
                            {row.appointmentDate || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            {row.appointmentTime || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-400">
                          {row.day || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-sm font-semibold text-white">{row.callerName || <span className="text-gray-600">-</span>}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="h-3.5 w-3.5 text-emerald-400" />
                            {row.callerEmail || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="h-3.5 w-3.5 text-blue-400" />
                            {row.callerPhone || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Building2 className="h-3.5 w-3.5 text-amber-400" />
                            {row.businessName || <span className="text-gray-600">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                          {row.eventId || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="py-4 px-6">
                          {row.status ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              row.status.toLowerCase().includes('confirmed')
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : row.status.toLowerCase().includes('pending')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              <CheckCircle className="h-3 w-3" />
                              {row.status}
                            </span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400">
                          {row.reminderSent || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400">
                          {row.showNoShow || <span className="text-gray-600">-</span>}
                        </td>
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(row)}
                              className="hover:bg-blue-500/20 hover:text-blue-300 border border-transparent hover:border-blue-500/30"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(row)}
                              className="hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {rows.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">{startIndex + 1}</span> to{' '}
                  <span className="font-medium text-white">{Math.min(endIndex, rows.length)}</span> of{' '}
                  <span className="font-medium text-white">{rows.length}</span> appointments
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sheets' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Google Sheets - Edit Directly</h3>
            <p className="text-sm text-gray-400 mt-1">Make changes directly in the Google Sheet</p>
          </div>
          <div className="p-0">
            <iframe
              src="https://docs.google.com/spreadsheets/d/1Uww2j5jNAZa1IN3o_EX_oLvzrg1idBhfdhSDXUREEbg/edit#gid=0"
              width="100%"
              height="800"
              style={{ border: 'none' }}
              allow="clipboard-read; clipboard-write"
              className="w-full"
            />
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRow ? 'Edit Record' : 'Add Record'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateBooked">Date Booked</Label>
                  <Input
                    id="dateBooked"
                    type="date"
                    value={formData.dateBooked || ''}
                    onChange={(e) => setFormData({ ...formData, dateBooked: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate || ''}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={formData.appointmentTime || ''}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Input
                    id="day"
                    placeholder="e.g., Monday"
                    value={formData.day || ''}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="callerName">Caller Name</Label>
                <Input
                  id="callerName"
                  value={formData.callerName || ''}
                  onChange={(e) => setFormData({ ...formData, callerName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="callerEmail">Caller Email</Label>
                  <Input
                    id="callerEmail"
                    type="email"
                    value={formData.callerEmail || ''}
                    onChange={(e) => setFormData({ ...formData, callerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callerPhone">Caller Phone</Label>
                  <Input
                    id="callerPhone"
                    type="tel"
                    value={formData.callerPhone || ''}
                    onChange={(e) => setFormData({ ...formData, callerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName || ''}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventId">Event ID</Label>
                <Input
                  id="eventId"
                  value={formData.eventId || ''}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  disabled={!!editingRow}
                  className={editingRow ? 'bg-gray-100' : ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    placeholder="e.g., Confirmed, Pending"
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderSent">Reminder Sent</Label>
                  <Input
                    id="reminderSent"
                    placeholder="e.g., Yes, No"
                    value={formData.reminderSent || ''}
                    onChange={(e) => setFormData({ ...formData, reminderSent: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="showNoShow">Show/No-Show</Label>
                <Input
                  id="showNoShow"
                  placeholder="e.g., Show, No-Show"
                  value={formData.showNoShow || ''}
                  onChange={(e) => setFormData({ ...formData, showNoShow: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              {editingRow && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDelete(editingRow)
                    setShowDialog(false)
                  }}
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRow ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
