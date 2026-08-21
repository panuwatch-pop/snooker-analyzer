import React from 'react';

export function ComparisonBar({
  label,
  val1,
  val2,
  p1Pct = 50,
  p2Pct = 50,
  unit = '',
  subtext1 = '',
  subtext2 = '',
  p1Better = false,
  p2Better = false,
  icon: Icon,
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-1.5 sm:p-2 hover:border-slate-700 transition-colors shadow-sm">
      {/* Header Metric Title */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1">
          {Icon && <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          <span className="text-xs font-bold text-slate-200 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
          {subtext1 && <span>{subtext1}</span>}
          {subtext1 && subtext2 && <span>•</span>}
          {subtext2 && <span>{subtext2}</span>}
        </div>
      </div>

      {/* Numerical Comparison Line */}
      <div className="flex items-center justify-between mb-0.5 font-mono">
        {/* Player 1 Value */}
        <div className="flex items-center gap-1">
          <span className={`text-base sm:text-lg md:text-xl font-bold tracking-tight ${p1Better ? 'text-sky-400' : 'text-slate-200'}`}>
            {val1}{unit}
          </span>
          {p1Better && (
            <span className="text-[8px] uppercase font-sans font-bold bg-sky-950 text-sky-300 px-1 py-0.2 rounded border border-sky-800">
              นำ
            </span>
          )}
        </div>

        {/* Player 2 Value */}
        <div className="flex items-center gap-1 flex-row-reverse">
          <span className={`text-base sm:text-lg md:text-xl font-bold tracking-tight ${p2Better ? 'text-amber-400' : 'text-slate-200'}`}>
            {val2}{unit}
          </span>
          {p2Better && (
            <span className="text-[8px] uppercase font-sans font-bold bg-amber-950 text-amber-300 px-1 py-0.2 rounded border border-amber-800">
              นำ
            </span>
          )}
        </div>
      </div>

      {/* Dual Comparative Color Bar */}
      <div className="h-2 sm:h-2.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 relative">
        {/* Player 1 Bar (Cyan/Blue) */}
        <div 
          style={{ width: `${Math.max(4, Math.min(96, p1Pct))}%` }} 
          className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-l-full transition-bar relative group"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Divider Gap */}
        <div className="w-0.5 bg-slate-950 z-10" />

        {/* Player 2 Bar (Amber/Gold) */}
        <div 
          style={{ width: `${Math.max(4, Math.min(96, p2Pct))}%` }} 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-r-full transition-bar relative group"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Percentage Share Indicator Footnote (ปรับลดขนาดตัวเลขแสดง % ให้เล็กลงกระชับ) */}
      <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 mt-0.5">
        <span className="text-sky-400/70">{p1Pct}%</span>
        <span className="text-amber-400/70">{p2Pct}%</span>
      </div>
    </div>
  );
}
