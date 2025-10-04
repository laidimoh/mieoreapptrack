import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useData } from './DataContext.jsx'
import { generateId, calculateWorkingHours } from '../lib/utils.js'

const TimeTrackingContext = createContext()

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext)
  if (!context) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider')
  }
  return context
}

export const TimeTrackingProvider = ({ children }) => {
  const { user } = useAuth()
  const { addTimeEntry, updateTimeEntry, timeEntries } = useData()
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0) // in seconds
  const [currentEntryId, setCurrentEntryId] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [currentTask, setCurrentTask] = useState('')
  const [currentDescription, setCurrentDescription] = useState('')
  const intervalRef = useRef(null)

  // Load active timer from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('activeTimer')
    if (savedTimer) {
      const { startTime: savedStartTime, currentEntryId: savedEntryId, currentProject: savedProject, currentTask: savedTask, currentDescription: savedDescription } = JSON.parse(savedTimer)
      const now = Date.now()
      const elapsed = Math.floor((now - savedStartTime) / 1000)
      
      setStartTime(savedStartTime)
      setElapsedTime(elapsed)
      setCurrentEntryId(savedEntryId)
      setCurrentProject(savedProject)
      setCurrentTask(savedTask)
      setCurrentDescription(savedDescription)
      setIsRunning(true)
      startTimerInterval(savedStartTime)
    }
  }, [])

  // Save active timer to localStorage whenever it changes
  useEffect(() => {
    if (isRunning && startTime && currentEntryId) {
      localStorage.setItem('activeTimer', JSON.stringify({
        startTime,
        currentEntryId,
        currentProject,
        currentTask,
        currentDescription
      }))
    } else {
      localStorage.removeItem('activeTimer')
    }
  }, [isRunning, startTime, currentEntryId, currentProject, currentTask, currentDescription])

  const startTimerInterval = (start) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000))
    }, 1000)
  }

  const startTimer = async (project, task, description) => {
    if (isRunning) return

    const now = Date.now()
    const newEntryId = generateId()
    const newStartTime = new Date(now).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    const today = new Date().toISOString().split('T')[0]

    const entryData = {
      id: newEntryId,
      date: today,
      startTime: newStartTime,
      endTime: newStartTime, // Will be updated on stop
      project: project?.name || 'General Work',
      task: task || '',
      description: description || '',
      breakDuration: 0,
      totalHours: 0,
      status: 'running'
    }

    const result = await addTimeEntry(entryData)
    if (result.success) {
      setStartTime(now)
      setElapsedTime(0)
      setCurrentEntryId(newEntryId)
      setCurrentProject(project)
      setCurrentTask(task)
      setCurrentDescription(description)
      setIsRunning(true)
      startTimerInterval(now)
    } else {
      console.error('Failed to start timer:', result.error)
      // Optionally show a toast or error message
    }
  }

  const stopTimer = async () => {
    if (!isRunning || !currentEntryId || !startTime) return

    clearInterval(intervalRef.current)
    const now = Date.now()
    const endTimeFormatted = new Date(now).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    const today = new Date().toISOString().split('T')[0]

    const totalHours = calculateWorkingHours(
      new Date(startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTimeFormatted,
      0 // Assuming no breaks are tracked by the timer directly
    )

    const updatedEntry = {
      endTime: endTimeFormatted,
      totalHours: totalHours,
      status: 'completed'
    }

    const result = await updateTimeEntry(currentEntryId, updatedEntry)
    if (result.success) {
      setIsRunning(false)
      setStartTime(null)
      setElapsedTime(0)
      setCurrentEntryId(null)
      setCurrentProject(null)
      setCurrentTask('')
      setCurrentDescription('')
    } else {
      console.error('Failed to stop timer:', result.error)
      // Optionally show a toast or error message
    }
  }

  const value = {
    isRunning,
    startTime,
    elapsedTime,
    currentEntryId,
    currentProject,
    currentTask,
    currentDescription,
    startTimer,
    stopTimer,
    setCurrentProject,
    setCurrentTask,
    setCurrentDescription
  }

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  )
}

