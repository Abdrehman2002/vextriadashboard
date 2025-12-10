'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone, MapPin, CheckCircle } from 'lucide-react'
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

export default function AdminAppointments() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [sheetAppointments, setSheetAppointments] = useState<SheetAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'normal' | 'google'>('normal')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  })

  const fetchEvents = async () => {
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const res = await fetch(
        `/api/google-calendar/list-events?timeMin=${firstDay.toISOString()}&timeMax=${lastDay.toISOString()}`
      )
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
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

  const handleAddEvent = (selectedDate?: Date) => {
    setSelectedEvent(null)
    const dateToUse = selectedDate || new Date()
    setFormData({
      title: '',
      description: '',
      date: dateToUse.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
    })
    setShowDialog(true)
  }

  const handleDayClick = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const selectedDate = new Date(year, month, day)
    setSelectedDay(day)
    handleAddEvent(selectedDate)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    const startDate = new Date(event.start)
    const endDate = new Date(event.end)

    setFormData({
      title: event.title,
      description: event.description || '',
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      location: event.location || '',
    })
    setShowDialog(true)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      await fetch('/api/google-calendar/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id }),
      })
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const start = new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
    const end = new Date(`${formData.date}T${formData.endTime}:00`).toISOString()

    const payload = {
      title: formData.title,
      description: formData.description,
      start,
      end,
      location: formData.location,
    }

    try {
      if (selectedEvent) {
        await fetch('/api/google-calendar/update-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, eventId: selectedEvent.id }),
        })
      } else {
        await fetch('/api/google-calendar/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setShowDialog(false)
      fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
    }
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            Appointments Calendar
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalAppointments} {totalAppointments === 1 ? 'appointment' : 'appointments'} this month
          </p>
        </div>
        {activeTab === 'normal' && (
          <Button
            onClick={() => handleAddEvent()}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 bg-white/5 rounded-t-2xl p-1">
        <button
          onClick={() => setActiveTab('normal')}
          className={cn(
            "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'normal'
              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500 shadow-sm'
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
              ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500 shadow-sm'
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
                <div key={day} className="text-center font-semibold text-xs uppercase tracking-wider text-purple-300 py-2">
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
                    onClick={() => day && !loading && handleDayClick(day)}
                    className={cn(
                      "min-h-[120px] rounded-2xl p-3 transition-all duration-200",
                      day
                        ? cn(
                            "bg-[#120A24] border cursor-pointer",
                            isSelected && "border-purple-500/50 bg-purple-500/10",
                            !isSelected && hasEvents && "border-purple-500/30 hover:border-purple-500/50",
                            !isSelected && !hasEvents && "border-white/5 hover:border-white/10",
                            "hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20"
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
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-semibold rounded-full border border-purple-500/30">
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
                                    handleEditEvent(event)
                                  }}
                                  className="group relative bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg p-2 cursor-pointer transition-all duration-200"
                                >
                                  <div className="flex items-start gap-1.5">
                                    <Clock className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white truncate">
                                        {event.title}
                                      </p>
                                      <p className="text-[10px] text-purple-300/70 mt-0.5">
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
            <p className="text-sm text-gray-400 mt-1">View and manage your calendar in real-time</p>
          </div>
          <div className="p-0">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=1c82143bf911816e35b0a7ddfb78e629c24fdaa19ed90f38210e336c549129be%40group.calendar.google.com&ctz=America%2FChicago&mode=WEEK"
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
            <DialogTitle className="text-white">
              {selectedEvent ? 'Edit Appointment' : 'Add Appointment'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDeleteEvent(selectedEvent.id)
                    setShowDialog(false)
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
              >
                {selectedEvent ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
