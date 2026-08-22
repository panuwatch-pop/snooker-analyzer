import React from 'react';
import { BALL_TYPES } from '../utils/snookerCalculator';
import { StatsDashboard } from './StatsDashboard';
import { RotateCcw, ArrowRightLeft, Shield, Target, AlertCircle, PlayCircle, Play, Pause, Square, Zap, ShieldCheck, Clock, Trophy, BarChart2, ChevronDown, X, Plus, Minus } from 'lucide-react';

const getDisplayName = (name) => {
  if (!name) return 'ผู้เล่น';
  return name.replace(/\s*\(.*?\)/g, '').trim();
};

export function RefereeDeck({
  currentPlayerIndex,
  players,
  p1Stats,
  p2Stats,
  matchState,
  currentFrame,
  currentShotDuration,
  startGame,
  pauseGame,
  endGame,
  scoreBall,
  switchTurn,
  setIsFoulModalOpen,
  undo,
  canUndo,
  nextFrame,
  resetMatch,
  setCurrentPlayerIndex,
  isMobileStatsOpen,
  setIsMobileStatsOpen,
  // 🎱 6-Red Snooker Points Remaining & Potted Reds Props
  remainingReds,
  pottedRedsCount,
  pointsRemaining,
  adjustRemainingReds,
}) {
  const activePlayer = players[currentPlayerIndex];

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
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 sm:p-2.5 shadow-xl space-y-1 sm:space-y-2">
      
      {/* 🔴🟡🟢 1. Ball Score Buttons (1 - 7) ทรงวงกลมลูกสนุ๊กเกอร์ 3D สวยงาม เด่นชัด */}
      <div className="bg-slate-950 p-1 sm:p-2 rounded-lg border border-slate-800 space-y-1 shadow-lg">
        
        {/* แผงปุ่มตบลูกสี 1-7 ทรงวงกลม 3D */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 justify-items-center">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const ball = BALL_TYPES[num];
            return (
              <button
                key={num}
                onClick={() => scoreBall(num)}
                disabled={matchState === 'PAUSED' || matchState === 'FINISHED'}
                className={`relative w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center ${ball.color} ${ball.textColor} border-2 ${ball.border} font-bold shadow-[0_4px_12px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-90 transition-all group disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className="text-sm xs:text-base sm:text-xl font-black font-mono leading-none drop-shadow">
                  {ball.points}
                </span>
                <span className="text-[7px] sm:text-[8px] opacity-95 font-bold leading-tight">
                  {getDisplayName(ball.name)}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Action Keys: ไอคอนอยู่ข้างหน้า (ซ้าย) ตัวหนังสืออยู่ข้างๆ (ขวา) แบบเรียงแนวนอน ไม่วางบนล่าง */}
        <div className="grid grid-cols-5 gap-0.5 sm:gap-1 pt-1 border-t border-slate-800/80">
          {/* Switch Turn (Space) */}
          <button
            onClick={() => switchTurn('SWITCH')}
            disabled={matchState === 'PAUSED' || matchState === 'FINISHED'}
            className="flex flex-row items-center justify-center gap-0.5 py-0.5 px-0.5 sm:py-1 sm:px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-[8px] xs:text-[8.5px] sm:text-xs font-bold transition-all active:scale-95 disabled:opacity-40 shadow"
          >
            <ArrowRightLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 shrink-0" />
            <span className="truncate">เปลี่ยนฝั่ง</span>
          </button>

          {/* Safety (S) */}
          <button
            onClick={() => switchTurn('SAFETY')}
            disabled={matchState === 'PAUSED' || matchState === 'FINISHED'}
            className="flex flex-row items-center justify-center gap-0.5 py-0.5 px-0.5 sm:py-1 sm:px-1 rounded bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[8px] xs:text-[8.5px] sm:text-xs font-bold transition-all active:scale-95 disabled:opacity-40 shadow"
          >
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
            <span className="truncate">แทงกัน</span>
          </button>

          {/* Miss (M) */}
          <button
            onClick={() => switchTurn('MISS')}
            disabled={matchState === 'PAUSED' || matchState === 'FINISHED'}
            className="flex flex-row items-center justify-center gap-0.5 py-0.5 px-0.5 sm:py-1 sm:px-1 rounded bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700 text-[8px] xs:text-[8.5px] sm:text-xs font-bold transition-all active:scale-95 disabled:opacity-40 shadow"
          >
            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <span className="truncate">แทงพลาด</span>
          </button>

          {/* Foul (F) */}
          <button
            onClick={() => setIsFoulModalOpen(true)}
            disabled={matchState === 'PAUSED' || matchState === 'FINISHED'}
            className="flex flex-row items-center justify-center gap-0.5 py-0.5 px-0.5 sm:py-1 sm:px-1 rounded bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-700 text-[8px] xs:text-[8.5px] sm:text-xs font-bold transition-all active:scale-95 disabled:opacity-40 shadow"
          >
            <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
            <span className="truncate">ฟาวล์</span>
          </button>

          {/* Undo (Backspace) */}
          <button
            onClick={undo}
            disabled={!canUndo || matchState === 'FINISHED'}
            className={`flex flex-row items-center justify-center gap-0.5 py-0.5 px-0.5 sm:py-1 sm:px-1 rounded border text-[8px] xs:text-[8.5px] sm:text-xs font-bold transition-all shadow ${
              canUndo && matchState !== 'FINISHED'
                ? 'bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border-indigo-700 active:scale-95' 
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-40'
            }`}
          >
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 shrink-0" />
            <span className="truncate">ย้อนหลัง</span>
          </button>
        </div>

        {/* 📊 3. แถบสรุปในแถบเดียวกัน: แทงอยู่ + FRAME + เวลาช็อต + ลูกแดง 6 เม็ด + แต้มคงเหลือ 6-Red + AST/POT/SAF */}
        <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono text-slate-300 px-1 bg-slate-900/90 rounded">
          
          {/* ฝ่ายแทงอยู่ */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-emerald-400 font-bold">แทงอยู่:</span>
            <span className={`font-bold px-1.5 py-0.2 rounded border ${
              currentPlayerIndex === 0 
                ? 'bg-sky-950 text-sky-300 border-sky-800' 
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {getDisplayName(activePlayer.name)}
            </span>
          </div>

          {/* ลำดับเฟรม (Frame Badge) */}
          <div className="flex items-center gap-1 shrink-0 bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>FRAME {currentFrame}</span>
          </div>

          {/* 🎱 แต้มคงเหลือบนโต๊ะ + สรุปลูกแดง 6 เม็ด (6-Red Snooker Points Remaining) */}
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.2 rounded border border-emerald-600/60 font-bold shrink-0 text-emerald-300">
            <span>บนโต๊ะ: <strong className="text-amber-300 font-extrabold">{pointsRemaining}</strong> แต้ม</span>
            {adjustRemainingReds && (
              <div className="flex items-center gap-0.5 ml-1 border-l border-slate-800 pl-1">
                <span className="text-[8px] text-red-400 font-semibold">🔴{pottedRedsCount}/6 เม็ด</span>
                <button
                  onClick={() => adjustRemainingReds(-1)}
                  disabled={remainingReds <= 0}
                  className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                  title="ลดจำนวนลูกแดง 1 ลูก"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => adjustRemainingReds(1)}
                  disabled={remainingReds >= 6}
                  className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                  title="เพิ่มจำนวนลูกแดง 1 ลูก"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>

          {/* นาฬิกาจับเวลาช็อต (Shot Duration Clock) */}
          <div className={`flex items-center gap-1 px-1.5 py-0.2 rounded border font-bold shrink-0 ${
            currentShotDuration > 30 
              ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse' 
              : currentShotDuration > 20 
              ? 'bg-amber-950/80 text-amber-400 border-amber-800' 
              : 'bg-slate-800 text-slate-200 border-slate-700'
          }`}>
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>เวลา: <strong className="text-white font-extrabold">{currentShotDuration}s</strong></span>
          </div>

          {/* สถิติด่วน AST / POT / SAF */}
          <div className="flex items-center gap-1.5 shrink-0 text-[8px] sm:text-[9px]">
            <span className="text-sky-300">AST: {activePlayer.ast || 0}s</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-300">POT: {activePlayer.potAccuracy || 0}%</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300">SAF: {activePlayer.safetyRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* 4. Match State Controls & Player Quick Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-slate-800 pt-1">
        <div className="flex items-center gap-1">
          {matchState !== 'IN_PROGRESS' ? (
            <button
              onClick={startGame}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow transition-all animate-pulse"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>{matchState === 'PAUSED' ? 'แข่งต่อ' : 'เริ่มเกม'}</span>
            </button>
          ) : (
            <button
              onClick={pauseGame}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] shadow transition-all"
            >
              <Pause className="w-3 h-3 fill-white" />
              <span>พักเกม</span>
            </button>
          )}

          <button
            onClick={endGame}
            disabled={matchState === 'FINISHED'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              matchState === 'FINISHED'
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800'
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
            <span>จบแมตช์</span>
          </button>

          {/* 📊 ปุ่ม Dropdown สถิติ ข้างคำว่า จบแมตช์ บนหน้าจอมือถือตามสั่ง */}
          {setIsMobileStatsOpen && (
            <button
              onClick={() => setIsMobileStatsOpen(!isMobileStatsOpen)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all active:scale-95 sm:hidden shadow-sm"
              title="เปิด/ปิด แผงสถิติ"
            >
              <BarChart2 className="w-3 h-3 text-amber-400" />
              <span>สถิติ</span>
              <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform duration-200 ${isMobileStatsOpen ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick Player Switch Toggle (กดเพื่อสลับฝั่งเหมือนปุ่มเปลี่ยนฝั่ง) */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => handleSelectPlayer(0)}
            className={`px-1.5 py-0.2 rounded font-bold transition-all ${
              currentPlayerIndex === 0 
                ? 'bg-sky-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P1: {getDisplayName(players[0].name)}
          </button>
          <button
            onClick={() => handleSelectPlayer(1)}
            className={`px-1.5 py-0.2 rounded font-bold transition-all ${
              currentPlayerIndex === 1 
                ? 'bg-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P2: {getDisplayName(players[1].name)}
          </button>
        </div>

        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => nextFrame()}
            disabled={matchState === 'FINISHED'}
            className="flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-300 rounded border border-emerald-700 font-bold transition-colors disabled:opacity-50"
          >
            <PlayCircle className="w-3 h-3" />
            <span>เฟรมถัดไป</span>
          </button>
          <button
            onClick={resetMatch}
            className="flex items-center gap-0.5 px-1.5 py-0.2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* 📊 5. Box แผงสถิติ ปรับเป็น Modal Floating Popup ด้านล่างหน้าจอ ป้องกันการซ้อนกับปุ่ม 1-7 บน Samsung S25FE และมือถือทุกรุ่น */}
      {isMobileStatsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileStatsOpen(false)}
        >
          <div 
            className="bg-slate-950 border border-slate-700 rounded-2xl p-3 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-2 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>กล่องสถิติเปรียบเทียบสด (Live Match Stats)</span>
              </div>
              <button
                onClick={() => setIsMobileStatsOpen(false)}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-600 font-bold active:scale-95 transition-all shadow"
              >
                <X className="w-4 h-4" />
                <span>ปิด</span>
              </button>
            </div>

            <StatsDashboard
              p1Stats={p1Stats}
              p2Stats={p2Stats}
              players={players}
              device={{ type: 'Desktop' }} // แสดงผลเปรียบเทียบเต็มรูปแบบในกล่อง Dropdown
            />
          </div>
        </div>
      )}
    </div>
  );
}
