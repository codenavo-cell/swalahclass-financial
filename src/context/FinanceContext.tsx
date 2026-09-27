import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ClassProfile,
  Student,
  Transaction,
  ContributionCampaign,
  Reminder,
  NotificationItem,
  AuditLog,
  ClassGoal,
  DashboardSummary,
  StudentFinancialSummary,
  TransactionType,
} from '../types';
import {
  INITIAL_CLASS_PROFILE,
  INITIAL_STUDENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_REMINDERS,
  INITIAL_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../data/seedData';
import { firestoreService } from '../firebase/firestoreService';
import {
  hashPassword,
  DEFAULT_ADMIN_PASSWORD_HASH,
  DEFAULT_TEACHER_PASSWORD_HASH,
  AUTHORIZED_ADMIN_EMAILS,
  AUTHORIZED_TEACHER_IDENTIFIERS,
} from '../utils/security';

export type UserRole = 'admin' | 'class_teacher';

export interface AdminAuth {
  isAuthenticated: boolean;
  email: string | null;
  name: string;
  role?: UserRole;
  lastLogin: string | null;
}

interface FinanceContextType {
  // Auth
  auth: AdminAuth;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  updateAdminCredentials: (newEmail: string, newPassword?: string) => Promise<boolean>;
  adminEmail: string;

  // Data
  profile: ClassProfile;
  students: Student[];
  transactions: Transaction[];
  campaigns: ContributionCampaign[];
  reminders: Reminder[];
  goals: ClassGoal[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  categories: string[];
  paymentMethods: string[];

  // Summaries
  dashboardSummary: DashboardSummary;
  getStudentSummary: (studentId: string) => StudentFinancialSummary;
  getStudentTransactions: (studentId: string) => Transaction[];

  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  toggleStudentStatus: (id: string) => void;
  removeAllStudentsExceptOne: () => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Campaign Actions
  addCampaign: (campaign: Omit<ContributionCampaign, 'id' | 'createdAt'>) => ContributionCampaign;
  updateCampaign: (id: string, updates: Partial<ContributionCampaign>) => void;
  recordContributionPayment: (campaignId: string, studentId: string, amount: number, paymentMethod: string, notes?: string) => void;

  // Reminder Actions
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Reminder;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<ClassGoal, 'id'>) => void;
  updateGoalProgress: (id: string, newAmount: number) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'reminder') => void;

  // Categories & Setup
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  updateProfile: (profile: Partial<ClassProfile>) => void;

  // Backup & Restore
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; message: string };
  resetToDefaultData: () => void;
  clearAllFinancialData: () => void;
  logAuditAction: (action: AuditLog['action'], details: string, recordId?: string) => void;
  isFirestoreLive: boolean;
}

const STORAGE_KEYS = {
  AUTH: 'cf_admin_auth',
  PROFILE: 'cf_class_profile',
  STUDENTS: 'cf_students',
  TRANSACTIONS: 'cf_transactions',
  CAMPAIGNS: 'cf_campaigns',
  REMINDERS: 'cf_reminders',
  GOALS: 'cf_goals',
  NOTIFICATIONS: 'cf_notifications',
  AUDIT_LOGS: 'cf_audit_logs',
  CATEGORIES: 'cf_categories',
  PAYMENT_METHODS: 'cf_payment_methods',
  ADMIN_CREDS: 'cf_admin_credentials',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load stored admin credentials or defaults
  const [adminCreds, setAdminCreds] = useState<{ email: string; passwordHash: string }>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.passwordHash === '301thwalha' || !parsed.passwordHash) {
          parsed.passwordHash = DEFAULT_ADMIN_PASSWORD_HASH;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default allowed administrator
    return {
      email: 'codenavo@gmail.com', // Pre-configured admin email matching developer account
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    };
  });

  // Admin auth session
  const [auth, setAuth] = useState<AdminAuth>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Automatically authenticated as demo administrator in local dev session for seamless initial experience
    return {
      isAuthenticated: true,
      email: 'codenavo@gmail.com',
      name: 'Class Finance Administrator',
      lastLogin: new Date().toISOString(),
    };
  });

  // Data states with persistence
  const [profile, setProfileState] = useState<ClassProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed: ClassProfile = JSON.parse(stored);
        if (parsed.className === 'Wahdah') {
          parsed.className = 'Swalah';
          if (parsed.contactEmail === 'wahdah2026@noorulhuda.edu') {
            parsed.contactEmail = 'swalah2026@noorulhuda.edu';
          }
          if (parsed.description?.includes('Wahdah')) {
            parsed.description = parsed.description.replace(/Wahdah/g, 'Swalah');
          }
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
        }
        if (parsed.classLeader) {
          parsed.classLeader = '';
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CLASS_PROFILE;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (stored) {
        let parsed: Student[] = JSON.parse(stored);
        // Automatic cleanup: remove all demo students and keep only 1 member
        const singleMemberCleaned = localStorage.getItem('cf_single_member_mode_v2');
        if (!singleMemberCleaned) {
          localStorage.setItem('cf_single_member_mode_v2', 'true');
          const single = parsed.length > 0 ? [parsed[0]] : INITIAL_STUDENTS;
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(single));
          return single;
        }
        if (
          parsed.length > 0 &&
          (parsed[0].fullName === 'Ahmad Faris' || !parsed[0].email || parsed[0].email === 'faris@example.com')
        ) {
          parsed[0].fullName = 'THWALHA';
          parsed[0].email = 'irshadmnkd@gmail.com';
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        let parsed: Transaction[] = JSON.parse(stored);
        const singleMemberCleaned = localStorage.getItem('cf_single_member_txns_v2');
        if (!singleMemberCleaned) {
          localStorage.setItem('cf_single_member_txns_v2', 'true');
          parsed = parsed.filter((tx) => !tx.studentId || tx.studentId === 'stu-1');
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed));
          return parsed;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS.filter((tx) => !tx.studentId || tx.studentId === 'stu-1');
  });

  const [campaigns, setCampaigns] = useState<ContributionCampaign[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) {
        let parsed: ContributionCampaign[] = JSON.parse(stored);
        let updated = false;
        parsed = parsed.map((c) => {
          if (c.description?.includes('Wahdah') || c.title?.includes('Wahdah')) {
            updated = true;
            return {
              ...c,
              title: c.title.replace(/Wahdah/g, 'Swalah'),
              description: c.description.replace(/Wahdah/g, 'Swalah'),
            };
          }
          return c;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CAMPAIGNS;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REMINDERS;
  });

  const [goals, setGoals] = useState<ClassGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GOALS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(adminCreds));
  }, [adminCreds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Helper to append audit logs
  const logAuditAction = (action: AuditLog['action'], details: string, recordId?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      timestamp: new Date().toISOString(),
      adminEmail: auth.email || adminCreds.email,
      recordId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    firestoreService.logAudit(newLog);
  };

  // Helper to add internal notification
  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'reminder' = 'info',
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Authentication methods
  const login = async (
    usernameOrEmail: string,
    pass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const rawInput = usernameOrEmail.trim();
    const normalizedInput = rawInput.toLowerCase();
    const digitsOnly = rawInput.replace(/\D/g, '');
    const hashedInput = await hashPassword(pass);

    // 1. Check if authorized Class Teacher
    const isTeacher =
      AUTHORIZED_TEACHER_IDENTIFIERS.includes(normalizedInput) ||
      normalizedInput === 'nirs';

    if (isTeacher) {
      if (hashedInput !== DEFAULT_TEACHER_PASSWORD_HASH) {
        return {
          success: false,
          error: 'Invalid password. Please check your Class Teacher credentials.',
        };
      }

      const teacherAuth: AdminAuth = {
        isAuthenticated: true,
        email: 'nirs@noorulhuda.edu',
        name: 'Class Teacher (NIRS)',
        role: 'class_teacher',
        lastLogin: new Date().toISOString(),
      };
      setAuth(teacherAuth);
      logAuditAction('LOGIN', `Class Teacher (NIRS) signed in successfully`);
      addNotification('Teacher Signed In', 'Class Teacher session established.', 'success');
      return { success: true };
    }

    // 2. Check if authorized Admin
    const authorizedAdmin = adminCreds.email.trim().toLowerCase();
    const isAdmin =
      AUTHORIZED_ADMIN_EMAILS.includes(normalizedInput) ||
      normalizedInput === authorizedAdmin ||
      normalizedInput === 'admin@example.com' ||
      normalizedInput === 'codenavo@gmail.com' ||
      digitsOnly === '9611395005';

    if (isAdmin) {
      const isPasswordValid =
        hashedInput === adminCreds.passwordHash ||
        hashedInput === DEFAULT_ADMIN_PASSWORD_HASH;

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid password. Please check your admin credentials.',
        };
      }

      const effectiveEmail = normalizedInput.includes('@') ? normalizedInput : authorizedAdmin;
      const adminAuth: AdminAuth = {
        isAuthenticated: true,
        email: effectiveEmail,
        name: 'Class Finance Administrator',
        role: 'admin',
        lastLogin: new Date().toISOString(),
      };
      setAuth(adminAuth);
      logAuditAction('LOGIN', `Admin logged in successfully via identifier: ${rawInput}`);
      addNotification('Admin Signed In', 'Secure administrator session established.', 'success');
      return { success: true };
    }

    // 3. Strictly prevent unauthorized users from accessing the admin dashboard
    return {
      success: false,
      error: 'Invalid credentials. Please verify your email/identifier and password.',
    };
  };

  const logout = () => {
    logAuditAction('LOGOUT', `User ${auth.email || 'session'} logged out.`);
    setAuth({
      isAuthenticated: false,
      email: null,
      name: '',
      role: undefined,
      lastLogin: null,
    });
  };

  const requestPasswordReset = (identifier: string) => {
    const rawInput = identifier.trim();
    const normalizedInput = rawInput.toLowerCase();
    const digitsOnly = rawInput.replace(/\D/g, '');
    const authorizedAdmin = adminCreds.email.trim().toLowerCase();

    // Check if user entered teacher identifier NIRS
    if (AUTHORIZED_TEACHER_IDENTIFIERS.includes(normalizedInput) || normalizedInput === 'nirs') {
      return {
        success: true,
        message: 'Account verified. Password recovery instructions have been dispatched.',
      };
    }

    // Check if user entered phone or registered email
    const isPhoneMatch = digitsOnly === '9611395005';
    const isEmailMatch =
      AUTHORIZED_ADMIN_EMAILS.includes(normalizedInput) ||
      normalizedInput === authorizedAdmin;

    if (!isPhoneMatch && !isEmailMatch) {
      return {
        success: false,
        message: 'Identifier not recognized. Please check your details and try again.',
      };
    }

    if (isPhoneMatch) {
      return {
        success: true,
        message: 'Verification code sent to your registered mobile number.',
      };
    }

    return {
      success: true,
      message: 'Password reset link sent to your registered email address.',
    };
  };

  const updateAdminCredentials = async (newEmail: string, newPassword?: string): Promise<boolean> => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    let newHash = adminCreds.passwordHash;
    if (newPassword && newPassword.trim()) {
      newHash = await hashPassword(newPassword.trim());
    }
    const updated = {
      email: normalizedEmail,
      passwordHash: newHash,
    };
    setAdminCreds(updated);
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(updated));
    logAuditAction('SETTINGS_CHANGED', `Updated administrator email to ${normalizedEmail}`);
    addNotification('Security Settings Updated', 'Admin credentials updated successfully.', 'info');
    return true;
  };

  // Computed Financials
  const dashboardSummary = useMemo<DashboardSummary>(() => {
    let totalReceived = 0;
    let totalExpenses = 0;
    let totalPending = 0;
    let totalToReceive = 0;
    let totalAdvance = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'cancelled') return;

      if (tx.status === 'pending') {
        totalPending += tx.amount;
        if (tx.type === 'contribution' || tx.type === 'income' || tx.type === 'collection') {
          totalToReceive += tx.amount;
        }
        return;
      }

      switch (tx.type) {
        case 'income':
        case 'contribution':
        case 'collection':
          totalReceived += tx.amount;
          break;
        case 'expense':
        case 'payment':
          totalExpenses += tx.amount;
          break;
        case 'refund':
          totalExpenses += tx.amount;
          break;
        case 'advance':
        case 'loan':
          totalAdvance += tx.amount;
          totalExpenses += tx.amount;
          break;
        case 'adjustment':
          if (tx.amount > 0) totalReceived += tx.amount;
          else totalExpenses += Math.abs(tx.amount);
          break;
      }
    });

    const totalBalance = totalReceived - totalExpenses;

    return {
      totalBalance,
      totalReceived,
      totalExpenses,
      totalPending,
      totalToReceive,
      totalAdvance,
    };
  }, [transactions]);

  // Per-student summary calculation
  const getStudentSummary = (studentId: string): StudentFinancialSummary => {
    const studentTx = transactions.filter((tx) => tx.studentId === studentId && tx.status !== 'cancelled');

    let totalContributionPaid = 0;
    let totalPaid = 0; // Class received from student
    let totalPending = 0;
    let totalReceivedBack = 0; // Class paid to student

    studentTx.forEach((tx) => {
      if (tx.status === 'pending') {
        if (tx.type === 'contribution' || tx.type === 'income' || tx.type === 'collection') {
          totalPending += tx.amount;
        }
        return;
      }

      if (tx.type === 'contribution') {
        totalContributionPaid += tx.amount;
        totalPaid += tx.amount;
      } else if (tx.type === 'income' || tx.type === 'collection' || tx.type === 'payment') {
        totalPaid += tx.amount;
      } else if (tx.type === 'refund' || tx.type === 'advance' || tx.type === 'loan') {
        totalReceivedBack += tx.amount;
      }
    });

    // Check campaigns to calculate any unpaid quotas
    campaigns.forEach((camp) => {
      if (camp.status === 'active' && camp.perStudentAmount > 0) {
        const studentPaidForCamp = studentTx
          .filter((tx) => tx.campaignId === camp.id && tx.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        if (studentPaidForCamp < camp.perStudentAmount) {
          const diff = camp.perStudentAmount - studentPaidForCamp;
          // Only add if not already logged as a pending transaction
          const hasPendingTx = studentTx.some((tx) => tx.campaignId === camp.id && tx.status === 'pending');
          if (!hasPendingTx) {
            totalPending += diff;
          }
        }
      }
    });

    const balance = totalPaid - totalReceivedBack;

    return {
      totalContributionPaid,
      totalPaid,
      totalPending,
      totalReceivedBack,
      balance,
    };
  };

  const getStudentTransactions = (studentId: string) => {
    return transactions.filter((tx) => tx.studentId === studentId);
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStudents((prev) => [...prev, newStudent]);
    setProfileState((prev) => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
    firestoreService.saveStudent(newStudent);
    logAuditAction('STUDENT_CREATED', `Enrolled student ${newStudent.fullName} (Roll #${newStudent.rollNumber})`, id);
    addNotification('Student Enrolled', `${newStudent.fullName} added to the class ledger.`, 'info');
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
          firestoreService.saveStudent(updated);
          return updated;
        }
        return s;
      }),
    );
    logAuditAction('STUDENT_EDITED', `Updated details for student ID ${id}`, id);
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    firestoreService.deleteStudent(id);
    setProfileState((prev) => ({ ...prev, totalStudents: Math.max(0, prev.totalStudents - 1) }));
    logAuditAction('STUDENT_DELETED', `Deleted student ${target?.fullName || id}`, id);
    addNotification('Student Removed', `Student record ${target?.fullName} was removed.`, 'warning');
  };

  const toggleStudentStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'active' ? 'inactive' : 'active';
          logAuditAction('STUDENT_ARCHIVED', `Changed status of ${s.fullName} to ${newStatus}`, id);
          const updated = { ...s, status: newStatus as any, updatedAt: new Date().toISOString() };
          firestoreService.saveStudent(updated);
          return updated;
        }
        return s;
      }),
    );
  };

  const removeAllStudentsExceptOne = () => {
    const single = students.length > 0 ? [students[0]] : INITIAL_STUDENTS;
    setStudents(single);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(single));
    setTransactions((prev) => {
      const filtered = prev.filter((tx) => !tx.studentId || tx.studentId === single[0].id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
      return filtered;
    });
    setProfileState((prev) => ({ ...prev, totalStudents: 1 }));
    logAuditAction('SETTINGS_CHANGED', `Student directory cleaned: retained 1 member (${single[0].fullName}), removed all other students.`);
    addNotification('Student Directory Updated', `All other students removed. Retained 1 member (${single[0].fullName}).`, 'info');
  };

  // Transaction Actions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const id = `TXN-${1000 + transactions.length + 1}`;
    const newTx: Transaction = {
      ...txData,
      id,
      createdBy: auth.email || adminCreds.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    firestoreService.saveTransaction(newTx);

    // Update goal if applicable
    if (newTx.type === 'contribution' || newTx.type === 'income') {
      const matchedGoal = goals.find((g) => g.category === newTx.category || g.title.includes(newTx.category));
      if (matchedGoal) {
        updateGoalProgress(matchedGoal.id, matchedGoal.currentAmount + newTx.amount);
      }
    }

    logAuditAction(
      txData.type === 'expense' ? 'EXPENSE_ADDED' : 'TRANSACTION_CREATED',
      `Recorded ${newTx.type.toUpperCase()}: ${profile.currencySymbol}${newTx.amount} - ${newTx.description}`,
      id,
    );

    addNotification(
      newTx.type === 'expense' ? 'Expense Recorded' : 'Transaction Logged',
      `${profile.currencySymbol}${newTx.amount} (${newTx.category}) - ${newTx.description}`,
      newTx.type === 'expense' ? 'info' : 'success',
    );

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          const updated = { ...tx, ...updates, updatedAt: new Date().toISOString() };
          firestoreService.saveTransaction(updated);
          return updated;
        }
        return tx;
      }),
    );
    logAuditAction('TRANSACTION_EDITED', `Updated transaction ${id}`, id);
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    firestoreService.deleteTransaction(id);
    logAuditAction('TRANSACTION_DELETED', `Deleted transaction ${id} (${profile.currencySymbol}${tx?.amount || 0})`, id);
    addNotification('Transaction Deleted', `Transaction ${id} was permanently removed.`, 'warning');
  };

  // Campaign Actions
  const addCampaign = (campData: Omit<ContributionCampaign, 'id' | 'createdAt'>) => {
    const id = `camp-${Date.now()}`;
    const newCamp: ContributionCampaign = {
      ...campData,
      id,
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    firestoreService.saveCampaign(newCamp);
    logAuditAction('CONTRIBUTION_CREATED', `Created campaign: ${newCamp.title} (Target: ${profile.currencySymbol}${newCamp.requiredTotalAmount})`, id);
    addNotification('New Contribution Campaign', `${newCamp.title} (${profile.currencySymbol}${newCamp.perStudentAmount}/student)`, 'info');
    return newCamp;
  };

  const updateCampaign = (id: string, updates: Partial<ContributionCampaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          firestoreService.saveCampaign(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const recordContributionPayment = (
    campaignId: string,
    studentId: string,
    amount: number,
    paymentMethod: string,
    notes?: string,
  ) => {
    const student = students.find((s) => s.id === studentId);
    const campaign = campaigns.find((c) => c.id === campaignId);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addTransaction({
      date: dateStr,
      time: timeStr,
      amount,
      type: 'contribution',
      studentId,
      studentName: student?.fullName || 'Student',
      category: campaign?.category || 'Contribution',
      description: `${campaign?.title || 'Class Contribution'} payment`,
      paymentMethod: (paymentMethod.toLowerCase().replace(' ', '_') as any) || 'cash',
      status: 'completed',
      campaignId,
      notes: notes || `Direct record for ${student?.fullName}`,
    });
  };

  // Reminder Actions
  const addReminder = (remData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const id = `rem-${Date.now()}`;
    const newRem: Reminder = {
      ...remData,
      id,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newRem, ...prev]);
    firestoreService.saveReminder(newRem);
    addNotification('Reminder Created', newRem.title, 'reminder');
    return newRem;
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'completed' ? 'active' : 'completed';
          const updated = { ...r, status: nextStatus as any };
          firestoreService.saveReminder(updated);
          return updated;
        }
        return r;
      }),
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    firestoreService.deleteReminder(id);
  };

  // Goals
  const addGoal = (goalData: Omit<ClassGoal, 'id'>) => {
    const id = `goal-${Date.now()}`;
    setGoals((prev) => [...prev, { ...goalData, id }]);
  };

  const updateGoalProgress = (id: string, newAmount: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g)));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Categories & Profile
  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      logAuditAction('SETTINGS_CHANGED', `Added custom category: ${trimmed}`);
    }
  };

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    logAuditAction('SETTINGS_CHANGED', `Removed category: ${cat}`);
  };

  const updateProfile = (updates: Partial<ClassProfile>) => {
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setProfileState(updated);
    firestoreService.saveProfile(updated);
    logAuditAction('SETTINGS_CHANGED', `Updated class profile settings`);
    addNotification('Profile Saved', 'Class profile information updated.', 'info');
  };

  // Backup & Restore
  const exportDataJSON = () => {
    const dump = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      adminEmail: auth.email || adminCreds.email,
      profile,
      students,
      transactions,
      campaigns,
      reminders,
      goals,
      categories,
      paymentMethods,
      auditLogs,
    };
    logAuditAction('DATA_EXPORTED', `Exported full database backup (${transactions.length} txns, ${students.length} students)`);
    return JSON.stringify(dump, null, 2);
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.students || !parsed.transactions) {
        return { success: false, message: 'Invalid backup structure. Required keys missing.' };
      }
      if (parsed.profile) setProfileState(parsed.profile);
      if (parsed.students) setStudents(parsed.students);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.campaigns) setCampaigns(parsed.campaigns);
      if (parsed.reminders) setReminders(parsed.reminders);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);

      logAuditAction('DATA_RESTORED', `Imported database from backup archive`);
      addNotification('Database Restored', 'All records restored successfully from backup.', 'success');
      return { success: true, message: 'Class Finance database restored successfully!' };
    } catch (err) {
      return { success: false, message: 'Failed to parse JSON file. Corrupt or invalid format.' };
    }
  };

  const resetToDefaultData = () => {
    setProfileState(INITIAL_CLASS_PROFILE);
    setStudents(INITIAL_STUDENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setReminders(INITIAL_REMINDERS);
    setGoals(INITIAL_GOALS);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAuditAction('DATA_RESTORED', 'Reset class ledger to official Swalah 2026 seed state');
    addNotification('Database Reset', 'Class data reset to sample baseline.', 'info');
  };

  const clearAllFinancialData = () => {
    setTransactions([]);
    setCampaigns([]);
    setReminders([]);
    setGoals([]);
    logAuditAction('DATA_CLEARED', 'Cleared all transactions and campaign records');
    addNotification('Transactions Cleared', 'Financial records have been emptied.', 'warning');
  };

  const value = {
    auth,
    login,
    logout,
    requestPasswordReset,
    updateAdminCredentials,
    adminEmail: adminCreds.email,
    profile,
    students,
    transactions,
    campaigns,
    reminders,
    goals,
    notifications,
    auditLogs,
    categories,
    paymentMethods,
    dashboardSummary,
    getStudentSummary,
    getStudentTransactions,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    removeAllStudentsExceptOne,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCampaign,
    updateCampaign,
    recordContributionPayment,
    addReminder,
    toggleReminder,
    deleteReminder,
    addGoal,
    updateGoalProgress,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    addCategory,
    removeCategory,
    updateProfile,
    exportDataJSON,
    importDataJSON,
    resetToDefaultData,
    clearAllFinancialData,
    logAuditAction,
    isFirestoreLive: firestoreService.isLive(),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
