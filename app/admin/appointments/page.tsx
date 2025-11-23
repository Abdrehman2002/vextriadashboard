'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
}

export default function AdminAppointments() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'normal' | 'google'>('normal')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
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
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
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
    const dayDate = new Date(year, month, day)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Appointments</h1>
        {activeTab === 'normal' && (
          <Button onClick={() => handleAddEvent()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-black/5">
        <Button
          variant={activeTab === 'normal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('normal')}
          className="rounded-b-none"
        >
          Normal Calendar
        </Button>
        <Button
          variant={activeTab === 'google' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('google')}
          className="rounded-b-none"
        >
          Google Calendar
        </Button>
      </div>

      {activeTab === 'normal' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-[#2A2A2A] py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                onClick={() => day && !loading && handleDayClick(day)}
                className={`min-h-[100px] border border-black/5 rounded-md p-2 ${
                  day ? 'bg-white cursor-pointer hover:bg-black/5 transition-colors' : 'bg-[#F8F6F2]'
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium text-[#000000] mb-1">{day}</div>
                    <div className="space-y-1">
                      {loading ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        getEventsForDay(day).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEvent(event)
                            }}
                            className="text-xs bg-[#000000] text-white px-2 py-1 rounded cursor-pointer hover:bg-[#111111]"
                          >
                            {event.title}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'google' && (
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=1c82143bf911816e35b0a7ddfb78e629c24fdaa19ed90f38210e336c549129be%40group.calendar.google.com&ctz=America%2FChicago&mode=WEEK"
              style={{ border: 0 }}
              width="100%"
              height="800"
              frameBorder={0}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Appointment' : 'Add Appointment'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedEvent ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
