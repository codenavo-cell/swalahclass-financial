import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Bell,
  Calculator,
  Search,
  LogOut,
  School,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenCalculator: () => void;
  onGlobalSearch: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenCalculator,
  onGlobalSearch,
  activeTab,
}) => {
  const { profile, auth, logout, notifications } = useFinance();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Institution & Class identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/15 border border-blue-800 shrink-0">
            <School className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Class {profile.className}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                <Calendar className="w-3 h-3" />
                {profile.academicYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs">
              {profile.institutionName}
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global search trigger */}
          <button
            onClick={onGlobalSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium transition cursor-pointer"
            title="Search students & transactions"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Quick Search...</span>
          </button>

          {/* Quick Calculator Button */}
          <button
            onClick={onOpenCalculator}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-transparent hover:border-blue-200 cursor-pointer relative"
            title="Quick Calculator"
          >
            <Calculator className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-transparent hover:border-blue-200 cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User badge & logout */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {auth.role === 'class_teacher' ? 'Class Teacher' : 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {auth.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {auth.role === 'class_teacher' ? 'T' : 'A'}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
