import React, { useState } from 'react';
import { X, Delete, Copy, Check, Calculator as CalcIcon } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface QuickCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyValue?: (val: number) => void;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({
  isOpen,
  onClose,
  onApplyValue,
}) => {
  const { profile } = useFinance();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleEquals = () => {
    if (!equation) return;
    try {
      const fullExpr = `${equation}${display}`.replace(/×/g, '*').replace(/÷/g, '/');
      // safe numeric evaluate
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();
      setDisplay(String(Math.round(result * 100) / 100));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApply = () => {
    const num = parseFloat(display);
    if (!isNaN(num) && onApplyValue) {
      onApplyValue(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xs w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-sm">Class Quick Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-blue-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-900 text-right p-5 text-white">
          <div className="text-xs text-slate-400 font-mono min-h-[16px]">{equation || ' '}</div>
          <div className="text-3xl font-mono font-bold tracking-tight text-emerald-400 mt-1 truncate">
            {profile.currencySymbol} {display}
          </div>
        </div>

        {/* Pad Buttons */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-slate-50">
          <button
            onClick={handleClear}
            className="p-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-sm transition"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center transition"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="p-3 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base transition"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="p-3 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base transition"
          >
            ×
          </button>

          <button onClick={() => handleDigit('7')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            7
          </button>
          <button onClick={() => handleDigit('8')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            8
          </button>
          <button onClick={() => handleDigit('9')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            9
          </button>
          <button onClick={() => handleOperator('-')} className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base transition">
            -
          </button>

          <button onClick={() => handleDigit('4')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            4
          </button>
          <button onClick={() => handleDigit('5')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            5
          </button>
          <button onClick={() => handleDigit('6')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            6
          </button>
          <button onClick={() => handleOperator('+')} className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-base transition">
            +
          </button>

          <button onClick={() => handleDigit('1')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            1
          </button>
          <button onClick={() => handleDigit('2')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            2
          </button>
          <button onClick={() => handleDigit('3')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            3
          </button>
          <button
            onClick={handleEquals}
            className="row-span-2 p-3.5 rounded-2xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-800/30 transition"
          >
            =
          </button>

          <button onClick={() => handleDigit('0')} className="col-span-2 p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            0
          </button>
          <button onClick={() => handleDigit('.')} className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base shadow-xs transition">
            .
          </button>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {onApplyValue && (
            <button
              onClick={handleApply}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              Use Amount
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
