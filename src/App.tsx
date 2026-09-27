import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { QuickActionModal } from './components/common/QuickActionModal';
import { QuickCalculator } from './components/common/QuickCalculator';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { StudentsView } from './components/students/StudentsView';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { AddStudentModal } from './components/students/AddStudentModal';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { ContributionsView } from './components/contributions/ContributionsView';
import { AddCampaignModal } from './components/contributions/AddCampaignModal';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { RemindersView } from './components/reminders/RemindersView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';
import { PublicPaymentRequestModal } from './components/requests/PublicPaymentRequestModal';
import { MemberPendingView } from './components/member/MemberPendingView';
import { NonogramGate } from './components/puzzle/NonogramGate';

import { Student, Transaction, TransactionType } from './types';

const MainAppContent: React.FC = () => {
  const { auth, students, transactions } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Student Profile & Add Modals
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Transaction Modals
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('income');
  const [defaultTxStudentId, setDefaultTxStudentId] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Campaign Modals
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);

  // Payment Request & Reminder Modals
  const [paymentRequestStudent, setPaymentRequestStudent] = useState<Student | null>(null);
  const [paymentRequestAmount, setPaymentRequestAmount] = useState<number | undefined>(undefined);

  // Puzzle Gate ("before open website" challenge)
  const [showPuzzleGate, setShowPuzzleGate] = useState(true);

  // Class Member Portal Mode
  const [showMemberPortal, setShowMemberPortal] = useState(false);

  // 1. Interactive Nonogram Gate ("before open website")
  if (showPuzzleGate) {
    return <NonogramGate onEnterWebsite={() => setShowPuzzleGate(false)} />;
  }

  // 2. If not logged in as the designated administrator, show the secure authentication screen or member portal
  if (!auth.isAuthenticated) {
    if (showMemberPortal) {
      return <MemberPendingView onBackToAdmin={() => setShowMemberPortal(false)} />;
    }
    return (
      <LoginView
        onOpenMemberPortal={() => setShowMemberPortal(true)}
        onOpenNonogramPuzzle={() => setShowPuzzleGate(true)}
      />
    );
  }

  // Handlers
  const handleOpenAddTransaction = (type: TransactionType = 'income', studentId?: string) => {
    setDefaultTxType(type);
    setDefaultTxStudentId(studentId);
    setEditingTransaction(null);
    setIsAddTransactionOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setDefaultTxType(tx.type);
    setDefaultTxStudentId(tx.studentId);
    setIsAddTransactionOpen(true);
  };

  const handleSelectStudentById = (studentId: string) => {
    const stu = students.find((s) => s.id === studentId);
    if (stu) {
      setSelectedStudentForProfile(stu);
    }
  };

  const handleRequestPayment = (student: Student, pendingAmount: number) => {
    setPaymentRequestStudent(student);
    setPaymentRequestAmount(pendingAmount > 0 ? pendingAmount : 500);
  };

  const handleQuickActionSelect = (actionId: string) => {
    switch (actionId) {
      case 'receive_money':
        handleOpenAddTransaction('income');
        break;
      case 'add_expense':
        handleOpenAddTransaction('expense');
        break;
      case 'add_student':
        setIsAddStudentOpen(true);
        break;
      case 'add_contribution':
        setIsAddCampaignOpen(true);
        break;
      case 'create_reminder':
        setActiveTab('reminders');
        break;
      case 'generate_report':
        setActiveTab('reports');
        break;
      case 'open_calculator':
        setIsCalculatorOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onGlobalSearch={() => setIsGlobalSearchOpen(true)}
        activeTab={activeTab}
      />

      {/* Main Body with Desktop Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenAddTransaction={handleOpenAddTransaction}
              onOpenAddStudent={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              onOpenAddCampaign={() => setIsAddCampaignOpen(true)}
              onOpenAddReminder={() => setActiveTab('reminders')}
              onSelectStudent={handleSelectStudentById}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              onSelectStudent={setSelectedStudentForProfile}
              onOpenAddStudentModal={() => {
                setEditingStudent(null);
                setIsAddStudentOpen(true);
              }}
              onRequestPayment={handleRequestPayment}
              onEditStudent={(stu) => {
                setEditingStudent(stu);
                setIsAddStudentOpen(true);
              }}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddModal={handleOpenAddTransaction}
              onEditTransaction={handleEditTransaction}
              onSelectStudent={handleSelectStudentById}
            />
          )}

          {activeTab === 'contributions' && <ContributionsView />}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'reminders' && <RemindersView />}

          {activeTab === 'audit' && <AuditLogView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile-first Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Global Modals */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleQuickActionSelect}
      />

      <QuickCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectStudent={setSelectedStudentForProfile}
        onSelectTransaction={(tx) => {
          setActiveTab('transactions');
        }}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        isOpen={Boolean(selectedStudentForProfile)}
        onClose={() => setSelectedStudentForProfile(null)}
        onAddTransactionForStudent={(sId) => handleOpenAddTransaction('contribution', sId)}
        onSetReminderForStudent={(stu, amt) => {
          setSelectedStudentForProfile(null);
          setActiveTab('reminders');
        }}
        onRequestPayment={handleRequestPayment}
        onEditStudent={(stu) => {
          setEditingStudent(stu);
          setIsAddStudentOpen(true);
        }}
      />

      {/* Add / Edit Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        editingStudent={editingStudent}
        onClose={() => {
          setIsAddStudentOpen(false);
          setEditingStudent(null);
        }}
        onSaved={(updated) => {
          if (selectedStudentForProfile && selectedStudentForProfile.id === updated.id) {
            setSelectedStudentForProfile(updated);
          }
        }}
      />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        defaultType={defaultTxType}
        defaultStudentId={defaultTxStudentId}
        editingTransaction={editingTransaction}
      />

      {/* Add Contribution Campaign Modal */}
      <AddCampaignModal
        isOpen={isAddCampaignOpen}
        onClose={() => setIsAddCampaignOpen(false)}
      />

      {/* Shareable Public Payment Request Modal */}
      {paymentRequestStudent && (
        <PublicPaymentRequestModal
          isOpen={true}
          onClose={() => setPaymentRequestStudent(null)}
          student={paymentRequestStudent}
          amount={paymentRequestAmount}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
