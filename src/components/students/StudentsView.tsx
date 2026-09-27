import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Student } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Phone,
  Mail,
  ChevronRight,
  ShieldAlert,
  Edit2,
  Trash2,
  Archive,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  Settings,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface StudentsViewProps {
  onSelectStudent: (student: Student) => void;
  onOpenAddStudentModal: () => void;
  onRequestPayment: (student: Student, pendingAmount: number) => void;
  onEditStudent?: (student: Student) => void;
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-cyan-600',
];

const getInitials = (name: string, roll: number) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0] && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return String(roll);
};

export const StudentsView: React.FC<StudentsViewProps> = ({
  onSelectStudent,
  onOpenAddStudentModal,
  onRequestPayment,
  onEditStudent,
}) => {
  const {
    students,
    profile,
    getStudentSummary,
    toggleStudentStatus,
    deleteStudent,
    updateStudent,
    removeAllStudentsExceptOne,
    auth,
  } = useFinance();

  const isAuthorized = auth.role === 'admin' || auth.role === 'class_teacher';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'paid' | 'pending'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showRemainOneConfirm, setShowRemainOneConfirm] = useState(false);

  // Filter & sort logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((stu) => {
        // Search by name, rollNumber, studentNumber, regNumber
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          stu.fullName.toLowerCase().includes(q) ||
          String(stu.rollNumber).includes(q) ||
          stu.studentNumber.toLowerCase().includes(q) ||
          stu.registrationNumber.toLowerCase().includes(q);

        if (!matchesQuery) return false;

        const summary = getStudentSummary(stu.id);

        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return stu.status === 'active';
        if (filterStatus === 'inactive') return stu.status === 'inactive';
        if (filterStatus === 'paid') return summary.totalPending === 0 && summary.totalPaid > 0;
        if (filterStatus === 'pending') return summary.totalPending > 0 && summary.totalPaid === 0;
        if (filterStatus === 'partial') return summary.totalPending > 0 && summary.totalPaid > 0;

        return true;
      })
      .sort((a, b) => {
        const sumA = getStudentSummary(a.id);
        const sumB = getStudentSummary(b.id);

        if (sortBy === 'roll') {
          return sortOrder === 'asc' ? a.rollNumber - b.rollNumber : b.rollNumber - a.rollNumber;
        }
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.fullName.localeCompare(b.fullName)
            : b.fullName.localeCompare(a.fullName);
        }
        if (sortBy === 'paid') {
          return sortOrder === 'asc'
            ? sumA.totalPaid - sumB.totalPaid
            : sumB.totalPaid - sumA.totalPaid;
        }
        if (sortBy === 'pending') {
          return sortOrder === 'asc'
            ? sumA.totalPending - sumB.totalPending
            : sumB.totalPending - sumA.totalPending;
        }
        return 0;
      });
  }, [students, searchQuery, filterStatus, sortBy, sortOrder, getStudentSummary]);

  const exportStudentsCSV = () => {
    const headers = ['Roll #', 'Full Name', 'Student ID', 'Reg Number', 'Phone', 'Paid', 'Pending', 'Status'];
    const rows = students.map((s) => {
      const sum = getStudentSummary(s.id);
      return [
        s.rollNumber,
        `"${s.fullName}"`,
        s.studentNumber,
        s.registrationNumber,
        s.phone || '',
        sum.totalPaid,
        sum.totalPending,
        s.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${profile.className}_Students_${profile.academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-800" />
            <span>Class Student Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {students.length} students enrolled in {profile.institutionName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {students.length > 1 && (
            <button
              onClick={() => setShowRemainOneConfirm(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Remove other students and remain 1 member"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Remain 1 Member</span>
            </button>
          )}

          <button
            onClick={exportStudentsCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddStudentModal}
            className="px-4 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-md shadow-blue-800/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll number, registration ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="roll">Roll Number</option>
              <option value="name">Name (A-Z)</option>
              <option value="paid">Total Paid</option>
              <option value="pending">Pending Amount</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          {[
            { id: 'all', label: 'All Students' },
            { id: 'paid', label: 'Fully Paid' },
            { id: 'pending', label: 'Pending Dues' },
            { id: 'partial', label: 'Partially Paid' },
            { id: 'active', label: 'Active Status' },
            { id: 'inactive', label: 'Archived / Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-xl font-semibold transition cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-blue-800 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-slate-400 text-xs ml-auto">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Unified Continuous Member List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No student records matched your current query or filters. Try adjusting the search term.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((stu) => {
              const sum = getStudentSummary(stu.id);
              const isSettled = sum.totalPending === 0;
              const initials = getInitials(stu.fullName, stu.rollNumber);
              const avatarBg =
                AVATAR_COLORS[Math.abs((stu.rollNumber || 1) - 1) % AVATAR_COLORS.length] ||
                'bg-blue-600';

              return (
                <div
                  key={stu.id}
                  onClick={() => onSelectStudent(stu)}
                  className="flex items-center justify-between p-3 sm:p-3.5 md:p-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Left: Circular Avatar Badge + Student Details */}
                  <div className="flex items-center gap-3 min-w-0 mr-2 sm:mr-4">
                    {/* 1. Student Number / Circular Badge */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${avatarBg} text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-2xs tracking-wider`}
                      >
                        {initials}
                      </div>
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-slate-900 text-white text-[9px] font-bold rounded-full border border-white leading-tight">
                        #{stu.rollNumber}
                      </span>
                    </div>

                    {/* 2. Student Name & 3. Secondary Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition truncate">
                          {stu.fullName}
                        </h4>

                        {/* 4. Payment Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSettled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isSettled ? 'Paid' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600 font-semibold">
                          {stu.studentNumber}
                        </span>
                        {stu.registrationNumber && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-400 hidden sm:inline">
                              {stu.registrationNumber}
                            </span>
                          </>
                        )}
                        {stu.phone && (
                          <>
                            <span className="text-slate-300 hidden md:inline">•</span>
                            <span className="items-center gap-1 text-slate-500 hidden md:inline-flex">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {stu.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Amounts (Paid, Owes, Balance), Request Pay, Chevron */}
                  <div className="flex items-center gap-3 sm:gap-5 md:gap-6 shrink-0">
                    {/* Desktop Detailed Columns: Paid, Owes, Balance */}
                    <div className="hidden md:flex items-center gap-5 text-right">
                      {/* 5. Amount Paid */}
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Paid</p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-600">
                          {profile.currencySymbol}
                          {sum.totalPaid.toLocaleString()}
                        </p>
                      </div>

                      {/* 6. Amount Owed / Pending */}
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Owes</p>
                        <p
                          className={`text-xs sm:text-sm font-black ${
                            sum.totalPending > 0 ? 'text-amber-600' : 'text-slate-500'
                          }`}
                        >
                          {profile.currencySymbol}
                          {sum.totalPending.toLocaleString()}
                        </p>
                      </div>

                      {/* 7. Balance */}
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Balance</p>
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            sum.balance >= 0 ? 'text-slate-700' : 'text-amber-700'
                          }`}
                        >
                          {profile.currencySymbol}
                          {sum.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Mobile/Tablet Compact Financial Summary (Image 2 style) */}
                    <div className="flex flex-col items-end text-right md:hidden">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">Owes:</span>
                        <span
                          className={`text-xs sm:text-sm font-black ${
                            sum.totalPending > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {profile.currencySymbol}
                          {sum.totalPending.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-emerald-600 font-semibold">
                          Paid {profile.currencySymbol}
                          {sum.totalPaid.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          Bal {profile.currencySymbol}
                          {sum.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 8. Compact Request Pay Button & 9. Right-facing Arrow Icon */}
                    <div className="flex items-center gap-1.5">
                      {sum.totalPending > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestPayment(stu, sum.totalPending);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold border border-amber-200 transition cursor-pointer flex items-center gap-1"
                          title="Send Payment Request / Reminder"
                        >
                          <span>Request Pay</span>
                          <ChevronRight className="w-3 h-3 text-amber-700" />
                        </button>
                      )}

                      {onEditStudent && isAuthorized && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditStudent(stu);
                          }}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition cursor-pointer"
                          title={`Edit Member Settings (${auth.role === 'class_teacher' ? 'Class Teacher' : 'Admin'})`}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}

                      <span className="p-1 text-slate-400 group-hover:text-blue-800 transition">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Student Record"
          message="Are you sure you want to permanently delete this student? Their financial transaction history will be preserved in the audit log."
          confirmLabel="Delete Student"
          isDestructive={true}
          onConfirm={() => {
            deleteStudent(deleteConfirmId);
            setDeleteConfirmId(null);
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Remove All Except One Confirmation */}
      {showRemainOneConfirm && (
        <ConfirmationModal
          isOpen={true}
          title="Remove Students — Keep 1 Member"
          message="Are you sure you want to remove all other students and keep only 1 member in the directory? Unused student records will be cleared."
          confirmLabel="Remain 1 Member"
          isDestructive={true}
          onConfirm={() => {
            removeAllStudentsExceptOne();
            setShowRemainOneConfirm(false);
          }}
          onCancel={() => setShowRemainOneConfirm(false)}
        />
      )}
    </div>
  );
};
