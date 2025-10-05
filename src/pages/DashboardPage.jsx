import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Button } from '../components/ui/button.jsx'
import { Badge } from '../components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx'
import ProFeatureCard from '../components/ui/ProFeatureCard.jsx'
import { Clock, Plus, Calendar, BarChart3, TrendingUp, Target, Edit3, CalendarPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useData } from '../contexts/DataContext.jsx'
import { useTimeTracking } from '../contexts/TimeTrackingContext.jsx'
import ManualEntryDialog from '../components/time-tracker/ManualEntryDialog.jsx'
import BulkMonthEntryDialog from '../components/reports/BulkMonthEntryDialog.jsx'
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

  const handleUpgradeClick = () => {
    // This would open a subscription modal or redirect to pricing page
    alert('Upgrade to PRO to unlock advanced features!');
  }

  const handleBulkEntriesAdded = (newEntries) => {
    // This will trigger a re-render to show new entries
    console.log('Bulk entries added:', newEntries.length);
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
          
          {/* PRO Analytics Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProFeatureCard 
              title="Advanced Analytics"
              description="Deep insights into productivity patterns and trends"
              icon={BarChart3}
              onUpgradeClick={handleUpgradeClick}
            />
            <ProFeatureCard 
              title="Custom Reports"
              description="Create detailed reports with advanced filtering"
              icon={TrendingUp}
              onUpgradeClick={handleUpgradeClick}
            />
            <ProFeatureCard 
              title="Team Dashboard"
              description="Monitor team performance and project progress"
              icon={Target}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>
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
