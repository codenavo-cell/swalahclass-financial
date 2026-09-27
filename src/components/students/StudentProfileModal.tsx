import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Student } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  Receipt,
  Plus,
  Send,
  BellRing,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Share2,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onAddTransactionForStudent: (studentId: string) => void;
  onSetReminderForStudent: (student: Student, pendingAmount: number) => void;
  onRequestPayment: (student: Student, pendingAmount: number) => void;
  onViewReport?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onAddTransactionForStudent,
  onSetReminderForStudent,
  onRequestPayment,
  onViewReport,
  onEditStudent,
}) => {
  const { profile, getStudentSummary, getStudentTransactions, students, auth } = useFinance();
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen || !student) return null;

  const currentStudent = students.find((s) => s.id === student.id) || student;
  const isAuthorized = auth.role === 'admin' || auth.role === 'class_teacher';

  const summary = getStudentSummary(currentStudent.id);
  const transactions = getStudentTransactions(currentStudent.id);

  const filteredTx = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'contribution') return t.type === 'contribution';
    if (filterType === 'refund') return t.type === 'refund';
    if (filterType === 'pending') return t.status === 'pending';
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <div className="absolute top-5 right-5 flex items-center gap-2">
            {onEditStudent && isAuthorized && (
              <button
                onClick={() => onEditStudent(currentStudent)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold transition cursor-pointer shadow-xs"
                title="Edit student profile and member settings"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Settings</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center font-black text-xl border border-white/20 shadow-md">
                {currentStudent.rollNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-white">{currentStudent.fullName}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      currentStudent.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-400/30'
                    }`}
                  >
                    {currentStudent.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Roll #{currentStudent.rollNumber} • {currentStudent.studentNumber} • Reg: {currentStudent.registrationNumber}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-blue-100">
                  {currentStudent.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-blue-300" />
                      {currentStudent.phone}
                    </span>
                  )}
                  {currentStudent.parentContact && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-200">
                      Parent: {currentStudent.parentContact}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Financial Summary Cards Required by Specification */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Student Financial Standing
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* YOU PAID */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">You Paid</p>
              <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                {profile.currencySymbol}
                {summary.totalPaid.toLocaleString()}
              </p>
            </div>

            {/* YOU OWE */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">You Owe</p>
              <p className="text-base sm:text-lg font-black text-amber-600 mt-0.5">
                {profile.currencySymbol}
                {summary.totalPending.toLocaleString()}
              </p>
            </div>

            {/* CLASS RECEIVED FROM YOU */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Class Recv From You</p>
              <p className="text-base sm:text-lg font-black text-blue-700 mt-0.5">
                {profile.currencySymbol}
                {summary.totalPaid.toLocaleString()}
              </p>
            </div>

            {/* CLASS PAID TO YOU */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Class Paid To You</p>
              <p className="text-base sm:text-lg font-black text-rose-600 mt-0.5">
                {profile.currencySymbol}
                {summary.totalReceivedBack.toLocaleString()}
              </p>
            </div>

            {/* BALANCE */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Net Balance</p>
              <p
                className={`text-base sm:text-lg font-black mt-0.5 ${
                  summary.balance >= 0 ? 'text-emerald-700' : 'text-amber-600'
                }`}
              >
                {profile.currencySymbol}
                {summary.balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => onAddTransactionForStudent(currentStudent.id)}
              className="px-3 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>

            {onEditStudent && isAuthorized && (
              <button
                onClick={() => onEditStudent(currentStudent)}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title={`Edit settings for this member (${auth.role === 'class_teacher' ? 'Class Teacher' : 'Administrator'})`}
              >
                <Settings className="w-3.5 h-3.5 text-blue-700" />
                <span>Edit Settings</span>
              </button>
            )}

            <button
              onClick={() => onRequestPayment(currentStudent, summary.totalPending)}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-700" />
              <span>Request Payment</span>
            </button>

            <button
              onClick={() => onSetReminderForStudent(currentStudent, summary.totalPending)}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-700" />
              <span>Set Reminder</span>
            </button>

            {onViewReport && (
              <button
                onClick={() => onViewReport(currentStudent)}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                <span>View Report</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ml-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
              <span>Print Ledger</span>
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Transaction History ({filteredTx.length})
            </h4>

            {/* Quick Filters */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded-lg ${
                  filterType === 'all' ? 'bg-blue-800 text-white font-bold' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('contribution')}
                className={`px-2 py-0.5 rounded-lg ${
                  filterType === 'contribution' ? 'bg-blue-800 text-white font-bold' : 'text-slate-500'
                }`}
              >
                Contributions
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-2 py-0.5 rounded-lg ${
                  filterType === 'pending' ? 'bg-blue-800 text-white font-bold' : 'text-slate-500'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTx.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No transactions recorded for this student yet.
              </div>
            ) : (
              filteredTx.map((tx) => {
                const isPositive =
                  tx.type === 'contribution' || tx.type === 'income' || tx.type === 'collection';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {tx.date} • {tx.paymentMethod.toUpperCase()} {tx.referenceNumber && `• Ref: ${tx.referenceNumber}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-black text-sm ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {profile.currencySymbol}
                        {tx.amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
