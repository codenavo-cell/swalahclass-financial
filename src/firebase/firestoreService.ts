import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import {
  Student,
  Transaction,
  ContributionCampaign,
  Reminder,
  AuditLog,
  ClassProfile,
} from '../types';

export const firestoreService = {
  // Check if live
  isLive: () => isFirebaseConfigured && db !== null,

  // Save or update class profile
  async saveProfile(profile: ClassProfile): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'classes', 'swalah_2026'), {
        ...profile,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('Firestore saveProfile error:', e);
    }
  },

  // Students collection
  async saveStudent(student: Student): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (e) {
      console.error('Firestore saveStudent error:', e);
    }
  },

  async deleteStudent(studentId: string): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (e) {
      console.error('Firestore deleteStudent error:', e);
    }
  },

  // Transactions ledger collection
  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (e) {
      console.error('Firestore saveTransaction error:', e);
    }
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (e) {
      console.error('Firestore deleteTransaction error:', e);
    }
  },

  // Contribution campaigns
  async saveCampaign(campaign: ContributionCampaign): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'contributions', campaign.id), campaign);
    } catch (e) {
      console.error('Firestore saveCampaign error:', e);
    }
  },

  // Reminders
  async saveReminder(reminder: Reminder): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'reminders', reminder.id), reminder);
    } catch (e) {
      console.error('Firestore saveReminder error:', e);
    }
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await deleteDoc(doc(db, 'reminders', reminderId));
    } catch (e) {
      console.error('Firestore deleteReminder error:', e);
    }
  },

  // Audit Logs (append only)
  async logAudit(log: AuditLog): Promise<void> {
    if (!this.isLive() || !db) return;
    try {
      await setDoc(doc(db, 'auditLogs', log.id), log);
    } catch (e) {
      console.error('Firestore logAudit error:', e);
    }
  },

  // Query transactions by date range for Reports
  async queryTransactionsByDate(startDate: string, endDate: string): Promise<Transaction[]> {
    if (!this.isLive() || !db) return [];
    try {
      const q = query(
        collection(db, 'transactions'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as Transaction);
    } catch (e) {
      console.error('Firestore queryTransactionsByDate error:', e);
      return [];
    }
  },

  // Query transactions for a specific student
  async queryTransactionsByStudent(studentId: string): Promise<Transaction[]> {
    if (!this.isLive() || !db) return [];
    try {
      const q = query(
        collection(db, 'transactions'),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as Transaction);
    } catch (e) {
      console.error('Firestore queryTransactionsByStudent error:', e);
      return [];
    }
  },

  // Query pending payments
  async queryPendingPayments(): Promise<Transaction[]> {
    if (!this.isLive() || !db) return [];
    try {
      const q = query(
        collection(db, 'transactions'),
        where('status', '==', 'pending'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as Transaction);
    } catch (e) {
      console.error('Firestore queryPendingPayments error:', e);
      return [];
    }
  },
};
