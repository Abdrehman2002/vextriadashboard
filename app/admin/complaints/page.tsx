'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, RefreshCw, AlertCircle, User, Mail, Phone, FileText, Calendar, CheckCircle2 } from 'lucide-react'

interface ComplaintRow {
  rowIndex?: number
  timestamp: string
  complaintId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  complaintType: string
  priority: string
  status: string
  description: string
  assignedTo: string
  resolutionNotes: string
  dateResolved: string
}

export default function AdminComplaints() {
  const [rows, setRows] = useState<ComplaintRow[]>([])
  const [loading, setLoading] = useState(true)

  const [showDialog, setShowDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<ComplaintRow | null>(null)
  const [formData, setFormData] = useState<Partial<ComplaintRow>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/complaints/get', { cache: 'no-store' })
      const data = await res.json()
      setRows(Array.isArray(data) ? data.reverse() : [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
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
      timestamp: new Date().toISOString().split('T')[0],
      complaintId: `CMPL-${Date.now()}`,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      complaintType: '',
      priority: 'Medium',
      status: 'New',
      description: '',
      assignedTo: '',
      resolutionNotes: '',
      dateResolved: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (row: ComplaintRow) => {
    setEditingRow(row)
    setFormData(row)
    setShowDialog(true)
  }

  const handleDelete = async (row: ComplaintRow) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return

    try {
      await fetch('/api/complaints/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: row.rowIndex }),
      })
      fetchRows()
    } catch (error) {
      console.error('Error deleting complaint:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingRow) {
        await fetch('/api/complaints/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, rowIndex: editingRow.rowIndex }),
        })
      } else {
        await fetch('/api/complaints/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setShowDialog(false)
      fetchRows()
    } catch (error) {
      console.error('Error saving complaint:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'in progress':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const totalPages = Math.ceil(rows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedRows = rows.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Customer Complaints
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage customer complaints</p>
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
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Complaint
          </Button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6">
            <div className="overflow-x-auto -mx-6">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#120A24]">
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">ID</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Customer</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Type</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Priority</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Description</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0B0715]">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {[...Array(8)].map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 bg-white/10 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle className="w-12 h-12 text-white/20" />
                          <p className="text-sm font-medium text-white/40">No complaints yet</p>
                          <p className="text-xs text-white/30">Click "Add Complaint" to log your first complaint</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => (
                      <tr
                        key={row.complaintId}
                        onClick={() => handleEdit(row)}
                        className="border-b border-gray-800 hover:bg-[#120A24] transition-all duration-200 cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-red-400" />
                            {row.timestamp ? new Date(row.timestamp).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                          {row.complaintId || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-blue-400" />
                              <span className="text-sm font-semibold text-white">{row.customerName || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Mail className="h-3 w-3 text-emerald-400" />
                              {row.customerEmail || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Phone className="h-3 w-3 text-blue-400" />
                              {row.customerPhone || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">
                          {row.complaintType || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(row.priority)}`}>
                            <AlertCircle className="h-3 w-3" />
                            {row.priority || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                            <CheckCircle2 className="h-3 w-3" />
                            {row.status || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400 max-w-xs truncate">
                          {row.description || '-'}
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
                  <span className="font-medium text-white">{rows.length}</span> complaints
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30"
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
                            ? 'bg-red-600 text-white'
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
                    className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-30"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRow ? 'Edit Complaint' : 'Add Complaint'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone || ''}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail || ''}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* Complaint Details */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Complaint Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complaintType">Type *</Label>
                    <Input
                      id="complaintType"
                      placeholder="e.g., Service Issue"
                      value={formData.complaintType || ''}
                      onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={formData.priority || 'Medium'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status || 'New'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Resolution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Team member name"
                      value={formData.assignedTo || ''}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateResolved">Date Resolved</Label>
                    <Input
                      id="dateResolved"
                      type="date"
                      value={formData.dateResolved || ''}
                      onChange={(e) => setFormData({ ...formData, dateResolved: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                  <Textarea
                    id="resolutionNotes"
                    rows={3}
                    value={formData.resolutionNotes || ''}
                    onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                  />
                </div>
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
              <Button type="submit" className="bg-gradient-to-r from-red-500 to-pink-600">
                {editingRow ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
