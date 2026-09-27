import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod, TransactionStatus } from '../../types';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  User,
  AlertTriangle,
} from 'lucide-react';
import { QuickCalculator } from '../common/QuickCalculator';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  defaultStudentId?: string;
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
  defaultStudentId,
  editingTransaction,
}) => {
  const {
    students,
    categories,
    paymentMethods,
    profile,
    addTransaction,
    updateTransaction,
    campaigns,
  } = useFinance();

  const [type, setType] = useState<TransactionType>(editingTransaction?.type || defaultType);
  const [amount, setAmount] = useState<string>(
    editingTransaction ? String(editingTransaction.amount) : '',
  );
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [studentId, setStudentId] = useState(
    editingTransaction?.studentId || defaultStudentId || '',
  );
  const [category, setCategory] = useState(
    editingTransaction?.category || (categories[0] || 'Program'),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editingTransaction?.paymentMethod || 'cash',
  );
  const [referenceNumber, setReferenceNumber] = useState(
    editingTransaction?.referenceNumber || '',
  );
  const [paidTo, setPaidTo] = useState(editingTransaction?.paidTo || '');
  const [status, setStatus] = useState<TransactionStatus>(
    editingTransaction?.status || 'completed',
  );
  const [notes, setNotes] = useState(editingTransaction?.notes || '');
  const [campaignId, setCampaignId] = useState(editingTransaction?.campaignId || '');

  const today = new Date().toISOString().split('T')[0];
  const nowTime = `${String(new Date().getHours()).padStart(2, '0')}:${String(
    new Date().getMinutes(),
  ).padStart(2, '0')}`;
  const [date, setDate] = useState(editingTransaction?.date || today);
  const [time, setTime] = useState(editingTransaction?.time || nowTime);

  const [error, setError] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [pendingConfirmPayload, setPendingConfirmPayload] = useState<any | null>(null);

  useEffect(() => {
    if (defaultType) setType(defaultType);
    if (defaultStudentId) setStudentId(defaultStudentId);
  }, [defaultType, defaultStudentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a valid transaction amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description for the transaction.');
      return;
    }

    const selectedStudent = students.find((s) => s.id === studentId);

    const payload = {
      date,
      time,
      amount: parsedAmount,
      type,
      studentId: studentId || undefined,
      studentName: selectedStudent?.fullName || undefined,
      category,
      description: description.trim(),
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      paidTo: paidTo.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      campaignId: campaignId || undefined,
    };

    // Major transaction check (requirement 9: "Show a confirmation before committing major transactions")
    if (parsedAmount >= 5000 && !editingTransaction) {
      setPendingConfirmPayload(payload);
      return;
    }

    commitSave(payload);
  };

  const commitSave = (payload: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    setPendingConfirmPayload(null);
    onClose();
  };

  const isIncomeFamily =
    type === 'income' || type === 'contribution' || type === 'collection';

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`p-5 text-white flex items-center justify-between transition-colors ${
              isIncomeFamily
                ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
                : 'bg-gradient-to-r from-rose-800 to-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20">
                {isIncomeFamily ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {editingTransaction
                    ? 'Edit Financial Transaction'
                    : isIncomeFamily
                    ? 'Record Received Money / Contribution'
                    : 'Record Class Expense Voucher'}
                </h3>
                <p className="text-[11px] text-white/80">Class Finance Ledger</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
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

            {/* Transaction Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Transaction Classification
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'income', label: 'Income / Deposit' },
                  { id: 'expense', label: 'Money Spent' },
                  { id: 'contribution', label: 'Contribution' },
                  { id: 'refund', label: 'Refund' },
                  { id: 'advance', label: 'Advance' },
                  { id: 'loan', label: 'Loan' },
                  { id: 'adjustment', label: 'Adjustment' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as TransactionType)}
                    className={`py-2 px-2 rounded-xl font-semibold border transition text-center cursor-pointer ${
                      type === item.id
                        ? 'bg-blue-800 text-white border-blue-900 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field with Calculator Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Amount ({profile.currencySymbol}) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCalculator(true)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculator</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {profile.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description / Purpose *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Stage lighting rental advance, or Class program contribution"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Student Member */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student / Member (Optional)
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="">General Class Activity (No specific student)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.rollNumber} - {s.fullName} ({s.studentNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign / Target Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Link to Contribution Drive
                </label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="">No linked campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({profile.currencySymbol}{c.perStudentAmount}/student)
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="cash">Cash in hand</option>
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="other">Other / Cheque</option>
                </select>
              </div>

              {/* Paid To / Vendor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Paid To / Vendor / Receiver
                </label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="e.g. Royal Decorators / Campus Canteen"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Reference / Invoice Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  UPI Ref # / Bill / Receipt No
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UPI/4910284 or INV-104"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Transaction Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  <option value="completed">Completed (Confirmed Received / Paid)</option>
                  <option value="pending">Pending (Promised / Awaiting Clear)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Internal Notes & Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional audit or verification notes..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer ${
                  isIncomeFamily
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                {editingTransaction ? 'Save Updates' : 'Commit Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Quick Calculator Modal */}
      <QuickCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onApplyValue={(val) => setAmount(String(val))}
      />

      {/* Major Transaction Confirmation Dialog */}
      {pendingConfirmPayload && (
        <ConfirmationModal
          isOpen={true}
          title="Major Transaction Confirmation"
          message={`You are committing a major financial transaction of ${profile.currencySymbol}${pendingConfirmPayload.amount.toLocaleString()} for "${pendingConfirmPayload.description}". Please verify this amount is accurate before proceeding.`}
          confirmLabel="Confirm & Record"
          onConfirm={() => commitSave(pendingConfirmPayload)}
          onCancel={() => setPendingConfirmPayload(null)}
        />
      )}
    </>
  );
};
