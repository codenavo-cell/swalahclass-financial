import React from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  PiggyBank,
  TrendingDown,
  BarChart3,
  BellRing,
  Settings,
  ShieldAlert,
  LogOut,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { students, transactions, campaigns, reminders, notifications, dashboardSummary, profile, logout, auth } =
    useFinance();

  const activeRemindersCount = reminders.filter((r) => r.status === 'active').length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: transactions.length },
    { id: 'contributions', label: 'Contributions', icon: PiggyBank, badge: activeCampaignsCount, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'reports', label: 'Reports & PDF', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: BellRing, badge: activeRemindersCount, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'audit', label: 'Audit Log', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-4rem)]">
      {/* Top Section */}
      <div className="p-4 space-y-6">
        {/* Class Ledger Balance Widget in Sidebar */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-2xl p-4 shadow-lg shadow-blue-900/15 border border-blue-800">
          <div className="flex items-center justify-between text-blue-200 text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Class Balance
            </span>
            <span className="text-[10px] bg-blue-700/60 px-1.5 py-0.5 rounded text-blue-100">Live</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight mt-1">
            {profile.currencySymbol}
            {dashboardSummary.totalBalance.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-blue-700/40 flex justify-between text-[11px] text-blue-200">
            <span>Recv: {profile.currencySymbol}{dashboardSummary.totalReceived.toLocaleString()}</span>
            <span>Spent: {profile.currencySymbol}{dashboardSummary.totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-800 text-white shadow-sm shadow-blue-800/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-950 text-blue-200'
                        : item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Security */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="truncate mr-2">
            <p className="font-semibold text-slate-800 truncate">
              {auth.role === 'class_teacher' ? 'Class Teacher (NIRS)' : 'Administrator'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{auth.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
