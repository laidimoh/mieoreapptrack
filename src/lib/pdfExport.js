import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportTimeEntriesToPdf = async (timeEntries, user, startDate, endDate, exportOptions = {}) => {
  try {
    console.log('Starting PDF export with entries:', timeEntries.length);
    console.log('Export options:', exportOptions);
    
    // Default options if not provided
    const options = {
      includeStartEndTimes: true,
      includeBreakTime: true,
      includeTotalHours: true,
      includeExtraHours: true,
      includeEarnings: true,
      includeCompanyHeader: true,
      includeWorkerInfo: true,
      includeSummary: true,
      ...exportOptions
    };
    
    if (!timeEntries || timeEntries.length === 0) {
      throw new Error('No time entries provided for PDF export');
    }

    // Create jsPDF instance
    const doc = new jsPDF();
    
    // Set document properties
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'WorkTrack User';
    const companyName = user?.companyName || 'WorkTrack Company';
    
    // Format period for display
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const monthYear = startDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const periodText = startDateObj.getMonth() === endDateObj.getMonth() && 
                      startDateObj.getFullYear() === endDateObj.getFullYear() 
                      ? monthYear 
                      : `${startDate} to ${endDate}`;
    
    doc.setProperties({
      title: 'Timesheet Report',
      subject: `Timesheet Report - ${periodText}`,
      author: userFullName,
      creator: 'WorkTrack App'
    });

    let yPos = 20;

    // Main title - Timesheet Report (centered)
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Timesheet Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Employee and Period information layout - more compact
    if (options.includeWorkerInfo) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      
      // Left side - Employee
      doc.text('Employee:', 20, yPos);
      doc.setFont(undefined, 'bold');
      doc.text(userFullName, 70, yPos);
      
      // Right side - Period
      doc.setFont(undefined, 'normal');
      doc.text('Period:', 120, yPos);
      doc.setFont(undefined, 'bold');
      doc.text(monthYear, 150, yPos);
      
      // Second line for company and date range
      yPos += 8;
      if (options.includeCompanyHeader) {
        doc.setFont(undefined, 'normal');
        doc.text('Company:', 20, yPos);
        doc.setFont(undefined, 'bold');
        doc.text(companyName, 70, yPos);
      }
      
      // Full date range on right side
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`${startDate} to ${endDate}`, 150, yPos);
      
      yPos += 15;
    }
    
    // Create dynamic table based on options - improved layout
    const tableColumns = ['Date'];
    const columnWidths = [30];
    let totalWidth = 30;
    
    if (options.includeStartEndTimes) {
      tableColumns.push('Start Time', 'End Time');
      columnWidths.push(25, 25);
      totalWidth += 50;
    }
    
    if (options.includeBreakTime) {
      tableColumns.push('Break');
      columnWidths.push(20);
      totalWidth += 20;
    }
    
    if (options.includeTotalHours) {
      tableColumns.push('Total Hours');
      columnWidths.push(25);
      totalWidth += 25;
    }
    
    if (options.includeExtraHours) {
      tableColumns.push('Extra Hours');
      columnWidths.push(25);
      totalWidth += 25;
    }
    
    // Center the table
    const tableStartX = (210 - totalWidth) / 2;
    
    // Table header - improved styling
    doc.setFillColor(52, 152, 219); // Better blue color
    doc.rect(tableStartX, yPos, totalWidth, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    
    // Header columns with centered positioning
    let xPos = tableStartX;
    tableColumns.forEach((column, index) => {
      doc.text(column, xPos + columnWidths[index]/2, yPos + 6.5, { align: 'center' });
      xPos += columnWidths[index];
    });
    
    yPos += 10;
    
    // Table data
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    let totalHours = 0;
    let totalExtraHours = 0;
    let totalEarnings = 0;
    const hourlyRate = parseFloat(user?.hourlyRate) || 0;
    
    doc.setFontSize(8); // Better font size for data rows
    
    timeEntries.forEach((entry, index) => {
      const hours = parseFloat(entry.totalHours) || 0;
      const extraHours = parseFloat(entry.extraHours) || 0;
      totalHours += hours;
      totalExtraHours += extraHours;
      totalEarnings += (hours + extraHours) * hourlyRate;
      
      // Alternate row colors with border
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(tableStartX, yPos, totalWidth, 8, 'F');
      }
      
      // Add light border
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.1);
      doc.line(tableStartX, yPos + 8, tableStartX + totalWidth, yPos + 8);
      
      // Format time display
      const formatTime = (time) => {
        if (!time || time === 'N/A') return '--';
        return time.toString().replace(' AM', '').replace(' PM', '');
      };
      
      // Row data with centered positioning
      xPos = tableStartX;
      const rowData = [entry.date || '--'];
      
      if (options.includeStartEndTimes) {
        rowData.push(formatTime(entry.startTime), formatTime(entry.endTime));
      }
      
      if (options.includeBreakTime) {
        rowData.push((entry.breakDuration || '60') + ' min');
      }
      
      if (options.includeTotalHours) {
        rowData.push(hours.toFixed(2) + 'h');
      }
      
      if (options.includeExtraHours) {
        const extraHours = parseFloat(entry.extraHours) || 0;
        rowData.push(extraHours.toFixed(2) + 'h');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      rowData.forEach((data, colIndex) => {
        doc.text(data, xPos + columnWidths[colIndex]/2, yPos + 5.5, { align: 'center' });
        xPos += columnWidths[colIndex];
      });
      
      yPos += 8;
    });
    
            // Add table border
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.rect(tableStartX, yPos - (timeEntries.length * 8) - 10, totalWidth, (timeEntries.length * 8) + 10, 'S');
    
    // Add total hours summary at the bottom
    yPos += 10;
    
    // Total hours summary box
    doc.setFillColor(245, 245, 245);
    doc.rect(tableStartX, yPos, totalWidth, 15, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(tableStartX, yPos, totalWidth, 15, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    
    // Calculate totals
    const grandTotalHours = totalHours + totalExtraHours;
    
    // Display totals in the summary box
    let summaryText = `Total Hours: ${grandTotalHours.toFixed(2)}h`;
    if (totalExtraHours > 0) {
      summaryText = `Regular: ${totalHours.toFixed(2)}h | Extra: ${totalExtraHours.toFixed(2)}h | Total: ${grandTotalHours.toFixed(2)}h`;
    }
    
    doc.text(summaryText, tableStartX + totalWidth/2, yPos + 10, { align: 'center' });
    yPos += 15;
    
    // Earnings summary if enabled
    if (options.includeSummary && options.includeEarnings && hourlyRate > 0) {
      yPos += 8;
      const currency = user?.currency || 'USD';
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Rate: ${currency} ${hourlyRate.toFixed(2)}/hour`, 105, yPos, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Earnings: ${currency} ${totalEarnings.toFixed(2)}`, 105, yPos + 10, { align: 'center' });
      yPos += 20;
    }
    
    // Single footer at bottom
    yPos = Math.max(yPos + 20, 275);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(120, 120, 120);
    
    // Website copyright on the left
    doc.text('© www.mieore.com', 20, yPos);
    
    // Generation date on the right
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })}`, 170, yPos);
    
    // Footer with website and generation date
    yPos = Math.max(yPos + 15, 280); // Ensure footer is at bottom
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Website copyright on the left
    doc.text('© www.mieore.com', 20, yPos);
    
    // Generation date on the right
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })}`, 170, yPos);

    // Generate PDF blob
    console.log('Generating PDF blob...');
    const pdfBlob = doc.output("blob");
    console.log('PDF blob created successfully, size:', pdfBlob.size, 'bytes');
    
    // Create a clean, professional filename
    const cleanName = userFullName.replace(/[^a-zA-Z0-9]/g, '_');
    const suffix = options.includeEarnings ? 'Full' : 'Hours_Only';
    const fileName = `timesheet_${cleanName}_${suffix}_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.pdf`;
    console.log('Returning PDF data:', { fileName, blobSize: pdfBlob.size });
    
    return { blob: pdfBlob, fileName };
  } catch (error) {
    console.error('Detailed PDF generation error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

export const exportTimeEntriesToCsv = (timeEntries, user, startDate, endDate) => {
  if (!timeEntries.length) return;

  const headers = [
    "Date", "Project", "Task", "Description", "Start Time", "End Time", "Break (min)", "Hours", "Extra Hours", "Earnings"
  ];

  const csvContent = [
    headers.join(","),
    ...timeEntries.map(entry => {
      const regularHours = parseFloat(entry.totalHours) || 0;
      const extraHours = parseFloat(entry.extraHours) || 0;
      const totalHours = regularHours + extraHours;
      const earnings = (totalHours * (user?.hourlyRate || 0)).toFixed(2);
      return [
        entry.date,
        `"${entry.project || 'N/A'}"`,
        `"${entry.task || 'N/A'}"`,
        `"${entry.description || 'N/A'}"`,
        entry.startTime,
        entry.endTime,
        entry.breakDuration,
        regularHours.toFixed(2),
        extraHours.toFixed(2),
        earnings
      ].join(",");
    })
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const csvFileName = `WorkTrack_Report_${startDate}_to_${endDate}.csv`;
  return { blob: blob, fileName: csvFileName };
};
