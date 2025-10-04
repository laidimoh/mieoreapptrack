import React from 'react'
import InteractiveCalendar from '../components/calendar/InteractiveCalendar.jsx'

const CalendarPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View your time entries in a monthly calendar format with visual indicators.
        </p>
      </div>

      <InteractiveCalendar />
    </div>
  )
}

export default CalendarPage