import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Calendar as CalendarIcon, 
  FileText, 
  Download, 
  Mail, 
  Clock,
  TrendingUp,
  BarChart3,
  CalendarPlus
} from 'lucide-react';
import InteractiveCalendar from '@/components/calendar/InteractiveCalendar.jsx';
import EmailReportDialog from '@/components/reports/EmailReportDialog.jsx';
import BulkMonthEntryDialog from '@/components/reports/BulkMonthEntryDialog.jsx';
import { exportTimeEntriesToPdf, exportTimeEntriesToCsv } from '@/lib/pdfExport.js';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatDate, formatCurrency } from '@/lib/utils.js';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import ReportsTable from '@/components/reports/ReportsTable.jsx';

const CalendarReportsPage = () => {
  const { user } = useAuth();
  const { timeEntries, projects } = useData();
  
  // Report filters
  const [startDate, setStartDate] = useState(formatDate(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState('all');
  const [filteredEntries, setFilteredEntries] = useState([]);
  
  // Export state
  const [exportedFile, setExportedFile] = useState(null);
  const [exportedFileName, setExportedFileName] = useState("");

  useEffect(() => {
    filterEntries();
  }, [startDate, endDate, selectedProject, timeEntries]);

  const filterEntries = () => {
    let entries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });

    if (selectedProject !== 'all') {
      entries = entries.filter(entry => entry.projectId === selectedProject);
    }
    setFilteredEntries(entries);
  };

  const totalReportHours = filteredEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const totalReportEarnings = totalReportHours * (user?.hourlyRate || 0);

  const handleExportPdf = async () => {
    try {
      console.log('Starting PDF export process...');
      console.log('Filtered entries:', filteredEntries.length);
      console.log('User data:', user);
      
      if (filteredEntries.length === 0) {
        alert('No data to export. Please select a date range with time entries.');
        return;
      }

      console.log('Calling exportTimeEntriesToPdf...');
      const result = await exportTimeEntriesToPdf(filteredEntries, user, startDate, endDate);
      
      if (!result || !result.blob) {
        throw new Error('PDF export returned invalid result');
      }
      
      const { blob, fileName } = result;
      setExportedFile(blob);
      setExportedFileName(fileName);
      
      console.log('Creating download link...');
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('PDF download cleanup completed');
      }, 100);
      
      console.log('PDF download triggered successfully');
    } catch (error) {
      console.error('PDF Export Error Details:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      
      let errorMessage = 'Failed to export PDF. ';
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(errorMessage + '\n\nPlease check the browser console for more details.');
    }
  };

  const handleExportCsv = async () => {
    try {
      if (filteredEntries.length === 0) {
        alert('No data to export. Please select a date range with time entries.');
        return;
      }

      const { blob, fileName } = exportTimeEntriesToCsv(filteredEntries, user, startDate, endDate);
      setExportedFile(blob);
      setExportedFileName(fileName);
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleEntryUpdate = (updatedEntry) => {
    // Update the filtered entries to reflect the change
    const updatedEntries = filteredEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setFilteredEntries(updatedEntries);
  };

  const handleEntryDelete = (deletedEntry) => {
    console.log('[REPORTS] Handling entry deletion:', deletedEntry.id, deletedEntry.date);
    
    // Remove the deleted entry from filtered entries immediately for UI feedback
    const updatedEntries = filteredEntries.filter(entry => entry.id !== deletedEntry.id);
    setFilteredEntries(updatedEntries);
    
    // Force a refresh of the filter to pick up any real-time changes
    setTimeout(() => {
      console.log('[REPORTS] Forcing filter refresh after deletion');
      filterEntries();
    }, 500); // Small delay to allow real-time updates to propagate
  };

  const handleBulkEntriesAdded = (newEntries) => {
    // Refresh filtered entries after bulk addition
    filterEntries();
  };

  // Calculate some quick stats for the dashboard
  const thisMonth = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  });
  
  const thisWeek = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  const thisMonthHours = thisMonth.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const thisWeekHours = thisWeek.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate detailed reports and export your time tracking data
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(thisWeekHours * (user?.hourlyRate || 0), user?.currency)} earned
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(thisMonthHours * (user?.hourlyRate || 0), user?.currency)} earned
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Period</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReportHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalReportEarnings, user?.currency)} earnings
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              All time entries logged
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Report Filters
          </CardTitle>
          <CardDescription>Select date range and project to generate your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectFilter">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <BulkMonthEntryDialog 
              trigger={
                <Button variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add Bulk Month
                </Button>
              }
              onEntriesAdded={handleBulkEntriesAdded}
            />
            <div className="flex space-x-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-xl font-bold">{totalReportHours.toFixed(2)}h</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold">{formatCurrency(totalReportEarnings, user?.currency)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Entries Count</p>
                <p className="text-xl font-bold">{filteredEntries.length}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  console.log('[REPORTS] Manual refresh triggered');
                  filterEntries();
                }}
                title="Refresh data"
              >
                <Clock className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          <ReportsTable 
            timeEntries={filteredEntries} 
            hourlyRate={user?.hourlyRate || 0} 
            currency={user?.currency}
            onEntryUpdate={handleEntryUpdate}
            onEntryDelete={handleEntryDelete}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={handleExportPdf} disabled={filteredEntries.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleExportCsv} disabled={filteredEntries.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <EmailReportDialog 
              trigger={(
                <Button variant="outline" disabled={!exportedFile}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email to HR
                </Button>
              )}
              reportFile={exportedFile}
              reportFileName={exportedFileName}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarReportsPage;