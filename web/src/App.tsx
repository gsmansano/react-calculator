import { useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { useCalculator } from './hooks/useCalculator';

export default function App() {
  const {
    display,
    accumulator,
    operation,
    error,
    inputDigit,
    inputDecimal,
    clear,
    allClear,
    toggleSign,
    setBinaryOperation,
    applyUnaryOperation,
    evaluate
  } = useCalculator();

  const isClearPending = display !== '0' || error !== null;

  let expression = '';
  if (accumulator !== null && operation) {
    const opSymbol: Record<string, string> = {
      add: '+',
      subtract: '−',
      multiply: '×',
      divide: '÷',
      power: 'xʸ'
    };
    expression = `${accumulator} ${opSymbol[operation]}`;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        inputDecimal();
      } else if (e.key === '+') {
        setBinaryOperation('add');
      } else if (e.key === '-') {
        setBinaryOperation('subtract');
      } else if (e.key === '*') {
        setBinaryOperation('multiply');
      } else if (e.key === '/') {
        setBinaryOperation('divide');
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === '=') {
        evaluate();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        allClear();
      } else if (e.key === 'Backspace') {
        clear();
      } else if (e.key === '%') {
        applyUnaryOperation('percentage');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, setBinaryOperation, evaluate, allClear, clear, applyUnaryOperation]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between px-2">
          <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-300 tracking-tight">Calculator</h1>
        </div>

        {/* Calculator Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800/60 p-4">
          <div className="mb-4">
            <Display value={display} expression={expression} error={error} />
          </div>
          <Keypad
            onDigit={inputDigit}
            onDecimal={inputDecimal}
            onClear={clear}
            onAllClear={allClear}
            onToggleSign={toggleSign}
            onBinaryOp={setBinaryOperation}
            onUnaryOp={applyUnaryOperation}
            onEvaluate={evaluate}
            isClearPending={isClearPending}
          />
        </div>

        {/* Controls */}
        <div className="mt-2">
          <ThemeToggle />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-xs text-slate-400 dark:text-slate-600 font-medium">
          Powered by React & Tailwind CSS
        </footer>

      </div>
    </div>
  );
}
