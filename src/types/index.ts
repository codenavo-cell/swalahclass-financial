export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';

export interface ClassProfile {
  className: string;
  institutionName: string;
  academicYear: string;
  batch: string;
  classLeader: string;
  assistantLeader: string;
  classTeacher: string;
  totalStudents: number;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  updatedAt: string;
}

export type StudentStatus = 'active' | 'inactive';

export interface Student {
  id: string;
  fullName: string;
  studentNumber: string;
  rollNumber: number;
  registrationNumber: string;
  phone?: string;
  email?: string;
  parentContact?: string;
  notes?: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'income'
  | 'expense'
  | 'contribution'
  | 'refund'
  | 'loan'
  | 'advance'
  | 'collection'
  | 'payment'
  | 'adjustment'
  | 'other';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';

export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amount: number;
  type: TransactionType;
  studentId?: string; // Optional if general class expense/income
  studentName?: string;
  category: string;
  description: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  campaignId?: string;
  paidTo?: string; // For expenses
  receiptRef?: string;
}

export interface ContributionCampaign {
  id: string;
  title: string;
  requiredTotalAmount: number;
  perStudentAmount: number;
  dueDate: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export interface ContributionStudentStatus {
  studentId: string;
  amountPaid: number;
  amountRequired: number;
  status: 'paid' | 'partial' | 'pending';
  lastPaidDate?: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  type: 'student' | 'contribution' | 'general' | 'report';
  studentId?: string;
  studentName?: string;
  amount?: number;
  isRepeating?: boolean;
  status: 'active' | 'completed' | 'dismissed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'STUDENT_CREATED'
    | 'STUDENT_EDITED'
    | 'STUDENT_ARCHIVED'
    | 'STUDENT_DELETED'
    | 'TRANSACTION_CREATED'
    | 'TRANSACTION_EDITED'
    | 'TRANSACTION_DELETED'
    | 'EXPENSE_ADDED'
    | 'CONTRIBUTION_CREATED'
    | 'REPORT_GENERATED'
    | 'SETTINGS_CHANGED'
    | 'DATA_EXPORTED'
    | 'DATA_RESTORED'
    | 'DATA_CLEARED';
  timestamp: string;
  adminEmail: string;
  recordId?: string;
  details: string;
}

export interface ClassGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  notes?: string;
}

export interface StudentFinancialSummary {
  totalContributionPaid: number;
  totalPaid: number; // class received from student
  totalPending: number; // student owes class
  totalReceivedBack: number; // class paid to student (refund/advance)
  balance: number; // net standing (positive = student has credit/excess, negative = owes)
}

export interface DashboardSummary {
  totalBalance: number;
  totalReceived: number;
  totalExpenses: number;
  totalPending: number;
  totalToReceive: number;
  totalAdvance: number;
}
