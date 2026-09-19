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
  variant?: 'digit' | 'binaryOp' | 'unaryOp' | 'equal';
  className?: string;
}> = ({ label, onClick, variant = 'digit', className = '' }) => {
  const baseStyle = "relative flex items-center justify-center h-[72px] rounded-2xl text-2xl font-light tracking-tight tabular-nums transition-all duration-200 active:scale-95 overflow-hidden group select-none";
  
  const variants = {
    digit: "bg-[#ffffff] dark:bg-[#182121] text-[#0c1010] dark:text-[#f0f4f4] border border-[#c5d3d3] dark:border-[#1f2828] hover:bg-[#f0f5f5] dark:hover:bg-[#202c2c] shadow-[0_4px_10px_rgba(0,0,0,0.02)]",
    binaryOp: "bg-[#aa96ad] dark:bg-[#67536a] text-[#ffffff] dark:text-[#ffffff] border border-transparent hover:bg-[#9d87a0] dark:hover:bg-[#755e78] shadow-[0_4px_10px_rgba(0,0,0,0.05)]",
    unaryOp: "bg-[#b1aabc] dark:bg-[#4a4356] text-[#0c1010] dark:text-[#f0f4f4] border border-transparent hover:bg-[#a39bad] dark:hover:bg-[#574e64] shadow-[0_4px_10px_rgba(0,0,0,0.05)]",
    equal: "bg-[#7c9899] dark:bg-[#678283] text-[#ffffff] border border-transparent hover:bg-[#6c898a] dark:hover:bg-[#577172] shadow-[0_8px_20px_rgba(0,0,0,0.15)]",
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
      <Button label={isClearPending ? 'C' : 'AC'} onClick={isClearPending ? onClear : onAllClear} variant="unaryOp" />
      <Button label="+/-" onClick={onToggleSign} variant="unaryOp" />
      <Button label="%" onClick={() => onUnaryOp('percentage')} variant="unaryOp" />
      <Button label="÷" onClick={() => onBinaryOp('divide')} variant="binaryOp" />

      {/* Row 2 */}
      <Button label="7" onClick={() => onDigit('7')} variant="digit" />
      <Button label="8" onClick={() => onDigit('8')} variant="digit" />
      <Button label="9" onClick={() => onDigit('9')} variant="digit" />
      <Button label="×" onClick={() => onBinaryOp('multiply')} variant="binaryOp" />

      {/* Row 3 */}
      <Button label="4" onClick={() => onDigit('4')} variant="digit" />
      <Button label="5" onClick={() => onDigit('5')} variant="digit" />
      <Button label="6" onClick={() => onDigit('6')} variant="digit" />
      <Button label="−" onClick={() => onBinaryOp('subtract')} variant="binaryOp" />

      {/* Row 4 */}
      <Button label="1" onClick={() => onDigit('1')} variant="digit" />
      <Button label="2" onClick={() => onDigit('2')} variant="digit" />
      <Button label="3" onClick={() => onDigit('3')} variant="digit" />
      <Button label="+" onClick={() => onBinaryOp('add')} variant="binaryOp" />

      {/* Row 5 */}
      <Button label="0" onClick={() => onDigit('0')} variant="digit" />
      <Button label="." onClick={onDecimal} variant="digit" />
      <Button label="√" onClick={() => onUnaryOp('sqrt')} variant="unaryOp" />
      <Button label="xʸ" onClick={() => onBinaryOp('power')} variant="binaryOp" />
      
      {/* Extra Row */}
      <Button label="=" onClick={onEvaluate} variant="equal" className="col-span-4" />
    </div>
  );
};
