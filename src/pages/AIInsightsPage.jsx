import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Lightbulb,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatCurrency } from '@/lib/utils.js';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subWeeks, 
  subMonths,
  format,
  isToday,
  getHours
} from 'date-fns';

const AIInsightsPage = () => {
  const { user } = useAuth();
  const { timeEntries } = useData();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    generateInsights();
  }, [timeEntries]);

  const generateInsights = () => {
    if (!timeEntries || timeEntries.length === 0) {
      setInsights(null);
      return;
    }

    const now = new Date();
    const thisWeek = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek(now) && entryDate <= endOfWeek(now);
    });

    const lastWeek = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const lastWeekStart = startOfWeek(subWeeks(now, 1));
      const lastWeekEnd = endOfWeek(subWeeks(now, 1));
      return entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
    });

    const thisMonth = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfMonth(now) && entryDate <= endOfMonth(now);
    });

    const lastMonth = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return entryDate >= lastMonthStart && entryDate <= lastMonthEnd;
    });

    // Calculate weekly and monthly totals
    const thisWeekHours = thisWeek.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const lastWeekHours = lastWeek.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const thisMonthHours = thisMonth.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const lastMonthHours = lastMonth.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    // Calculate trends
    const weeklyTrend = lastWeekHours > 0 ? ((thisWeekHours - lastWeekHours) / lastWeekHours) * 100 : 0;
    const monthlyTrend = lastMonthHours > 0 ? ((thisMonthHours - lastMonthHours) / lastMonthHours) * 100 : 0;

    // Analyze productivity patterns
    const hourlyData = {};
    timeEntries.forEach(entry => {
      if (entry.startTime) {
        const hour = parseInt(entry.startTime.split(':')[0]);
        hourlyData[hour] = (hourlyData[hour] || 0) + (entry.totalHours || 0);
      }
    });

    const peakHour = Object.keys(hourlyData).reduce((a, b) => 
      hourlyData[a] > hourlyData[b] ? a : b
    );

    // Project analysis
    const projectData = {};
    timeEntries.forEach(entry => {
      const project = entry.project || 'Unassigned';
      projectData[project] = (projectData[project] || 0) + (entry.totalHours || 0);
    });

    const mostProductiveProject = Object.keys(projectData).reduce((a, b) => 
      projectData[a] > projectData[b] ? a : b
    );

    // Generate recommendations
    const recommendations = [];
    
    if (weeklyTrend > 10) {
      recommendations.push({
        type: 'positive',
        title: 'Great Progress!',
        description: `You're ${weeklyTrend.toFixed(1)}% more productive this week. Keep up the excellent work!`
      });
    } else if (weeklyTrend < -10) {
      recommendations.push({
        type: 'improvement',
        title: 'Focus Opportunity',
        description: `Your productivity is down ${Math.abs(weeklyTrend).toFixed(1)}% this week. Consider reviewing your priorities.`
      });
    }

    if (peakHour >= 9 && peakHour <= 11) {
      recommendations.push({
        type: 'insight',
        title: 'Morning Person',
        description: `You're most productive at ${peakHour}:00. Schedule important tasks during morning hours.`
      });
    } else if (peakHour >= 14 && peakHour <= 16) {
      recommendations.push({
        type: 'insight',
        title: 'Afternoon Focus',
        description: `You peak at ${peakHour}:00. Consider tackling complex work in the early afternoon.`
      });
    }

    if (thisWeekHours < 40 && user?.targetHours && user.targetHours > thisWeekHours) {
      recommendations.push({
        type: 'goal',
        title: 'Weekly Goal',
        description: `You need ${(user.targetHours - thisWeekHours).toFixed(1)} more hours to reach your weekly target.`
      });
    }

    setInsights({
      thisWeekHours,
      lastWeekHours,
      thisMonthHours,
      lastMonthHours,
      weeklyTrend,
      monthlyTrend,
      peakHour,
      mostProductiveProject,
      recommendations,
      projectData,
      hourlyData
    });
  };

  if (!insights) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground mt-2">
            Start tracking time to see personalized productivity insights and recommendations.
          </p>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No data available yet. Start logging your time to generate AI-powered insights!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
        <p className="text-muted-foreground mt-2">
          Personalized productivity insights and recommendations powered by AI.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.thisWeekHours.toFixed(1)}h</div>
            <div className="flex items-center text-xs">
              {insights.weeklyTrend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={insights.weeklyTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(insights.weeklyTrend).toFixed(1)}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.thisMonthHours.toFixed(1)}h</div>
            <div className="flex items-center text-xs">
              {insights.monthlyTrend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={insights.monthlyTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(insights.monthlyTrend).toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.peakHour}:00</div>
            <p className="text-xs text-muted-foreground">Most productive time</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Project</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{insights.mostProductiveProject}</div>
            <p className="text-xs text-muted-foreground">Most time spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to improve your productivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                rec.type === 'positive' ? 'bg-green-500' :
                rec.type === 'improvement' ? 'bg-yellow-500' :
                rec.type === 'insight' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
              <div>
                <h4 className="font-semibold text-foreground">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          ))}
          {insights.recommendations.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Keep tracking your time to receive personalized recommendations!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Project Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Project Time Distribution
          </CardTitle>
          <CardDescription>
            How your time is distributed across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(insights.projectData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([project, hours], index) => {
                const percentage = (hours / insights.thisMonthHours) * 100;
                return (
                  <div key={project} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{project}</span>
                      <span className="text-sm text-muted-foreground">
                        {hours.toFixed(1)}h ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsPage;