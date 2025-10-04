import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { useData } from '@/contexts/DataContext.jsx';
import { formatDate } from '@/lib/utils.js';
import { format, getDaysInMonth, startOfMonth, addDays, isWeekend } from 'date-fns';

const BulkMonthEntryDialog = ({ trigger, onEntriesAdded }) => {
  const { projects, addTimeEntry } = useData();
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [standardHours, setStandardHours] = useState(8);
  const [selectedProject, setSelectedProject] = useState('');
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [breakDuration, setBreakDuration] = useState(60);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track if already submitted for this session

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const daysInMonth = getDaysInMonth(monthStart);
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isWeekendDay = isWeekend(date);
      days.push({
        day,
        date,
        isWeekend: isWeekendDay,
        dayName: format(date, 'EEE')
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const toggleDay = (day) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(day)) {
      newSelected.delete(day);
    } else {
      newSelected.add(day);
    }
    setSelectedDays(newSelected);
  };

  const selectAllWorkdays = () => {
    const workdays = calendarDays
      .filter(day => !day.isWeekend)
      .map(day => day.day);
    setSelectedDays(new Set(workdays));
    setExcludeWeekends(true); // Automatically set exclude weekends when selecting workdays
  };

  const selectAllDays = () => {
    const allDays = calendarDays.map(day => day.day);
    setSelectedDays(new Set(allDays));
    setExcludeWeekends(false); // Allow weekends when selecting all days
  };

  const clearSelection = () => {
    setSelectedDays(new Set());
  };

  const calculateWorkHours = (startTimeStr, endTimeStr) => {
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;
    
    // Handle overnight shifts (if end time is next day)
    let totalMinutes = endTotalMinutes - startTotalMinutes;
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Add 24 hours
    }
    
    return totalMinutes / 60; // Convert to hours
  };

  const calculateEndTime = (startTimeStr, hours, breakMinutes) => {
    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + (hours * 60) + breakMinutes;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const sessionId = Date.now(); // Unique session ID for this submission
    console.log(`[BULK ENTRY ${sessionId}] === SUBMISSION STARTED ===`);
    
    // Multiple layers of protection
    if (selectedDays.size === 0) {
      console.log(`[BULK ENTRY ${sessionId}] No days selected`);
      alert('Please select at least one day.');
      return;
    }

    if (isSubmitting) {
      console.log(`[BULK ENTRY ${sessionId}] Already submitting, blocking duplicate`);
      return;
    }

    if (hasSubmitted) {
      console.log(`[BULK ENTRY ${sessionId}] Already submitted in this session, blocking`);
      alert('Entries have already been submitted. Please close and reopen the dialog to submit again.');
      return;
    }

    // Set submission flags immediately
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = [];
      const addedDays = new Set();

      // Filter out weekends if excludeWeekends is true
      const validDays = Array.from(selectedDays).filter(day => {
        const entryDate = new Date(year, month - 1, day);
        return !excludeWeekends || !isWeekend(entryDate);
      });

      console.log(`[BULK ENTRY ${sessionId}] Selected days from UI:`, Array.from(selectedDays));
      console.log(`[BULK ENTRY ${sessionId}] Valid days after weekend filter:`, validDays);
      console.log(`[BULK ENTRY ${sessionId}] Exclude weekends:`, excludeWeekends);
      console.log(`[BULK ENTRY ${sessionId}] Target month:`, selectedMonth);
      console.log(`[BULK ENTRY ${sessionId}] Will create ${validDays.length} entries`);

      // Prevent double submission - create a submission lock
      const lockKey = `bulk_submission_${selectedMonth}_${validDays.join('_')}`;
      const existingLock = sessionStorage.getItem(lockKey);
      if (existingLock) {
        const lockTime = parseInt(existingLock);
        const timeDiff = Date.now() - lockTime;
        if (timeDiff < 30000) { // 30 second lock
          console.log(`[BULK ENTRY ${sessionId}] Submission locked, last submission ${timeDiff}ms ago`);
          alert('Bulk submission already in progress. Please wait 30 seconds before trying again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Set submission lock
      sessionStorage.setItem(lockKey, Date.now().toString());

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validDays.length; i++) {
        const day = validDays[i];
        const entryDate = new Date(year, month - 1, day);
        const dateStr = formatDate(entryDate, 'yyyy-MM-dd');
        
        // Skip if we already processed this date in this batch
        if (addedDays.has(dateStr)) {
          console.log(`[BULK ENTRY ${sessionId}] Skipping duplicate date in batch:`, dateStr);
          continue;
        }
        
        addedDays.add(dateStr);
        
        // Calculate actual work hours based on time span
        const actualEndTime = calculateEndTime(startTime, standardHours, breakDuration);
        const totalSpan = calculateWorkHours(startTime, actualEndTime);
        const netHours = Math.max(0, totalSpan - (breakDuration / 60));
        
        const entry = {
          date: dateStr,
          projectId: '',
          project: 'Bulk Entry',
          task: 'Standard Work',
          description: description.trim() || 'Work',
          startTime,
          endTime: actualEndTime,
          breakDuration,
          totalHours: netHours,
          // Let Firebase generate the ID automatically
        };
        
        console.log(`[BULK ENTRY ${sessionId}] Creating entry ${i + 1}/${validDays.length} for ${dateStr}:`, {
          date: entry.date,
          totalHours: entry.totalHours,
          startTime: entry.startTime,
          endTime: entry.endTime
        });
        
        entries.push(entry);
        
        // Add with error handling and longer delay
        try {
          const result = await addTimeEntry(entry);
          console.log(`[BULK ENTRY ${sessionId}] Result for ${dateStr}:`, result);
          
          if (!result || !result.success) {
            console.error(`[BULK ENTRY ${sessionId}] Failed to add entry for ${dateStr}:`, result?.error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (entryError) {
          console.error(`[BULK ENTRY ${sessionId}] Exception adding entry for ${dateStr}:`, entryError);
          errorCount++;
        }
        
        // Longer delay between entries
        if (i < validDays.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        }
      }

      console.log(`[BULK ENTRY ${sessionId}] Completed: ${successCount} success, ${errorCount} errors`);

      if (onEntriesAdded) {
        onEntriesAdded(entries);
      }

      // Clear submission lock after completion
      sessionStorage.removeItem(lockKey);

      // Reset form only on success
      if (errorCount === 0) {
        setSelectedDays(new Set());
        setDescription('');
        setBreakDuration(60);
        setOpen(false);
        setHasSubmitted(false); // Reset for next time
        
        alert(`Successfully added ${successCount} time entries for ${selectedMonth}!`);
      } else {
        alert(`Completed with ${successCount} successful entries and ${errorCount} errors. Check console for details.`);
      }
    } catch (error) {
      console.error(`[BULK ENTRY ${sessionId}] Critical error:`, error);
      alert(`Failed to add entries: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      console.log(`[BULK ENTRY ${sessionId}] === SUBMISSION ENDED ===`);
    }
  };

  // Helper function to check for existing entries
  const checkExistingEntries = async (validDays, year, month) => {
    // This would need to be implemented with your data context
    // For now, we'll just return empty array
    return [];
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          // Reset submission state when dialog opens
          setIsSubmitting(false);
          setHasSubmitted(false);
          console.log('[BULK ENTRY] Dialog opened, reset submission state');
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Add Bulk Month Entries
          </DialogTitle>
          <DialogDescription>
            Add multiple days of work entries with standard hours for an entire month.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Work description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                max="480"
                step="5"
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Standard Hours per Day</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={standardHours}
                  onChange={(e) => setStandardHours(parseFloat(e.target.value) || 8)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">End time: </span>
                {calculateEndTime(startTime, standardHours, breakDuration)}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Total span: </span>
                {(() => {
                  const endTime = calculateEndTime(startTime, standardHours, breakDuration);
                  const totalSpan = calculateWorkHours(startTime, endTime);
                  return `${totalSpan.toFixed(1)}h`;
                })()}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Net work hours: </span>
              {(() => {
                const endTime = calculateEndTime(startTime, standardHours, breakDuration);
                const totalSpan = calculateWorkHours(startTime, endTime);
                const netHours = Math.max(0, totalSpan - (breakDuration / 60));
                return `${netHours.toFixed(2)}h (${totalSpan.toFixed(1)}h total - ${breakDuration}min break)`;
              })()}
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Select Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={selectAllWorkdays}>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Weekdays Only
                </Button>
                <Button size="sm" variant="outline" onClick={selectAllDays}>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  All Days
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  <Square className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="excludeWeekends"
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="excludeWeekends" className="text-sm text-muted-foreground">
                  Exclude weekends from final entries
                </Label>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ day, date, isWeekend, dayName }) => {
                    const isSelected = selectedDays.has(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`
                          aspect-square text-xs p-1 rounded border transition-all
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background hover:bg-muted border-border'
                          }
                          ${isWeekend ? 'text-muted-foreground' : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">
                      Selected: {selectedDays.size} days
                    </div>
                    {excludeWeekends && (
                      <div className="text-xs text-orange-600">
                        Weekends will be excluded from final entries
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const actualDays = Array.from(selectedDays).filter(day => {
                        const entryDate = new Date(year, month - 1, day);
                        return !excludeWeekends || !isWeekend(entryDate);
                      });
                      const endTime = calculateEndTime(startTime, standardHours, breakDuration);
                      const totalSpan = calculateWorkHours(startTime, endTime);
                      const netHours = Math.max(0, totalSpan - (breakDuration / 60));
                      const totalNetHours = actualDays.length * netHours;
                      return `${actualDays.length} entries, ${totalNetHours.toFixed(1)}h net work`;
                    })()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSubmitting && !hasSubmitted) {
                handleSubmit();
              }
            }} 
            disabled={isSubmitting || selectedDays.size === 0 || hasSubmitted}
            style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }} // Completely disable clicking when submitting
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add {(() => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const actualDays = Array.from(selectedDays).filter(day => {
                    const entryDate = new Date(year, month - 1, day);
                    return !excludeWeekends || !isWeekend(entryDate);
                  });
                  return actualDays.length;
                })()} Entries
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkMonthEntryDialog;