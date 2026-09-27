import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Menu,
  Plus,
  PiggyBank,
  TrendingDown,
  BellRing,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAction,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { reminders, campaigns } = useFinance();
  const activeRemindersCount = reminders.filter((r) => r.status === 'active').length;

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Options Drawer for Mobile */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">More Management Areas</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSelect('contributions')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border transition ${
                  activeTab === 'contributions'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Contributions</p>
                  <p className="text-[10px] text-slate-500">Campaigns & targets</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect('expenses')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border transition ${
                  activeTab === 'expenses'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Expenses</p>
                  <p className="text-[10px] text-slate-500">Categories & receipts</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect('reminders')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border transition relative ${
                  activeTab === 'reminders'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {activeRemindersCount > 0 && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {activeRemindersCount}
                  </span>
                )}
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <BellRing className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Reminders</p>
                  <p className="text-[10px] text-slate-500">Student dues</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect('audit')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border transition ${
                  activeTab === 'audit'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-200 text-slate-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Audit Log</p>
                  <p className="text-[10px] text-slate-500">Security history</p>
                </div>
              </button>

              <button
                onClick={() => handleSelect('settings')}
                className={`p-4 rounded-2xl flex flex-col items-start gap-2 border col-span-2 transition ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Admin Settings & Backup</p>
                    <p className="text-[10px] text-slate-500">Class profile, credentials & backup</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Mobile Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden px-2 py-2 flex items-center justify-around shadow-lg">
        {/* Home */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-blue-800 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </button>

        {/* Students */}
        <button
          onClick={() => onSelectTab('students')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'students' ? 'text-blue-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Students</span>
        </button>

        {/* Floating Add Center Action */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenQuickAction}
            className="w-13 h-13 rounded-full bg-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-800/40 border-4 border-slate-50 active:scale-95 transition cursor-pointer"
            aria-label="Add transaction or action"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-blue-900 mt-1">Action</span>
        </div>

        {/* Transactions */}
        <button
          onClick={() => onSelectTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'transactions' ? 'text-blue-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1">Ledger</span>
        </button>

        {/* More */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            ['contributions', 'expenses', 'reminders', 'reports', 'settings', 'audit'].includes(activeTab)
              ? 'text-blue-800 font-bold'
              : 'text-slate-500'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
