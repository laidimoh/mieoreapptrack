import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Clock, Edit3, Timer, Zap, CalendarPlus } from 'lucide-react';
import LiveTimer from '@/components/time-tracker/LiveTimer.jsx';
import ManualEntryDialog from '@/components/time-tracker/ManualEntryDialog.jsx';
import BulkMonthEntryDialog from '@/components/reports/BulkMonthEntryDialog.jsx';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatDate, formatCurrency } from '@/lib/utils.js';

const DailyInputPage = () => {
  const { user } = useAuth();
  const { timeEntries, isTimerRunning } = useData();

  // Get today's entries
  const today = formatDate(new Date(), 'yyyy-MM-dd');
  const todayEntries = timeEntries.filter(entry => entry.date === today);

  const handleBulkEntriesAdded = (newEntries) => {
    // This will trigger a re-render to show new entries
    console.log('Bulk entries added:', newEntries.length);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Input</h1>
        <p className="text-muted-foreground mt-2">
          Track your time with live timer or manual entry for accurate time logging.
        </p>
      </div>

      {/* Quick Entry Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Entry Actions</CardTitle>
          <CardDescription>
            Add time entries quickly with manual entry or bulk month addition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <ManualEntryDialog 
              trigger={
                <Button 
                  size="lg"
                  className="px-6 py-3"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Add Manual Entry
                </Button>
              }
            />
            <BulkMonthEntryDialog 
              trigger={
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-6 py-3"
                >
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Add Bulk Month
                </Button>
              }
              onEntriesAdded={handleBulkEntriesAdded}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Input Methods */}
      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer" className="flex items-center space-x-2">
            <Timer className="w-4 h-4" />
            <span>Live Timer</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="w-5 h-5 mr-2" />
                Real-Time Tracker
              </CardTitle>
              <CardDescription>
                Start and stop the timer to automatically track your work time with break detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveTimer />
            </CardContent>
          </Card>

          {/* Timer Tips */}
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Timer Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Automatic Break Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    The timer automatically detects and records your breaks for accurate time tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Real-Time Earnings</h4>
                  <p className="text-sm text-muted-foreground">
                    Watch your earnings grow in real-time as you work.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Auto-Save</h4>
                  <p className="text-sm text-muted-foreground">
                    Your time is automatically saved every minute to prevent data loss.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Manual Time Entry Tips
              </CardTitle>
              <CardDescription>
                Tips for effective manual time tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Quick Entry</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the "Add Manual Entry" button above to quickly log individual work sessions.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Bulk Month Entry</h4>
                  <p className="text-sm text-muted-foreground">
                    Use "Add Bulk Month" to quickly add multiple days with standard hours (great for regular schedules).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Accurate Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Be precise with your start/end times and break durations for accurate reporting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Entries */}
          {todayEntries.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Today's Entries ({todayEntries.length})</CardTitle>
                <CardDescription>
                  Your recent entries for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayEntries.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">
                          {entry.task || entry.entryType || 'Work'}
                        </Badge>
                        <div>
                          <p className="font-medium">{entry.project || 'General'}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{entry.totalHours?.toFixed(2)}h</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency((entry.totalHours || 0) * (user?.hourlyRate || 0), user?.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {todayEntries.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {todayEntries.length - 5} more entries...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyInputPage;
