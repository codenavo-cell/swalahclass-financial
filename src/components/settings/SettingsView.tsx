import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Settings,
  School,
  Lock,
  Database,
  AlertTriangle,
  Download,
  Upload,
  CheckCircle,
  Save,
  Tag,
  CreditCard,
  RotateCcw,
  Trash2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    adminEmail,
    updateAdminCredentials,
    exportDataJSON,
    importDataJSON,
    resetToDefaultData,
    clearAllFinancialData,
    auth,
  } = useFinance();

  const isClassTeacher = auth.role === 'class_teacher';

  // Class Profile State
  const [className, setClassName] = useState(profile.className);
  const [institutionName, setInstitutionName] = useState(profile.institutionName);
  const [academicYear, setAcademicYear] = useState(profile.academicYear);
  const [batch, setBatch] = useState(profile.batch);
  const [classLeader, setClassLeader] = useState(profile.classLeader);
  const [assistantLeader, setAssistantLeader] = useState(profile.assistantLeader);
  const [classTeacher, setClassTeacher] = useState(profile.classTeacher);
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol);
  const [contactEmail, setContactEmail] = useState(profile.contactEmail);
  const [contactPhone, setContactPhone] = useState(profile.contactPhone);
  const [description, setDescription] = useState(profile.description);

  // Admin Credentials State
  const [newAdminEmail, setNewAdminEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Status message
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      className: className.trim(),
      institutionName: institutionName.trim(),
      academicYear: academicYear.trim(),
      batch: batch.trim(),
      classLeader: classLeader.trim(),
      assistantLeader: assistantLeader.trim(),
      classTeacher: classTeacher.trim(),
      currencySymbol: currencySymbol.trim() || '₹',
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      description: description.trim(),
    });

    setSaveMessage('Class settings updated successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    await updateAdminCredentials(newAdminEmail, newPassword || undefined);
    setCredMessage({ type: 'success', text: 'Admin security credentials updated.' });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setCredMessage(null), 3000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Class_${profile.className}_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataJSON(content);
        if (res.success) {
          setSaveMessage('Class Finance database restored successfully!');
          setTimeout(() => setSaveMessage(null), 4000);
        } else {
          setSaveMessage(`Import failed: ${res.message}`);
          setTimeout(() => setSaveMessage(null), 5000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-900" />
            <span>Class Finance Configuration & Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Class profile, role authorizations (Admin & Class Teacher), and full ledger backups
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Authorized: {auth.role === 'class_teacher' ? 'Class Teacher' : 'Administrator'}</span>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 1. Class Profile Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Class & Institution Profile</h3>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Editable by Admin & Teacher
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Official ledger details shown on receipts, reports, and member cards</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Class Name *
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Swalah"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Noorul Huda Islamic Academy"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Academic Session Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Batch Identifier
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch 2024-2026"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Class Teacher / Usthad
              </label>
              <input
                type="text"
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                placeholder="Usthad Abdullah Al-Hadi"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Class Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98471 23456"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Class Portal Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Official financial management and ledger portal..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Class Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Admin Security & Credentials */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-900">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Single Administrator Security</h3>
            <p className="text-[11px] text-slate-500">
              Only this email address is granted permission to access and modify financial records
            </p>
          </div>
        </div>

        {credMessage && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              credMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{credMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Authorized Admin Email
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="codenavo@gmail.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                New Password (Optional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Credentials</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Database Backup & Restore */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Database Backup & Archive</h3>
            <p className="text-[11px] text-slate-500">
              Export and restore all class students, transactions, and audit logs as JSON
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Export Full Database</h4>
              <p className="text-xs text-slate-500 mt-1">
                Download a complete, offline JSON archive containing all financial ledger entries, student profiles, and historical logs.
              </p>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="mt-4 py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Restore From Backup</h4>
              <p className="text-xs text-slate-500 mt-1">
                Upload a previously saved JSON backup file to instantly restore database state.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Select File to Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Dangerous Zone */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-900">Dangerous Administrative Operations</h3>
            <p className="text-[11px] text-slate-500">
              Irreversible actions requiring strict confirmation to safeguard ledger integrity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-950">Reset to Class Swalah 2026 Seed Baseline</h4>
              <p className="text-xs text-rose-900/80 mt-0.5">
                Restores official starter records for Noorul Huda Islamic Academy (38 students & sample entries).
              </p>
            </div>
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: 'Reset to Sample Seed Data',
                  message:
                    'Are you sure you want to reset all data back to the default Swalah 2026 baseline? Any custom transactions created will be replaced with sample entries.',
                  onConfirm: () => {
                    resetToDefaultData();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  },
                })
              }
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-950">Clear All Financial Ledger Records</h4>
              <p className="text-xs text-rose-900/80 mt-0.5">
                Clears all transactions, campaigns, and reminders, leaving student directory intact.
              </p>
            </div>
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: 'Clear Financial Data',
                  message:
                    'WARNING: This will permanently delete all transactions and campaigns. Your student enrollments will remain.',
                  onConfirm: () => {
                    clearAllFinancialData();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  },
                })
              }
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Transactions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmationModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Execute Operation"
          isDestructive={true}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
