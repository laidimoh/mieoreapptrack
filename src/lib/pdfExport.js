import jsPDF from 'jspdf';
// Import autoTable directly to ensure it's bundled
import 'jspdf-autotable';

export const exportTimeEntriesToPdf = async (timeEntries, user, startDate, endDate) => {
  try {
    console.log('Starting PDF export with entries:', timeEntries.length);
    console.log('User data:', user);
    console.log('Date range:', startDate, 'to', endDate);
    
    if (!timeEntries || timeEntries.length === 0) {
      throw new Error('No time entries provided for PDF export');
    }

    // Create jsPDF instance - autoTable should be available via direct import
    const doc = new jsPDF();
    
    console.log('jsPDF instance created with autoTable plugin');
    console.log('doc.autoTable type:', typeof doc.autoTable);
    
    // If autoTable still not available, something is wrong with the build
    if (typeof doc.autoTable !== 'function') {
      console.error('autoTable method not available even with direct import');
      console.log('Available methods:', Object.getOwnPropertyNames(doc).filter(name => name.toLowerCase().includes('auto')));
      
      // Enhanced fallback with better formatting
      const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'WorkTrack User';
      const companyName = user?.companyName || 'WorkTrack Company';
      
      doc.setFontSize(18);
      doc.text(companyName, 20, 20);
      
      doc.setFontSize(14);
      doc.text('TIME ENTRY REPORT', 20, 35);
      
      doc.setFontSize(12);
      doc.text(`Worker: ${userFullName}`, 20, 50);
      doc.text(`Period: ${startDate} to ${endDate}`, 20, 60);
      doc.text(`Total Entries: ${timeEntries.length}`, 20, 70);
      
      let yPosition = 90;
      doc.setFontSize(10);
      timeEntries.forEach((entry, index) => {
        if (yPosition > 270) { // Start new page
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${entry.date}: ${entry.totalHours}h - ${entry.project || 'Work'}`, 20, yPosition);
        yPosition += 10;
      });
      
      const pdfBlob = doc.output("blob");
      const cleanName = userFullName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${cleanName}_TimeReport_${startDate}_to_${endDate}.pdf`;
      return { blob: pdfBlob, fileName };
    }

    // Set document properties
    const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'WorkTrack User';
    const userEmail = user?.email || 'No email provided';
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

    // Professional header design similar to the image
    // Company name at top
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, 105, 25, { align: 'center' });
    
    // Main title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Timesheet Report', 105, 35, { align: 'center' });
    
    // Employee information section
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Left column - Employee info
    doc.text('Employee:', 20, 50);
    doc.setFont(undefined, 'bold');
    doc.text(userFullName, 20, 58);
    
    // Right column - Period info
    doc.setFont(undefined, 'normal');
    doc.text('Period:', 140, 50);
    doc.setFont(undefined, 'bold');
    doc.text(periodText, 140, 58);
    
    // Company info
    doc.setFont(undefined, 'normal');
    doc.text('Company:', 20, 68);
    doc.setFont(undefined, 'bold');
    doc.text(companyName, 20, 76);

    // Table data with clean, professional structure focused on time tracking
    const tableColumn = ["Date", "Start Time", "End Time", "Break (min)", "Total Hours"];
    const tableRows = [];

    let totalHours = 0;
    let totalEarnings = 0;

    timeEntries.forEach((entry, index) => {
      try {
        console.log(`Processing entry ${index + 1}:`, entry);
        
        const hours = parseFloat(entry.totalHours) || 0;
        const hourlyRate = parseFloat(user?.hourlyRate) || 0;
        const earnings = hours * hourlyRate;
        
        // Format time display to be more prominent and clear
        const formatTime = (time) => {
          if (!time) return 'N/A';
          // If it's already in HH:MM format, return as is
          if (time.includes(':')) return time;
          // Otherwise format it properly
          return time;
        };
        
        const entryData = [
          entry.date || 'N/A',
          formatTime(entry.startTime) || 'N/A',
          formatTime(entry.endTime) || 'N/A',
          entry.breakDuration || '0',
          hours.toFixed(2)
        ];
        
        tableRows.push(entryData);
        totalHours += hours;
        totalEarnings += earnings;
      } catch (entryError) {
        console.error(`Error processing entry ${index + 1}:`, entryError);
        // Skip this entry but continue with others
      }
    });

    // Add table with professional styling
    console.log('Creating table with', tableRows.length, 'rows');
    
    if (tableRows.length === 0) {
      throw new Error('No valid entries to include in PDF');
    }
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90, // Start after the header information
      headStyles: { 
        fillColor: [41, 128, 185], // Professional blue similar to image
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 4, 
        overflow: 'linebreak',
        halign: 'center',
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' }, // Date - wider for better readability
        1: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }, // Start Time - bold for prominence  
        2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }, // End Time - bold for prominence
        3: { cellWidth: 25, halign: 'center' }, // Break
        4: { cellWidth: 35, halign: 'center' }  // Total Hours
      },
      margin: { top: 10, right: 20, bottom: 10, left: 20 },
      alternateRowStyles: { fillColor: [248, 249, 250] }, // Very light gray for alternate rows
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5,
    });

    // Add clean summary section at the bottom
    let finalY = 100; // Default fallback
    try {
      // Get the final Y position after the table
      finalY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 100;
    } catch (yError) {
      console.warn('Could not get table finalY, using default:', yError);
    }
    
    // Add some space
    finalY += 20;
    
    const currency = user?.currency || 'USD';
    const hourlyRate = parseFloat(user?.hourlyRate) || 0;
    
    // Professional summary with hours and earnings
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Hours: ${totalHours.toFixed(2)}h`, 105, finalY, { align: 'center' });
    
    if (hourlyRate > 0) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Rate: ${currency} ${hourlyRate.toFixed(2)}/hour`, 105, finalY + 12, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Earnings: ${currency} ${totalEarnings.toFixed(2)}`, 105, finalY + 24, { align: 'center' });
    }
    
    // Add a simple footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    const footerY = finalY + (hourlyRate > 0 ? 40 : 25);
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
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
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
