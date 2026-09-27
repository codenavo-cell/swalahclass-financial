import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Wallet,
  Clock,
  School,
  CheckCircle,
  FileText,
  Filter,
  Search,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { Transaction, Student, ContributionCampaign } from '../../types';
import { generateOfficialPDF } from '../../utils/pdfExport';
import { exportToExcelCSV } from '../../utils/excelExport';

export type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'student_report'
  | 'expense_report'
  | 'contribution_report'
  | 'pending_payments'
  | 'complete_statement';

export const ReportsView: React.FC = () => {
  const { profile, transactions, students, campaigns, dashboardSummary, getStudentSummary } =
    useFinance();

  // Active Report
  const [activeReportTab, setActiveReportTab] = useState<ReportType>('complete_statement');

  // Filter States
  const [dateRange, setDateRange] = useState<
    'today' | 'this_week' | 'this_month' | 'academic_year' | 'custom'
  >('academic_year');
  const [customStart, setCustomStart] = useState<string>('2026-01-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-12-31');

  // Specific Day / Month selectors
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Additional Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTxType, setSelectedTxType] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Modals & UI States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const reportTabs: { id: ReportType; label: string; desc: string }[] = [
    { id: 'daily', label: 'Daily Report', desc: "Today's audited cash flow & time-ordered entries" },
    { id: 'weekly', label: 'Weekly Report', desc: '7-day comparative analysis & day-by-day trend' },
    { id: 'monthly', label: 'Monthly Report', desc: 'Month run-rate, collection targets & spending' },
    { id: 'student_report', label: 'Student Report', desc: 'Roster contribution quotas, payments & dues' },
    { id: 'expense_report', label: 'Expense Report', desc: 'Category expenditures, vendors & payment modes' },
    { id: 'contribution_report', label: 'Contribution Report', desc: 'Campaign drives, targets & student progress' },
    { id: 'pending_payments', label: 'Pending Payments', desc: 'Outstanding dues, overdue amounts & action reminders' },
    { id: 'complete_statement', label: 'Complete Financial Statement', desc: 'Institutional audit sheet & general balance' },
  ];

  // Unique Categories from transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // General Filtered Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // 1. Date filter
      if (activeReportTab === 'daily') {
        if (tx.date !== selectedDay) return false;
      } else if (activeReportTab === 'monthly') {
        const d = new Date(tx.date);
        if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;
      } else {
        if (dateRange === 'today' && tx.date !== todayStr) return false;
        if (dateRange === 'this_week') {
          const d = new Date(tx.date);
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (d < weekAgo || d > now) return false;
        }
        if (dateRange === 'this_month') {
          const d = new Date(tx.date);
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        }
        if (dateRange === 'custom') {
          if (customStart && tx.date < customStart) return false;
          if (customEnd && tx.date > customEnd) return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // 3. Type filter
      if (selectedTxType !== 'all') {
        if (selectedTxType === 'income_types') {
          if (!['income', 'contribution', 'collection'].includes(tx.type)) return false;
        } else if (selectedTxType === 'expense_types') {
          if (!['expense', 'payment', 'refund', 'advance', 'loan'].includes(tx.type)) return false;
        } else if (tx.type !== selectedTxType) {
          return false;
        }
      }

      // 4. Student filter
      if (selectedStudentId !== 'all' && tx.studentId !== selectedStudentId) return false;

      // 5. Payment method
      if (selectedPaymentMethod !== 'all' && tx.paymentMethod !== selectedPaymentMethod) return false;

      // 6. Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;

      return true;
    });
  }, [
    transactions,
    activeReportTab,
    selectedDay,
    selectedMonth,
    selectedYear,
    dateRange,
    customStart,
    customEnd,
    selectedCategory,
    selectedTxType,
    selectedStudentId,
    selectedPaymentMethod,
    selectedStatus,
  ]);

  // Aggregate stats for filtered transactions
  const reportStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let pending = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'cancelled') return;
      if (tx.status === 'pending') {
        pending += tx.amount;
        return;
      }
      if (['income', 'contribution', 'collection'].includes(tx.type)) {
        income += tx.amount;
      } else if (['expense', 'payment', 'refund', 'advance', 'loan'].includes(tx.type)) {
        expense += tx.amount;
      }
    });

    const net = income - expense;
    return { income, expense, pending, net, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Category breakdown for Expense / Income reporting
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.status === 'cancelled') return;
      const cat = tx.category || 'Uncategorized';
      if (!map[cat]) map[cat] = { income: 0, expense: 0, count: 0 };
      map[cat].count += 1;
      if (['income', 'contribution', 'collection'].includes(tx.type)) {
        map[cat].income += tx.amount;
      } else if (['expense', 'payment', 'refund', 'advance', 'loan'].includes(tx.type)) {
        map[cat].expense += tx.amount;
      }
    });
    return Object.entries(map).sort((a, b) => b[1].expense - a[1].expense || b[1].income - a[1].income);
  }, [filteredTransactions]);

  // Student Roster Calculations for Student Report
  const studentReportData = useMemo(() => {
    return students
      .filter((s) => {
        if (!studentSearch) return true;
        const q = studentSearch.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.rollNumber.toString().includes(q)
        );
      })
      .map((student) => {
        const summary = getStudentSummary(student.id);
        const studentTxList = transactions.filter((t) => t.studentId === student.id);
        const requiredTarget = campaigns.reduce((acc, c) => acc + (c.perStudentAmount || 0), 0);
        return {
          student,
          summary,
          txCount: studentTxList.length,
          requiredTarget,
          statusText:
            summary.totalPending === 0
              ? 'Paid'
              : summary.totalPaid > 0
              ? 'Partial'
              : 'Pending',
        };
      });
  }, [students, studentSearch, getStudentSummary, transactions, campaigns]);

  // Weekly day-by-day distribution (last 7 days or current week)
  const weeklyDayDistribution = useMemo(() => {
    const days: { label: string; dateStr: string; income: number; expense: number }[] = [];
    const baseDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push({ label, dateStr, income: 0, expense: 0 });
    }

    filteredTransactions.forEach((tx) => {
      if (tx.status === 'cancelled') return;
      const match = days.find((day) => day.dateStr === tx.date);
      if (match) {
        if (['income', 'contribution', 'collection'].includes(tx.type)) {
          match.income += tx.amount;
        } else if (['expense', 'payment', 'refund'].includes(tx.type)) {
          match.expense += tx.amount;
        }
      }
    });

    return days;
  }, [filteredTransactions]);

  // PDF Export Trigger
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const activeTabObj = reportTabs.find((t) => t.id === activeReportTab);
      const title = activeTabObj ? activeTabObj.label : 'Class Financial Audit Report';

      let dateRangeText = `Academic Year ${profile.academicYear}`;
      if (activeReportTab === 'daily') dateRangeText = `Date: ${selectedDay}`;
      else if (activeReportTab === 'monthly') {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ];
        dateRangeText = `Month: ${monthNames[selectedMonth]} ${selectedYear}`;
      } else if (dateRange === 'custom') {
        dateRangeText = `${customStart} to ${customEnd}`;
      } else if (dateRange === 'today') {
        dateRangeText = 'Today';
      } else if (dateRange === 'this_week') {
        dateRangeText = 'Past 7 Days';
      } else if (dateRange === 'this_month') {
        dateRangeText = 'Current Month';
      }

      if (activeReportTab === 'student_report') {
        const headers = ['Roll #', 'Student Name', 'Reg No', 'Required', 'Paid', 'Pending', 'Status'];
        const extraRows = studentReportData.map((item) => [
          item.student.rollNumber,
          item.student.fullName,
          item.student.registrationNumber || '-',
          `${profile.currencySymbol} ${item.requiredTarget.toLocaleString()}`,
          `${profile.currencySymbol} ${item.summary.totalPaid.toLocaleString()}`,
          `${profile.currencySymbol} ${item.summary.totalPending.toLocaleString()}`,
          item.statusText.toUpperCase(),
        ]);

        generateOfficialPDF({
          profile,
          title,
          dateRangeText,
          summary: {
            totalReceived: reportStats.income,
            totalSpent: reportStats.expense,
            currentBalance: dashboardSummary.totalBalance,
            totalPending: dashboardSummary.totalPending,
          },
          reportType: 'student_report',
          headers,
          extraRows,
        });
      } else if (activeReportTab === 'contribution_report') {
        const headers = ['Campaign Title', 'Per Student', 'Target Amount', 'Collected', 'Due Date', 'Status'];
        const extraRows = campaigns.map((c) => {
          const collected = transactions
            .filter((t) => t.campaignId === c.id && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
          return [
            c.title,
            `${profile.currencySymbol} ${c.perStudentAmount.toLocaleString()}`,
            `${profile.currencySymbol} ${c.requiredTotalAmount.toLocaleString()}`,
            `${profile.currencySymbol} ${collected.toLocaleString()}`,
            c.dueDate,
            c.status.toUpperCase(),
          ];
        });

        generateOfficialPDF({
          profile,
          title,
          dateRangeText,
          summary: {
            totalReceived: reportStats.income,
            totalSpent: reportStats.expense,
            currentBalance: dashboardSummary.totalBalance,
            totalPending: dashboardSummary.totalPending,
          },
          reportType: 'contribution_report',
          headers,
          extraRows,
        });
      } else {
        generateOfficialPDF({
          profile,
          title,
          dateRangeText,
          summary: {
            totalReceived: reportStats.income,
            totalSpent: reportStats.expense,
            currentBalance: dashboardSummary.totalBalance,
            totalPending: dashboardSummary.totalPending,
          },
          transactions: filteredTransactions,
          reportType: activeReportTab,
        });
      }

      setExportNotice('PDF document generated and downloaded successfully.');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setExportNotice('Failed to generate PDF. You can also use the print preview button.');
      setTimeout(() => setExportNotice(null), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // CSV / Excel Export Trigger
  const handleExportCSV = () => {
    const filename = `Class_${profile.className}_${activeReportTab}_${new Date().toISOString().slice(0, 10)}`;

    if (activeReportTab === 'student_report') {
      const headers = [
        'Roll Number',
        'Student Name',
        'Student Number',
        'Registration Number',
        'Phone',
        'Required Contribution',
        'Total Paid',
        'Pending Dues',
        'Status',
      ];
      const rows = studentReportData.map((item) => [
        item.student.rollNumber,
        item.student.fullName,
        item.student.studentNumber,
        item.student.registrationNumber || '',
        item.student.phone || '',
        item.requiredTarget,
        item.summary.totalPaid,
        item.summary.totalPending,
        item.statusText,
      ]);
      exportToExcelCSV(filename, headers, rows);
    } else if (activeReportTab === 'contribution_report') {
      const headers = ['Campaign ID', 'Title', 'Target Amount', 'Per Student', 'Collected Amount', 'Due Date', 'Status'];
      const rows = campaigns.map((c) => {
        const collected = transactions
          .filter((t) => t.campaignId === c.id && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        return [c.id, c.title, c.requiredTotalAmount, c.perStudentAmount, collected, c.dueDate, c.status];
      });
      exportToExcelCSV(filename, headers, rows);
    } else {
      const headers = [
        'Transaction ID',
        'Date',
        'Time',
        'Type',
        'Category',
        'Description',
        'Amount',
        'Student / Member',
        'Paid To',
        'Payment Method',
        'Reference Number',
        'Status',
        'Created By',
      ];
      const rows = filteredTransactions.map((t) => [
        t.id,
        t.date,
        t.time || '',
        t.type,
        t.category,
        t.description,
        t.amount,
        t.studentName || '',
        t.paidTo || '',
        t.paymentMethod,
        t.referenceNumber || '',
        t.status,
        t.createdBy,
      ]);
      exportToExcelCSV(filename, headers, rows);
    }

    setExportNotice('Excel/CSV export generated successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-900" />
            <span>Class Financial Statements & Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready financial reports, interactive charts, PDF downloads and CSV/Excel exports
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-200" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Print Preview / Institutional Sheet"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export notification banner */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 8 Primary Report Selection Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {reportTabs.map((tab, idx) => {
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer text-left flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Contextual Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-900" />
              <span>Scope:</span>
            </span>

            {/* If Daily Report, show Day Selector */}
            {activeReportTab === 'daily' ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
                <button
                  onClick={() => setSelectedDay(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-[11px]"
                >
                  Today
                </button>
              </div>
            ) : activeReportTab === 'monthly' ? (
              /* If Monthly Report, show Month/Year Selector */
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December',
                  ].map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            ) : (
              /* General Date Range Options */
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'academic_year', label: `Session (${profile.academicYear})` },
                  { id: 'custom', label: 'Custom Range' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDateRange(p.id as any)}
                    className={`px-3 py-1 rounded-xl font-semibold transition ${
                      dateRange === p.id
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Payment Method */}
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 uppercase"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && activeReportTab !== 'daily' && activeReportTab !== 'monthly' && (
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Inflow (Received)</span>
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {profile.currencySymbol} {reportStats.income.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Collections & Contributions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Outflow (Expenses)</span>
          </p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {profile.currencySymbol} {reportStats.expense.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Program & Operational costs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-blue-900" />
            <span>Net Operating Balance</span>
          </p>
          <p
            className={`text-xl sm:text-2xl font-black mt-1 ${
              reportStats.net >= 0 ? 'text-blue-900' : 'text-amber-600'
            }`}
          >
            {profile.currencySymbol} {reportStats.net.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Retained class reserves</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Receivables</span>
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {profile.currencySymbol} {dashboardSummary.totalPending.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Outstanding from 30 students</p>
        </div>
      </div>

      {/* VIEW 1: DAILY REPORT */}
      {activeReportTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Daily Audited Activity: {selectedDay}
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed timeline of receipts, expenses and cash receipts recorded on this date
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-900 rounded-full">
                {filteredTransactions.length} entries today
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No financial transactions were recorded on {selectedDay}. Select another date above.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          ['income', 'contribution', 'collection'].includes(tx.type)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {['income', 'contribution', 'collection'].includes(tx.type) ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{tx.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {tx.time || '10:00 AM'} • {tx.category} • {tx.studentName || tx.paidTo || 'Class Fund'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black text-sm ${
                          ['income', 'contribution', 'collection'].includes(tx.type)
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {['income', 'contribution', 'collection'].includes(tx.type) ? '+' : '-'}
                        {profile.currencySymbol}
                        {tx.amount.toLocaleString()}
                      </p>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY REPORT */}
      {activeReportTab === 'weekly' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">7-Day Financial Flow Chart</h3>
            <p className="text-xs text-slate-500">
              Comparative view of income vs expenses across the past 7 days
            </p>
          </div>

          {/* SVG Comparative Bars */}
          <div className="grid grid-cols-7 gap-2 items-end h-48 pt-6 border-b border-slate-100">
            {weeklyDayDistribution.map((d) => {
              const maxVal = Math.max(
                ...weeklyDayDistribution.map((x) => Math.max(x.income, x.expense)),
                1000
              );
              const incomeHeight = (d.income / maxVal) * 100;
              const expenseHeight = (d.expense / maxVal) * 100;

              return (
                <div key={d.dateStr} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 h-36 w-full justify-center">
                    {/* Income bar */}
                    <div
                      title={`Income: ${profile.currencySymbol}${d.income}`}
                      className="w-3 sm:w-5 bg-emerald-500 rounded-t-md transition-all duration-300"
                      style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                    />
                    {/* Expense bar */}
                    <div
                      title={`Expense: ${profile.currencySymbol}${d.expense}`}
                      className="w-3 sm:w-5 bg-rose-500 rounded-t-md transition-all duration-300"
                      style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Collections
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Expenditures
            </span>
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY REPORT */}
      {activeReportTab === 'monthly' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Monthly Breakdown: {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
              </h3>
              <p className="text-xs text-slate-500">
                Monthly aggregate run rate, spending distribution and balance
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900">
              {filteredTransactions.length} transactions
            </span>
          </div>

          {/* Month Distribution by Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Category Spending in Selected Month</h4>
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No transactions in this month.</p>
            ) : (
              categoryBreakdown.map(([cat, val]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-bold">{cat}</span>
                    <span className="text-slate-500">
                      Spent: <strong className="text-rose-600">{profile.currencySymbol}{val.expense.toLocaleString()}</strong> | Received: <strong className="text-emerald-600">{profile.currencySymbol}{val.income.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-900 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (val.expense / (reportStats.expense || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: STUDENT REPORT */}
      {activeReportTab === 'student_report' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Student Contribution & Ledger Report</h3>
              <p className="text-xs text-slate-500">
                Individual student payments, required quota, pending balances and standing
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, roll #..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Roll #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Reg No</th>
                  <th className="py-2.5 px-3 text-right">Required Target</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Pending</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReportData.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {item.student.rollNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.student.fullName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {item.student.registrationNumber || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                      {profile.currencySymbol} {item.requiredTarget.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      {profile.currencySymbol} {item.summary.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                      {profile.currencySymbol} {item.summary.totalPending.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.statusText === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.statusText === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: EXPENSE REPORT */}
      {activeReportTab === 'expense_report' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Categorical Expenditure Analysis</h3>
            <p className="text-xs text-slate-500">
              Breakdown of funds spent on food, travel, programs, logistics and supplies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              {categoryBreakdown
                .filter(([, v]) => v.expense > 0)
                .map(([cat, v]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cat}</span>
                      <span className="text-rose-600 font-mono">
                        {profile.currencySymbol} {v.expense.toLocaleString()} (
                        {Math.round((v.expense / (reportStats.expense || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (v.expense / (reportStats.expense || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 uppercase">Expense Summary</h4>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total Disbursements:</span>
                <span className="font-black text-rose-600">
                  {profile.currencySymbol} {reportStats.expense.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Recorded Invoices/Bills:</span>
                <span className="font-bold text-slate-900">
                  {filteredTransactions.filter((t) => ['expense', 'payment'].includes(t.type)).length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Average Expense:</span>
                <span className="font-bold text-slate-900">
                  {profile.currencySymbol}{' '}
                  {Math.round(
                    reportStats.expense /
                      Math.max(
                        1,
                        filteredTransactions.filter((t) => ['expense', 'payment'].includes(t.type)).length
                      )
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: CONTRIBUTION REPORT */}
      {activeReportTab === 'contribution_report' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const collected = transactions
                .filter((t) => t.campaignId === camp.id && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0);
              const progressPct = Math.min(
                100,
                Math.round((collected / (camp.requiredTotalAmount || 1)) * 100)
              );

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{camp.title}</h4>
                      <p className="text-[11px] text-slate-500">{camp.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-900">
                      {camp.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progress: {progressPct}%</span>
                      <span className="text-slate-800">
                        {profile.currencySymbol} {collected.toLocaleString()} / {profile.currencySymbol}{' '}
                        {camp.requiredTotalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                    <span>Due Date: <strong>{camp.dueDate}</strong></span>
                    <span>Quota: <strong>{profile.currencySymbol}{camp.perStudentAmount}/student</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 7: PENDING PAYMENTS REPORT */}
      {activeReportTab === 'pending_payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Outstanding Dues & Overdue Ledger</h3>
              <p className="text-xs text-slate-500">
                Actionable view of students with unpaid contributions and contact links
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Total Outstanding: {profile.currencySymbol} {dashboardSummary.totalPending.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Roll #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Parent / Contact</th>
                  <th className="py-2.5 px-3 text-right">Pending Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentReportData
                  .filter((s) => s.summary.totalPending > 0)
                  .map((item) => {
                    const student = item.student;
                    const msg = encodeURIComponent(
                      `Assalamu alaikkum ${student.fullName}. This is a friendly reminder from Class ${profile.className} Finance Committee. Your pending contribution balance is ${profile.currencySymbol}${item.summary.totalPending}. Kindly settle it before the upcoming program.`
                    );
                    const whatsappUrl = `https://wa.me/?text=${msg}`;
                    const emailUrl = `mailto:${student.email || ''}?subject=${encodeURIComponent(
                      `Pending Fee Reminder - Class ${profile.className}`
                    )}&body=${msg}`;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          {student.rollNumber}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {student.phone || student.parentContact || 'Contact not listed'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-600">
                          {profile.currencySymbol} {item.summary.totalPending.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={emailUrl}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 transition"
                              title="Send Email Reminder"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 8: COMPLETE FINANCIAL STATEMENT & AUDITED LEDGER TABLE */}
      {activeReportTab === 'complete_statement' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Audited Ledger & Transactions ({filteredTransactions.length} items)
              </h3>
              <p className="text-xs text-slate-500">
                Full chronological ledger sheet matching institutional balance standards
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-900">
              Balanced: 0.00
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">TXN #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Student / Member</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No transactions recorded under the chosen scope and filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isPositive = ['income', 'contribution', 'collection'].includes(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{tx.id}</td>
                        <td className="py-2.5 px-3 text-slate-500">{tx.date}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-600">
                          {tx.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{tx.category}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{tx.description}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {tx.studentName || tx.paidTo || 'Class Fund'}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black">
                          <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                            {isPositive ? '+' : '-'} {profile.currencySymbol} {tx.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Formatted Printable PDF Modal with Full Institutional Sheet */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsPrintModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-sm">Official Institutional Statement Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save as PDF File</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Printable Sheet */}
            <div className="p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 space-y-6 printable-report">
              {/* Institution Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
                <div className="inline-block p-2 rounded-xl bg-blue-900 text-white mb-1">
                  <School className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                  {profile.institutionName}
                </h1>
                <h2 className="text-base font-bold text-slate-700">
                  Class {profile.className} • Financial Management Committee
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Academic Session: {profile.academicYear} • Batch: {profile.batch}
                </p>
                <div className="pt-2 text-xs font-extrabold text-blue-900 uppercase tracking-widest">
                  ★ Official Class Financial Audit Statement ★
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p><strong>Class Teacher:</strong> {profile.classTeacher}</p>
                  <p><strong>Total Students:</strong> {students.length}</p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Report:</strong>{' '}
                    {reportTabs.find((t) => t.id === activeReportTab)?.label}
                  </p>
                  <p><strong>Generated On:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Currency:</strong> Indian Rupee ({profile.currencySymbol})</p>
                </div>
              </div>

              {/* Financial Summary 4 Boxes */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl border border-slate-300 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Received</p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">
                    {profile.currencySymbol} {reportStats.income.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-300 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Spent</p>
                  <p className="text-base font-black text-rose-700 mt-0.5">
                    {profile.currencySymbol} {reportStats.expense.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-300 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Current Balance</p>
                  <p className="text-base font-black text-blue-900 mt-0.5">
                    {profile.currencySymbol} {dashboardSummary.totalBalance.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-300 bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Pending Amount</p>
                  <p className="text-base font-black text-amber-700 mt-0.5">
                    {profile.currencySymbol} {dashboardSummary.totalPending.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[9px]">
                      <th className="p-2">TXN</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Student/Party</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransactions.slice(0, 30).map((t) => (
                      <tr key={t.id}>
                        <td className="p-2 font-mono">{t.id}</td>
                        <td className="p-2 text-slate-500">{t.date}</td>
                        <td className="p-2 font-medium">{t.description}</td>
                        <td className="p-2">{t.studentName || t.paidTo || 'Class General'}</td>
                        <td className="p-2 text-right font-bold">
                          {profile.currencySymbol} {t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Signatures Block */}
              <div className="pt-8 border-t border-slate-300 flex justify-around items-end text-xs">
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Class Teacher</p>
                  <p className="text-[10px] text-slate-500">{profile.classTeacher}</p>
                </div>

                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Official Class Seal</p>
                  <p className="text-[10px] text-slate-500">Class Finance Administrator</p>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4">
                Generated by Class Finance Admin • Noorul Huda Islamic Academy • All rights reserved
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
