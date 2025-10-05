import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Plus, Clock, Calendar } from 'lucide-react'
import { useData } from '@/contexts/DataContext.jsx'
import { calculateWorkingHours, formatDate } from '@/lib/utils.js'

const ManualEntryDialog = ({ trigger }) => {
  const { addTimeEntry, projects } = useData()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: formatDate(new Date(), 'yyyy-MM-dd'),
    startTime: '07:00',
    endTime: '16:00',
    breakDuration: 60,
    extraHours: 0,
    projectId: '',
    description: '',
    type: 'work'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalHours = calculateWorkingHours(formData.startTime, formData.endTime, formData.breakDuration)
      const selectedProject = projects.find(p => p.id === formData.projectId)
      
      const timeEntry = {
        ...formData,
        breakDuration: parseInt(formData.breakDuration) || 0,
        extraHours: parseFloat(formData.extraHours) || 0,
        totalHours,
        project: selectedProject ? selectedProject.name : 'General Work',
        projectId: formData.projectId || null
      }

      const result = await addTimeEntry(timeEntry)
      if (!result.success) {
        throw new Error(result.error)
      }
      setOpen(false)
      
      // Reset form
      setFormData({
        date: formatDate(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 60,
        extraHours: 0,
        projectId: '',
        description: '',
        type: 'work'
      })
    } catch (error) {
      console.error('Failed to create time entry:', error)
      // Optionally show a toast or error message
    } finally {
      setLoading(false)
    }
  }

  const totalHours = calculateWorkingHours(formData.startTime, formData.endTime, formData.breakDuration)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Add Time Entry
          </DialogTitle>
          <DialogDescription>
            Manually log your work time with detailed information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Entry Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work Day</SelectItem>
                  <SelectItem value="sick">Sick Day</SelectItem>
                  <SelectItem value="leave-paid">Leave - Paid</SelectItem>
                  <SelectItem value="leave-unpaid">Leave - Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Break and Extra Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                value={formData.breakDuration}
                onChange={(e) => handleInputChange('breakDuration', e.target.value)}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraHours">Extra Hours</Label>
              <Input
                id="extraHours"
                type="number"
                min="0"
                step="0.25"
                value={formData.extraHours}
                onChange={(e) => handleInputChange('extraHours', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Calculated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Regular Hours</div>
              <div className="text-xl font-bold text-foreground">
                {totalHours.toFixed(2)}h
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Hours (incl. Extra)</div>
              <div className="text-xl font-bold text-primary">
                {(totalHours + (parseFloat(formData.extraHours) || 0)).toFixed(2)}h
              </div>
            </div>
          </div>

          {/* Project and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="no-projects" disabled>
                      No projects available. Add one first!
                    </SelectItem>
                  ) : (
                    projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What did you work on today?"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ManualEntryDialog

