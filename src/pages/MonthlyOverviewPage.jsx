import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Calendar, BarChart3, TrendingUp } from 'lucide-react'

const MonthlyOverviewPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monthly Overview</h1>
        <p className="text-muted-foreground mt-2">
          Calendar view and comprehensive statistics for your work patterns
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Monthly Calendar</CardTitle>
          <CardDescription>Visual overview of your time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Monthly Overview Coming Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              This feature will provide a calendar view of your time entries with comprehensive monthly statistics.
            </p>
            <div className="flex justify-center space-x-4">
              <Button disabled>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" disabled>
                <TrendingUp className="w-4 h-4 mr-2" />
                Productivity Trends
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MonthlyOverviewPage
