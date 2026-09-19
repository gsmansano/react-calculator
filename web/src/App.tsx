import { useEffect } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { useCalculator } from './hooks/useCalculator';

export default function App() {
  const {
    display,
    error,
    expression,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        
        {/* Header */}
        <div className="w-full flex items-center justify-center px-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-center text-[#0c1010] dark:text-[#f0f4f4]">Calculator</h1>
        </div>

        {/* Calculator Card */}
        <div className="w-full bg-[#d6e2e2] dark:bg-[#121616] border border-[#b4c6c6] dark:border-[#1f2828] shadow-2xl rounded-2xl p-6 transition-colors">
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
        <footer className="mt-8 text-xs font-light text-slate-500 dark:text-slate-400">
          Built by <a href="https://github.com/gsmansano" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-[#0c1010] dark:text-[#f0f4f4]">Geovane Mansano</a>
        </footer>

      </div>
    </div>
  );
}
