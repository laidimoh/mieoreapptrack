import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Clock, Play, Pause, Square, Loader2 } from 'lucide-react'
import { useTimeTracking } from '@/contexts/TimeTrackingContext.jsx'
import { useData } from '@/contexts/DataContext.jsx'
import { formatDuration } from '@/lib/utils.js'

const TimeTracker = () => {
  const { 
    isRunning, 
    elapsedTime, 
    startTimer, 
    stopTimer, 
    currentProject, 
    currentTask, 
    currentDescription,
    setCurrentProject,
    setCurrentTask,
    setCurrentDescription
  } = useTimeTracking()
  const { projects, isLoading: dataLoading } = useData()

  const [selectedProject, setSelectedProject] = useState(currentProject?.id || "")
  const [task, setTask] = useState(currentTask)
  const [description, setDescription] = useState(currentDescription)

  useEffect(() => {
    if (currentProject) {
      setSelectedProject(currentProject.id)
    } else {
      setSelectedProject("")
    }
    setTask(currentTask)
    setDescription(currentDescription)
  }, [currentProject, currentTask, currentDescription])

  const handleStartStop = () => {
    if (isRunning) {
      stopTimer()
    } else {
      const project = projects.find(p => p.id === selectedProject)
      startTimer(project, task, description)
    }
  }

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId)
    const project = projects.find(p => p.id === projectId)
    setCurrentProject(project)
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Time Tracker</h3>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold tabular-nums">
            {formatDuration(elapsedTime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Select onValueChange={handleProjectChange} value={selectedProject} disabled={isRunning}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.length === 0 && (
              <SelectItem value="no-projects" disabled>
                No projects available. Add one first!
              </SelectItem>
            )}
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Task (e.g., Design UI)"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isRunning}
        />
      </div>

      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4"
        disabled={isRunning}
      />

      <Button
        onClick={handleStartStop}
        className={`w-full ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isRunning ? (
          <><Square className="mr-2 h-4 w-4" /> Stop Tracking</>
        ) : (
          <><Play className="mr-2 h-4 w-4" /> Start Tracking</>
        )}
      </Button>
    </div>
  )
}

export default TimeTracker
