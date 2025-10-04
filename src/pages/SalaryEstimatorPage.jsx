import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  PiggyBank,
  Target,
  Briefcase
} from 'lucide-react';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatCurrency } from '@/lib/utils.js';
import { 
  startOfYear, 
  endOfYear, 
  differenceInWeeks,
  differenceInDays,
  addDays
} from 'date-fns';

const SalaryEstimatorPage = () => {
  const { user } = useAuth();
  const { timeEntries } = useData();
  
  // Current settings
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate || 25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [vacationDays, setVacationDays] = useState(20);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  
  // Projections
  const [projections, setProjections] = useState(null);
  const [actualEarnings, setActualEarnings] = useState(null);

  useEffect(() => {
    calculateProjections();
    calculateActualEarnings();
  }, [hourlyRate, hoursPerWeek, workDaysPerWeek, vacationDays, timeEntries]);

  const calculateProjections = () => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Calculate working days in year
    const totalDaysInYear = differenceInDays(yearEnd, yearStart) + 1;
    const totalWeeksInYear = differenceInWeeks(yearEnd, yearStart) + 1;
    const workingDaysInYear = totalWeeksInYear * workDaysPerWeek - vacationDays;
    const workingHoursInYear = workingDaysInYear * (hoursPerWeek / workDaysPerWeek);
    
    // Calculate earnings
    const dailyEarnings = hourlyRate * (hoursPerWeek / workDaysPerWeek);
    const weeklyEarnings = hourlyRate * hoursPerWeek;
    const monthlyEarnings = weeklyEarnings * 4.33; // Average weeks per month
    const yearlyEarnings = hourlyRate * workingHoursInYear;
    
    // Calculate based on current progress
    const daysSinceYearStart = differenceInDays(now, yearStart) + 1;
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
      daysSinceYearStart,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Salary Estimator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate and track your earnings potential with advanced salary projections.
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

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
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {projections && (
            <>
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

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Year Progress
                  </CardTitle>
                  <CardDescription>
                    Expected vs projected earnings for this year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expected earnings to date</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(projections.expectedToDate, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Projected yearly total</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(projections.yearly, currency)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {projections.weeksSinceYearStart} weeks into the year
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {actualEarnings ? (
            <>
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
                    {projections && (
                      <p className="text-xs mt-1">
                        <span className={actualEarnings.thisWeek.earnings >= projections.weekly ? 'text-green-500' : 'text-yellow-500'}>
                          {((actualEarnings.thisWeek.earnings / projections.weekly) * 100).toFixed(0)}% of weekly target
                        </span>
                      </p>
                    )}
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
                    {projections && (
                      <p className="text-xs mt-1">
                        <span className={actualEarnings.thisMonth.earnings >= projections.monthly ? 'text-green-500' : 'text-yellow-500'}>
                          {((actualEarnings.thisMonth.earnings / projections.monthly) * 100).toFixed(0)}% of monthly target
                        </span>
                      </p>
                    )}
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
                    {projections && (
                      <p className="text-xs mt-1">
                        <span className={actualEarnings.thisYear.earnings >= projections.expectedToDate ? 'text-green-500' : 'text-yellow-500'}>
                          {((actualEarnings.thisYear.earnings / projections.expectedToDate) * 100).toFixed(0)}% of expected
                        </span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    How your actual earnings compare to projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projections && (
                      <>
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Start tracking your time to see actual earnings data!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalaryEstimatorPage;