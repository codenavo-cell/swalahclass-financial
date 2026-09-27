import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClassProfile, Transaction, Student } from '../types';

interface PDFExportOptions {
  profile: ClassProfile;
  title: string;
  dateRangeText: string;
  summary: {
    totalReceived: number;
    totalSpent: number;
    currentBalance: number;
    totalPending: number;
  };
  transactions?: Transaction[];
  students?: Student[];
  reportType?: string;
  extraRows?: (string | number)[][];
  headers?: string[];
}

export const generateOfficialPDF = ({
  profile,
  title,
  dateRangeText,
  summary,
  transactions = [],
  students = [],
  reportType = 'financial_statement',
  extraRows,
  headers,
}: PDFExportOptions): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currencySymbol = profile.currencySymbol || 'Rs.';
  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Colors
  const navy = [15, 23, 42]; // #0f172a
  const primaryBlue = [30, 58, 138]; // #1e3a8a
  const emerald = [5, 150, 105]; // #059669
  const rose = [225, 29, 72]; // #e11d48
  const amber = [217, 119, 6]; // #d97706

  // 1. Institution Header Banner
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(profile.institutionName.toUpperCase(), pageWidth / 2, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    `Class ${profile.className} • Batch: ${profile.batch} • Academic Year: ${profile.academicYear}`,
    pageWidth / 2,
    18,
    { align: 'center' }
  );

  doc.setFontSize(8);
  doc.text(
    'OFFICIAL CLASS FINANCIAL MANAGEMENT COMMITTEE AUDIT STATEMENT',
    pageWidth / 2,
    24,
    { align: 'center' }
  );

  // 2. Report Meta Info Box
  let y = 34;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  y += 5;
  doc.text(`Period Scope: ${dateRangeText}  |  Generated On: ${new Date().toLocaleString()}`, 14, y);
  y += 5;
  doc.text(`Class Teacher: ${profile.classTeacher}`, 14, y);

  // 3. Summary KPI Blocks
  y += 4;
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const boxHeight = 16;
  const startX = 14;

  const kpis = [
    { label: 'TOTAL RECEIVED', val: `${currencySymbol} ${summary.totalReceived.toLocaleString()}`, color: emerald },
    { label: 'TOTAL SPENT', val: `${currencySymbol} ${summary.totalSpent.toLocaleString()}`, color: rose },
    { label: 'CURRENT BALANCE', val: `${currencySymbol} ${summary.currentBalance.toLocaleString()}`, color: primaryBlue },
    { label: 'TOTAL PENDING', val: `${currencySymbol} ${summary.totalPending.toLocaleString()}`, color: amber },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (boxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + boxWidth / 2, y + 5, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, x + boxWidth / 2, y + 12, { align: 'center' });
  });

  y += boxHeight + 6;

  // 4. Data Table
  let tableHeaders: string[] = [];
  let tableData: (string | number)[][] = [];

  if (extraRows && headers) {
    tableHeaders = headers;
    tableData = extraRows;
  } else if (reportType === 'student_report' && students.length > 0) {
    tableHeaders = ['Roll', 'Student Name', 'Reg No', 'Total Paid', 'Pending', 'Status'];
    tableData = students.map((s) => {
      // Calculate from student transactions if passed
      return [
        s.rollNumber,
        s.fullName,
        s.registrationNumber || '-',
        `${currencySymbol} -`,
        `${currencySymbol} -`,
        s.status.toUpperCase(),
      ];
    });
  } else {
    tableHeaders = ['TXN #', 'Date', 'Type', 'Category', 'Description', 'Student/Member', 'Amount', 'Status'];
    tableData = transactions.map((t) => [
      t.id,
      t.date,
      t.type.toUpperCase(),
      t.category,
      t.description.length > 28 ? t.description.substring(0, 26) + '...' : t.description,
      t.studentName || t.paidTo || 'Class Fund',
      `${t.type === 'expense' ? '-' : '+'}${currencySymbol} ${t.amount.toLocaleString()}`,
      t.status.toUpperCase(),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Add Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Class Finance • ${profile.className} (${profile.batch}) • Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Final Signatures block at the end
  const finalY = (doc as any).lastAutoTable.finalY + 14;
  const pageHeight = doc.internal.pageSize.getHeight();

  // If there's enough space, draw on same page, else add page
  let sigY = finalY;
  if (sigY + 25 > pageHeight - 15) {
    doc.addPage();
    sigY = 30;
  }

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const sigColWidth = (pageWidth - 28) / 2;

  // Signatory 1: Class Teacher
  const sig1X = 14;
  doc.line(sig1X, sigY, sig1X + sigColWidth - 14, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Teacher', sig1X + (sigColWidth - 14) / 2, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(profile.classTeacher, sig1X + (sigColWidth - 14) / 2, sigY + 8, { align: 'center' });

  // Signatory 2: Administrator / Seal
  const sig2X = 14 + sigColWidth;
  doc.line(sig2X, sigY, sig2X + sigColWidth - 14, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Finance Admin (Seal)', sig2X + (sigColWidth - 14) / 2, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Verified & Audited', sig2X + (sigColWidth - 14) / 2, sigY + 8, { align: 'center' });

  // Save the PDF
  const cleanName = `${profile.className}_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(cleanName);
};
