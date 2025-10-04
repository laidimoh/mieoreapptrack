import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Play, Pause, Square, Coffee, Clock } from 'lucide-react'
import { useData } from '@/contexts/DataContext.jsx'
import { useAuth } from '@/contexts/AuthContext.jsx'
import { formatDate } from '@/lib/utils.js'

const LiveTimer = () => {
  const { user } = useAuth()
  const { addTimeEntry, projects } = useData()
  
  // Timer states
  const [isTracking, setIsTracking] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [breakStartTime, setBreakStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalBreakTime, setTotalBreakTime] = useState(0)
  const [currentBreakTime, setCurrentBreakTime] = useState(0)
  
  // Entry data
  const [selectedProject, setSelectedProject] = useState('')
  const [description, setDescription] = useState('')

  // Update timer every second
  useEffect(() => {
    let interval = null
    
    if (isTracking && !isOnBreak) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else if (isOnBreak && breakStartTime) {
      interval = setInterval(() => {
        setCurrentBreakTime(Math.floor((Date.now() - breakStartTime) / 1000))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, isOnBreak, startTime, breakStartTime])

  // Format time display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start/Resume tracking
  const handleStart = () => {
    if (!isTracking) {
      // Starting fresh
      setStartTime(Date.now())
      setElapsedTime(0)
      setTotalBreakTime(0)
      setCurrentBreakTime(0)
    }
    setIsTracking(true)
    setIsOnBreak(false)
  }

  // Start break
  const handleBreakStart = () => {
    if (isTracking && !isOnBreak) {
      setBreakStartTime(Date.now())
      setIsOnBreak(true)
      setCurrentBreakTime(0)
    }
  }

  // End break
  const handleBreakEnd = () => {
    if (isOnBreak) {
      setTotalBreakTime(prev => prev + currentBreakTime)
      setIsOnBreak(false)
      setBreakStartTime(null)
      setCurrentBreakTime(0)
    }
  }

  // Stop and save entry
  const handleStop = async () => {
    if (!isTracking) return

    // End break if currently on break
    if (isOnBreak) {
      setTotalBreakTime(prev => prev + currentBreakTime)
    }

    const endTime = Date.now()
    const totalWorkedSeconds = elapsedTime - totalBreakTime - (isOnBreak ? currentBreakTime : 0)
    const totalWorkedHours = totalWorkedSeconds / 3600

    // Create time entry
    const timeEntry = {
      date: formatDate(new Date(startTime), 'yyyy-MM-dd'),
      startTime: formatDate(new Date(startTime), 'HH:mm'),
      endTime: formatDate(new Date(endTime), 'HH:mm'),
      totalHours: Math.max(0, Number(totalWorkedHours.toFixed(2))),
      breakDuration: Math.floor(totalBreakTime / 60), // Convert to minutes
      projectId: selectedProject || 'general',
      description: description || 'Tracked work session',
      type: 'work'
    }

    try {
      await addTimeEntry(timeEntry)
      
      // Reset timer
      setIsTracking(false)
      setIsOnBreak(false)
      setStartTime(null)
      setBreakStartTime(null)
      setElapsedTime(0)
      setTotalBreakTime(0)
      setCurrentBreakTime(0)
      setDescription('')
      
      console.log('Time entry saved successfully')
    } catch (error) {
      console.error('Failed to save time entry:', error)
    }
  }

  // Calculate working time (excluding breaks)
  const workingTime = elapsedTime - totalBreakTime - (isOnBreak ? currentBreakTime : 0)
  const workingHours = workingTime / 3600
  const estimatedEarnings = workingHours * (user?.hourlyRate || 25)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Live Timer
          {isTracking && (
            <Badge variant={isOnBreak ? "secondary" : "default"}>
              {isOnBreak ? "On Break" : "Tracking"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-foreground mb-2">
            {formatTime(workingTime)}
          </div>
          <p className="text-sm text-muted-foreground">
            Working Time {isOnBreak && "(Break Active)"}
          </p>
          
          {/* Break Time Display */}
          {(totalBreakTime > 0 || isOnBreak) && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-mono text-muted-foreground">
                Break: {formatTime(totalBreakTime + currentBreakTime)}
              </div>
            </div>
          )}
          
          {/* Earnings Estimate */}
          {isTracking && workingHours > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Estimated earnings: ${estimatedEarnings.toFixed(2)}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 justify-center">
          {!isTracking ? (
            <Button onClick={handleStart} className="gap-2">
              <Play className="w-4 h-4" />
              Start Tracking
            </Button>
          ) : (
            <>
              {!isOnBreak ? (
                <Button onClick={handleBreakStart} variant="outline" className="gap-2">
                  <Coffee className="w-4 h-4" />
                  Start Break
                </Button>
              ) : (
                <Button onClick={handleBreakEnd} variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  End Break
                </Button>
              )}
              
              <Button onClick={handleStop} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop & Save
              </Button>
            </>
          )}
        </div>

        {/* Project and Description */}
        {isTracking && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div>
              <label className="text-sm font-medium">Project (Optional)</label>
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md"
              >
                <option value="">General Work</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LiveTimer