import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import ProFeatureCard from '@/components/ui/ProFeatureCard.jsx';
import { 
  FileText, 
  Download, 
  Users,
  Settings,
  Edit3,
  Trash2
} from 'lucide-react';
import ExportOptionsDialog from '@/components/reports/ExportOptionsDialog.jsx';
import ManualEntryDialog from '@/components/time-tracker/ManualEntryDialog.jsx';
import { exportTimeEntriesToPdf } from '@/lib/pdfExport.js';
import { useData } from '@/contexts/DataContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatDate } from '@/lib/utils.js';

const CalendarReportsPage = () => {
  const { user } = useAuth();
  const { timeEntries, updateTimeEntry, deleteTimeEntry } = useData();
  
  const [startDate, setStartDate] = useState(formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'));
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  useEffect(() => {
    filterEntries();
  }, [startDate, endDate, timeEntries]);

  const filterEntries = () => {
    let entries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });
    setFilteredEntries(entries);
  };

  const handleExportPdf = async (exportOptions = {}) => {
    try {
      if (filteredEntries.length === 0) {
        alert('No data to export. Please select a date range with time entries.');
        return;
      }

      const result = await exportTimeEntriesToPdf(filteredEntries, user, startDate, endDate, exportOptions);
      
      if (!result || !result.blob) {
        throw new Error('PDF export returned invalid result');
      }
      
      const { blob, fileName } = result;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleUpgradeClick = () => {
    alert('Upgrade to PRO to unlock advanced features!');
  };

  const handleDeleteEntry = async () => {
    if (!deletingEntry) return;
    
    try {
      await deleteTimeEntry(deletingEntry.id);
      setDeletingEntry(null);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-2">
          View and export your time entries
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" onClick={() => {
                const today = new Date();
                setStartDate(formatDate(today, 'yyyy-MM-dd'));
                setEndDate(formatDate(today, 'yyyy-MM-dd'));
              }}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(formatDate(lastWeek, 'yyyy-MM-dd'));
                setEndDate(formatDate(today, 'yyyy-MM-dd'));
              }}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(formatDate(firstDay, 'yyyy-MM-dd'));
                setEndDate(formatDate(today, 'yyyy-MM-dd'));
              }}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const today = new Date();
                const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                setStartDate(formatDate(firstDayPrevMonth, 'yyyy-MM-dd'));
                setEndDate(formatDate(lastDayPrevMonth, 'yyyy-MM-dd'));
              }}>
                Previous Month
              </Button>
            </div>
            
            <ExportOptionsDialog 
              trigger={
                <Button disabled={filteredEntries.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              }
              onExport={handleExportPdf}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Time Entries
          </CardTitle>
          <CardDescription>
            Detailed view of your tracked time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                  <TableHead className="text-right">Extra Hours</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No time entries found for the selected date range.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.startTime || '09:00 AM'}</TableCell>
                      <TableCell>{entry.endTime || '05:00 PM'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {(entry.totalHours || 0).toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(entry.extraHours || 0).toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.description || ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          work
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingEntry(entry)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProFeatureCard 
          title="Advanced Analytics"
          description="Detailed productivity insights and trends"
          icon={FileText}
          onUpgradeClick={handleUpgradeClick}
        />
        <ProFeatureCard 
          title="Custom Reports"
          description="Create and schedule custom report formats"
          icon={Settings}
          onUpgradeClick={handleUpgradeClick}
        />
        <ProFeatureCard 
          title="Team Management"
          description="Manage team members and projects"
          icon={Users}
          onUpgradeClick={handleUpgradeClick}
        />
      </div>

      {editingEntry && (
        <ManualEntryDialog
          trigger={null}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          isOpen={!!editingEntry}
        />
      )}

      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry for {deletingEntry?.date}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingEntry(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarReportsPage;
