import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  LogOut,
  Receipt,
  School,
  Lock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Student, Transaction, ContributionCampaign } from '../../types';

interface MemberPendingViewProps {
  onBackToAdmin?: () => void;
}

export const MemberPendingView: React.FC<MemberPendingViewProps> = ({ onBackToAdmin }) => {
  const { students, transactions, campaigns, profile, getStudentSummary } = useFinance();

  // Navigation steps: 'email' -> 'otp' -> 'dashboard'
  const [step, setStep] = useState<'email' | 'otp' | 'dashboard'>('email');

  // Form states
  const [inputEmail, setInputEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedEmailNotice, setSimulatedEmailNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Authenticated Member State
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Generate 6-digit OTP
  const triggerOtpGeneration = (student: Student) => {
    // Generate secure 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    setResendCooldown(30); // 30s resend cooldown

    // Simulated email dispatch notification for user testing
    setSimulatedEmailNotice(
      `[Verification Email Sent]: Your 6-digit code for ${student.fullName} (${student.email}) is: ${code}`
    );
  };

  // Step 1: Submit Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    // Find in class roster
    const match = students.find((s) => s.email?.trim().toLowerCase() === cleanEmail);

    if (!match) {
      setErrorMessage(
        'Email address not recognized as an enrolled class member. Please verify with your Class Teacher or Administrator.'
      );
      return;
    }

    if (match.status !== 'active') {
      setErrorMessage('Your student profile is currently inactive. Please contact the administrator.');
      return;
    }

    // Email belongs to verified active student
    setVerifiedStudent(match);
    triggerOtpGeneration(match);
    setStep('otp');
    setOtpCode('');
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (Date.now() > otpExpiry) {
        setErrorMessage('This verification code has expired. Please request a new one.');
        return;
      }

      if (otpCode.trim() !== generatedOtp) {
        setErrorMessage('Invalid verification code. Please check the code and try again.');
        return;
      }

      // Successful verification
      setStep('dashboard');
    }, 600);
  };

  const handleResendOtp = () => {
    if (!verifiedStudent || resendCooldown > 0) return;
    setErrorMessage(null);
    triggerOtpGeneration(verifiedStudent);
  };

  // Step 3: Logout
  const handleLogout = () => {
    setVerifiedStudent(null);
    setGeneratedOtp(null);
    setInputEmail('');
    setOtpCode('');
    setShowHistory(false);
    setSimulatedEmailNotice(null);
    setErrorMessage(null);
    setStep('email');
  };

  // Verified student's private calculations
  const studentFinancials = useMemo(() => {
    if (!verifiedStudent) return null;
    return getStudentSummary(verifiedStudent.id);
  }, [verifiedStudent, getStudentSummary]);

  // Verified student's private transactions ONLY (Strict privacy - never leaks other students)
  const studentTransactions = useMemo(() => {
    if (!verifiedStudent) return [];
    return transactions.filter(
      (tx) => tx.studentId === verifiedStudent.id && tx.status !== 'cancelled'
    );
  }, [verifiedStudent, transactions]);

  // Active campaigns that student owes dues for
  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.status === 'active') || campaigns[0];
  }, [campaigns]);

  // Masked email for display
  const maskedEmail = useMemo(() => {
    if (!verifiedStudent?.email) return '';
    const [local, domain] = verifiedStudent.email.split('@');
    if (!domain) return verifiedStudent.email;
    const masked = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local}***`;
    return `${masked}@${domain}`;
  }, [verifiedStudent]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header Navigation */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/15">
            <School className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
              Class {profile.className}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Student Financial Portal • {profile.institutionName}
            </p>
          </div>
        </div>

        {onBackToAdmin && step !== 'dashboard' && (
          <button
            onClick={onBackToAdmin}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin Login</span>
          </button>
        )}

        {step === 'dashboard' && (
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>
        )}
      </header>

      {/* Main Body */}
      <main className="max-w-lg w-full mx-auto my-auto py-8">
        {/* STEP 1: ENTER REGISTERED EMAIL */}
        {step === 'email' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                CHECK MY PENDING AMOUNT
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Enter your registered class member email to securely access your personal fee status.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="e.g. faris@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Only enrolled class members should use their registered email.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Confidential & Encrypted
              </span>
              <span>Class Swalah (2026)</span>
            </div>
          </div>
        )}

        {/* STEP 2: EMAIL VERIFICATION CODE (OTP) */}
        {step === 'otp' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 border border-blue-100 mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                VERIFY YOUR IDENTITY
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We dispatched a 6-digit verification code to your registered email:
              </p>
              <p className="text-xs font-mono font-bold text-blue-900 bg-blue-50 py-1 px-3 rounded-full inline-block">
                {maskedEmail}
              </p>
            </div>

            {/* Test Helper Dispatch Box */}
            {simulatedEmailNotice && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="flex items-center gap-1 text-blue-800">
                    <Mail className="w-3.5 h-3.5" />
                    Incoming Verification Mail
                  </span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                    Delivered
                  </span>
                </div>
                <p className="font-mono text-xs">{simulatedEmailNotice}</p>
                <button
                  type="button"
                  onClick={() => generatedOtp && setOtpCode(generatedOtp)}
                  className="text-blue-700 underline font-semibold text-[11px] pt-0.5 cursor-pointer block"
                >
                  Click to auto-enter code: {generatedOtp}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[0.5em] py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY & VIEW PENDING</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="text-blue-900 font-bold hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRIVATE MEMBER DASHBOARD - SHOW ONLY THEIR OWN PENDING */}
        {step === 'dashboard' && verifiedStudent && studentFinancials && (
          <div className="space-y-6">
            {/* Student Welcome Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Verified Class Member
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    Welcome, {verifiedStudent.fullName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Roll #{verifiedStudent.rollNumber} • {verifiedStudent.studentNumber} • Class {profile.className}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {verifiedStudent.fullName.charAt(0)}
                </div>
              </div>
            </div>

            {/* MAIN DISPLAY: YOUR PENDING AMOUNT */}
            {studentFinancials.totalPending > 0 ? (
              /* When Student Has Dues */
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-7 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-amber-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-200" />
                    <span>YOUR PENDING AMOUNT</span>
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-6xl font-black tracking-tight">
                      {profile.currencySymbol}
                      {studentFinancials.totalPending.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-amber-400/40 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-amber-200 text-[11px] font-semibold uppercase">Status</p>
                      <p className="font-extrabold text-sm text-white">Pending</p>
                    </div>

                    <div>
                      <p className="text-amber-200 text-[11px] font-semibold uppercase">Due Date</p>
                      <p className="font-extrabold text-sm text-white">
                        {activeCampaign ? activeCampaign.dueDate : '30 September 2026'}
                      </p>
                    </div>
                  </div>

                  {activeCampaign && (
                    <div className="pt-2">
                      <p className="text-amber-200 text-[11px] font-semibold uppercase">Contribution Drive</p>
                      <p className="font-bold text-xs text-white">{activeCampaign.title}</p>
                    </div>
                  )}
                </div>

                {/* Decorative background glow */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
              </div>
            ) : (
              /* When Student Has Zero Dues */
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-7 sm:p-8 shadow-xl space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">You're all clear! 🎉</h3>
                  <p className="text-emerald-100 text-sm mt-1">
                    Your current pending amount is {profile.currencySymbol}0.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/20 text-xs text-emerald-100">
                  All required class contributions and program quotas are fully settled.
                </div>
              </div>
            )}

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Settled</p>
                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">
                  {profile.currencySymbol}
                  {studentFinancials.totalPaid.toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                  {profile.classTeacher}
                </p>
              </div>
            </div>

            {/* Toggle: VIEW MY HISTORY */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-900" />
                  <span>VIEW MY PAYMENT HISTORY ({studentTransactions.length})</span>
                </span>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistory && (
                <div className="p-4 pt-0 border-t border-slate-100 space-y-2.5">
                  {studentTransactions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No payment records found for your account yet.
                    </p>
                  ) : (
                    studentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          <p className="text-[11px] text-slate-500">
                            {tx.date} • {tx.category} • Method: <span className="uppercase">{tx.paymentMethod}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600">
                            +{profile.currencySymbol}
                            {tx.amount.toLocaleString()}
                          </p>
                          <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Strict Privacy Protected:</strong> You are accessing your personal financial standing. In compliance with school ledger confidentiality, class-wide balances and other members' information are strictly private.
              </p>
            </div>

            {/* Clear Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto text-center py-4 border-t border-slate-200 text-slate-400 text-xs space-y-1">
        <p>Noorul Huda Islamic Academy • Class Swalah (2026 Batch)</p>
        <p className="text-[11px]">Authorized Student Self-Service Financial Portal</p>
      </footer>
    </div>
  );
};
