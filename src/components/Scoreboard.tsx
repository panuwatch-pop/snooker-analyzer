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
  frame: Frame;
  frameDurationFormatted: string;
  shotDurationSec: number;
  onSwitchStriker: () => void;
  onEndFrame: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  player1Name,
  player2Name,
  activeStrikerIndex,
  currentBreak,
  ballsInCurrentVisit,
  frame,
  frameDurationFormatted,
  shotDurationSec,
  onSwitchStriker,
  onEndFrame,
}) => {
  const p1Score = frame.player1Score;
  const p2Score = frame.player2Score;
  const diff = Math.abs(p1Score - p2Score);
  const remaining = calculateRemainingPoints(frame.redsRemaining, frame.shots);
  const isSafeLead = diff > remaining;
  const snookersNeeded = calculateSnookersRequired(diff, remaining);
  const leaderName = p1Score >= p2Score ? player1Name : player2Name;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3">
      {/* Main Scoreboard Cards with Adjacent Giant Points & Frames Underneath */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Player 1 Card (Score on Right) */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border active:scale-[0.99] ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          <div className="flex items-center justify-between">
            {/* Player Info (Left) */}
            <div className="space-y-2 flex-1 min-w-0 pr-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight truncate">
                  {player1Name}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {activeStrikerIndex === 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full animate-pulse">
                    กำลังแทง
                  </span>
                )}
                <div className="text-xs text-slate-400 font-semibold">
                  เบรกสูงสุด: <strong className="text-emerald-400 font-bold">{frame.stats[0]?.highestBreak || 0}</strong>
                </div>
              </div>
            </div>

            {/* Giant Score & Frame Count Underneath (Right) */}
            <div className="flex flex-col items-end flex-shrink-0 pl-2">
              <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
                {p1Score}
              </div>
              <div className="mt-1 bg-amber-500/20 border border-amber-400/60 px-2.5 py-0.5 rounded-lg flex items-center space-x-1 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-200 font-bold">เฟรม:</span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-300">{frame.player1FramesWon}</span>
              </div>
            </div>
          </div>

          {activeStrikerIndex === 0 && (
            <div className="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2 text-amber-400 bg-amber-950/50 border border-amber-700/50 px-2.5 py-1 rounded-lg">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>เบรกปัจจุบัน: <strong className="text-sm text-amber-300 font-mono">{currentBreak}</strong> แต้ม</span>
                <span className="text-slate-400">({ballsInCurrentVisit} ลูก)</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ช็อตนี้: <strong className="text-amber-300 font-mono">{shotDurationSec}s</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Card (Score on Left, Info on Right) */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border active:scale-[0.99] ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          <div className="flex items-center justify-between">
            {/* Giant Score & Frame Count Underneath (Left) */}
            <div className="flex flex-col items-start flex-shrink-0 pr-2">
              <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
                {p2Score}
              </div>
              <div className="mt-1 bg-amber-500/20 border border-amber-400/60 px-2.5 py-0.5 rounded-lg flex items-center space-x-1 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-200 font-bold">เฟรม:</span>
                <span className="text-sm sm:text-base font-black font-mono text-amber-300">{frame.player2FramesWon}</span>
              </div>
            </div>

            {/* Player Info (Right) */}
            <div className="space-y-2 flex-1 min-w-0 pl-2 text-right">
              <div className="flex items-center justify-end space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight truncate">
                  {player2Name}
                </h3>
                <div className={`p-1.5 rounded-lg ${activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
                  <User className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <div className="text-xs text-slate-400 font-semibold">
                  เบรกสูงสุด: <strong className="text-emerald-400 font-bold">{frame.stats[1]?.highestBreak || 0}</strong>
                </div>
                {activeStrikerIndex === 1 && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full animate-pulse">
                    กำลังแทง
                  </span>
                )}
              </div>
            </div>
          </div>

          {activeStrikerIndex === 1 && (
            <div className="mt-3 pt-2.5 border-t border-emerald-800/40 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-1 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ช็อตนี้: <strong className="text-amber-300 font-mono">{shotDurationSec}s</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-amber-400 bg-amber-950/50 border border-amber-700/50 px-2.5 py-1 rounded-lg">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>เบรกปัจจุบัน: <strong className="text-sm text-amber-300 font-mono">{currentBreak}</strong> แต้ม</span>
                <span className="text-slate-400">({ballsInCurrentVisit} ลูก)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frame Status Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-2.5 text-xs md:text-sm font-semibold">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">แดงบนโต๊ะ:</span>
          <span className="font-bold font-mono text-red-400 bg-red-950/80 border border-red-800 px-2.5 py-0.5 rounded-lg">
            {frame.redsRemaining} ลูก
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
            <span className="text-slate-400">แต้มบนโต๊ะ:</span>
            <span className="font-bold font-mono text-emerald-400 text-sm sm:text-base">{remaining}</span>
          </div>

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
            <span className="text-slate-400">แต้มนำ/ตาม:</span>
            <span className="font-bold font-mono text-amber-300 text-sm sm:text-base">{diff}</span>
          </div>

          {isSafeLead ? (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-3 py-1 rounded-lg flex items-center space-x-1.5 animate-pulse shadow-md font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                แต้มขาด! {remaining > 0 ? `ต้องวางสนุ๊ก: ${snookersNeeded} ลูก` : `(${leaderName} ชนะเฟรม)`}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 px-3 py-1 rounded-lg flex items-center space-x-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>แต้มยังไม่ขาด</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">เวลา:</span>
            <span className="font-mono font-bold text-slate-200">{frameDurationFormatted}</span>
          </div>

          {/* Direct End Frame Button */}
          <button
            onClick={onEndFrame}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 cursor-pointer active:scale-95 transition-all"
            title="กดเพื่อจบเฟรมนี้และดูผลผู้ชนะ หรือเริ่มเฟรมถัดไป"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>จบเฟรมนี้ (End Frame)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
