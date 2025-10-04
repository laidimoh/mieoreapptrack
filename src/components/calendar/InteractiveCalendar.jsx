import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useData } from '@/contexts/DataContext.jsx'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, getDay } from 'date-fns'

const InteractiveCalendar = () => {
  const { timeEntries } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days to start the calendar on Sunday
  const startPadding = getDay(monthStart)
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (startPadding - i))
    return date
  })

  // Combine all days
  const calendarDays = [...paddingDays, ...monthDays]

  // Get entry type indicator
  const getEntryIndicator = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayEntries = timeEntries.filter(entry => entry.date === dateStr)
    
    if (dayEntries.length === 0) return null

    // Priority: work > sick > leave-paid > leave-unpaid
    const hasWork = dayEntries.some(entry => entry.type === 'work')
    const hasSick = dayEntries.some(entry => entry.type === 'sick')
    const hasLeavePaid = dayEntries.some(entry => entry.type === 'leave-paid')
    const hasLeaveUnpaid = dayEntries.some(entry => entry.type === 'leave-unpaid')

    if (hasWork) return { type: 'work', color: 'bg-green-500', label: 'Work Day' }
    if (hasSick) return { type: 'sick', color: 'bg-red-500', label: 'Sick Day' }
    if (hasLeavePaid) return { type: 'leave-paid', color: 'bg-yellow-500', label: 'Paid Leave' }
    if (hasLeaveUnpaid) return { type: 'leave-unpaid', color: 'bg-gray-500', label: 'Unpaid Leave' }

    return null
  }

  // Get entries for selected date
  const getSelectedDateEntries = () => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return timeEntries.filter(entry => entry.date === dateStr)
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const selectedEntries = getSelectedDateEntries()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Work Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Sick Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Paid Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Unpaid Leave</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isSelectedDate = selectedDate && isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)
              const indicator = getEntryIndicator(date)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative p-2 h-12 text-sm rounded-md transition-colors
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${isSelectedDate ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                    ${isTodayDate && !isSelectedDate ? 'bg-muted font-semibold' : ''}
                  `}
                >
                  <span className="relative z-10">{format(date, 'd')}</span>
                  
                  {/* Entry indicator */}
                  {indicator && (
                    <div 
                      className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${indicator.color}`}
                      title={indicator.label}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntries.length === 0 ? (
              <p className="text-muted-foreground">No entries for this date.</p>
            ) : (
              <div className="space-y-4">
                {selectedEntries.map((entry, index) => {
                  const getTypeColor = (type) => {
                    switch (type) {
                      case 'work': return 'bg-green-100 text-green-800'
                      case 'sick': return 'bg-red-100 text-red-800'
                      case 'leave-paid': return 'bg-yellow-100 text-yellow-800'
                      case 'leave-unpaid': return 'bg-gray-100 text-gray-800'
                      default: return 'bg-blue-100 text-blue-800'
                    }
                  }

                  const getTypeLabel = (type) => {
                    switch (type) {
                      case 'work': return 'Work Day'
                      case 'sick': return 'Sick Day'
                      case 'leave-paid': return 'Paid Leave'
                      case 'leave-unpaid': return 'Unpaid Leave'
                      default: return type
                    }
                  }

                  return (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getTypeColor(entry.type)}>
                          {getTypeLabel(entry.type)}
                        </Badge>
                        <span className="text-sm font-medium">
                          {entry.totalHours}h
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Time: {entry.startTime} - {entry.endTime}</p>
                        {entry.breakDuration > 0 && (
                          <p>Break: {entry.breakDuration} minutes</p>
                        )}
                        {entry.description && (
                          <p>Description: {entry.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InteractiveCalendar