import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, PiggyBank, Calendar, Calculator } from 'lucide-react';
import { ContributionCampaign } from '../../types';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCampaign?: ContributionCampaign | null;
}

export const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
  isOpen,
  onClose,
  editingCampaign,
}) => {
  const { addCampaign, updateCampaign, categories, profile, students } = useFinance();

  const [title, setTitle] = useState(editingCampaign?.title || '');
  const [perStudentAmount, setPerStudentAmount] = useState<string>(
    editingCampaign ? String(editingCampaign.perStudentAmount) : '500',
  );
  const [requiredTotalAmount, setRequiredTotalAmount] = useState<string>(
    editingCampaign
      ? String(editingCampaign.requiredTotalAmount)
      : String(500 * (students.length || 38)),
  );
  const [dueDate, setDueDate] = useState(
    editingCampaign?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  );
  const [category, setCategory] = useState(editingCampaign?.category || 'Program');
  const [description, setDescription] = useState(editingCampaign?.description || '');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>(
    editingCampaign?.status || 'active',
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePerStudentChange = (val: string) => {
    setPerStudentAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && students.length > 0) {
      setRequiredTotalAmount(String(Math.round(num * students.length)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPerStudent = parseFloat(perStudentAmount);
    const parsedTotal = parseFloat(requiredTotalAmount);

    if (!title.trim()) {
      setError('Please provide a campaign title.');
      return;
    }

    if (isNaN(parsedPerStudent) || parsedPerStudent <= 0) {
      setError('Per-student amount must be greater than 0.');
      return;
    }

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        title: title.trim(),
        perStudentAmount: parsedPerStudent,
        requiredTotalAmount: parsedTotal || parsedPerStudent * students.length,
        dueDate,
        category,
        description: description.trim(),
        status,
      });
    } else {
      addCampaign({
        title: title.trim(),
        perStudentAmount: parsedPerStudent,
        requiredTotalAmount: parsedTotal || parsedPerStudent * students.length,
        dueDate,
        category,
        description: description.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-800 text-indigo-200">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {editingCampaign ? 'Edit Contribution Drive' : 'Launch Class Contribution Drive'}
              </h3>
              <p className="text-[11px] text-indigo-200">Set quotas and monitor student payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contribution Drive Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class Annual Program 2026 or Study Tour"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Per-Student Quota ({profile.currencySymbol}) *
              </label>
              <input
                type="number"
                value={perStudentAmount}
                onChange={(e) => handlePerStudentChange(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Applied across {students.length} students
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Fund Target ({profile.currencySymbol})
              </label>
              <input
                type="number"
                value={requiredTotalAmount}
                onChange={(e) => setRequiredTotalAmount(e.target.value)}
                placeholder="19000"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Purpose & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Contribution for stage decoration, sound setup, certificates, and refreshments..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              {editingCampaign ? 'Save Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
