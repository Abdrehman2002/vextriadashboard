'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, User, Mail, Phone, Calendar, CheckCircle2 } from 'lucide-react'

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

export default function UserComplaints() {
  const [rows, setRows] = useState<ComplaintRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'normal' | 'sheets'>('normal')
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
          <p className="text-sm text-gray-400 mt-1">View customer complaints (Read-only)</p>
        </div>
        <Button
          onClick={fetchRows}
          variant="ghost"
          disabled={loading}
          className="border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 bg-white/5 rounded-t-2xl p-1">
        <button
          onClick={() => setActiveTab('normal')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'normal'
              ? 'bg-red-600/30 text-red-300 border-b-2 border-red-500 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Normal View
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'sheets'
              ? 'bg-red-600/30 text-red-300 border-b-2 border-red-500 shadow-sm'
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
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">ID</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Customer</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Type</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Priority</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-6 text-[11px] uppercase tracking-wider text-red-300 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0B0715]">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 bg-white/10 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle className="w-12 h-12 text-white/20" />
                          <p className="text-sm font-medium text-white/40">No complaints to display</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => (
                      <tr
                        key={row.complaintId}
                        className="border-b border-gray-800 hover:bg-[#120A24] transition-all duration-200"
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
      )}

      {activeTab === 'sheets' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Google Sheets - View Only</h3>
            <p className="text-sm text-gray-400 mt-1">Read-only view of the Google Sheet</p>
          </div>
          <div className="p-0">
            <iframe
              src="https://docs.google.com/spreadsheets/d/1JxVhK2uuRiYmE0VOUr2Ul6Jj7Br5qyWd91TnhzExd7o/edit"
              width="100%"
              height="800"
              style={{ border: 'none' }}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
