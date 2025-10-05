import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  Brain, 
  Calculator,
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Lightbulb,
  Calendar,
  BarChart3,
  Zap,
  DollarSign,
  PiggyBank,
  Briefcase
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
  getHours,
  startOfYear,
  endOfYear,
  differenceInWeeks,
  differenceInDays,
  addDays
} from 'date-fns';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { timeEntries } = useData();
  
  // AI Insights state
  const [insights, setInsights] = useState(null);
  
  // Salary Calculator state
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate || 25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [vacationDays, setVacationDays] = useState(20);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [projections, setProjections] = useState(null);
  const [actualEarnings, setActualEarnings] = useState(null);

  useEffect(() => {
    generateInsights();
    calculateProjections();
    calculateActualEarnings();
  }, [timeEntries, hourlyRate, hoursPerWeek, workDaysPerWeek, vacationDays]);

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

    const peakHour = Object.keys(hourlyData).length > 0 ? Object.keys(hourlyData).reduce((a, b) => 
      hourlyData[a] > hourlyData[b] ? a : b
    ) : 9;

    // Project analysis
    const projectData = {};
    timeEntries.forEach(entry => {
      const project = entry.project || 'Unassigned';
      projectData[project] = (projectData[project] || 0) + (entry.totalHours || 0);
    });

    const mostProductiveProject = Object.keys(projectData).length > 0 ? Object.keys(projectData).reduce((a, b) => 
      projectData[a] > projectData[b] ? a : b
    ) : 'No projects';

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

    if (thisWeekHours < hoursPerWeek) {
      recommendations.push({
        type: 'goal',
        title: 'Weekly Goal',
        description: `You need ${(hoursPerWeek - thisWeekHours).toFixed(1)} more hours to reach your weekly target of ${hoursPerWeek} hours.`
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

  const calculateProjections = () => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Calculate working days in year
    const totalWeeksInYear = differenceInWeeks(yearEnd, yearStart) + 1;
    const workingDaysInYear = totalWeeksInYear * workDaysPerWeek - vacationDays;
    const workingHoursInYear = workingDaysInYear * (hoursPerWeek / workDaysPerWeek);
    
    // Calculate earnings
    const dailyEarnings = hourlyRate * (hoursPerWeek / workDaysPerWeek);
    const weeklyEarnings = hourlyRate * hoursPerWeek;
    const monthlyEarnings = weeklyEarnings * 4.33; // Average weeks per month
    const yearlyEarnings = hourlyRate * workingHoursInYear;
    
    // Calculate based on current progress
    const weeksSinceYearStart = differenceInWeeks(now, yearStart) + 1;
    const expectedEarningsToDate = weeklyEarnings * weeksSinceYearStart;
    
    setProjections({
      daily: dailyEarnings,
      weekly: weeklyEarnings,
      monthly: monthlyEarnings,
      yearly: yearlyEarnings,
      expectedToDate: expectedEarningsToDate,
      workingDaysInYear,
      workingHoursInYear,
      weeksSinceYearStart
    });
  };

  const calculateActualEarnings = () => {
    if (!timeEntries || timeEntries.length === 0) {
      setActualEarnings(null);
      return;
    }

    const now = new Date();
    const yearStart = startOfYear(now);
    
    // Calculate actual earnings this year
    const thisYearEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= yearStart && entryDate <= now;
    });
    
    const totalHoursThisYear = thisYearEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const actualEarningsThisYear = totalHoursThisYear * hourlyRate;
    
    // Calculate this month
    const thisMonth = now.getMonth();
    const thisMonthEntries = thisYearEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === thisMonth;
    });
    
    const totalHoursThisMonth = thisMonthEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const actualEarningsThisMonth = totalHoursThisMonth * hourlyRate;
    
    // Calculate this week (last 7 days)
    const sevenDaysAgo = addDays(now, -7);
    const thisWeekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= sevenDaysAgo && entryDate <= now;
    });
    
    const totalHoursThisWeek = thisWeekEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const actualEarningsThisWeek = totalHoursThisWeek * hourlyRate;
    
    setActualEarnings({
      thisWeek: {
        hours: totalHoursThisWeek,
        earnings: actualEarningsThisWeek
      },
      thisMonth: {
        hours: totalHoursThisMonth,
        earnings: actualEarningsThisMonth
      },
      thisYear: {
        hours: totalHoursThisYear,
        earnings: actualEarningsThisYear
      }
    });
  };

  const saveSettings = () => {
    // In a real app, this would save to user profile
    console.log('Saving salary settings:', {
      hourlyRate,
      hoursPerWeek,
      workDaysPerWeek,
      vacationDays,
      currency
    });
  };

  if (!insights && !timeEntries?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-2">
            Track your productivity and earnings with AI-powered insights and salary projections.
          </p>
        </div>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Start tracking time to see personalized analytics and earnings projections!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered productivity insights and comprehensive salary analysis.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Combined Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights && (
              <>
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
                    <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{insights.peakHour}:00</div>
                    <p className="text-xs text-muted-foreground">Most productive time</p>
                  </CardContent>
                </Card>
              </>
            )}

            {actualEarnings && (
              <>
                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Week Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(actualEarnings.thisWeek.earnings, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {actualEarnings.thisWeek.hours.toFixed(1)} hours tracked
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Month Earnings</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(actualEarnings.thisMonth.earnings, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {actualEarnings.thisMonth.hours.toFixed(1)} hours tracked
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Recommendations */}
          {insights && insights.recommendations.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.recommendations.slice(0, 2).map((rec, index) => (
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
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insights ? (
            <>
              {/* AI Recommendations */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
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
                        const percentage = insights.thisMonthHours > 0 ? (hours / insights.thisMonthHours) * 100 : 0;
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
            </>
          ) : (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Start tracking time to see AI-powered insights!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          {actualEarnings && projections ? (
            <>
              {/* Actual vs Projected */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(actualEarnings.thisWeek.earnings, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {actualEarnings.thisWeek.hours.toFixed(1)} hours tracked
                    </p>
                    <p className="text-xs mt-1">
                      <span className={actualEarnings.thisWeek.earnings >= projections.weekly ? 'text-green-500' : 'text-yellow-500'}>
                        {((actualEarnings.thisWeek.earnings / projections.weekly) * 100).toFixed(0)}% of weekly target
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(actualEarnings.thisMonth.earnings, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {actualEarnings.thisMonth.hours.toFixed(1)} hours tracked
                    </p>
                    <p className="text-xs mt-1">
                      <span className={actualEarnings.thisMonth.earnings >= projections.monthly ? 'text-green-500' : 'text-yellow-500'}>
                        {((actualEarnings.thisMonth.earnings / projections.monthly) * 100).toFixed(0)}% of monthly target
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Year</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(actualEarnings.thisYear.earnings, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {actualEarnings.thisYear.hours.toFixed(1)} hours tracked
                    </p>
                    <p className="text-xs mt-1">
                      <span className={actualEarnings.thisYear.earnings >= projections.expectedToDate ? 'text-green-500' : 'text-yellow-500'}>
                        {((actualEarnings.thisYear.earnings / projections.expectedToDate) * 100).toFixed(0)}% of expected
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Performance Summary
                  </CardTitle>
                  <CardDescription>
                    How your actual earnings compare to projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weekly Performance</span>
                      <span className={`text-sm font-medium ${
                        actualEarnings.thisWeek.earnings >= projections.weekly ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {actualEarnings.thisWeek.earnings >= projections.weekly ? 'On Track' : 'Behind Target'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Performance</span>
                      <span className={`text-sm font-medium ${
                        actualEarnings.thisMonth.earnings >= projections.monthly ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {actualEarnings.thisMonth.earnings >= projections.monthly ? 'Exceeding' : 'Below Target'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Yearly Performance</span>
                      <span className={`text-sm font-medium ${
                        actualEarnings.thisYear.earnings >= projections.expectedToDate ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {actualEarnings.thisYear.earnings >= projections.expectedToDate ? 'Ahead of Schedule' : 'Catching Up'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projections */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Earning Projections
                  </CardTitle>
                  <CardDescription>
                    Based on current hourly rate and work schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(projections.weekly, currency)}</p>
                      <p className="text-sm text-muted-foreground">Weekly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(projections.monthly, currency)}</p>
                      <p className="text-sm text-muted-foreground">Monthly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(projections.yearly, currency)}</p>
                      <p className="text-sm text-muted-foreground">Yearly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatCurrency(projections.expectedToDate, currency)}</p>
                      <p className="text-sm text-muted-foreground">Expected YTD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Start tracking time to see earnings analysis!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Salary Calculator
              </CardTitle>
              <CardDescription>
                Adjust your work parameters to see earning projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <div className="flex">
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                      className="rounded-r-none"
                    />
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-20 rounded-l-none border-l-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workDays">Work Days per Week</Label>
                  <Input
                    id="workDays"
                    type="number"
                    value={workDaysPerWeek}
                    onChange={(e) => setWorkDaysPerWeek(parseFloat(e.target.value) || 0)}
                    min="1"
                    max="7"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vacation">Vacation Days per Year</Label>
                  <Input
                    id="vacation"
                    type="number"
                    value={vacationDays}
                    onChange={(e) => setVacationDays(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <Button onClick={saveSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {projections && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projections.daily, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(hoursPerWeek / workDaysPerWeek).toFixed(1)} hours per day
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projections.weekly, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hoursPerWeek} hours per week
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projections.monthly, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ~{(hoursPerWeek * 4.33).toFixed(0)} hours per month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projections.yearly, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {projections.workingHoursInYear.toFixed(0)} working hours
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;