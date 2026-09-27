import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, UserPlus, Phone, Mail, User, Hash, FileText, Settings, ShieldCheck } from 'lucide-react';
import { Student } from '../../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStudent?: Student | null;
  onSaved?: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  editingStudent,
  onSaved,
}) => {
  const { addStudent, updateStudent, students, profile, auth } = useFinance();

  const isAuthorized = auth.role === 'admin' || auth.role === 'class_teacher';

  const [fullName, setFullName] = useState(editingStudent?.fullName || '');
  const [rollNumber, setRollNumber] = useState<number>(editingStudent?.rollNumber || 1);
  const [studentNumber, setStudentNumber] = useState(editingStudent?.studentNumber || '');
  const [registrationNumber, setRegistrationNumber] = useState(
    editingStudent?.registrationNumber || '',
  );
  const [phone, setPhone] = useState(editingStudent?.phone || '');
  const [email, setEmail] = useState(editingStudent?.email || '');
  const [parentContact, setParentContact] = useState(editingStudent?.parentContact || '');
  const [notes, setNotes] = useState(editingStudent?.notes || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(editingStudent?.status || 'active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingStudent) {
      setFullName(editingStudent.fullName || '');
      setRollNumber(editingStudent.rollNumber || 1);
      setStudentNumber(editingStudent.studentNumber || '');
      setRegistrationNumber(editingStudent.registrationNumber || '');
      setPhone(editingStudent.phone || '');
      setEmail(editingStudent.email || '');
      setParentContact(editingStudent.parentContact || '');
      setNotes(editingStudent.notes || '');
      setStatus(editingStudent.status || 'active');
      setError(null);
    } else {
      const nextRoll = students.length > 0 ? Math.max(...students.map((s) => s.rollNumber)) + 1 : 1;
      const prefix = profile?.className ? profile.className.slice(0, 3).toUpperCase() : 'SWL';
      setFullName('');
      setRollNumber(nextRoll);
      setStudentNumber(`${prefix}-${String(nextRoll).padStart(3, '0')}`);
      setRegistrationNumber(`NHIA-2026-${100 + nextRoll}`);
      setPhone('');
      setEmail('');
      setParentContact('');
      setNotes('');
      setStatus('active');
      setError(null);
    }
  }, [editingStudent, isOpen, students, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthorized) {
      setError('Permission denied: Only Admin or Class Teacher can edit student settings.');
      return;
    }

    if (!fullName.trim()) {
      setError('Please provide the student’s full name.');
      return;
    }

    if (rollNumber <= 0) {
      setError('Roll number must be a positive integer.');
      return;
    }

    // Check duplicate roll number (if not editing current)
    const duplicate = students.find(
      (s) => s.rollNumber === rollNumber && s.id !== editingStudent?.id,
    );
    if (duplicate) {
      setError(`Roll number ${rollNumber} is already assigned to ${duplicate.fullName}.`);
      return;
    }

    if (editingStudent) {
      const updatedData: Partial<Student> = {
        fullName: fullName.trim(),
        rollNumber,
        studentNumber: studentNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        parentContact: parentContact.trim(),
        notes: notes.trim(),
        status,
      };
      updateStudent(editingStudent.id, updatedData);
      onSaved?.({ ...editingStudent, ...updatedData } as Student);
    } else {
      const created = addStudent({
        fullName: fullName.trim(),
        rollNumber,
        studentNumber: studentNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        parentContact: parentContact.trim(),
        notes: notes.trim(),
        status,
      });
      onSaved?.(created);
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
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
              {editingStudent ? <Settings className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {editingStudent ? 'Edit Student Settings' : 'Enroll New Student'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  {auth.role === 'class_teacher' ? 'Class Teacher' : 'Admin'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                {editingStudent
                  ? `Modifying settings for ${editingStudent.fullName} (Roll #${editingStudent.rollNumber})`
                  : 'Class ledger enrollment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Student Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahmad Faris"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Roll Number *
              </label>
              <input
                type="number"
                value={rollNumber}
                onChange={(e) => setRollNumber(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Student ID / Code
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="SWL-001"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="NHIA-2026-101"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 12345"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Parent / Guardian Contact
              </label>
              <input
                type="text"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="+91 94470 54321"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              >
                <option value="active">Active (Currently Studying)</option>
                <option value="inactive">Inactive / Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Administrative Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Special fee exemption, financial aid, or notes..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
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
              className="px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-800/20 transition cursor-pointer"
            >
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
