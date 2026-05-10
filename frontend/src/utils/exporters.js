/**
 * Export Utilities
 * Handle PDF, Excel, CSV exports and email/print functionality
 */

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the CSV file
 * @param {Array} columns - Column configuration (optional)
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get column headers
    const headers = columns 
      ? columns.map(col => col.header || col.key)
      : Object.keys(data[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✅ CSV exported: ${filename}.csv`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Export data to Excel format (using simple table HTML)
 * Requires: File will be in .xlsx format when opened in Excel
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the Excel file
 * @param {String} sheetName - Name of the Excel sheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get column headers
    const headers = Object.keys(data[0]);

    // Create HTML table
    let html = `<table border="1">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>`;

    // Create blob with Excel MIME type
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✅ Excel exported: ${filename}.xls`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};

/**
 * Export data to PDF format (requires jsPDF library)
 * Installation: npm install jspdf
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the PDF file
 * @param {String} title - PDF title
 */
export const exportToPDF = async (data, filename = 'export', title = 'Report') => {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    const autoTable = await import('jspdf-autotable');

    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.fontSize = 16;
    doc.text(title, 14, 22);

    // Add date
    const date = new Date().toLocaleDateString();
    doc.fontSize = 10;
    doc.text(`Generated on: ${date}`, 14, 32);

    // Get headers
    const headers = Object.keys(data[0]);
    
    // Format data for table
    const tableData = data.map(row => 
      headers.map(header => row[header] || '')
    );

    // Add table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      margin: { top: 40 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
    console.log(`✅ PDF exported: ${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    console.warn('PDF export requires: npm install jspdf jspdf-autotable');
  }
};

/**
 * Send data via email (requires backend API)
 * @param {String} email - Recipient email
 * @param {Array} data - Data to send
 * @param {String} subject - Email subject
 * @param {String} format - Export format (csv, excel, pdf)
 */
export const sendViaEmail = async (email, data, subject = 'Report', format = 'csv') => {
  try {
    if (!email || !data) {
      console.warn('Email and data are required');
      return;
    }

    // In a real app, this would call a backend API endpoint
    // that handles email sending with attachments
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: email,
        subject,
        data,
        format,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log(`✅ Email sent to: ${email}`);
      return true;
    } else {
      console.error('Failed to send email');
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Print data in a formatted table
 * Opens print dialog with formatted table
 * @param {Array} data - Array of objects to print
 * @param {String} title - Print title
 */
export const printData = (data, title = 'Print Report') => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to print');
      return;
    }

    const headers = Object.keys(data[0]);
    
    // Create print window HTML
    const printWindow = window.open('', '', 'height=600,width=800');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #fff;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #0D6EFD;
            padding-bottom: 10px;
          }
          .date-info {
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #0D6EFD;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          @media print {
            body {
              margin: 0;
              padding: 10mm;
            }
            table {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="date-info">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);

    console.log(`✅ Print dialog opened for: ${title}`);
  } catch (error) {
    console.error('Error printing data:', error);
  }
};

/**
 * Generate a summary report with statistics
 * @param {Array} data - Array of objects
 * @param {String} title - Report title
 * @param {Object} stats - Statistics object
 * @returns {String} Formatted report string
 */
export const generateReport = (data, title = 'Report', stats = {}) => {
  try {
    const date = new Date().toLocaleString();
    const totalRecords = data.length;
    const summaryContent = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const report = `
╔════════════════════════════════════════════╗
║         ${title.toUpperCase().padEnd(38)}  ║
╚════════════════════════════════════════════╝

Generated: ${date}
Total Records: ${totalRecords}

SUMMARY STATISTICS:
${summaryContent}

DATA RECORDS:
${JSON.stringify(data, null, 2)}
    `;

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    return '';
  }
};

/**
 * Copy data to clipboard as formatted text
 * @param {Array} data - Array of objects to copy
 */
export const copyToClipboard = (data) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to copy');
      return false;
    }

    const headers = Object.keys(data[0]);
    
    // Create tab-separated values (TSV) for Excel compatibility
    let tsvContent = headers.join('\t') + '\n';
    data.forEach(row => {
      tsvContent += headers.map(h => row[h] || '').join('\t') + '\n';
    });

    // Copy to clipboard
    navigator.clipboard.writeText(tsvContent).then(() => {
      console.log('✅ Data copied to clipboard');
      return true;
    }).catch(() => {
      console.error('Failed to copy to clipboard');
      return false;
    });
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Export all formats at once (returns object with all data)
 * @param {Array} data - Data to export
 * @param {String} baseFilename - Base filename for exports
 * @returns {Object} Object with export functions
 */
export const exportAllFormats = (data, baseFilename = 'export') => {
  return {
    csv: () => exportToCSV(data, baseFilename),
    excel: () => exportToExcel(data, baseFilename),
    pdf: () => exportToPDF(data, baseFilename),
    print: () => printData(data, baseFilename),
    email: (email) => sendViaEmail(email, data),
    clipboard: () => copyToClipboard(data),
  };
};

export default {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  sendViaEmail,
  printData,
  generateReport,
  copyToClipboard,
  exportAllFormats,
};
