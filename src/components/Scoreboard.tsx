import React from 'react';
import { User, Flame, Clock, Sparkles, ShieldAlert, Flag, Trophy } from 'lucide-react';
import { Frame } from '../types/snooker';
import { calculateRemainingPoints, calculateSnookersRequired } from '../utils/snookerRules';

interface ScoreboardProps {
  player1Name: string;
  player2Name: string;
  activeStrikerIndex: 0 | 1;
  currentBreak: number;
  ballsInCurrentVisit: number;
  frame?: Frame;
  frameDurationFormatted: string;
  shotDurationSec: number;
  onSwitchStriker: () => void;
  onEndFrame: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  player1Name = 'ผู้เล่น 1',
  player2Name = 'ผู้เล่น 2',
  activeStrikerIndex = 0,
  currentBreak = 0,
  ballsInCurrentVisit = 0,
  frame,
  frameDurationFormatted = '00:00',
  shotDurationSec = 0,
  onSwitchStriker,
  onEndFrame,
}) => {
  const p1Score = frame?.player1Score ?? 0;
  const p2Score = frame?.player2Score ?? 0;
  const p1Frames = frame?.player1FramesWon ?? 0;
  const p2Frames = frame?.player2FramesWon ?? 0;
  const redsRemaining = frame?.redsRemaining ?? 15;
  const p1HighBreak = frame?.stats?.[0]?.highestBreak ?? 0;
  const p2HighBreak = frame?.stats?.[1]?.highestBreak ?? 0;

  const diff = Math.abs(p1Score - p2Score);
  const remaining = calculateRemainingPoints(redsRemaining, frame?.shots || []);
  const isSafeLead = diff > remaining;
  const snookersNeeded = calculateSnookersRequired(diff, remaining);
  const leaderName = p1Score >= p2Score ? player1Name : player2Name;

  const p1Break = activeStrikerIndex === 0 ? currentBreak : 0;
  const p2Break = activeStrikerIndex === 1 ? currentBreak : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-1.5 sm:space-y-3">
      {/* Main Scoreboard: ALWAYS 2 COLUMNS (Left-Right Side by Side on Mobile and Desktop) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
        {/* Player 1 Card (Left Card: Frame -> Break -> Score) */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl sm:shadow-2xl shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 1 Header */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <div className={`p-0.5 sm:p-1.5 rounded-md sm:rounded-lg ${activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <h3 className="text-xs sm:text-lg md:text-2xl font-black text-slate-100 tracking-tight truncate">
                {player1Name}
              </h3>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {activeStrikerIndex === 0 && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full animate-pulse shadow">
                  กำลังแทง
                </span>
              )}
              <div className="text-[9px] sm:text-xs text-slate-400 font-semibold hidden xs:block">
                เบรกสูง: <strong className="text-emerald-400 font-bold">{p1HighBreak}</strong>
              </div>
            </div>
          </div>

          {/* Player 1 Middle: Frame on Left -> Break in Middle -> Giant Score on Right (Facing P2) */}
          <div className="my-1 sm:my-2 py-0.5 sm:py-1 flex items-center justify-between gap-1 sm:gap-3">
            {/* Frame Box on the LEFT */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/25 to-amber-950/50 border border-amber-400/80 rounded-lg sm:rounded-2xl px-1.5 sm:px-3.5 py-1 sm:py-2.5 shadow-md flex-shrink-0">
              <div className="text-[8px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>เฟรม</span>
              </div>
              <span className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black font-mono text-amber-300 leading-none mt-0.5">
                {p1Frames}
              </span>
            </div>

            {/* Current Break in the MIDDLE (No word "เบรก", flame icon + bold number) */}
            <div className={`flex flex-col items-center justify-center rounded-lg sm:rounded-2xl px-1.5 sm:px-3.5 py-1 sm:py-2.5 border transition-all flex-shrink-0 ${
              activeStrikerIndex === 0 && p1Break > 0
                ? 'bg-gradient-to-b from-orange-500/30 to-amber-950/60 border-orange-400/80 shadow-md shadow-orange-950/50 scale-105'
                : 'bg-slate-950/50 border-slate-800/80 opacity-60'
            }`}>
              <Flame className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-orange-400 animate-bounce' : 'text-slate-500'}`} />
              <span className={`text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black font-mono leading-none mt-0.5 ${
                activeStrikerIndex === 0 && p1Break > 0 ? 'text-orange-300' : 'text-slate-500'
              }`}>
                {p1Break}
              </span>
            </div>

            {/* Giant Score on the RIGHT (Facing Player 2) */}
            <div className="flex-1 text-right">
              <span className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white font-mono drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none select-none inline-block">
                {p1Score}
              </span>
            </div>
          </div>

          {/* Shot Time Footer for active striker */}
          {activeStrikerIndex === 0 && (
            <div className="pt-1 sm:pt-1.5 border-t border-emerald-800/40 flex items-center justify-between text-[9px] sm:text-xs font-bold text-slate-400">
              <div className="flex items-center space-x-1">
                <span>ตบ: <strong className="text-emerald-400 font-mono">{ballsInCurrentVisit}</strong></span>
              </div>
              <div className="flex items-center space-x-0.5 sm:space-x-1 text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-400" />
                <span><strong className="text-amber-300 font-mono">{shotDurationSec}s</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Card (Right Card: Score -> Break -> Frame) */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-5 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl sm:shadow-2xl shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 2 Header */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {activeStrikerIndex === 1 && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full animate-pulse shadow">
                  กำลังแทง
                </span>
              )}
              <div className="text-[9px] sm:text-xs text-slate-400 font-semibold hidden xs:block">
                เบรกสูง: <strong className="text-emerald-400 font-bold">{p2HighBreak}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <h3 className="text-xs sm:text-lg md:text-2xl font-black text-slate-100 tracking-tight truncate">
                {player2Name}
              </h3>
              <div className={`p-0.5 sm:p-1.5 rounded-md sm:rounded-lg ${activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>

          {/* Player 2 Middle: Giant Score on Left (Facing P1) -> Break in Middle -> Frame on Right */}
          <div className="my-1 sm:my-2 py-0.5 sm:py-1 flex items-center justify-between gap-1 sm:gap-3">
            {/* Giant Score on the LEFT (Facing Player 1) */}
            <div className="flex-1 text-left">
              <span className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white font-mono drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none select-none inline-block">
                {p2Score}
              </span>
            </div>

            {/* Current Break in the MIDDLE (No word "เบรก", flame icon + bold number) */}
            <div className={`flex flex-col items-center justify-center rounded-lg sm:rounded-2xl px-1.5 sm:px-3.5 py-1 sm:py-2.5 border transition-all flex-shrink-0 ${
              activeStrikerIndex === 1 && p2Break > 0
                ? 'bg-gradient-to-b from-orange-500/30 to-amber-950/60 border-orange-400/80 shadow-md shadow-orange-950/50 scale-105'
                : 'bg-slate-950/50 border-slate-800/80 opacity-60'
            }`}>
              <Flame className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-orange-400 animate-bounce' : 'text-slate-500'}`} />
              <span className={`text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black font-mono leading-none mt-0.5 ${
                activeStrikerIndex === 1 && p2Break > 0 ? 'text-orange-300' : 'text-slate-500'
              }`}>
                {p2Break}
              </span>
            </div>

            {/* Frame Box on the RIGHT */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-500/25 to-amber-950/50 border border-amber-400/80 rounded-lg sm:rounded-2xl px-1.5 sm:px-3.5 py-1 sm:py-2.5 shadow-md flex-shrink-0">
              <div className="text-[8px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>เฟรม</span>
              </div>
              <span className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black font-mono text-amber-300 leading-none mt-0.5">
                {p2Frames}
              </span>
            </div>
          </div>

          {/* Shot Time Footer for active striker */}
          {activeStrikerIndex === 1 && (
            <div className="pt-1 sm:pt-1.5 border-t border-emerald-800/40 flex items-center justify-between text-[9px] sm:text-xs font-bold text-slate-400">
              <div className="flex items-center space-x-0.5 sm:space-x-1 text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-400" />
                <span><strong className="text-amber-300 font-mono">{shotDurationSec}s</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <span>ตบ: <strong className="text-emerald-400 font-mono">{ballsInCurrentVisit}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frame Status Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2 sm:p-3 shadow-md flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm font-semibold">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">แดงบนโต๊ะ:</span>
          <span className="font-bold font-mono text-red-400 bg-red-950/80 border border-red-800 px-1.5 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg">
            {redsRemaining} ลูก
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1 sm:gap-2">
          <div className="bg-slate-900 border border-slate-700/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center space-x-1">
            <span className="text-slate-400 text-[10px] sm:text-xs">แต้มบนโต๊ะ:</span>
            <span className="font-bold font-mono text-emerald-400 text-xs sm:text-sm md:text-base">{remaining}</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center space-x-1">
            <span className="text-slate-400 text-[10px] sm:text-xs">นำ/ตาม:</span>
            <span className="font-bold font-mono text-amber-300 text-xs sm:text-sm md:text-base">{diff}</span>
          </div>

          {isSafeLead ? (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center space-x-1 animate-pulse shadow-md font-bold text-[10px] sm:text-xs">
              <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 flex-shrink-0" />
              <span>
                แต้มขาด! {remaining > 0 ? `สนุ๊ก: ${snookersNeeded}` : `(${leaderName} ชนะ)`}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center space-x-1 font-bold text-[10px] sm:text-xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
              <span>แต้มยังไม่ขาด</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-700/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center space-x-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span className="font-mono font-bold text-slate-200 text-xs sm:text-sm">{frameDurationFormatted}</span>
          </div>

          {/* Direct End Frame Button */}
          <button
            onClick={onEndFrame}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-amber-600/30 cursor-pointer active:scale-95 transition-all"
            title="กดเพื่อจบเฟรมนี้และดูผลผู้ชนะ หรือเริ่มเฟรมถัดไป"
          >
            <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>จบเฟรม</span>
          </button>
        </div>
      </div>
    </div>
  );
};
