import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ContributionCampaign, Student } from '../../types';
import {
  PiggyBank,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  CreditCard,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AddCampaignModal } from './AddCampaignModal';
import { PublicPaymentRequestModal } from '../requests/PublicPaymentRequestModal';

export const ContributionsView: React.FC = () => {
  const {
    campaigns,
    students,
    transactions,
    profile,
    recordContributionPayment,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ContributionCampaign | null>(null);
  const [selectedCampaignForPayment, setSelectedCampaignForPayment] =
    useState<ContributionCampaign | null>(null);
  const [shareCampaign, setShareCampaign] = useState<ContributionCampaign | null>(null);

  // Quick record payment state
  const [paymentStudentId, setPaymentStudentId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Compute breakdown for a campaign
  const getCampaignStats = (camp: ContributionCampaign) => {
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;
    let totalCollected = 0;

    students.forEach((stu) => {
      const studentPaid = transactions
        .filter(
          (t) =>
            t.studentId === stu.id &&
            t.campaignId === camp.id &&
            t.type === 'contribution' &&
            t.status === 'completed',
        )
        .reduce((sum, t) => sum + t.amount, 0);

      totalCollected += studentPaid;

      if (studentPaid >= camp.perStudentAmount) {
        paidCount++;
      } else if (studentPaid > 0) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    const percent = Math.min(
      100,
      Math.round((totalCollected / (camp.requiredTotalAmount || 1)) * 100),
    );

    return {
      paidCount,
      partialCount,
      pendingCount,
      totalCollected,
      percent,
    };
  };

  const handleRecordDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForPayment || !paymentStudentId) return;

    const amt = parseFloat(paymentAmount) || selectedCampaignForPayment.perStudentAmount;
    recordContributionPayment(selectedCampaignForPayment.id, paymentStudentId, amt, paymentMethod);

    setPaymentSuccessMsg(`Payment of ${profile.currencySymbol}${amt} recorded successfully!`);
    setPaymentAmount('');
    setTimeout(() => setPaymentSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-indigo-700" />
            <span>Class Contribution Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor target collection campaigns, per-student quotas and progress
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-700/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ New Contribution Drive</span>
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((camp) => {
          const stats = getCampaignStats(camp);
          return (
            <div
              key={camp.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-indigo-200 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                      {camp.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        camp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {camp.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{camp.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">{camp.description}</p>
                </div>

                {/* Quota details */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Per Student</p>
                    <p className="text-base font-black text-slate-800">
                      {profile.currencySymbol}
                      {camp.perStudentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {camp.dueDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress and Student Stats */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Collection Progress: {profile.currencySymbol}
                    {stats.totalCollected.toLocaleString()} of {profile.currencySymbol}
                    {camp.requiredTotalAmount.toLocaleString()}
                  </span>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    {stats.percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>

                {/* 4 Stats Chips matching prompt (Total students, Paid, Pending, Partially paid) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Students</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{students.length}</p>
                  </div>

                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Paid</p>
                    <p className="text-sm font-black text-emerald-700 mt-0.5">{stats.paidCount}</p>
                  </div>

                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 text-center">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">Pending</p>
                    <p className="text-sm font-black text-amber-700 mt-0.5">{stats.pendingCount}</p>
                  </div>

                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 text-center">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">Partially Paid</p>
                    <p className="text-sm font-black text-blue-700 mt-0.5">{stats.partialCount}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCampaignForPayment(camp);
                      setPaymentAmount(String(camp.perStudentAmount));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Student Payment</span>
                  </button>

                  <button
                    onClick={() => setShareCampaign(camp)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Request</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingCampaign(camp);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 font-medium"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Direct Student Payment Modal */}
      {selectedCampaignForPayment && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedCampaignForPayment(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Record Payment for {selectedCampaignForPayment.title}
                </h3>
                <p className="text-[11px] text-indigo-200">
                  Target: {profile.currencySymbol}
                  {selectedCampaignForPayment.perStudentAmount} per student
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaignForPayment(null)}
                className="p-1 rounded-full text-indigo-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {paymentSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              {/* Direct Record Form */}
              <form onSubmit={handleRecordDirectPayment} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Quick Add Student Payment</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Student *
                  </label>
                  <select
                    value={paymentStudentId}
                    onChange={(e) => setPaymentStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    required
                  >
                    <option value="">-- Choose student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        Roll #{s.rollNumber} - {s.fullName} ({s.studentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Amount ({profile.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={String(selectedCampaignForPayment.perStudentAmount)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Record Payment Received
                </button>
              </form>

              {/* Roster Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">
                  Student Payment Roster Status
                </h4>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {students.map((stu) => {
                    const paid = transactions
                      .filter(
                        (t) =>
                          t.studentId === stu.id &&
                          t.campaignId === selectedCampaignForPayment.id &&
                          t.type === 'contribution' &&
                          t.status === 'completed',
                      )
                      .reduce((sum, t) => sum + t.amount, 0);

                    const isFull = paid >= selectedCampaignForPayment.perStudentAmount;

                    return (
                      <div
                        key={stu.id}
                        className="p-3 flex items-center justify-between text-xs hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            #{stu.rollNumber} {stu.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Paid: {profile.currencySymbol}
                            {paid.toLocaleString()} / {profile.currencySymbol}
                            {selectedCampaignForPayment.perStudentAmount}
                          </p>
                        </div>

                        <div>
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Fully Paid
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentStudentId(stu.id);
                                setPaymentAmount(
                                  String(selectedCampaignForPayment.perStudentAmount - paid),
                                );
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold"
                            >
                              Collect {profile.currencySymbol}
                              {selectedCampaignForPayment.perStudentAmount - paid}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCampaignForPayment(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Campaign Modal */}
      <AddCampaignModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingCampaign={editingCampaign}
      />

      {/* Public Payment Request Share Modal */}
      {shareCampaign && (
        <PublicPaymentRequestModal
          isOpen={true}
          onClose={() => setShareCampaign(null)}
          campaign={shareCampaign}
        />
      )}
    </div>
  );
};
