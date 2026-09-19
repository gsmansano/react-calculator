import React from 'react';

interface DisplayProps {
  value: string;
  expression?: string | null;
  error?: string | null;
}

export const Display: React.FC<DisplayProps> = ({ value, expression, error }) => {
  // Format long values cleanly
  const displayValue = value.length > 12 ? Number(value).toExponential(6) : value;

  return (
    <div className="flex flex-col items-end justify-end p-6 bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_-2px_20px_rgba(0,0,0,0.5)] min-h-[160px] w-full transition-colors relative overflow-hidden">
      {/* Premium glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 pointer-events-none" />
      
      {/* Error Badge */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100/90 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold px-3 py-1 rounded-full animate-pulse border border-red-200 dark:border-red-800/50 shadow-sm uppercase tracking-wider backdrop-blur-sm">
          {error.replace(/_/g, ' ')}
        </div>
      )}

      {/* Expression Sub-display */}
      <div className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-widest min-h-[1.5rem] mb-2 opacity-80 transition-opacity flex items-center justify-end w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {expression || ''}
      </div>

      {/* Main Value Display */}
      <div className={`font-mono font-light text-slate-800 dark:text-slate-100 tracking-tight transition-all duration-300 ease-out w-full text-right break-all ${displayValue.length > 10 ? 'text-3xl' : 'text-5xl'} ${error ? 'text-red-500 dark:text-red-400 scale-95 opacity-90' : 'scale-100 opacity-100'}`}>
        {displayValue}
      </div>
    </div>
  );
};
