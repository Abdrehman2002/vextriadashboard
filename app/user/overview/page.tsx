'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Phone, CheckCircle, DollarSign, Power, Calendar, TrendingUp, Activity, Users } from 'lucide-react'
import { AreaChart, BarChart, DonutChart } from '@tremor/react'

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

  const pieData = [
    { name: 'Booked', value: metrics?.upcomingAppointments || 0 },
    { name: 'Inquiries', value: Math.max(0, (metrics?.answeredCalls || 0) - (metrics?.upcomingAppointments || 0)) },
  ]

  const callTrend = metrics?.callsPerDay?.map(d => ({ date: d.date, Calls: d.calls })) || []
  const revenueTrend = metrics?.revenuePerDay?.map(d => ({ date: d.date, Revenue: d.revenue })) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">
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
        <h2 className="text-lg font-semibold text-white mb-4">Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Calls */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/30 rounded-xl border border-blue-400/30">
                <Phone className="h-5 w-5 text-blue-300" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Total Calls</p>
              <h3 className="text-3xl font-bold text-white">{metrics?.totalCalls || 0}</h3>
              <p className="text-xs text-blue-300/70">Every call captured</p>
            </div>
          </div>

          {/* Answered Calls */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/30 rounded-xl border border-blue-400/30">
                <CheckCircle className="h-5 w-5 text-blue-300" />
              </div>
              <Activity className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Answered Calls</p>
              <h3 className="text-3xl font-bold text-white">{metrics?.answeredCalls || 0}</h3>
              <p className="text-xs text-blue-300/70">
                {metrics?.totalCalls ? `${((metrics.answeredCalls / metrics.totalCalls) * 100).toFixed(1)}% answer rate` : '0% answer rate'}
              </p>
            </div>
          </div>

          {/* Revenue Saved */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/30 rounded-xl border border-emerald-400/30">
                <DollarSign className="h-5 w-5 text-emerald-300" />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Revenue Saved</p>
              <h3 className="text-3xl font-bold text-white">
                {currencyFormatter.format(metrics?.totalRevenueSaved || 0)}
              </h3>
              <p className="text-xs text-emerald-300/70">From {metrics?.upcomingAppointments || 0} booked appointments</p>
            </div>
          </div>

          {/* Missed Revenue */}
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-500/30 rounded-xl border border-amber-400/30">
                <Users className="h-5 w-5 text-amber-300" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Missed Revenue</p>
              <h3 className="text-3xl font-bold text-white">
                {currencyFormatter.format(metrics?.missedRevenueSaved || 0)}
              </h3>
              <p className="text-xs text-amber-300/70">Opportunities to capture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls Trend */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Call Activity</h3>
                <span className="text-xs text-gray-400">Last 30 days</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1">↑ Up 12% vs previous period</p>
            </div>
            <AreaChart
              className="h-72"
              data={callTrend}
              index="date"
              categories={['Calls']}
              colors={['blue']}
              valueFormatter={(value) => `${value} calls`}
              showLegend={false}
              showGridLines={true}
              curveType="natural"
            />
          </div>

          {/* Revenue Trend */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Revenue Generated</h3>
                <span className="text-xs text-gray-400">Last 30 days</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1">↑ Up 8% vs previous period</p>
            </div>
            <BarChart
              className="h-72"
              data={revenueTrend}
              index="date"
              categories={['Revenue']}
              colors={['cyan']}
              valueFormatter={(value) => currencyFormatter.format(value)}
              showLegend={false}
              showGridLines={true}
            />
          </div>

          {/* Appointment Distribution */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Call Distribution</h3>
                <span className="text-xs text-gray-400">Last 30 days</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1">
                {metrics?.upcomingAppointments && metrics?.answeredCalls
                  ? `${((metrics.upcomingAppointments / metrics.answeredCalls) * 100).toFixed(1)}% conversion to bookings`
                  : '0% conversion'}
              </p>
            </div>
            <DonutChart
              className="h-72"
              data={pieData}
              category="value"
              index="name"
              colors={['emerald', 'rose']}
              valueFormatter={(value) => `${value} calls`}
              showLabel={true}
              showAnimation={true}
            />
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-white/70">Booked: {metrics?.upcomingAppointments || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                <span className="text-sm text-white/70">Inquiries: {Math.max(0, (metrics?.answeredCalls || 0) - (metrics?.upcomingAppointments || 0))}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
                <span className="text-xs text-gray-400">{calendarSummary?.upcomingCount || 0} scheduled</span>
              </div>
              <p className="text-xs text-blue-300/70 mt-1">Your booked appointments</p>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
              {calendarSummary?.upcomingEvents && calendarSummary.upcomingEvents.length > 0 ? (
                calendarSummary.upcomingEvents.map((event, idx) => (
                  <div
                    key={event.title + event.start}
                    className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{event.title}</p>
                      <p className="text-xs text-white/50 mt-1">
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
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
