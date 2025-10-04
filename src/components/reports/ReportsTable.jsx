import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx';
import { Edit, Check, X, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext.jsx';
import { formatCurrency, formatHours } from '@/lib/utils.js';
import firebaseService from '@/lib/firebaseService.js';

const ReportsTable = ({ timeEntries, hourlyRate, currency, onEntryUpdate, onEntryDelete }) => {
  const { updateTimeEntry, deleteTimeEntry } = useData();
  const [editingId, setEditingId] = useState(null);
  const [editedHours, setEditedHours] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Log entry structure for debugging
  React.useEffect(() => {
    if (timeEntries && timeEntries.length > 0) {
      console.log('=== REPORTS TABLE DATA STRUCTURE ===');
      console.log('Sample entry:', timeEntries[0]);
      console.log('Entry keys:', Object.keys(timeEntries[0]));
      console.log('ID type:', typeof timeEntries[0].id);
      console.log('ID value:', timeEntries[0].id);
    }
  }, [timeEntries]);

  // Fix ID mismatches
  const handleFixIds = async () => {
    try {
      console.log('Starting ID fix...');
      const result = await firebaseService.fixIdMismatches();
      if (result.success) {
        alert(`ID fix completed! Fixed ${result.fixedCount} entries. Page will refresh to update data.`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(`ID fix failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error fixing IDs:', error);
      alert(`ID fix failed: ${error.message}`);
    }
  };

  if (!timeEntries || timeEntries.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No time entries to display for this report.</p>;
  }

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditedHours(entry.totalHours.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedHours('');
  };

  const saveEdit = async (entry) => {
    const newHours = parseFloat(editedHours);
    if (isNaN(newHours) || newHours < 0) {
      alert('Please enter a valid number of hours.');
      return;
    }

    try {
      const updatedEntry = {
        ...entry,
        totalHours: newHours,
        updatedAt: new Date().toISOString()
      };
      
      await updateTimeEntry(entry.id, updatedEntry);
      
      if (onEntryUpdate) {
        onEntryUpdate(updatedEntry);
      }
      
      setEditingId(null);
      setEditedHours('');
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry. Please try again.');
    }
  };

  const handleDelete = async (entry) => {
    setDeletingId(entry.id);
    try {
      const result = await deleteTimeEntry(entry.id);
      if (result && result.success !== false) {
        if (onEntryDelete) {
          onEntryDelete(entry);
        }
      } else {
        alert(`Failed to delete entry: ${result?.error || 'Unknown error'}`);
      }
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(`Failed to delete entry: ${error.message}`);
      setDeletingId(null);
    }
  };

  const toggleSelect = (entryId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = timeEntries.map(entry => entry.id);
    setSelectedIds(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Please select entries to delete.');
      return;
    }

    // Debug what we're working with
    console.log('=== BULK DELETE DEBUG ===');
    console.log('Selected IDs:', Array.from(selectedIds));
    console.log('Time entries sample:', timeEntries.slice(0, 3).map(e => ({
      id: e.id,
      idType: typeof e.id,
      date: e.date,
      allProps: Object.keys(e)
    })));

    setIsDeleting(true);
    try {
      const entriesToDelete = timeEntries.filter(entry => selectedIds.has(entry.id));
      console.log('Entries to delete:', entriesToDelete.map(e => ({
        id: e.id,
        date: e.date
      })));

      let successCount = 0;
      let errorCount = 0;

      for (const entry of entriesToDelete) {
        try {
          console.log(`Attempting to delete entry with ID: "${entry.id}" (type: ${typeof entry.id})`);
          const result = await deleteTimeEntry(entry.id);
          console.log(`Delete result for ${entry.id}:`, result);
          
          if (result && result.success !== false) {
            successCount++;
            if (onEntryDelete) {
              onEntryDelete(entry);
            }
          } else {
            errorCount++;
            console.error(`Failed to delete ${entry.id}:`, result?.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Exception deleting ${entry.id}:`, error);
        }
      }

      setSelectedIds(new Set());
      setIsDeleting(false);

      if (errorCount === 0) {
        alert(`Successfully deleted ${successCount} entries.`);
      } else {
        alert(`Deleted ${successCount} entries. ${errorCount} failed to delete.`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      alert(`Bulk delete failed: ${error.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {timeEntries.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedIds.size === timeEntries.length && timeEntries.length > 0}
                onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} of {timeEntries.length} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={handleFixIds}>
                Fix IDs
              </Button>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Multiple Entries</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} time entries? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete {selectedIds.size} Entries
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.size === timeEntries.length && timeEntries.length > 0}
                onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Earnings</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(String(entry.id))}
                  onCheckedChange={() => toggleSelect(entry.id)}
                />
              </TableCell>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.project || 'N/A'}</TableCell>
              <TableCell>{entry.task || 'N/A'}</TableCell>
              <TableCell className="max-w-[200px] truncate">{entry.description || 'N/A'}</TableCell>
              <TableCell className="text-right">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editedHours}
                    onChange={(e) => setEditedHours(e.target.value)}
                    className="w-20 text-right"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveEdit(entry);
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  formatHours(entry.totalHours)
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency((editingId === entry.id ? parseFloat(editedHours) || 0 : entry.totalHours) * hourlyRate, currency)}
              </TableCell>
              <TableCell className="text-center">
                {editingId === entry.id ? (
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveEdit(entry)}
                      className="h-8 w-8 p-0"
                      title="Save changes"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="h-8 w-8 p-0"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(entry)}
                      className="h-8 w-8 p-0"
                      title="Edit hours"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete entry"
                          disabled={deletingId === entry.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this time entry? 
                            <br />
                            <strong>Date:</strong> {entry.date}
                            <br />
                            <strong>Hours:</strong> {formatHours(entry.totalHours)}
                            <br />
                            <strong>Task:</strong> {entry.task || 'N/A'}
                            <br />
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(entry)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};

export default ReportsTable;