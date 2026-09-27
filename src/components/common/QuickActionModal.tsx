import React from 'react';
import {
  X,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  BellRing,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'receive_money',
      title: 'Receive Money / Contribution',
      desc: 'Record student payment or class deposit',
      icon: ArrowDownLeft,
      color: 'bg-emerald-500 text-white',
      badge: '+ Income',
    },
    {
      id: 'add_expense',
      title: 'Add Expense Voucher',
      desc: 'Record stage, food, travel or printing cost',
      icon: ArrowUpRight,
      color: 'bg-rose-500 text-white',
      badge: '- Expense',
    },
    {
      id: 'add_student',
      title: 'Enroll New Student',
      desc: 'Add student details, roll number & contacts',
      icon: UserPlus,
      color: 'bg-blue-600 text-white',
      badge: 'Student',
    },
    {
      id: 'add_contribution',
      title: 'New Contribution Target',
      desc: 'Launch program or tour collection drive',
      icon: PiggyBank,
      color: 'bg-indigo-600 text-white',
      badge: 'Campaign',
    },
    {
      id: 'create_reminder',
      title: 'Create Due Reminder',
      desc: 'Set student pending alert or deadline',
      icon: BellRing,
      color: 'bg-amber-500 text-white',
      badge: 'Reminder',
    },
    {
      id: 'generate_report',
      title: 'Generate PDF Report',
      desc: 'Instant financial statement & balance sheet',
      icon: FileSpreadsheet,
      color: 'bg-purple-600 text-white',
      badge: 'Report',
    },
    {
      id: 'open_calculator',
      title: 'Class Quick Calculator',
      desc: 'Tally physical notes or split event charges',
      icon: Calculator,
      color: 'bg-slate-700 text-white',
      badge: 'Tool',
    },
  ];

  const handleAction = (id: string) => {
    onSelectAction(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Dashboard Quick Actions</h3>
            <p className="text-[11px] text-slate-400">Select an operation to perform</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => handleAction(act.id)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${act.color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{act.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800 shrink-0">
                  {act.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
