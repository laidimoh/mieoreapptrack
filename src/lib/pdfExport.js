import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportTimeEntriesToPdf = async (timeEntries, user, startDate, endDate) => {
  try {
    console.log('Starting PDF export with entries:', timeEntries.length);
    console.log('User data:', user);
    console.log('Date range:', startDate, 'to', endDate);
    
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

    // Professional header design
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Timesheet Report', 105, 35, { align: 'center' });
    
    // Employee information section
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    doc.text('Employee:', 20, 50);
    doc.setFont(undefined, 'bold');
    doc.text(userFullName, 20, 58);
    
    doc.setFont(undefined, 'normal');
    doc.text('Period:', 140, 50);
    doc.setFont(undefined, 'bold');
    doc.text(periodText, 140, 58);
    
    // Create manual table with clean design
    let yPos = 80;
    
    // Table header
    doc.setFillColor(41, 128, 185); // Professional blue
    doc.rect(20, yPos, 170, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    
    // Header columns
    doc.text('Date', 25, yPos + 7);
    doc.text('Start Time', 55, yPos + 7);
    doc.text('End Time', 85, yPos + 7);
    doc.text('Break', 115, yPos + 7);
    doc.text('Total Hours', 145, yPos + 7);
    
    yPos += 10;
    
    // Table data
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    let totalHours = 0;
    let totalEarnings = 0;
    const hourlyRate = parseFloat(user?.hourlyRate) || 0;
    
    timeEntries.forEach((entry, index) => {
      const hours = parseFloat(entry.totalHours) || 0;
      totalHours += hours;
      totalEarnings += hours * hourlyRate;
      
      // Alternate row colors
      if (index % 2 === 1) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos, 170, 8, 'F');
      }
      
      // Format time display
      const formatTime = (time) => {
        if (!time || time === 'N/A') return 'N/A';
        return time.toString();
      };
      
      // Row data
      doc.text(entry.date || 'N/A', 25, yPos + 6);
      doc.text(formatTime(entry.startTime), 55, yPos + 6);
      doc.text(formatTime(entry.endTime), 85, yPos + 6);
      doc.text((entry.breakDuration || '0') + ' min', 115, yPos + 6);
      doc.text(hours.toFixed(2) + 'h', 145, yPos + 6);
      
      yPos += 8;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Summary section
    yPos += 20;
    const currency = user?.currency || 'USD';
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Hours: ${totalHours.toFixed(2)}h`, 105, yPos, { align: 'center' });
    
    if (hourlyRate > 0) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Rate: ${currency} ${hourlyRate.toFixed(2)}/hour`, 105, yPos + 12, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Earnings: ${currency} ${totalEarnings.toFixed(2)}`, 105, yPos + 24, { align: 'center' });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const footerY = yPos + (hourlyRate > 0 ? 40 : 25);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })}`, 105, footerY, { align: 'center' });

    // Generate PDF blob
    console.log('Generating PDF blob...');
    const pdfBlob = doc.output("blob");
    console.log('PDF blob created successfully, size:', pdfBlob.size, 'bytes');
    
    // Create a clean, professional filename
    const cleanName = userFullName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `timesheet_${cleanName}_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.pdf`;
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
    "Date", "Project", "Task", "Description", "Start Time", "End Time", "Break (min)", "Hours", "Earnings"
  ];

  const csvContent = [
    headers.join(","),
    ...timeEntries.map(entry => {
      const earnings = (entry.totalHours * (user?.hourlyRate || 0)).toFixed(2);
      return [
        entry.date,
        `"${entry.project || 'N/A'}"`,
        `"${entry.task || 'N/A'}"`,
        `"${entry.description || 'N/A'}"`,
        entry.startTime,
        entry.endTime,
        entry.breakDuration,
        entry.totalHours.toFixed(2),
        earnings
      ].join(",");
    })
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const csvFileName = `WorkTrack_Report_${startDate}_to_${endDate}.csv`;
  return { blob: blob, fileName: csvFileName };
};
