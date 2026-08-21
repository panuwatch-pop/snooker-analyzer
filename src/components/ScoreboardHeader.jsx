import React, { useState } from 'react';
import { Flame, Edit3, Check } from 'lucide-react';

const getDisplayName = (name) => {
  if (!name) return 'ผู้เล่น';
  return name.replace(/\s*\(.*?\)/g, '').trim();
};

export function ScoreboardHeader({
  players,
  p1Stats,
  p2Stats,
  currentPlayerIndex,
  currentFrame,
  currentShotDuration,
  breakHistory,
  updatePlayerName,
  setCurrentPlayerIndex,
}) {
  const [isEditingP1, setIsEditingP1] = useState(false);
  const [isEditingP2, setIsEditingP2] = useState(false);
  const [p1NameInput, setP1NameInput] = useState(players[0].name);
  const [p2NameInput, setP2NameInput] = useState(players[1].name);

  const handleSaveP1 = () => {
    updatePlayerName(0, p1NameInput.trim() || 'ผู้เล่น 1');
    setIsEditingP1(false);
  };

  const handleSaveP2 = () => {
    updatePlayerName(1, p2NameInput.trim() || 'ผู้เล่น 2');
    setIsEditingP2(false);
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-1 sm:px-3 py-0.5">
        
        {/* Flexbox Scoreboard Deck - ขยายขนาดตัวเลขคะแนนให้ใหญ่ยักษ์อลังการมากยิ่งขึ้น text-7xl */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 bg-slate-950 rounded-xl border border-slate-800 p-1 sm:p-2 shadow-2xl">
          
          {/* Player 1 Card (Cyan Palette) */}
          <div 
            onClick={() => setCurrentPlayerIndex(0)}
            className={`flex-1 flex items-center justify-between p-1 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${
              currentPlayerIndex === 0 
                ? 'bg-slate-900 border-sky-500 ring-2 ring-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.25)]' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-950 border border-sky-500/50 flex items-center justify-center text-sky-400 font-extrabold text-[10px] sm:text-xs">
                  P1
                </div>
                {currentPlayerIndex === 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingP1 ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={p1NameInput}
                      onChange={(e) => setP1NameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveP1()}
                      className="bg-slate-800 text-sky-300 text-[10px] px-1 py-0.2 rounded border border-sky-500 w-full focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveP1} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <span className="font-bold text-slate-100 text-xs sm:text-sm truncate">
                      {getDisplayName(players[0].name)}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingP1(true); }}
                      className="text-slate-500 hover:text-sky-400 transition-colors p-0.5"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-sky-400/90 font-mono">
                  <span>HB:{p1Stats.highestBreak}</span>
                  <span>•</span>
                  <span>{p1Stats.ast}s</span>
                </div>
              </div>
            </div>

            {/* 🎯 Current Frame Points P1 (ขยายขนาดตัวเลขให้ใหญ่ยักษ์จัมโบ้เด่นชัดมากที่สุด text-7xl) */}
            <div className="text-right pl-1 sm:pl-2 shrink-0">
              <div className="text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-sky-400 font-mono tracking-tighter leading-none select-none drop-shadow-[0_0_30px_rgba(56,189,248,0.85)]">
                {players[0].currentFramePoints}
              </div>
            </div>
          </div>

          {/* Center Match Frame Score (คะแนนรวมเฟรม) */}
          <div className="shrink-0 flex flex-col items-center justify-center text-center px-1">
            <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.2">
              FRAMES
            </div>
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-4xl md:text-5xl font-black text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-inner">
              <span>{players[0].frameScore}</span>
              <span className="text-slate-600 font-light">-</span>
              <span>{players[1].frameScore}</span>
            </div>
            {currentPlayerIndex === 0 && (
              <div className="mt-0.5 text-[8px] font-bold text-sky-300 bg-sky-950 px-1 rounded border border-sky-800">
                ◀ แทง
              </div>
            )}
            {currentPlayerIndex === 1 && (
              <div className="mt-0.5 text-[8px] font-bold text-amber-300 bg-amber-950 px-1 rounded border border-amber-800">
                แทง ▶
              </div>
            )}
          </div>

          {/* Player 2 Card (Amber Palette) */}
          <div 
            onClick={() => setCurrentPlayerIndex(1)}
            className={`flex-1 flex items-center justify-between p-1 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${
              currentPlayerIndex === 1 
                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.25)]' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
            }`}
          >
            {/* 🎯 Current Frame Points P2 (ขยายขนาดตัวเลขให้ใหญ่ยักษ์จัมโบ้เด่นชัดมากที่สุด text-7xl) */}
            <div className="text-left pr-1 sm:pr-2 shrink-0">
              <div className="text-7xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-amber-400 font-mono tracking-tighter leading-none select-none drop-shadow-[0_0_30px_rgba(251,191,36,0.85)]">
                {players[1].currentFramePoints}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden text-right flex-row-reverse">
              <div className="relative shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 font-extrabold text-[10px] sm:text-xs">
                  P2
                </div>
                {currentPlayerIndex === 1 && (
                  <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingP2 ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={p2NameInput}
                      onChange={(e) => setP2NameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveP2()}
                      className="bg-slate-800 text-amber-300 text-[10px] px-1 py-0.2 rounded border border-amber-500 w-full focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveP2} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditingP2(true); }}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-bold text-slate-100 text-xs sm:text-sm truncate">
                      {getDisplayName(players[1].name)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-400/90 font-mono justify-end">
                  <span>{p2Stats.ast}s</span>
                  <span>•</span>
                  <span>HB:{p2Stats.highestBreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Break Indicator Banner */}
        {players[currentPlayerIndex].currentBreak > 0 && (
          <div className="mt-0.5 flex items-center justify-between bg-emerald-950/80 border border-emerald-700/80 px-2 py-0.5 rounded text-emerald-300 shadow">
            <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span>BREAK ({getDisplayName(players[currentPlayerIndex].name)}):</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                {players[currentPlayerIndex].currentBreak}
              </span>
            </div>
            
            {/* Balls in current break */}
            <div className="flex items-center gap-0.5 overflow-x-auto py-0.2">
              {breakHistory.map((ball, idx) => (
                <span 
                  key={idx} 
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${ball.color} ${ball.textColor} border ${ball.border} flex items-center justify-center text-[9px] font-bold shadow`}
                >
                  {ball.points}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
