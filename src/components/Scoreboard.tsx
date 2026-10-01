import React from 'react';
import { User, Flame, Clock, Sparkles, ShieldAlert, Trophy, Target, Zap, Percent, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { Frame, ElectricConfig } from '../types/snooker';
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
  isElectricMode?: boolean;
  electricConfig?: ElectricConfig;
  p1CumulativeScore?: number;
  p2CumulativeScore?: number;
  currentGameNumber?: number;
  totalGames?: number;
  isShootOutMode?: boolean;
  shootOutRemainingSec?: number;
  shootOutShotSec?: number;
  isShootOutPaused?: boolean;
  ballInHandActive?: boolean;
  onResetShotClock?: () => void;
  onTogglePauseShootOut?: () => void;
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
  isElectricMode = false,
  electricConfig,
  p1CumulativeScore,
  p2CumulativeScore,
  currentGameNumber = 1,
  totalGames = 0,
  isShootOutMode = false,
  shootOutRemainingSec = 600,
  shootOutShotSec = 15,
  isShootOutPaused = false,
  ballInHandActive = false,
  onResetShotClock,
  onTogglePauseShootOut,
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

  const currentConfig = electricConfig || frame?.electricConfig;
  const hasHandicap = isElectricMode && currentConfig?.handicapEnabled;

  const diff = Math.abs(p1Score - p2Score);
  const remaining = calculateRemainingPoints(
    redsRemaining,
    frame?.shots || [],
    isElectricMode ? 'electric-count' : (isGaMode ? 'snooker-ga' : '15-reds'),
    currentConfig
  );
  const isSafeLead = diff > remaining;
  const snookersNeeded = calculateSnookersRequired(diff, remaining);
  const leaderName = p1Score >= p2Score ? player1Name : player2Name;

  const p1Break = activeStrikerIndex === 0 ? currentBreak : 0;
  const p2Break = activeStrikerIndex === 1 ? currentBreak : 0;

  const effectiveP1Cum = p1CumulativeScore !== undefined ? p1CumulativeScore : p1Score;
  const effectiveP2Cum = p2CumulativeScore !== undefined ? p2CumulativeScore : p2Score;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-0.5 xs:space-y-0.5 sm:space-y-1 flex-shrink-0">
      {/* Shoot Out Dedicated Timing & Ball in Hand HUD */}
      {isShootOutMode && (
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900/95 to-amber-950/90 border-2 border-red-500/80 rounded-xl p-1.5 xs:p-2 sm:p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Match Countdown */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="p-1 sm:p-1.5 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-red-300 font-black uppercase tracking-wider flex items-center gap-1">
                <span>เวลาแมตช์</span>
                <span className="text-slate-400 font-bold">
                  ({(shootOutRemainingSec ?? 0) > 300 ? 'ครึ่งแรก' : 'ครึ่งหลัง'})
                </span>
              </div>
              <div className={`text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black font-mono leading-none ${
                (shootOutRemainingSec ?? 0) <= 60 ? 'text-red-400 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]' : 'text-white'
              }`}>
                {Math.floor((shootOutRemainingSec ?? 0) / 60).toString().padStart(2, '0')}:
                {((shootOutRemainingSec ?? 0) % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Shot Clock & Status */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className={`px-2.5 sm:px-4 py-1 rounded-xl border-2 flex items-center space-x-2 shadow-inner transition-all ${
              isShootOutPaused
                ? 'bg-amber-950/90 border-amber-500/90 text-amber-300'
                : (shootOutShotSec ?? 0) <= 2
                  ? 'bg-red-950 border-red-500 text-red-300 animate-pulse ring-2 ring-red-500/70'
                  : (shootOutShotSec ?? 0) <= 5
                    ? 'bg-amber-950 border-amber-400 text-amber-300'
                    : 'bg-emerald-950 border-emerald-500 text-emerald-300'
            }`}>
              <div className="text-right">
                <div className="text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase tracking-wider opacity-80">
                  {isShootOutPaused ? '⏸️ หยุดช็อต' : 'ช็อตคล็อก'}
                </div>
                <div className="text-2xl xs:text-3xl sm:text-4xl font-black font-mono leading-none">
                  {(shootOutShotSec ?? 0).toString().padStart(2, '0')}s
                </div>
              </div>
            </div>

            {/* Quick Referee Action Buttons */}
            <div className="flex flex-col gap-1">
              {onTogglePauseShootOut && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onTogglePauseShootOut(); }}
                  className={`px-2 py-0.5 sm:py-1 rounded-lg text-[8px] xs:text-[9px] sm:text-[10px] font-black border transition cursor-pointer flex items-center space-x-1 ${
                    isShootOutPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                  }`}
                  title="กดปุ่ม 0 (Ins) หรือ Space เพื่อหยุด/เดินเวลา"
                >
                  {isShootOutPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                  <span>{isShootOutPaused ? 'เดินเวลา [0]' : 'หยุดเวลา [0]'}</span>
                </button>
              )}
              {onResetShotClock && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onResetShotClock(); }}
                  className="px-2 py-0.5 sm:py-1 rounded-lg text-[8px] xs:text-[9px] sm:text-[10px] font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition cursor-pointer flex items-center space-x-1"
                  title="กดปุ่ม 8 เพื่อรีเซ็ตเวลาช็อต"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>รีเซ็ตช็อต [8]</span>
                </button>
              )}
            </div>
          </div>

          {/* Ball in Hand Alert Badge */}
          {ballInHandActive && (
            <div className="w-full bg-rose-600 text-white text-[10px] xs:text-xs sm:text-sm font-black py-1 px-3 rounded-lg border-2 border-rose-300 flex items-center justify-center space-x-1.5 animate-bounce shadow-lg shadow-rose-950">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>🔴 บอลอินแฮนด์ (Ball in Hand) : วางลูกขาวได้ทุกจุดบนโต๊ะ</span>
            </div>
          )}
        </div>
      )}

      {/* Main Scoreboard */}
      <div className="grid grid-cols-2 gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2">
        
        {/* ==================== PLAYER 1 CARD ==================== */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-1.5 md:p-2 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 ring-emerald-500/50 shadow-md shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-0.5 xs:h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* 1. Header: Avatar + Player Name + High Break & Handicap Underneath */}
          <div className="flex items-center space-x-1 xs:space-x-1.5 min-w-0 mb-0.5">
            <div className={`p-0.5 xs:p-1 rounded-md flex-shrink-0 ${activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
              <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-lg font-black text-slate-100 tracking-tight truncate leading-tight">
                  {player1Name}
                </h3>
                {frame?.netHandicapPoints && frame.netHandicapPoints > 0 ? (
                  <span className={`text-[6px] xs:text-[7px] font-black px-1 py-0.2 rounded leading-none inline-flex items-center gap-0.5 ${
                    frame.handicapGiverIndex === 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    <span>{frame.handicapGiverIndex === 0 ? `ต่อ ${frame.netHandicapPoints}` : `ได้ต่อ +${frame.netHandicapPoints}`}</span>
                    {frame.player1HandicapPoints !== undefined && frame.player1HandicapPoints > 0 && (
                      <span className="opacity-75 font-mono text-[5px] xs:text-[6px]">({frame.player1HandicapPoints})</span>
                    )}
                  </span>
                ) : null}
                {hasHandicap && (
                  <span className={`text-[6px] xs:text-[7px] font-black px-1 py-0.2 rounded leading-none ${
                    currentConfig?.handicapGiverIndex === 0
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {currentConfig?.handicapGiverIndex === 0 ? `ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'รอง 100%'}
                  </span>
                )}
              </div>
              {!isElectricMode && (
                <div className="text-[6px] xs:text-[7px] sm:text-[9px] text-slate-400 font-semibold leading-none">
                  เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p1HighBreak}</strong>
                </div>
              )}
            </div>
          </div>

          {/* 2. Body: Either 4-Box Top/Bottom (Electric Mode) OR Stacked Frame/Break + Giant Score (Standard) */}
          {isElectricMode ? (
            /* ================= Electric Mode 2-Box Stack (Top: Current Game, Bottom: Cumulative) ================= */
            <div className="flex flex-col gap-0.5 xs:gap-1 flex-1 my-0.5">
              {/* Top Box: Current Game Ball Count (ช่องบน: สกอร์นับลูกปัจจุบัน) */}
              <div className={`flex-1 flex flex-col justify-between rounded-md xs:rounded-lg p-1 xs:p-1.5 border shadow-inner ${
                activeStrikerIndex === 0
                  ? 'bg-gradient-to-b from-slate-950/95 to-emerald-950/60 border-emerald-500/90'
                  : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-slate-400">
                  <span className="uppercase text-emerald-400 font-extrabold">แต้มเกมปัจจุบัน</span>
                  {activeStrikerIndex === 0 && (
                    <span className="text-amber-300 font-mono">
                      ตบ {ballsInCurrentVisit}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center py-0.5">
                  <span className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight leading-none ${
                    activeStrikerIndex === 0
                      ? 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                      : 'text-slate-100'
                  }`}>
                    {p1Score}
                  </span>
                </div>
              </div>

              {/* Bottom Box: Total Cumulative Score (ช่องล่าง: สกอร์นับสะสม) */}
              <div className="flex-1 flex flex-col justify-between rounded-md xs:rounded-lg p-1 xs:p-1.5 border border-cyan-800/60 bg-gradient-to-b from-slate-950/90 to-cyan-950/40 shadow-inner">
                <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-cyan-300">
                  <span className="uppercase tracking-wider">แต้มสะสมรวม</span>
                  <span className="text-[6px] xs:text-[7px] bg-cyan-900/60 px-1 rounded font-mono text-cyan-200">
                    รวมทุกเกม
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-0.5">
                  <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-cyan-300 leading-none">
                    {effectiveP1Cum}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================= Standard Mode (Frame + Break + Large Score) ================= */
            <div className="flex items-stretch gap-0.5 xs:gap-1 sm:gap-1.5 flex-1 my-0.5">
              {/* Left Sub-Boxes Stack: FRAME & BREAK (22-24% width) */}
              <div className="w-[24%] xs:w-[22%] sm:w-[20%] flex flex-col justify-between gap-0.5 xs:gap-1">
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
              <div className={`flex-1 flex flex-col justify-between rounded-lg xs:rounded-xl md:rounded-2xl p-1 xs:p-1.5 md:p-2 border transition-all h-full ${
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
                  <span className={`text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                    activeStrikerIndex === 0
                      ? 'text-emerald-300 drop-shadow-[0_0_24px_rgba(52,211,153,0.5)]'
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
          )}
        </div>

        {/* ==================== PLAYER 2 CARD ==================== */}
        <div
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-lg xs:rounded-xl md:rounded-2xl p-0.5 xs:p-1 sm:p-1.5 md:p-2 transition-all duration-300 cursor-pointer border active:scale-[0.99] flex flex-col justify-between ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 ring-emerald-500/50 shadow-md shadow-emerald-950/70'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-0.5 xs:h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* 1. Header: Name + High Break & Handicap Underneath + Avatar */}
          <div className="flex items-center justify-end space-x-1 xs:space-x-1.5 min-w-0 mb-0.5">
            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-end space-x-1">
                {frame?.netHandicapPoints && frame.netHandicapPoints > 0 ? (
                  <span className={`text-[6px] xs:text-[7px] font-black px-1 py-0.2 rounded leading-none inline-flex items-center gap-0.5 ${
                    frame.handicapGiverIndex === 1
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    <span>{frame.handicapGiverIndex === 1 ? `ต่อ ${frame.netHandicapPoints}` : `ได้ต่อ +${frame.netHandicapPoints}`}</span>
                    {frame.player2HandicapPoints !== undefined && frame.player2HandicapPoints > 0 && (
                      <span className="opacity-75 font-mono text-[5px] xs:text-[6px]">({frame.player2HandicapPoints})</span>
                    )}
                  </span>
                ) : null}
                {hasHandicap && (
                  <span className={`text-[6px] xs:text-[7px] font-black px-1 py-0.2 rounded leading-none ${
                    currentConfig?.handicapGiverIndex === 1
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {currentConfig?.handicapGiverIndex === 1 ? `ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'รอง 100%'}
                  </span>
                )}
                <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-lg font-black text-slate-100 tracking-tight truncate leading-tight">
                  {player2Name}
                </h3>
              </div>
              {!isElectricMode && (
                <div className="text-[6px] xs:text-[7px] sm:text-[9px] text-slate-400 font-semibold leading-none">
                  เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p2HighBreak}</strong>
                </div>
              )}
            </div>
            <div className={`p-0.5 xs:p-1 rounded-md flex-shrink-0 ${activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400'}`}>
              <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          {/* 2. Body: Either 4-Box Top/Bottom (Electric Mode) OR Stacked Frame/Break + Giant Score (Standard) */}
          {isElectricMode ? (
            /* ================= Electric Mode 2-Box Stack (Top: Current Game, Bottom: Cumulative) ================= */
            <div className="flex flex-col gap-0.5 xs:gap-1 flex-1 my-0.5">
              {/* Top Box: Current Game Ball Count (ช่องบน: สกอร์นับลูกปัจจุบัน) */}
              <div className={`flex-1 flex flex-col justify-between rounded-md xs:rounded-lg p-1 xs:p-1.5 border shadow-inner ${
                activeStrikerIndex === 1
                  ? 'bg-gradient-to-b from-slate-950/95 to-emerald-950/60 border-emerald-500/90'
                  : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-slate-400">
                  <span className="uppercase text-emerald-400 font-extrabold">แต้มเกมปัจจุบัน</span>
                  {activeStrikerIndex === 1 && (
                    <span className="text-amber-300 font-mono">
                      ตบ {ballsInCurrentVisit}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center py-0.5">
                  <span className={`text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight leading-none ${
                    activeStrikerIndex === 1
                      ? 'text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                      : 'text-slate-100'
                  }`}>
                    {p2Score}
                  </span>
                </div>
              </div>

              {/* Bottom Box: Total Cumulative Score (ช่องล่าง: สกอร์นับสะสม) */}
              <div className="flex-1 flex flex-col justify-between rounded-md xs:rounded-lg p-1 xs:p-1.5 border border-cyan-800/60 bg-gradient-to-b from-slate-950/90 to-cyan-950/40 shadow-inner">
                <div className="flex items-center justify-between text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-cyan-300">
                  <span className="uppercase tracking-wider">แต้มสะสมรวม</span>
                  <span className="text-[6px] xs:text-[7px] bg-cyan-900/60 px-1 rounded font-mono text-cyan-200">
                    รวมทุกเกม
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-0.5">
                  <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-cyan-300 leading-none">
                    {effectiveP2Cum}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================= Standard Mode (Score + Frame/Break) ================= */
            <div className="flex items-stretch gap-0.5 xs:gap-1 sm:gap-1.5 flex-1 my-0.5">
              {/* Left Column: Giant Wide Full-Height SCORE Box */}
              <div className={`flex-1 flex flex-col justify-between rounded-lg xs:rounded-xl md:rounded-2xl p-1 xs:p-1.5 md:p-2 border transition-all h-full ${
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
                  <span className={`text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                    activeStrikerIndex === 1
                      ? 'text-emerald-300 drop-shadow-[0_0_24px_rgba(52,211,153,0.5)]'
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

              {/* Right Sub-Boxes Stack: FRAME & BREAK (22-24% width) */}
              <div className="w-[24%] xs:w-[22%] sm:w-[20%] flex flex-col justify-between gap-0.5 xs:gap-1">
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
          )}
        </div>
      </div>

      {/* Frame Status Bar (Seamless touching on mobile) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-md xs:rounded-lg md:rounded-xl p-0.5 xs:p-1 md:p-1.5 shadow-sm flex flex-wrap items-center justify-between gap-0.5 xs:gap-1 text-[7px] xs:text-[8px] md:text-xs font-semibold mb-0">
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
            <div className="bg-red-600 border-2 border-red-300 text-white px-1.5 py-0.2 md:py-0.5 rounded flex items-center space-x-1 animate-pulse shadow-md font-black text-[7px] xs:text-[8px] md:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>
                แต้มขาด {diff - remaining} แต้ม! {remaining > 0 ? `(สนุ๊ก: ${snookersNeeded})` : `(${leaderName} ชนะ)`}
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
