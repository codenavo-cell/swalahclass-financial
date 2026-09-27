import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Reminder } from '../../types';
import {
  BellRing,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  User,
  AlertCircle,
  X,
  Repeat,
} from 'lucide-react';

export const RemindersView: React.FC = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder, students, profile } =
    useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  );
  const [type, setType] = useState<'student' | 'contribution' | 'general' | 'report'>('general');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedStudent = students.find((s) => s.id === studentId);

    addReminder({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      type,
      studentId: studentId || undefined,
      studentName: selectedStudent?.fullName || undefined,
      amount: parseFloat(amount) || undefined,
      isRepeating,
      status: 'active',
    });

    setTitle('');
    setDescription('');
    setAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-600" />
            <span>Class Financial Reminders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated notifications for student dues, deadlines and report reviews
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: `All Reminders (${reminders.length})` },
          { id: 'active', label: `Active (${reminders.filter((r) => r.status === 'active').length})` },
          { id: 'completed', label: `Completed (${reminders.filter((r) => r.status === 'completed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BellRing className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-800">No reminders in this list</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a student-specific or class-wide payment reminder.
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isCompleted = rem.status === 'completed';
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-amber-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleReminder(rem.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-amber-500'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {rem.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-50 text-amber-800 uppercase border border-amber-200">
                        {rem.type}
                      </span>
                      {rem.isRepeating && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 flex items-center gap-1">
                          <Repeat className="w-3 h-3" /> Repeating
                        </span>
                      )}
                    </div>

                    {rem.description && (
                      <p className="text-xs text-slate-600 mt-1">{rem.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        Due Date: {rem.dueDate}
                      </span>
                      {rem.studentName && (
                        <span className="flex items-center gap-1 text-blue-700 font-semibold">
                          <User className="w-3.5 h-3.5" />
                          {rem.studentName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {rem.amount && (
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl">
                      {profile.currencySymbol}
                      {rem.amount.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-amber-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                <h3 className="font-bold text-sm">Create Class Reminder</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-amber-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rahul has ₹500 pending"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reminder Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="student">Student Specific Due</option>
                  <option value="contribution">Contribution Drive Deadline</option>
                  <option value="report">Financial Statement Report Review</option>
                  <option value="general">General Class Finance</option>
                </select>
              </div>

              {type === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Student
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="">-- Choose student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        Roll #{s.rollNumber} - {s.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pending Amount ({profile.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Context
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Details about the pending item..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="repeatChk"
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="repeatChk" className="text-xs text-slate-700 font-medium">
                  Repeating monthly reminder
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  Set Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
