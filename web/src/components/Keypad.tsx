import React from 'react';
import type { BinaryOperation, UnaryOperation } from '../hooks/useCalculator';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onToggleSign: () => void;
  onBinaryOp: (op: BinaryOperation) => void;
  onUnaryOp: (op: UnaryOperation) => void;
  onEvaluate: () => void;
  isClearPending: boolean; // Tells whether C or AC should be shown
}

const Button: React.FC<{ 
  label: string | React.ReactNode; 
  onClick: () => void; 
  variant?: 'default' | 'operator' | 'action' | 'equal';
  className?: string;
}> = ({ label, onClick, variant = 'default', className = '' }) => {
  const baseStyle = "relative flex items-center justify-center h-[72px] rounded-2xl text-2xl font-medium transition-all duration-200 active:scale-90 overflow-hidden group select-none";
  
  const variants = {
    default: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-[0_4px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50",
    operator: "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shadow-[0_4px_10px_rgba(79,70,229,0.05)] border border-indigo-100/50 dark:border-indigo-800/30",
    action: "bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-[0_4px_10px_rgba(225,29,72,0.05)] border border-rose-100/50 dark:border-rose-800/30",
    equal: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-[0_8px_20px_rgba(79,70,229,0.3)] border border-indigo-400/20",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {/* Subtle shine effect */}
      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/5 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-full group-hover:translate-x-full duration-700" />
      {label}
    </button>
  );
};

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onClear,
  onAllClear,
  onToggleSign,
  onBinaryOp,
  onUnaryOp,
  onEvaluate,
  isClearPending
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {/* Row 1 */}
      <Button label={isClearPending ? 'C' : 'AC'} onClick={isClearPending ? onClear : onAllClear} variant="action" />
      <Button label="+/-" onClick={onToggleSign} variant="operator" />
      <Button label="%" onClick={() => onUnaryOp('percentage')} variant="operator" />
      <Button label="÷" onClick={() => onBinaryOp('divide')} variant="operator" />

      {/* Row 2 */}
      <Button label="7" onClick={() => onDigit('7')} />
      <Button label="8" onClick={() => onDigit('8')} />
      <Button label="9" onClick={() => onDigit('9')} />
      <Button label="×" onClick={() => onBinaryOp('multiply')} variant="operator" />

      {/* Row 3 */}
      <Button label="4" onClick={() => onDigit('4')} />
      <Button label="5" onClick={() => onDigit('5')} />
      <Button label="6" onClick={() => onDigit('6')} />
      <Button label="−" onClick={() => onBinaryOp('subtract')} variant="operator" />

      {/* Row 4 */}
      <Button label="1" onClick={() => onDigit('1')} />
      <Button label="2" onClick={() => onDigit('2')} />
      <Button label="3" onClick={() => onDigit('3')} />
      <Button label="+" onClick={() => onBinaryOp('add')} variant="operator" />

      {/* Row 5 */}
      <Button label="0" onClick={() => onDigit('0')} />
      <Button label="." onClick={onDecimal} />
      <Button label="√" onClick={() => onUnaryOp('sqrt')} variant="operator" />
      <Button label="=" onClick={onEvaluate} variant="equal" />
      
      {/* Extra Row */}
      <Button label="xʸ" onClick={() => onBinaryOp('power')} variant="operator" className="col-span-4" />
    </div>
  );
};
