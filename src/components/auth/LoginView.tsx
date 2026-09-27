import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  School,
  ArrowRight,
  HelpCircle,
  Receipt,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface LoginViewProps {
  onOpenMemberPortal?: () => void;
  onOpenNonogramPuzzle?: () => void;
}

type UserRole = 'admin' | 'class_teacher' | 'student';

export const LoginView: React.FC<LoginViewProps> = ({
  onOpenMemberPortal,
  onOpenNonogramPuzzle,
}) => {
  const { login, requestPasswordReset, profile } = useFinance();

  // Role selection state (Admin default selected with teal outline)
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Input states (clean and soft, no hardcoded prefilled emails or passwords)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & modal states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'phone' | 'email' | 'teacher'>('email');
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryFeedback, setRecoveryFeedback] = useState<string | null>(null);

  // Handle Role selection - reset fields so inputs remain clean with soft placeholders only
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setUsername('');
    setPassword('');

    if (role === 'student') {
      // If student role is selected, open student member pending portal
      if (onOpenMemberPortal) {
        onOpenMemberPortal();
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError(
        selectedRole === 'class_teacher'
          ? 'Please enter your Teacher ID or email.'
          : 'Please enter your administrator email.'
      );
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler with 9611395005 phone recovery support
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryFeedback(null);

    const res = requestPasswordReset(recoveryInput);
    setRecoveryFeedback(res.message);
  };

  return (
    <div className="min-h-screen bg-[#063b46] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Subtle Islamic Geometric Pattern Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(#2dd4bf 1px, transparent 1px), radial-gradient(#0d9488 1.5px, transparent 1.5px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* Decorative Arabesque SVG Star Outlines in Background */}
      <svg
        className="absolute -top-24 -left-24 w-96 h-96 text-teal-500/10 pointer-events-none"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35" />
      </svg>
      <svg
        className="absolute -bottom-24 -right-24 w-96 h-96 text-teal-400/10 pointer-events-none"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35" />
      </svg>

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        {/* Top Center: Portal Title */}
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo Crest */}
          <div className="w-16 h-16 rounded-2xl bg-teal-800/90 text-white flex items-center justify-center shadow-lg border-2 border-teal-400/30 mb-3 backdrop-blur-xs">
            <School className="w-9 h-9 text-teal-200" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-[0.25em] text-white drop-shadow-xs uppercase">
            SWALAH
          </h1>
          <p className="text-xs sm:text-sm text-teal-200 font-bold tracking-widest uppercase mt-1">
            FINANCIAL MANAGEMENT PORTAL
          </p>
        </div>

        {/* Centered White Rounded Login Card with Soft Shadow */}
        <div className="bg-white rounded-3xl shadow-2xl w-full border border-slate-100 overflow-hidden">
          
          {/* Login Card Teal Header Section */}
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-800 text-white px-6 py-6 text-center flex flex-col items-center border-b border-teal-600/30">
            {/* Lock icon inside rounded square at the top */}
            <div className="w-12 h-12 rounded-xl bg-teal-900/60 border border-teal-400/40 flex items-center justify-center text-teal-200 mb-2.5 shadow-inner">
              <Lock className="w-6 h-6 text-teal-300" />
            </div>

            {/* Heading: Sign In */}
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In</h2>
            {/* Subtitle: Manage your class finances in one place. */}
            <p className="text-xs text-teal-100/90 mt-1 font-medium">
              Manage your class finances in one place.
            </p>
          </div>

          {/* Inside Card Body */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Error & Feedback Alerts */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SELECT ROLE section */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                SELECT ROLE
              </label>

              {/* Three role buttons: Admin, Class Teacher, Student */}
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'admin', label: 'Admin' },
                    { id: 'class_teacher', label: 'Class Teacher' },
                    { id: 'student', label: 'Student' },
                  ] as const
                ).map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role.id)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-2 border-teal-600 bg-teal-50 text-teal-800 shadow-xs'
                          : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="truncate w-full">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedRole === 'class_teacher' ? 'Teacher ID / Email' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      selectedRole === 'class_teacher'
                        ? 'Enter Teacher ID or email'
                        : 'Enter administrator email'
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password field with lock icon, placeholder, and eye visibility icon */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Row: "Remember me" checkbox on left + "Forgot Password?" link on right */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setRecoveryFeedback(null);
                  }}
                  className="font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Authentication Button: Continue with Email */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 transition disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Continue with Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Student Check My Pending Option */}
            {onOpenMemberPortal && (
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={onOpenMemberPortal}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span>CLASS MEMBER — CHECK MY PENDING</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Authorized Portal verification badge */}
        <div className="mt-5 flex flex-col items-center gap-2 text-xs text-teal-200/90 text-center">
          <div className="flex items-center gap-1.5 text-teal-200/80 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>Authorized Swalah Financial Management Portal</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal with 9611395005 Phone Number Support */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Recover Password</h3>
                <p className="text-[11px] text-slate-500">Security Verification Service</p>
              </div>
            </div>

            {/* Toggle: Email vs Mobile vs Teacher */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode('email');
                  setRecoveryInput('');
                  setRecoveryFeedback(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  recoveryMode === 'email'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode('phone');
                  setRecoveryInput('');
                  setRecoveryFeedback(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  recoveryMode === 'phone'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMode('teacher');
                  setRecoveryInput('');
                  setRecoveryFeedback(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                  recoveryMode === 'teacher'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Teacher
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {recoveryMode === 'email'
                ? 'Enter your registered administrator email to receive password reset instructions.'
                : recoveryMode === 'phone'
                ? 'Enter your registered recovery phone number to receive a verification code.'
                : 'Enter your assigned Teacher ID or email to verify your identity.'}
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                  {recoveryMode === 'email'
                    ? 'Registered Email'
                    : recoveryMode === 'phone'
                    ? 'Recovery Phone Number'
                    : 'Teacher Identifier'}
                </label>
                <div className="relative">
                  {recoveryMode === 'phone' ? (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  )}
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder={
                      recoveryMode === 'email'
                        ? 'Enter email address'
                        : recoveryMode === 'phone'
                        ? 'Enter mobile number'
                        : 'Enter teacher ID'
                    }
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              {recoveryFeedback && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Status:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{recoveryFeedback}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow"
                >
                  Verify & Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
