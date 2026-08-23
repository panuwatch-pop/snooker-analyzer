import React, { useState } from 'react';
import { Flame, Edit3, Check, Trophy, PlayCircle } from 'lucide-react';

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
  switchTurn,
  // 🎱 แต้มคงเหลือ 15-Red / 6-Red Snooker
  matchFormat,
  maxReds,
  maxPointsPossible,
  remainingReds,
  pottedRedsCount,
  pointsRemaining,
  scoreDiff,
  isPointsDeficit,
  snookersRequired,
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

  const handleSelectPlayer = (targetIndex) => {
    if (currentPlayerIndex !== targetIndex) {
      if (switchTurn) {
        switchTurn('SWITCH');
      } else {
        setCurrentPlayerIndex(targetIndex);
      }
    }
  };

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-1 sm:px-3 py-0.5">
        
        {/* Flexbox Scoreboard Deck - ปรับสีตัวเลขผู้เล่นที่ไม่ใช่ตาแทงให้ชัดแจ๋ว และเพิ่มขนาดตัวหนังสือแต้มบนโต๊ะกับฝั่งผู้เล่นแทง */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 bg-slate-950 rounded-xl border border-slate-800 p-1 sm:p-2 shadow-2xl">
          
          {/* Player 1 Card (Cyan Palette) - กดแล้วสลับฝั่งเหมือนปุ่มเปลี่ยนฝั่ง */}
          <div 
            onClick={() => handleSelectPlayer(0)}
            className={`relative flex-1 flex items-center justify-between p-1.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
              currentPlayerIndex === 0 
                ? 'bg-gradient-to-r from-sky-950/90 via-slate-900 to-sky-950/90 border-2 border-sky-400 ring-4 ring-sky-500/40 shadow-[0_0_30px_rgba(56,189,248,0.5)] scale-[1.02] z-10' 
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 shadow-md'
            }`}
          >
            {/* ลายพื้นหลัง Mesh Pattern เฉพาะตอนกำลังแทง (Active Player 1 Texture) */}
            {currentPlayerIndex === 0 && (
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px)`,
                  backgroundSize: '12px 12px'
                }}
              />
            )}

            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden relative z-10">
              <div className="relative shrink-0">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs transition-all ${
                  currentPlayerIndex === 0
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.9)] ring-2 ring-white'
                    : 'bg-slate-800 text-sky-400 border border-slate-700 font-bold'
                }`}>
                  P1
                </div>
                {currentPlayerIndex === 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* 🎯 ป้ายบอกสถานะแทงอยู่ */}
                {currentPlayerIndex === 0 && (
                  <div className="inline-flex items-center gap-1 text-[8px] font-black text-sky-300 bg-sky-950/90 px-1.5 py-0.2 rounded border border-sky-500/60 shadow mb-0.5 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>กำลังแทง 🎯</span>
                  </div>
                )}

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
                    <span className={`font-black text-xs sm:text-base truncate ${
                      currentPlayerIndex === 0 ? 'text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'text-slate-200'
                    }`}>
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

            {/* 🎯 Current Frame Points P1 (ปรับสีตัวเลขตอนไม่ได้แทงให้สว่าง คมชัด ไม่จืดมืด) */}
            <div className="text-right pl-1 sm:pl-2 shrink-0 relative z-10">
              <div className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tighter leading-none select-none transition-all ${
                currentPlayerIndex === 0
                  ? 'text-sky-300 drop-shadow-[0_0_25px_rgba(56,189,248,0.95)] scale-105'
                  : 'text-sky-400/80 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]'
              }`}>
                {players[0].currentFramePoints}
              </div>
            </div>
          </div>

          {/* Center Match Frame Score + 🎱 Snooker Points Remaining Badge */}
          <div className="shrink-0 flex flex-col items-center justify-center text-center px-0.5 sm:px-1">
            <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.2 flex items-center gap-1">
              <span>FRAMES</span>
              <span className="text-[7.5px] px-1 py-0.2 bg-amber-950 text-amber-300 border border-amber-800/80 rounded font-mono font-black">
                {maxReds} แดง ({maxPointsPossible})
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 text-xl sm:text-3xl md:text-5xl font-black text-amber-300 font-mono bg-slate-900 px-1.5 sm:px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-inner">
              <span>{players[0].frameScore}</span>
              <span className="text-slate-600 font-light">-</span>
              <span>{players[1].frameScore}</span>
            </div>
            
            {/* 🎱 สรุปลูกแดง + แต้มคงเหลือบนโต๊ะ (ขยายตัวหนังสือให้ใหญ่ขึ้นพอดีกรอบเดิม) */}
            <div className="mt-0.5 flex flex-col items-center gap-0.5">
              <div className="text-xs sm:text-sm font-black font-mono text-emerald-300 bg-emerald-950/95 px-2 py-0.5 rounded-lg border border-emerald-600 shadow-md flex items-center justify-center gap-1">
                <span>บนโต๊ะ:<strong className="text-amber-300 font-black text-sm sm:text-base ml-1">{pointsRemaining}</strong> แต้ม</span>
                <span className="text-slate-400 text-[10px] sm:text-xs font-bold border-l border-emerald-800 pl-1">
                  🔴<strong className="text-red-400 font-black">{pottedRedsCount}</strong>/{maxReds}
                </span>
              </div>

              {/* ⚠️ ปรับตัวหนังสือแสดงฝั่งผู้เล่นแทงใต้แต้มบนโต๊ะให้ใหญ่ขึ้น เด่นชัด */}
              {isPointsDeficit ? (
                <div className="text-xs sm:text-sm font-black text-red-300 bg-red-950/95 border border-red-600 px-2 py-0.5 rounded-md animate-pulse shadow">
                  🚨 แต้มขาด ({snookersRequired} สนุ๊ก)
                </div>
              ) : (
                currentPlayerIndex === 0 ? (
                  <div className="text-xs sm:text-sm font-black text-sky-300 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.4)] animate-pulse">
                    ◀ P1 แทง
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.4)] animate-pulse">
                    P2 แทง ▶
                  </div>
                )
              )}
            </div>
          </div>

          {/* Player 2 Card (Amber Palette) - กดแล้วสลับฝั่งเหมือนปุ่มเปลี่ยนฝั่ง */}
          <div 
            onClick={() => handleSelectPlayer(1)}
            className={`relative flex-1 flex items-center justify-between p-1.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
              currentPlayerIndex === 1 
                ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-400 ring-4 ring-amber-500/40 shadow-[0_0_30px_rgba(251,191,36,0.5)] scale-[1.02] z-10' 
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 shadow-md'
            }`}
          >
            {/* ลายพื้นหลัง Mesh Pattern เฉพาะตอนกำลังแทง (Active Player 2 Texture) */}
            {currentPlayerIndex === 1 && (
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#fbbf24 1.5px, transparent 1.5px)`,
                  backgroundSize: '12px 12px'
                }}
              />
            )}

            {/* 🎯 Current Frame Points P2 (ปรับสีตัวเลขตอนไม่ได้แทงให้สว่าง คมชัด ไม่จืดมืด) */}
            <div className="text-left pr-1 sm:pr-2 shrink-0 relative z-10">
              <div className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tighter leading-none select-none transition-all ${
                currentPlayerIndex === 1
                  ? 'text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.95)] scale-105'
                  : 'text-amber-400/80 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]'
              }`}>
                {players[1].currentFramePoints}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden text-right flex-row-reverse relative z-10">
              <div className="relative shrink-0">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs transition-all ${
                  currentPlayerIndex === 1
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.9)] ring-2 ring-white'
                    : 'bg-slate-800 text-amber-400 border border-slate-700 font-bold'
                }`}>
                  P2
                </div>
                {currentPlayerIndex === 1 && (
                  <span className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* 🎯 ป้ายบอกสถานะแทงอยู่ */}
                {currentPlayerIndex === 1 && (
                  <div className="inline-flex items-center gap-1 text-[8px] font-black text-amber-300 bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-500/60 shadow mb-0.5 tracking-wider justify-end">
                    <span>🎯 กำลังแทง</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                )}

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
                    <span className={`font-black text-xs sm:text-base truncate ${
                      currentPlayerIndex === 1 ? 'text-white drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-200'
                    }`}>
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
