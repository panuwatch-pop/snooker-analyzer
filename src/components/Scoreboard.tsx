import React from 'react';
import { User, Flame, Clock, Sparkles, ShieldAlert, Trophy, Target } from 'lucide-react';
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
  isGaMode?: boolean;
  onSwitchStriker: () => void;
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
  isGaMode = false,
  onSwitchStriker,
}) => {
  const p1Score = frame?.player1Score ?? 0;
  const p2Score = frame?.player2Score ?? 0;
  const p1Frames = frame?.player1FramesWon ?? 0;
  const p2Frames = frame?.player2FramesWon ?? 0;
  const p1Ga = frame?.player1Ga ?? 0;
  const p2Ga = frame?.player2Ga ?? 0;
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
    <div className="w-full max-w-7xl mx-auto space-y-0.5 xs:space-y-1 sm:space-y-1.5 flex-shrink-0">
      {/* Main Scoreboard: Mirrored Layout (User Sketch) */}
      <div className="grid grid-cols-2 gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2">
        
        {/* ==================== PLAYER 1 CARD (Left: [FRAME / BREAK] -> [SCORE]) ==================== */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-2 md:p-2.5 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 ring-emerald-500/50 shadow-md shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-0.5 xs:h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* 1. Header: Avatar + Player Name + High Break Underneath */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 min-w-0 mb-0.5">
            <div className={`p-0.5 xs:p-1 rounded-md flex-shrink-0 ${activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
              <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-lg font-black text-slate-100 tracking-tight truncate leading-tight">
                {player1Name}
              </h3>
              <div className="text-[6px] xs:text-[7px] sm:text-[9px] text-slate-400 font-semibold leading-none">
                เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p1HighBreak}</strong>
              </div>
            </div>
          </div>

          {/* 2. Body: Left Column [FRAME / BREAK] & Right Column [EXTRA LARGE SCORE] */}
          <div className="flex items-stretch gap-0.5 xs:gap-1 sm:gap-1.5 flex-1 my-0.5">
            {/* Left Sub-Boxes Stack: FRAME & BREAK */}
            <div className="w-[30%] xs:w-[28%] sm:w-[26%] flex flex-col justify-between gap-0.5 xs:gap-1">
              {/* Box 1: FRAME */}
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/90 rounded-md p-0.5 shadow-inner">
                <div className="text-[6px] xs:text-[7px] sm:text-[8px] text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                  <Trophy className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-amber-400 flex-shrink-0" />
                  <span>เฟรม</span>
                </div>
                <span className="text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono text-amber-300 leading-none mt-0.5">
                  {p1Frames}
                </span>
              </div>

              {/* Box Ga (If Ga Mode) */}
              {isGaMode && (
                <div className="flex-1 flex flex-col items-center justify-center bg-purple-950/40 border border-purple-800/80 rounded-md p-0.5 shadow-inner">
                  <div className="text-[6px] xs:text-[7px] sm:text-[8px] text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                    <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-purple-400 flex-shrink-0" />
                    <span>กา</span>
                  </div>
                  <span className="text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono text-purple-300 leading-none mt-0.5">
                    {p1Ga}
                  </span>
                </div>
              )}

              {/* Box 2: BREAK */}
              <div className={`flex-1 flex flex-col items-center justify-center rounded-md p-0.5 border transition-all duration-200 shadow-inner ${
                activeStrikerIndex === 0 && p1Break > 0
                  ? 'bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-900/90 border-amber-400 text-amber-200 ring-1 ring-amber-400/60 animate-pulse'
                  : 'bg-slate-950/80 border-slate-800/90 text-slate-400'
              }`}>
                <div className="flex items-center space-x-0.5">
                  <Flame className={`w-2 h-2 xs:w-2.5 xs:h-2.5 flex-shrink-0 ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                  <span className={`text-[6px] xs:text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>เบรก</span>
                </div>
                <span className={`text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono leading-none mt-0.5 ${
                  activeStrikerIndex === 0 && p1Break > 0 ? 'text-white drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]' : 'text-slate-400'
                }`}>
                  {p1Break}{activeStrikerIndex === 0 && p1Break > 0 ? '*' : ''}
                </span>
              </div>
            </div>

            {/* Right Column: Giant Wide Full-Height SCORE Box */}
            <div className={`flex-1 flex flex-col justify-between rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-1.5 border transition-all ${
              activeStrikerIndex === 0
                ? 'bg-gradient-to-b from-slate-950/95 to-emerald-950/50 border-emerald-500/90 shadow-md shadow-emerald-950/60'
                : 'bg-slate-950/80 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-slate-400 px-1">
                <span className="uppercase tracking-wider">คะแนน</span>
                {activeStrikerIndex === 0 && (
                  <span className="text-emerald-400 font-mono">
                    ตบ {ballsInCurrentVisit}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center py-0.5">
                <span className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 0
                    ? 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'text-slate-100'
                }`}>
                  {p1Score}
                </span>
              </div>

              {activeStrikerIndex === 0 ? (
                <div className="text-center text-[6px] xs:text-[7px] sm:text-[8px] font-mono text-amber-300 font-bold bg-slate-900/90 py-0.2 rounded">
                  เวลา: {shotDurationSec}s
                </div>
              ) : (
                <div className="h-1.5" />
              )}
            </div>
          </div>
        </div>

        {/* ==================== PLAYER 2 CARD (Right: [SCORE] -> [FRAME / BREAK]) ==================== */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-2 md:p-2.5 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 ring-emerald-500/50 shadow-md shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-0.5 xs:h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* 1. Header: Name + High Break Underneath + Avatar */}
          <div className="flex items-center justify-end space-x-1 xs:space-x-1.5 min-w-0 mb-0.5">
            <div className="min-w-0 flex-1 text-right">
              <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-lg font-black text-slate-100 tracking-tight truncate leading-tight">
                {player2Name}
              </h3>
              <div className="text-[6px] xs:text-[7px] sm:text-[9px] text-slate-400 font-semibold leading-none">
                เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p2HighBreak}</strong>
              </div>
            </div>
            <div className={`p-0.5 xs:p-1 rounded-md flex-shrink-0 ${activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
              <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          {/* 2. Body: Left Column [EXTRA LARGE SCORE] & Right Column [FRAME / BREAK] */}
          <div className="flex items-stretch gap-0.5 xs:gap-1 sm:gap-1.5 flex-1 my-0.5">
            {/* Left Column: Giant Wide Full-Height SCORE Box */}
            <div className={`flex-1 flex flex-col justify-between rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-1.5 border transition-all ${
              activeStrikerIndex === 1
                ? 'bg-gradient-to-b from-slate-950/95 to-emerald-950/50 border-emerald-500/90 shadow-md shadow-emerald-950/60'
                : 'bg-slate-950/80 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-slate-400 px-1">
                <span className="uppercase tracking-wider">คะแนน</span>
                {activeStrikerIndex === 1 && (
                  <span className="text-emerald-400 font-mono">
                    ตบ {ballsInCurrentVisit}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center py-0.5">
                <span className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 1
                    ? 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'text-slate-100'
                }`}>
                  {p2Score}
                </span>
              </div>

              {activeStrikerIndex === 1 ? (
                <div className="text-center text-[6px] xs:text-[7px] sm:text-[8px] font-mono text-amber-300 font-bold bg-slate-900/90 py-0.2 rounded">
                  เวลา: {shotDurationSec}s
                </div>
              ) : (
                <div className="h-1.5" />
              )}
            </div>

            {/* Right Sub-Boxes Stack: FRAME & BREAK */}
            <div className="w-[30%] xs:w-[28%] sm:w-[26%] flex flex-col justify-between gap-0.5 xs:gap-1">
              {/* Box 1: FRAME */}
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/90 rounded-md p-0.5 shadow-inner">
                <div className="text-[6px] xs:text-[7px] sm:text-[8px] text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                  <Trophy className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-amber-400 flex-shrink-0" />
                  <span>เฟรม</span>
                </div>
                <span className="text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono text-amber-300 leading-none mt-0.5">
                  {p2Frames}
                </span>
              </div>

              {/* Box Ga (If Ga Mode) */}
              {isGaMode && (
                <div className="flex-1 flex flex-col items-center justify-center bg-purple-950/40 border border-purple-800/80 rounded-md p-0.5 shadow-inner">
                  <div className="text-[6px] xs:text-[7px] sm:text-[8px] text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                    <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-purple-400 flex-shrink-0" />
                    <span>กา</span>
                  </div>
                  <span className="text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono text-purple-300 leading-none mt-0.5">
                    {p2Ga}
                  </span>
                </div>
              )}

              {/* Box 2: BREAK */}
              <div className={`flex-1 flex flex-col items-center justify-center rounded-md p-0.5 border transition-all duration-200 shadow-inner ${
                activeStrikerIndex === 1 && p2Break > 0
                  ? 'bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-900/90 border-amber-400 text-amber-200 ring-1 ring-amber-400/60 animate-pulse'
                  : 'bg-slate-950/80 border-slate-800/90 text-slate-400'
              }`}>
                <div className="flex items-center space-x-0.5">
                  <Flame className={`w-2 h-2 xs:w-2.5 xs:h-2.5 flex-shrink-0 ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                  <span className={`text-[6px] xs:text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>เบรก</span>
                </div>
                <span className={`text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono leading-none mt-0.5 ${
                  activeStrikerIndex === 1 && p2Break > 0 ? 'text-white drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]' : 'text-slate-400'
                }`}>
                  {p2Break}{activeStrikerIndex === 1 && p2Break > 0 ? '*' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Status Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-md xs:rounded-lg md:rounded-xl p-0.5 xs:p-1 md:p-1.5 shadow-sm flex flex-wrap items-center justify-between gap-0.5 xs:gap-1 text-[7px] xs:text-[8px] md:text-xs font-semibold">
        <div className="flex items-center space-x-1">
          <span className="text-slate-400">แดงบนโต๊ะ:</span>
          <span className="font-bold font-mono text-red-400 bg-red-950/80 border border-red-800 px-1 py-0.2 rounded">
            {redsRemaining} ลูก
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-0.5 xs:gap-1">
          <div className="bg-slate-900 border border-slate-700/80 px-1 py-0.2 rounded flex items-center space-x-0.5">
            <span className="text-slate-400 text-[6px] xs:text-[7px] md:text-xs">แต้มบนโต๊ะ:</span>
            <span className="font-bold font-mono text-emerald-400 text-[8px] xs:text-[9px] md:text-sm">{remaining}</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-1 py-0.2 rounded flex items-center space-x-0.5">
            <span className="text-slate-400 text-[6px] xs:text-[7px] md:text-xs">นำ/ตาม:</span>
            <span className="font-bold font-mono text-amber-300 text-[8px] xs:text-[9px] md:text-sm">{diff}</span>
          </div>

          {isSafeLead ? (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-1 py-0.2 rounded flex items-center space-x-0.5 animate-pulse shadow-sm font-bold text-[6px] xs:text-[7px] md:text-xs">
              <ShieldAlert className="w-2 h-2 text-rose-400 flex-shrink-0" />
              <span>
                แต้มขาด! {remaining > 0 ? `สนุ๊ก: ${snookersNeeded}` : `(${leaderName} ชนะ)`}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 px-1 py-0.2 rounded flex items-center space-x-0.5 font-bold text-[6px] xs:text-[7px] md:text-xs">
              <Sparkles className="w-2 h-2 text-emerald-400 flex-shrink-0" />
              <span>แต้มยังไม่ขาด</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-700/80 px-1 py-0.2 rounded flex items-center space-x-0.5">
            <Clock className="w-2 h-2 text-slate-400" />
            <span className="font-mono font-bold text-slate-200 text-[8px] xs:text-[9px] md:text-xs">{frameDurationFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
