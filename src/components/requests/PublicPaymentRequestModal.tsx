import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Mail,
  School,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Student, ContributionCampaign } from '../../types';

interface PublicPaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  campaign?: ContributionCampaign | null;
  amount?: number;
}

export const PublicPaymentRequestModal: React.FC<PublicPaymentRequestModalProps> = ({
  isOpen,
  onClose,
  student,
  campaign,
  amount,
}) => {
  const { profile, addNotification } = useFinance();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetAmount = amount || campaign?.perStudentAmount || 500;
  const targetTitle = campaign?.title || 'Class Contribution';
  const dueDate = campaign?.dueDate || '30 September 2026';

  const shareableUrl = `${window.location.origin}/?request=pay&class=${encodeURIComponent(
    profile.className,
  )}&amount=${targetAmount}`;

  const messageText = `Assalamu Alaikum / Greetings from Class ${profile.className} (${profile.institutionName}).\n\n📌 *Payment Request: ${targetTitle}*\n👤 Student: ${
    student ? student.fullName + ' (Roll #' + student.rollNumber + ')' : 'Class Student'
  }\n💰 Due Amount: ${profile.currencySymbol}${targetAmount.toLocaleString()}\n📅 Due Date: ${dueDate}\n\nPlease submit the payment via Cash or UPI to the Class Finance Admin.\n\nThank you!\nClass Finance Office - ${profile.classTeacher}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleSendEmail = async () => {
    if (emailSending) return;
    setEmailMessage(null);

    const studentEmail = student?.email?.trim() || 'irshadmnkd@gmail.com';

    setEmailSending(true);
    setEmailStatus('idle');

    try {
      const response = await fetch('/api/send-payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail,
          studentName: student?.fullName,
          studentRoll: student?.rollNumber,
          amountDue: targetAmount,
          currencySymbol: profile.currencySymbol || '₹',
          deadline: dueDate,
          className: profile.className,
          institutionName: profile.institutionName,
          teacherName: profile.classTeacher,
          campaignTitle: targetTitle,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailStatus('success');
        setEmailMessage(data.message || 'Payment request email sent successfully');
        if (addNotification) {
          addNotification(
            'Payment Request Email Sent',
            `Reminder for ${targetTitle} (${profile.currencySymbol}${targetAmount.toLocaleString()}) was dispatched to ${student?.fullName} (${studentEmail}).`,
            'success'
          );
        }
      } else {
        setEmailStatus('error');
        setEmailMessage(data.error || 'Failed to send payment request email. Please try again.');
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailMessage(
        err.message || 'Network error occurred while connecting to the email service. Please try again.'
      );
    } finally {
      setEmailSending(false);
    }
  };

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Generate Payment Request</h3>
              <p className="text-[11px] text-blue-200">Shareable secure reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Card Preview of What Parent/Student Sees */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-blue-800" />
                <span className="text-xs font-bold text-slate-800">
                  {profile.institutionName}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Class {profile.className}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-slate-900">{targetTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {student ? (
                  <span>
                    Requested for:{' '}
                    <strong className="text-slate-700">
                      {student.fullName} (Roll #{student.rollNumber})
                    </strong>
                  </span>
                ) : (
                  <span>Official Class Contribution Request</span>
                )}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Amount Due</p>
                <p className="text-xl font-black text-blue-900">
                  {profile.currencySymbol}
                  {targetAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Deadline</p>
                <p className="text-xs font-bold text-slate-700">{dueDate}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Note: This shareable view never exposes sensitive admin credentials, bank balances, or private student logs.
            </p>
          </div>

          {/* Feedback messages for Email Sending */}
          {emailMessage && emailStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{emailMessage}</span>
            </div>
          )}

          {emailMessage && emailStatus === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium">{emailMessage}</span>
            </div>
          )}

          {/* Share Actions */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase">Instant Share Options</p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailSending}
                className="py-2.5 px-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                title={student?.email ? `Send reminder to ${student.email}` : 'No email registered for student'}
              >
                {emailSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyMessage}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedMsg ? 'Copied Text' : 'Copy Message'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
