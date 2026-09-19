import React from 'react';

interface DisplayProps {
  value: string;
  expression?: string | null;
  error?: string | null;
  isLoading?: boolean;
}

export const Display: React.FC<DisplayProps> = ({ value, expression, error, isLoading }) => {
  // Format long values cleanly
  const displayValue = value.length > 12 ? Number(value).toExponential(6) : value;

  return (
    <div className="flex flex-col items-end justify-end p-6 bg-[#ffffff] dark:bg-[#0b0e0e] rounded-3xl shadow-inner shadow-[inset_0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.6)] min-h-[160px] w-full transition-colors relative overflow-hidden">
      {/* Premium glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:via-white/5 dark:to-white/10 pointer-events-none" />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#7c9899] dark:bg-[#678283] rounded-full animate-ping opacity-75"></div>
          <div className="w-2 h-2 bg-[#7c9899] dark:bg-[#678283] rounded-full absolute"></div>
        </div>
      )}

      {/* Error Badge */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100/90 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold px-3 py-1 rounded-full animate-pulse border border-red-200 dark:border-red-800/50 shadow-sm uppercase tracking-wider backdrop-blur-sm">
          {error.replace(/_/g, ' ')}
        </div>
      )}

      {/* Expression Sub-display */}
      <div className="text-[#7c9899] dark:text-[#678283] font-mono text-sm tracking-widest min-h-[1.5rem] mb-2 opacity-80 transition-opacity flex items-center justify-end w-full overflow-hidden text-ellipsis whitespace-nowrap tabular-nums">
        {expression || ''}
      </div>

      {/* Main Value Display */}
      <div className={`font-mono font-light text-[#0c1010] dark:text-[#f0f4f4] tracking-tight tabular-nums transition-all duration-300 ease-out w-full text-right break-all ${displayValue.length > 10 ? 'text-4xl' : 'text-5xl'} ${error ? 'text-red-500 scale-95 opacity-90' : 'scale-100 opacity-100'}`}>
        {displayValue}
      </div>
    </div>
  );
};
