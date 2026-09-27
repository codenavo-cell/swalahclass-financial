import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TransactionsViewProps {
  onOpenAddModal: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onSelectStudent: (studentId: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onEditTransaction,
  onSelectStudent,
}) => {
  const { transactions, categories, students, profile, deleteTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        (tx.studentName && tx.studentName.toLowerCase().includes(q)) ||
        (tx.paidTo && tx.paidTo.toLowerCase().includes(q)) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(q)) ||
        String(tx.amount).includes(q);

      if (!matchesSearch) return false;

      // Type
      if (filterType !== 'all') {
        if (filterType === 'income_group') {
          if (!['income', 'contribution', 'collection'].includes(tx.type)) return false;
        } else if (filterType === 'expense_group') {
          if (!['expense', 'payment', 'refund'].includes(tx.type)) return false;
        } else if (tx.type !== filterType) {
          return false;
        }
      }

      // Category
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;

      // Student
      if (filterStudent !== 'all' && tx.studentId !== filterStudent) return false;

      // Payment method
      if (filterPaymentMethod !== 'all' && tx.paymentMethod !== filterPaymentMethod) return false;

      // Status
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;

      // Date Range
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      return true;
    });
  }, [
    transactions,
    searchQuery,
    filterType,
    filterCategory,
    filterStudent,
    filterPaymentMethod,
    filterStatus,
    startDate,
    endDate,
  ]);

  const exportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Student',
      'Paid To',
      'Payment Method',
      'Reference Number',
      'Status',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.time,
      tx.type,
      `"${tx.category}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.studentName || ''}"`,
      `"${tx.paidTo || ''}"`,
      tx.paymentMethod,
      `"${tx.referenceNumber || ''}"`,
      tx.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${profile.className}_Transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStudent('all');
    setFilterPaymentMethod('all');
    setFilterStatus('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    filterType !== 'all' ||
    filterCategory !== 'all' ||
    filterStudent !== 'all' ||
    filterPaymentMethod !== 'all' ||
    filterStatus !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-800" />
            <span>Class Financial Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete transaction records with zero-gap audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenAddModal('income')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Receive</span>
          </button>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, student, receipt #, or amount..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '• Active'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-2.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Options */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {/* Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Types</option>
                <option value="income_group">Money In (Income/Contrib)</option>
                <option value="expense_group">Money Out (Expense/Refund)</option>
                <option value="contribution">Contribution</option>
                <option value="expense">Expense</option>
                <option value="refund">Refund</option>
                <option value="advance">Advance</option>
                <option value="loan">Loan</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Student */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Student
              </label>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNumber} {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table & Mobile Card List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table view for desktop / tablet */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Student / Party</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive =
                    tx.type === 'income' || tx.type === 'contribution' || tx.type === 'collection';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{tx.id}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div>{tx.date}</div>
                        <div className="text-[10px] text-slate-400">{tx.time}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {tx.studentName ? (
                          <button
                            onClick={() => tx.studentId && onSelectStudent(tx.studentId)}
                            className="text-blue-700 font-semibold hover:underline"
                          >
                            {tx.studentName}
                          </button>
                        ) : (
                          <span className="text-slate-500 italic">{tx.paidTo || 'General Class'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-semibold uppercase text-[10px]">
                          {tx.paymentMethod}
                        </div>
                        {tx.referenceNumber && (
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                            {tx.referenceNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tx.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-black text-sm ${
                            isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : '-'}
                          {profile.currencySymbol}
                          {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(tx.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No transactions match your search.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isPositive =
                tx.type === 'income' || tx.type === 'contribution' || tx.type === 'collection';
              return (
                <div key={tx.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {tx.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          {tx.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{tx.description}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-base font-black ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {profile.currencySymbol}
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                    <div>
                      {tx.studentName ? (
                        <button
                          onClick={() => tx.studentId && onSelectStudent(tx.studentId)}
                          className="text-blue-700 font-semibold hover:underline"
                        >
                          {tx.studentName}
                        </button>
                      ) : (
                        <span>{tx.paidTo || 'Class General'}</span>
                      )}{' '}
                      • {tx.date}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 text-slate-400 hover:text-blue-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Transaction Entry"
          message={`Are you sure you want to permanently delete transaction ${deleteId}? This will automatically adjust the class balance and log an immutable audit record.`}
          confirmLabel="Delete Transaction"
          isDestructive={true}
          onConfirm={() => {
            deleteTransaction(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};
