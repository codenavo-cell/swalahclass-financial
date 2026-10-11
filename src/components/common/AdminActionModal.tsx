import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  CheckCircle,
  KeyRound,
} from 'lucide-react';

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  isDestructive?: boolean;
  onAuthorized: () => void;
}

export const AdminActionModal: React.FC<AdminActionModalProps> = ({
  isOpen,
  onClose,
  title = 'Administrator Authorization Required',
  description = 'Modifications, additions, and deletions in class finances are strictly restricted to the Administrator.',
  actionLabel = 'Authorize & Proceed',
  isDestructive = false,
  onAuthorized,
}) => {
  const { auth, verifyAdminPassword, adminCreds, logAuditAction } = useFinance();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter the administrator password.');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        logAuditAction('SETTINGS_CHANGED', `Admin action authorized: ${title}`);
        onAuthorized();
        onClose();
      } else {
        setError('Invalid Administrator Password. Only authorized administrators can perform changes.');
        logAuditAction('SETTINGS_CHANGED', `UNAUTHORIZED ATTEMPT BLOCKED: ${title}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification error.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isDestructive
              ? 'bg-gradient-to-r from-rose-700 to-rose-900'
              : 'bg-gradient-to-r from-blue-900 to-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              {isDestructive ? (
                <ShieldAlert className="w-5 h-5 text-rose-200" />
              ) : (
                <Lock className="w-5 h-5 text-blue-200" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">{title}</h3>
              <p className="text-[11px] text-white/80">Admin Control Protected Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">Security Rule Active</p>
              <p className="text-amber-800 leading-relaxed text-[11px]">{description}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Account
            </label>
            <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
              <span>{adminCreds.email || 'codenavo@gmail.com'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Authorized Admin
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Admin Password</span>
              <span className="text-[10px] text-slate-400 font-normal">Enter password to authorize</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : actionLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
