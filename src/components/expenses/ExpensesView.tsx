import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingDown,
  Plus,
  Filter,
  Tag,
  Download,
  Receipt,
  PieChart,
  ShoppingBag,
  Trash2,
  Calendar,
  X,
  PlusCircle,
} from 'lucide-react';
import { AddTransactionModal } from '../transactions/AddTransactionModal';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    categories,
    profile,
    students,
    addCategory,
    removeCategory,
    deleteTransaction,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showManageCat, setShowManageCat] = useState(false);

  // Filter only expenses/refunds/payments
  const expensesList = useMemo(() => {
    return transactions.filter(
      (t) =>
        (t.type === 'expense' || t.type === 'payment' || t.type === 'refund') &&
        t.status !== 'cancelled',
    );
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expensesList;
    return expensesList.filter((e) => e.category === selectedCategory);
  }, [expensesList, selectedCategory]);

  const totalExpenseAmount = useMemo(() => {
    return expensesList.reduce((sum, e) => sum + e.amount, 0);
  }, [expensesList]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expensesList.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expensesList, totalExpenseAmount]);

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      addCategory(newCatInput.trim());
      setNewCatInput('');
    }
  };

  const exportExpenseCSV = () => {
    const headers = ['Voucher ID', 'Date', 'Category', 'Description', 'Paid To', 'Payment Method', 'Receipt Ref', 'Amount'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.date,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.paidTo || ''}"`,
      e.paymentMethod,
      `"${e.receiptRef || ''}"`,
      e.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${profile.className}_Expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-600" />
            <span>Class Expense Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit vouchers, invoices, vendor disbursements and category allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExpenseCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowManageCat(!showManageCat)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Class Outflow</p>
          <p className="text-2xl font-black text-rose-600 tracking-tight mt-1">
            {profile.currencySymbol}
            {totalExpenseAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{expensesList.length} recorded vouchers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Average Cost per Student</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            {profile.currencySymbol}
            {students.length > 0
              ? Math.round(totalExpenseAmount / students.length).toLocaleString()
              : 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Calculated across {students.length} students</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Top Expense Area</p>
          <p className="text-2xl font-black text-indigo-900 tracking-tight mt-1 truncate">
            {categoryBreakdown[0]?.name || 'N/A'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {profile.currencySymbol}
            {categoryBreakdown[0]?.amount.toLocaleString() || 0} ({categoryBreakdown[0]?.percent || 0}%)
          </p>
        </div>
      </div>

      {/* Custom Category Management Collapsible */}
      {showManageCat && (
        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Manage Custom Expense Categories
            </h3>
            <button onClick={() => setShowManageCat(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddCustomCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="e.g. Science Lab or Sports Equipment"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition"
            >
              Add Category
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(c)}
                  className="text-slate-400 hover:text-rose-600 transition"
                  title="Remove category"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Expense Allocation by Category</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{cat.name}</span>
                <span className="font-bold text-slate-900">
                  {profile.currencySymbol}
                  {cat.amount.toLocaleString()}{' '}
                  <span className="text-slate-400 font-normal">({cat.percent}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
            selectedCategory === 'all'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Expenses ({expensesList.length})
        </button>
        {categoryBreakdown.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat.name
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.name} ({profile.currencySymbol}{cat.amount.toLocaleString()})
          </button>
        ))}
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Voucher ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Paid To / Vendor</th>
                <th className="py-3 px-4">Method & Receipt</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No expense vouchers found in this category.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{exp.id}</td>
                    <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-700">{exp.paidTo || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="uppercase text-[10px] font-bold">{exp.paymentMethod}</span>
                      {exp.receiptRef && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Ref: {exp.receiptRef}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-rose-600 text-sm">
                        -{profile.currencySymbol}
                        {exp.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteTransaction(exp.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultType="expense"
      />
    </div>
  );
};
