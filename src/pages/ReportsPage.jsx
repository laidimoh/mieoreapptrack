import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { FileText, Download, Mail, Loader2 } from 'lucide-react'
import EmailReportDialog from '@/components/reports/EmailReportDialog.jsx'
import { exportTimeEntriesToPdf, exportTimeEntriesToCsv } from '@/lib/pdfExport.js'
import { useData } from '@/contexts/DataContext.jsx'
import { useAuth } from '@/contexts/AuthContext.jsx'
import { formatDate, formatCurrency } from '@/lib/utils.js'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import ReportsTable from '@/components/reports/ReportsTable.jsx'

const ReportsPage = () => {
  const { user } = useAuth()
  const { timeEntries, projects } = useData()
  const [startDate, setStartDate] = useState(formatDate(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))
  const [selectedProject, setSelectedProject] = useState('all')
  const [filteredEntries, setFilteredEntries] = useState([])

  useEffect(() => {
    filterEntries()
  }, [startDate, endDate, selectedProject, timeEntries])

  const filterEntries = () => {
    let entries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return entryDate >= start && entryDate <= end
    })

    if (selectedProject !== 'all') {
      entries = entries.filter(entry => entry.projectId === selectedProject)
    }
    setFilteredEntries(entries)
  }

  const totalReportHours = filteredEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
  const totalReportEarnings = totalReportHours * (user?.hourlyRate || 0)

  const [exportedFile, setExportedFile] = useState(null);
  const [exportedFileName, setExportedFileName] = useState("");

  const handleExportPdf = async () => {
    try {
      console.log('Starting PDF export with filtered entries:', filteredEntries);
      
      if (filteredEntries.length === 0) {
        alert('No data to export. Please select a date range with time entries.');
        return;
      }

      const { blob, fileName } = await exportTimeEntriesToPdf(filteredEntries, user, startDate, endDate);
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
      
      console.log('PDF download triggered successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and export detailed reports of your time entries.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range and project to generate your report.</CardDescription>
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

          <div className="flex justify-between items-center mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{totalReportHours.toFixed(2)}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(totalReportEarnings, user?.currency)}</p>
            </div>
          </div>

          <ReportsTable timeEntries={filteredEntries} hourlyRate={user?.hourlyRate || 0} currency={user?.currency} />

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
  )
}

export default ReportsPage
