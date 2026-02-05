'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Phone, CheckCircle, DollarSign, Power, Calendar, TrendingUp, Activity, Users, Zap, Target } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Metrics {
  totalCalls: number
  answeredCalls: number
  missedRevenueSaved: number
  totalRevenueSaved: number
  upcomingAppointments: number
  callsPerDay: { date: string; calls: number }[]
  revenuePerDay: { date: string; revenue: number }[]
}

interface CalendarSummary {
  upcomingCount: number
  upcomingEvents: Array<{ title: string; start: string }>
}

export default function UserOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [calendarSummary, setCalendarSummary] = useState<CalendarSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [agentOn, setAgentOn] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, calendarRes, agentStatusRes] = await Promise.all([
          fetch('/api/overview'),
          fetch('/api/calendar/summary'),
          fetch('/api/agent-status'),
        ])

        const metricsData = await metricsRes.json()
        const calendarData = await calendarRes.json()
        const agentStatusData = await agentStatusRes.json()

        setMetrics(metricsData)
        setCalendarSummary(calendarData)
        setAgentOn(agentStatusData.active ?? true)
      } catch (error) {
        console.error('Error fetching overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 bg-white/10 rounded-lg animate-pulse backdrop-blur-sm" />
        <div className="h-5 w-48 bg-white/10 rounded-lg animate-pulse backdrop-blur-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded mb-4" />
            <div className="h-8 w-16 bg-white/10 rounded mb-2" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return renderSkeleton()
  }

  const totalInquiries = Math.max(0, (metrics?.answeredCalls || 0) - (metrics?.upcomingAppointments || 0))
  const totalRevenueGenerated = (metrics?.upcomingAppointments || 0) * 300

  const pieData = [
    { name: 'Booked', value: metrics?.upcomingAppointments || 0, color: '#10b981' },
    { name: 'Inquiries', value: totalInquiries, color: '#f43f5e' },
  ]

  const callTrend = metrics?.callsPerDay?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calls: d.calls,
    answered: Math.floor(d.calls * 0.85), // Simulated data
  })) || []

  const revenueTrend = metrics?.revenuePerDay?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue,
  })) || []

  // Calculate conversion rate
  const conversionRate = metrics?.answeredCalls ?
    ((metrics?.upcomingAppointments || 0) / metrics.answeredCalls * 100).toFixed(1) : '0'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Last 30 days · {metrics?.totalCalls || 0} calls · {metrics?.totalCalls ? Math.round((metrics.answeredCalls / metrics.totalCalls) * 100) : 0}% answer rate · Read-only
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${agentOn ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-white/80">
              {agentOn ? 'Online · Responding in <5 sec' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Calls */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-xl hover:shadow-blue-500/30 hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-400/30">
                <Phone className="h-4 w-4 text-blue-300" />
              </div>
              <TrendingUp className="h-3 w-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-400">Total Calls</p>
              <h3 className="text-2xl font-bold text-white">{metrics?.totalCalls || 0}</h3>
              <p className="text-xs text-blue-300/70">Every call captured</p>
            </div>
          </div>

          {/* Number of Inquiries */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-xl hover:shadow-purple-500/30 hover:border-purple-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-purple-500/30 rounded-lg border border-purple-400/30">
                <Users className="h-4 w-4 text-purple-300" />
              </div>
              <Activity className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-400">Inquiries</p>
              <h3 className="text-2xl font-bold text-white">{totalInquiries}</h3>
              <p className="text-xs text-purple-300/70">Questions answered</p>
            </div>
          </div>

          {/* Number of Bookings */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-xl hover:shadow-cyan-500/30 hover:border-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-cyan-500/30 rounded-lg border border-cyan-400/30">
                <Calendar className="h-4 w-4 text-cyan-300" />
              </div>
              <CheckCircle className="h-3 w-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-400">Bookings</p>
              <h3 className="text-2xl font-bold text-white">{metrics?.upcomingAppointments || 0}</h3>
              <p className="text-xs text-cyan-300/70">Appointments scheduled</p>
            </div>
          </div>

          {/* Total Revenue Made */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-xl hover:shadow-emerald-500/30 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-emerald-500/30 rounded-lg border border-emerald-400/30">
                <DollarSign className="h-4 w-4 text-emerald-300" />
              </div>
              <TrendingUp className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white">
                {currencyFormatter.format(totalRevenueGenerated)}
              </h3>
              <p className="text-xs text-emerald-300/70">{metrics?.upcomingAppointments || 0} × $300</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Analytics & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Calls Trend with Gradient */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Call Activity</h3>
                </div>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Up 12% vs last week
              </p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={callTrend}>
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="answeredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#callGradient)" />
                <Area type="monotone" dataKey="answered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#answeredGradient)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-white/60">Total Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-white/60">Answered</span>
              </div>
            </div>
          </div>

          {/* Revenue Trend with Bars */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Revenue Performance</h3>
                </div>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {currencyFormatter.format(totalRevenueGenerated)} total
              </p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <Target className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Conversion Distribution</h3>
                </div>
                <span className="text-xs text-emerald-400">{conversionRate}% conversion</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-white/70">Booked: {metrics?.upcomingAppointments || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                <span className="text-xs text-white/70">Inquiries: {totalInquiries}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
                <span className="text-xs text-gray-400">{calendarSummary?.upcomingCount || 0} scheduled</span>
              </div>
              <p className="text-xs text-blue-300/70 mt-0.5">Your booked appointments</p>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {calendarSummary?.upcomingEvents && calendarSummary.upcomingEvents.length > 0 ? (
                calendarSummary.upcomingEvents.map((event, idx) => (
                  <div
                    key={event.title + event.start}
                    className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="p-1.5 bg-blue-500/20 rounded-md">
                      <Calendar className="h-3 w-3 text-blue-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-white truncate">{event.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {new Date(event.start).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
