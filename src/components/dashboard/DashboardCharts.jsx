import React from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { TrendingUp, DollarSign, Clock, Calendar } from 'lucide-react'
import { useData } from '@/contexts/DataContext.jsx'
import { useAuth } from '@/contexts/AuthContext.jsx'
import { formatCurrency } from '@/lib/utils.js'
import { subDays, format, startOfMonth, subMonths } from 'date-fns'

const DashboardCharts = () => {
  const { timeEntries, statistics } = useData()
  const { user } = useAuth()

  // Prepare last 7 days data
  const getLast7DaysData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayEntries = timeEntries.filter(entry => entry.date === dateStr && entry.type === 'work')
      const totalHours = dayEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
      const earnings = totalHours * (user?.hourlyRate || 25)
      
      data.push({
        date: format(date, 'MMM dd'),
        hours: Number(totalHours.toFixed(2)),
        earnings: Number(earnings.toFixed(2))
      })
    }
    return data
  }

  // Prepare last 6 months data
  const getLast6MonthsData = () => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(startOfMonth(new Date()), i)
      const monthStr = format(date, 'yyyy-MM')
      const monthEntries = timeEntries.filter(entry => 
        entry.date.startsWith(monthStr) && entry.type === 'work'
      )
      const totalHours = monthEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
      const earnings = totalHours * (user?.hourlyRate || 25)
      
      data.push({
        month: format(date, 'MMM yyyy'),
        hours: Number(totalHours.toFixed(1)),
        earnings: Number(earnings.toFixed(0))
      })
    }
    return data
  }

  const last7DaysData = getLast7DaysData()
  const last6MonthsData = getLast6MonthsData()

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Hours</p>
                <p className="text-2xl font-bold">{statistics.today.hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{statistics.week.hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{statistics.month.hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics.month.earnings, user?.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days - Daily Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'hours' ? `${value}h` : formatCurrency(value, user?.currency),
                    name === 'hours' ? 'Hours' : 'Earnings'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Last 6 Months Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Last 6 Months - Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last6MonthsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'hours' ? `${value}h` : formatCurrency(value, user?.currency),
                    name === 'hours' ? 'Hours' : 'Earnings'
                  ]}
                />
                <Bar dataKey="hours" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Heatmap Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Productivity heatmap coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardCharts