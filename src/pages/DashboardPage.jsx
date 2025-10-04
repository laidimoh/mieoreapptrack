import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx'
import { Clock, Plus, Calendar, BarChart3, TrendingUp, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'
import { useTimeTracking } from '../contexts/TimeTrackingContext.jsx'
import ManualEntryDialog from '../components/time-tracker/ManualEntryDialog.jsx'
import LiveTimer from '../components/time-tracker/LiveTimer.jsx'
import DashboardCharts from '../components/dashboard/DashboardCharts.jsx'
import InteractiveCalendar from '../components/calendar/InteractiveCalendar.jsx'
import { formatCurrency, formatDuration } from '../lib/utils.js'

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth()
  const { timeEntries, statistics, projects, isLoading, error } = useData()
  const { isRunning, elapsedTime, startTimer, stopTimer, currentProject } = useTimeTracking()
  
  // Show loading while auth is loading or user data is not available
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error if there's a data loading error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard data:</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }
  
  const todayEarnings = statistics.today.hours * (user?.hourlyRate || 0)
  const weekEarnings = statistics.week.hours * (user?.hourlyRate || 0)
  const monthEarnings = statistics.month.hours * (user?.hourlyRate || 0)

  const handleStartStopClick = () => {
    if (isRunning) {
      stopTimer()
    } else {
      // For now, start with a default project or prompt user later
      startTimer(projects[0] || null, 
                 'General Task', 
                 'Time tracked via dashboard timer')
    }
  }


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to track your time and boost your productivity today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartStopClick}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isRunning ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                <Clock className={`w-6 h-6 ${isRunning ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold">{isRunning ? 'Stop Timer' : 'Start Timer'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isRunning ? `Tracking: ${currentProject?.name || 'General'} (${formatDuration(elapsedTime)})` : 'Begin tracking time'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ManualEntryDialog trigger={
          <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Entry</h3>
                  <p className="text-sm text-muted-foreground">Log time manually</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }/>

        <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">View Calendar</h3>
                <p className="text-sm text-muted-foreground">Monthly overview</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{statistics.today.hours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(todayEarnings, user?.currency)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{statistics.week.hours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(weekEarnings, user?.currency)} • Target: 40h
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{statistics.month.hours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(monthEarnings, user?.currency)} • Target: 160h
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productivity</p>
                <p className="text-2xl font-bold">
                  {statistics.week.hours >= 40 ? '100' : Math.round((statistics.week.hours / 40) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Trend: stable</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Timer */}
      <LiveTimer />

      {/* Dashboard Views */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          {/* Dashboard Charts */}
          <DashboardCharts />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Time Entry Calendar
              </CardTitle>
              <CardDescription>
                Visual overview of your time entries with color-coded indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveCalendar />
            </CardContent>
          </Card>

          {/* Calendar Legend */}
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Calendar Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Work Entries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Meetings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Training</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Breaks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest time entries</CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No entries yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking time to see your activity
              </p>
              <ManualEntryDialog trigger={(
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Entry
                </Button>
              )}/>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.project || 'General Work'}</p>
                    <p className="text-sm text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.totalHours.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
