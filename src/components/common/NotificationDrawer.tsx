import React from 'react';
import { X, CheckCheck, Bell, Info, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinance();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              <p className="text-[11px] text-slate-500">
                {notifications.filter((n) => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-200 text-xs font-medium flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400">Financial alerts and reminders will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const getIcon = () => {
                switch (notif.type) {
                  case 'success':
                    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  case 'warning':
                    return <AlertTriangle className="w-4 h-4 text-amber-600" />;
                  case 'reminder':
                    return <Clock className="w-4 h-4 text-indigo-600" />;
                  default:
                    return <Info className="w-4 h-4 text-blue-600" />;
                }
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                    notif.read
                      ? 'bg-white border-slate-200 opacity-75'
                      : 'bg-blue-50/70 border-blue-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="shrink-0 mt-0.5">{getIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Class Finance Internal Notification Center
          </p>
        </div>
      </div>
    </div>
  );
};
