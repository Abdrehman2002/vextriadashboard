'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
}

interface SheetAppointment {
  rowIndex: number
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
  summary: string
}

export default function UserAppointments() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [sheetAppointments, setSheetAppointments] = useState<SheetAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'normal' | 'google'>('normal')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const fetchEvents = async () => {
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const res = await fetch(
        `/api/calendar/events?from=${firstDay.toISOString()}&to=${lastDay.toISOString()}`
      )
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSheetAppointments = async () => {
    try {
      const res = await fetch('/api/sheets/get')
      const data = await res.json()
      setSheetAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching sheet appointments:', error)
      setSheetAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchSheetAppointments()
  }, [currentDate])

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowDialog(true)
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      )
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth()
  const totalAppointments = events.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-blue-600 bg-clip-text text-transparent">
            Appointments Calendar
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalAppointments} {totalAppointments === 1 ? 'appointment' : 'appointments'} this month · Read-only view
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 bg-white/5 rounded-t-2xl p-1">
        <button
          onClick={() => setActiveTab('normal')}
          className={cn(
            "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'normal'
              ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-500 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <CalendarIcon className="h-4 w-4 inline mr-2" />
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={cn(
            "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'google'
              ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-500 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          Google Calendar
        </button>
      </div>

      {activeTab === 'normal' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {totalAppointments} scheduled
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={previousMonth}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-8">
            <div className="grid grid-cols-7 gap-4">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-xs uppercase tracking-wider text-blue-300 py-2">
                  {day}
                </div>
              ))}

              {/* Day Cells */}
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : []
                const hasEvents = dayEvents.length > 0
                const isSelected = selectedDay === day

                return (
                  <div
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    className={cn(
                      "min-h-[120px] rounded-2xl p-3 transition-all duration-200",
                      day
                        ? cn(
                            "bg-[#120A24] border",
                            isSelected && "border-blue-500/50 bg-blue-500/10",
                            !isSelected && hasEvents && "border-blue-500/30 cursor-pointer hover:border-blue-500/50",
                            !isSelected && !hasEvents && "border-white/5",
                            hasEvents && "hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                          )
                        : 'bg-transparent'
                    )}
                  >
                    {day && (
                      <div className="space-y-2">
                        {/* Day Number and Indicator */}
                        <div className="flex items-start justify-between">
                          <span className="text-lg font-bold text-white">{day}</span>
                          {hasEvents && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold rounded-full border border-blue-500/30">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Event Previews */}
                        <div className="space-y-1.5">
                          {loading ? (
                            <div className="h-5 bg-white/10 rounded animate-pulse" />
                          ) : (
                            dayEvents.slice(0, 2).map((event) => {
                              const startTime = new Date(event.start).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewEvent(event)
                                  }}
                                  className="group relative bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg p-2 cursor-pointer transition-all duration-200"
                                >
                                  <div className="flex items-start gap-1.5">
                                    <Clock className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white truncate">
                                        {event.title}
                                      </p>
                                      <p className="text-[10px] text-blue-300/70 mt-0.5">
                                        {startTime}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                          {dayEvents.length > 2 && (
                            <p className="text-[10px] text-gray-400 text-center py-1">
                              +{dayEvents.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'google' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Google Calendar Integration</h3>
            <p className="text-sm text-gray-400 mt-1">View your calendar in real-time</p>
          </div>
          <div className="p-0">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=1c82143bf911816e35b0a7ddfb78e629c24fdaa19ed90f38210e336c549129be%40group.calendar.google.com&ctz=America%2FChicago"
              style={{ border: 0 }}
              width="100%"
              height="800"
              frameBorder={0}
              className="w-full"
            />
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-[#0B0715] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Appointment Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Title</p>
                <p className="text-lg font-semibold text-white">{selectedEvent.title}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <p className="text-base text-gray-300">
                    {new Date(selectedEvent.start).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Ends at {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>

              {selectedEvent.location && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <p className="text-base text-gray-300">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Description</p>
                  <p className="text-base text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
