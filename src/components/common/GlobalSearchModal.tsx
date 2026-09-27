import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Search, X, Users, Receipt, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Student, Transaction } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
  onSelectTransaction,
}) => {
  const { students, transactions, profile } = useFinance();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { students: [], transactions: [] };

    const matchedStudents = students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        String(s.rollNumber).includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)),
    );

    const matchedTransactions = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.studentName && t.studentName.toLowerCase().includes(q)) ||
        (t.paidTo && t.paidTo.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        String(t.amount).includes(q),
    );

    return {
      students: matchedStudents.slice(0, 6),
      transactions: matchedTransactions.slice(0, 8),
    };
  }, [query, students, transactions]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students (name, roll #), or transactions (purpose, amt)..."
            className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type to search all class students, receipts, and transactions.
            </div>
          ) : results.students.length === 0 && results.transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Students Section */}
              {results.students.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Students ({results.students.length})
                  </h4>
                  <div className="space-y-1">
                    {results.students.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectStudent(s);
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center justify-between text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                            {s.rollNumber}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                              {s.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {s.studentNumber} • {s.registrationNumber}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Section */}
              {results.transactions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Transactions ({results.transactions.length})
                  </h4>
                  <div className="space-y-1">
                    {results.transactions.map((t) => {
                      const isPositive = ['income', 'contribution', 'collection'].includes(t.type);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            onSelectTransaction(t);
                            onClose();
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {t.description}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {t.id} • {t.category} • {t.date}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-black shrink-0 ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? '+' : '-'}
                            {profile.currencySymbol}
                            {t.amount.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
