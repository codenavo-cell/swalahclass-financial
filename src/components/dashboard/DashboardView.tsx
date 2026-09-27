import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  TrendingUp,
  CreditCard,
  UserPlus,
  PiggyBank,
  BellRing,
  FileSpreadsheet,
  ChevronRight,
  Target,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Transaction } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAddTransaction: (defaultType?: 'income' | 'expense' | 'contribution') => void;
  onOpenAddStudent: () => void;
  onOpenAddCampaign: () => void;
  onOpenAddReminder: () => void;
  onSelectStudent: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddTransaction,
  onOpenAddStudent,
  onOpenAddCampaign,
  onOpenAddReminder,
  onSelectStudent,
}) => {
  const { dashboardSummary, profile, transactions, reminders, goals, students, campaigns } =
    useFinance();

  const recentTransactions = transactions.slice(0, 6);
  const activeReminders = reminders.filter((r) => r.status === 'active').slice(0, 4);

  const getTransactionBadge = (tx: Transaction) => {
    if (tx.status === 'pending') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending',
      };
    }
    switch (tx.type) {
      case 'income':
      case 'contribution':
      case 'collection':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Received',
        };
      case 'expense':
      case 'payment':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Spent',
        };
      case 'refund':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
          label: 'Refund',
        };
      case 'advance':
      case 'loan':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Advance',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Adjustment',
        };
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with Class Profile & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 border border-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                {profile.academicYear} Academic Session
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                {students.length} Enrolled Students
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Class {profile.className} Financial Hub
            </h2>
            <p className="text-sm text-blue-200 mt-1 max-w-xl">
              Teacher: <span className="font-semibold text-white">{profile.classTeacher}</span>
            </p>
          </div>

          {/* Prominent Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAddTransaction('income')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>+ Receive Money</span>
            </button>

            <button
              onClick={() => onOpenAddTransaction('expense')}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-950/20 flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Expense</span>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Student</span>
            </button>

            <button
              onClick={onOpenAddCampaign}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
            >
              <PiggyBank className="w-4 h-4" />
              <span>+ Contribution</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer border border-white/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 6 Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* 1. TOTAL BALANCE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-sm shadow-blue-50/50 relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Balance
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalBalance.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Available Class Fund
          </p>
        </div>

        {/* 2. TOTAL RECEIVED */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm shadow-emerald-50/50">
          <div className="flex items-center justify-between text-emerald-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Received
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalReceived.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Collections & Dues</p>
        </div>

        {/* 3. TOTAL EXPENSES */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-sm shadow-rose-50/50">
          <div className="flex items-center justify-between text-rose-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalExpenses.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Programs & Materials</p>
        </div>

        {/* 4. TOTAL PENDING */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-sm shadow-amber-50/50">
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pending
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalPending.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Awaiting Student Pay</p>
        </div>

        {/* 5. TOTAL TO RECEIVE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-sm shadow-indigo-50/50">
          <div className="flex items-center justify-between text-indigo-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total to Receive
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalToReceive.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Committed Targets</p>
        </div>

        {/* 6. TOTAL ADVANCE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm shadow-sky-50/50">
          <div className="flex items-center justify-between text-sky-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Advance
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-700 tracking-tight">
            {profile.currencySymbol}
            {dashboardSummary.totalAdvance.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Vendor/Student Advances</p>
        </div>
      </div>

      {/* Grid: Recent Transactions & Class Fund Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Real-time ledger updates</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No transactions recorded yet</p>
                <p className="text-xs text-slate-400">Use "+ Receive Money" or "+ Add Expense" to start.</p>
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const badge = getTransactionBadge(tx);
                const isPositive =
                  tx.type === 'income' || tx.type === 'contribution' || tx.type === 'collection';
                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {tx.description}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {tx.studentName ? (
                            <button
                              onClick={() => tx.studentId && onSelectStudent(tx.studentId)}
                              className="text-blue-700 font-semibold hover:underline"
                            >
                              {tx.studentName}
                            </button>
                          ) : (
                            tx.paidTo || tx.category
                          )}{' '}
                          • {tx.paymentMethod.toUpperCase()} • {tx.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-extrabold ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {profile.currencySymbol}
                        {tx.amount.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">{tx.id}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Class Fund Goals & Active Reminders */}
        <div className="space-y-6">
          {/* Class Fund Goals */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Class Fund Targets</h3>
              </div>
              <button
                onClick={() => onNavigate('contributions')}
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4 mt-3">
              {goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 truncate mr-2">{g.title}</span>
                      <span className="font-mono font-bold text-blue-800">{percent}%</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                      <span>
                        {profile.currencySymbol}
                        {g.currentAmount.toLocaleString()} collected
                      </span>
                      <span className="font-medium text-slate-700">
                        Target: {profile.currencySymbol}
                        {g.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Reminders Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Pending Reminders</h3>
              </div>
              <button
                onClick={onOpenAddReminder}
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                + New
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {activeReminders.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No active reminders pending.
                </div>
              ) : (
                activeReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-amber-950">{rem.title}</p>
                        {rem.description && (
                          <p className="text-[11px] text-amber-900/80 mt-0.5">{rem.description}</p>
                        )}
                        <p className="text-[10px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {rem.dueDate}
                        </p>
                      </div>
                      {rem.amount && (
                        <span className="text-xs font-bold text-amber-900 px-2 py-0.5 rounded-lg bg-amber-200/70 shrink-0">
                          {profile.currencySymbol}
                          {rem.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
