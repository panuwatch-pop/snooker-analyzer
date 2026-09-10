import React, { useState } from 'react';
import { 
  User, 
  Flame, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle,
  Trophy, 
  Target, 
  Zap, 
  Keyboard, 
  Undo2, 
  RotateCcw, 
  Flag, 
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Frame, ElectricConfig, Shot, BallColor, GameMode } from '../types/snooker';
import { calculateRemainingPoints, calculateSnookersRequired, BALL_MAP } from '../utils/snookerRules';

interface KeyboardDisplayScreenProps {
  player1Name: string;
  player2Name: string;
  activeStrikerIndex: 0 | 1;
  currentBreak: number;
  ballsInCurrentVisit: number;
  frame?: Frame;
  frameDurationFormatted: string;
  shotDurationSec: number;
  gameMode?: GameMode;
  isGaMode?: boolean;
  isElectricMode?: boolean;
  electricConfig?: ElectricConfig;
  p1CumulativeScore?: number;
  p2CumulativeScore?: number;
  currentGameNumber?: number;
  totalGames?: number;
  currentVisitShots: Shot[];
  isFoulMode?: boolean;
  onFoulSelect?: (points: number) => void;
  onCancelFoulMode?: () => void;
  onSwitchStriker: () => void;
  onEndTurn?: (reason: 'miss' | 'safety') => void;
  onUndo?: () => void;
  onEndFrame?: () => void;
  onNewMatch?: () => void;
  onOpenKeypadGuide?: () => void;
  canUndo?: boolean;
}

export const KeyboardDisplayScreen: React.FC<KeyboardDisplayScreenProps> = ({
  player1Name = 'ผู้เล่น 1',
  player2Name = 'ผู้เล่น 2',
  activeStrikerIndex = 0,
  currentBreak = 0,
  ballsInCurrentVisit = 0,
  frame,
  frameDurationFormatted = '00:00',
  shotDurationSec = 0,
  gameMode = '15-reds',
  isGaMode = false,
  isElectricMode = false,
  electricConfig,
  p1CumulativeScore,
  p2CumulativeScore,
  currentGameNumber = 1,
  totalGames = 0,
  currentVisitShots = [],
  isFoulMode = false,
  onFoulSelect,
  onCancelFoulMode,
  onSwitchStriker,
  onEndTurn,
  onUndo,
  onEndFrame,
  onNewMatch,
  onOpenKeypadGuide,
  canUndo = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const p1Score = frame?.player1Score ?? 0;
  const p2Score = frame?.player2Score ?? 0;
  const p1Frames = frame?.player1FramesWon ?? 0;
  const p2Frames = frame?.player2FramesWon ?? 0;
  const p1Ga = frame?.player1Ga ?? 0;
  const p2Ga = frame?.player2Ga ?? 0;
  const redsRemaining = frame?.redsRemaining ?? (gameMode === '6-reds' ? 6 : 15);
  const p1HighBreak = frame?.stats?.[0]?.highestBreak ?? 0;
  const p2HighBreak = frame?.stats?.[1]?.highestBreak ?? 0;

  const currentConfig = electricConfig || frame?.electricConfig;
  const hasHandicap = isElectricMode && currentConfig?.handicapEnabled;

  const diff = Math.abs(p1Score - p2Score);
  const effectiveMode = isElectricMode ? 'electric-count' : (isGaMode ? 'snooker-ga' : gameMode);
  const remaining = calculateRemainingPoints(
    redsRemaining,
    frame?.shots || [],
    effectiveMode,
    currentConfig
  );
  const isSafeLead = diff > remaining;
  const snookersNeeded = calculateSnookersRequired(diff, remaining);
  const leaderName = p1Score >= p2Score ? player1Name : player2Name;

  const p1Break = activeStrikerIndex === 0 ? currentBreak : 0;
  const p2Break = activeStrikerIndex === 1 ? currentBreak : 0;

  const effectiveP1Cum = p1CumulativeScore !== undefined ? p1CumulativeScore : p1Score;
  const effectiveP2Cum = p2CumulativeScore !== undefined ? p2CumulativeScore : p2Score;

  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col justify-between select-none overflow-hidden animate-fadeIn p-0.5 xs:p-1 sm:p-2 md:p-3 space-y-0.5 xs:space-y-1 sm:space-y-1.5 md:space-y-2 pb-[max(0.25rem,env(safe-area-inset-bottom,4px))]">
      
      {/* 1. TOP HEADER / MATCH STATUS BAR */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2 shadow flex items-center justify-between gap-1 sm:gap-2 flex-shrink-0">
        
        {/* Left: Mode Badge & Frame/Game */}
        <div className="flex items-center space-x-1 xs:space-x-1.5 min-w-0">
          <button
            type="button"
            onClick={onOpenKeypadGuide}
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-1.5 xs:px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider flex-shrink-0 cursor-pointer transition active:scale-95"
            title="คลิกเพื่อดูผังปุ่มกด Wireless Keypad (22 ปุ่ม)"
          >
            <Keyboard className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-pulse flex-shrink-0" />
            <span className="hidden xs:inline">ผังปุ่มกด (Keypad)</span>
            <span className="xs:hidden">ปุ่มกด</span>
          </button>

          <div className={`px-1.5 xs:px-2 py-0.5 rounded-md border font-bold text-[9px] xs:text-[10px] sm:text-xs flex-shrink-0 ${
            effectiveMode === 'electric-count'
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500'
              : (effectiveMode === 'snooker-ga'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500'
                  : (effectiveMode === '6-reds'
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500 font-extrabold'
                      : 'bg-emerald-950/90 text-emerald-300 border-emerald-600'))
          }`}>
            {effectiveMode === 'electric-count'
              ? '⚡ ไฟฟ้า'
              : (effectiveMode === 'snooker-ga'
                  ? '🎯 กา'
                  : (effectiveMode === '6-reds' ? '🔴 6 แดง' : '🔴 15 แดง'))}
          </div>

          <div className="bg-slate-800/90 border border-slate-700 text-amber-300 px-1.5 xs:px-2 py-0.5 rounded-md font-bold text-[9px] xs:text-[10px] sm:text-xs flex items-center space-x-0.5 flex-shrink-0">
            <Trophy className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400 flex-shrink-0" />
            <span>{isElectricMode ? `เกม ${currentGameNumber}${totalGames ? `/${totalGames}` : ''}` : `เฟรม ${currentGameNumber}${totalGames ? `/${totalGames}` : ''}`}</span>
          </div>
        </div>

        {/* Center: Table Situation Indicators */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-[8px] xs:text-[9px] sm:text-xs font-bold">
          <div className="bg-slate-950 border border-red-900/80 px-1 xs:px-1.5 py-0.5 rounded flex items-center space-x-0.5 text-red-400">
            <span className="hidden sm:inline">แดง:</span>
            <span className="font-mono text-[9px] xs:text-xs sm:text-sm font-black text-red-300">{redsRemaining}</span>
          </div>

          <div className="bg-slate-950 border border-emerald-900/80 px-1 xs:px-1.5 py-0.5 rounded flex items-center space-x-0.5 text-emerald-400">
            <span className="hidden sm:inline">แต้มโต๊ะ:</span>
            <span className="font-mono text-[9px] xs:text-xs sm:text-sm font-black text-emerald-300">{remaining}</span>
          </div>

          <div className="bg-slate-950 border border-amber-900/80 px-1 xs:px-1.5 py-0.5 rounded flex items-center space-x-0.5 text-amber-400">
            <span className="hidden sm:inline">นำ/ตาม:</span>
            <span className="font-mono text-[9px] xs:text-xs sm:text-sm font-black text-amber-300">{diff}</span>
          </div>

          {isSafeLead ? (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-1.5 py-0.5 rounded flex items-center space-x-0.5 animate-pulse font-extrabold shadow text-[8px] xs:text-[9px] sm:text-xs">
              <ShieldAlert className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
              <span>แต้มขาด!</span>
            </div>
          ) : (
            <div className="hidden md:flex bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 px-1.5 py-0.5 rounded items-center space-x-0.5 font-bold">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>แต้มยังไม่ขาด</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Fullscreen Toggle */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
          <div className="bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] xs:text-[10px] sm:text-xs text-slate-200 flex items-center space-x-0.5">
            <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-slate-400 flex-shrink-0" />
            <span>{frameDurationFormatted}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition cursor-pointer"
            title="ขยายเต็มจอ (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3 xs:w-3.5 xs:h-3.5" /> : <Maximize2 className="w-3 h-3 xs:w-3.5 xs:h-3.5" />}
          </button>
        </div>
      </div>

      {/* 1.5 FOUL MODE ACTIVE BANNER */}
      {isFoulMode && (
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-2 border-rose-500 rounded-xl p-1.5 xs:p-2 sm:p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-1.5 animate-pulse flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-white font-black text-[11px] xs:text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span>โหมดบันทึกฟาวล์ (กดแต้มบนคีย์แพด):</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onFoulSelect?.(4)}
              className="bg-amber-900 hover:bg-amber-800 text-amber-200 font-mono font-black text-[10px] xs:text-xs sm:text-sm px-2 xs:px-2.5 py-0.5 sm:py-1 rounded-md border border-amber-500 shadow cursor-pointer active:scale-95"
            >
              [4] 4 แต้ม
            </button>
            <button
              type="button"
              onClick={() => onFoulSelect?.(5)}
              className="bg-blue-900 hover:bg-blue-800 text-blue-200 font-mono font-black text-[10px] xs:text-xs sm:text-sm px-2 xs:px-2.5 py-0.5 sm:py-1 rounded-md border border-blue-400 shadow cursor-pointer active:scale-95"
            >
              [5] 5 แต้ม
            </button>
            <button
              type="button"
              onClick={() => onFoulSelect?.(6)}
              className="bg-pink-900 hover:bg-pink-800 text-pink-200 font-mono font-black text-[10px] xs:text-xs sm:text-sm px-2 xs:px-2.5 py-0.5 sm:py-1 rounded-md border border-pink-400 shadow cursor-pointer active:scale-95"
            >
              [6] 6 แต้ม
            </button>
            <button
              type="button"
              onClick={() => onFoulSelect?.(7)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-mono font-black text-[10px] xs:text-xs sm:text-sm px-2 xs:px-2.5 py-0.5 sm:py-1 rounded-md border border-zinc-500 shadow cursor-pointer active:scale-95"
            >
              [7] 7 แต้ม
            </button>
            <button
              type="button"
              onClick={onCancelFoulMode}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] xs:text-xs px-2 py-0.5 sm:py-1 rounded-md border border-slate-600 shadow cursor-pointer"
            >
              [Clear] ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* 2. GIANT MAIN SCOREBOARDS (2 PLAYERS) */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 md:gap-3">
        
        {/* ==================== PLAYER 1 CARD ==================== */}
        <div 
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-xl xs:rounded-2xl p-1 xs:p-1.5 sm:p-2.5 md:p-3 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 sm:ring-4 ring-emerald-500/50 shadow-xl shadow-emerald-950/80'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 1 Header: Name, Active Badge & High Break */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5 xs:pb-1 sm:pb-1.5 flex-shrink-0">
            <div className="flex items-center space-x-1 xs:space-x-1.5 min-w-0 flex-1">
              <div className={`p-0.5 xs:p-1 rounded-md sm:rounded-lg flex-shrink-0 ${
                activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <h2 className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-slate-100 truncate tracking-tight">
                    {player1Name}
                  </h2>
                  {activeStrikerIndex === 0 && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[7px] xs:text-[8px] sm:text-[10px] px-1 xs:px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse flex-shrink-0 shadow">
                      กำลังแทง
                    </span>
                  )}
                </div>
                {!isElectricMode && (
                  <div className="text-[7px] xs:text-[8px] sm:text-xs text-slate-400 font-semibold leading-none">
                    เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p1HighBreak}</strong>
                  </div>
                )}
                {hasHandicap && (
                  <div className="text-[7px] xs:text-[8px] font-semibold mt-0.5">
                    <span className={`px-1 py-0.2 rounded font-bold ${
                      currentConfig?.handicapGiverIndex === 0
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {currentConfig?.handicapGiverIndex === 0 ? `ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'รอง 100%'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shot Clock (if striker active) */}
            {activeStrikerIndex === 0 && (
              <div className="text-right flex-shrink-0 pl-1">
                <span className="text-[6px] xs:text-[7px] sm:text-[9px] text-amber-300 font-bold block leading-none">เวลา</span>
                <span className="text-xs xs:text-sm sm:text-lg md:text-xl font-black font-mono text-amber-300 drop-shadow leading-none">
                  {shotDurationSec}s
                </span>
              </div>
            )}
          </div>

          {/* Player 1 Body: Electric 4-Box OR Standard Giant Score & Sub-Boxes */}
          {isElectricMode ? (
            /* ELECTRIC 4-BOX DISPLAY */
            <div className="flex-1 min-h-0 flex flex-col justify-between py-0.5 xs:py-1 space-y-0.5 xs:space-y-1 sm:space-y-2">
              {/* Top Box: Current Game Score */}
              <div className="flex-1 min-h-0 bg-slate-950/80 border border-cyan-900/60 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2.5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] xs:text-xs sm:text-sm text-cyan-300 font-extrabold flex items-center space-x-0.5">
                    <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-cyan-400 flex-shrink-0" />
                    <span>เกมนับลูก</span>
                  </span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] text-slate-400 font-semibold">เกมที่ {currentGameNumber}</span>
                </div>
                <span className={`text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black font-mono leading-none ${
                  activeStrikerIndex === 0 ? 'text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-slate-100'
                }`}>
                  {p1Score}
                </span>
              </div>

              {/* Bottom Box: Cumulative Score */}
              <div className="flex-1 min-h-0 bg-slate-950/90 border border-amber-900/60 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2.5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] xs:text-xs sm:text-sm text-amber-300 font-extrabold flex items-center space-x-0.5">
                    <Trophy className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400 flex-shrink-0" />
                    <span>สะสมรวม</span>
                  </span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] text-slate-400 font-semibold">ทุกเกม</span>
                </div>
                <span className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-mono text-amber-300 drop-shadow leading-none">
                  {effectiveP1Cum}
                </span>
              </div>
            </div>
          ) : (
            /* STANDARD GIANT SCORE + FRAMES / BREAKS / GA */
            <div className="flex-1 min-h-0 flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-3 py-0.5 xs:py-1">
              
              {/* Left Sub-Boxes Stack: FRAME & BREAK & GA */}
              <div className="w-[28%] xs:w-[26%] sm:w-[24%] md:w-[22%] flex flex-col justify-between gap-0.5 xs:gap-1 h-full min-h-0">
                {/* Frame Box */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-md xs:rounded-lg p-0.5 xs:p-1 shadow-inner">
                  <div className="text-[7px] xs:text-[8px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                    <Trophy className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-amber-400 flex-shrink-0" />
                    <span>เฟรม</span>
                  </div>
                  <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono text-amber-300 leading-none mt-0.5">
                    {p1Frames}
                  </span>
                </div>

                {/* Ga Box (if Ga mode) */}
                {isGaMode && (
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-purple-950/50 border border-purple-800 rounded-md xs:rounded-lg p-0.5 xs:p-1 shadow-inner">
                    <div className="text-[7px] xs:text-[8px] sm:text-xs text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                      <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-purple-400 flex-shrink-0" />
                      <span>กา</span>
                    </div>
                    <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono text-purple-300 leading-none mt-0.5">
                      {p1Ga}
                    </span>
                  </div>
                )}

                {/* Break Box */}
                <div className={`flex-1 min-h-0 flex flex-col items-center justify-center rounded-md xs:rounded-lg p-0.5 xs:p-1 border transition-all duration-300 shadow-inner ${
                  activeStrikerIndex === 0 && p1Break > 0
                    ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 border-amber-400 text-amber-200 ring-1 ring-amber-400/60 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-0.5">
                    <Flame className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                    <span className={`text-[7px] xs:text-[8px] sm:text-xs font-black uppercase tracking-wider ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>
                      เบรก
                    </span>
                  </div>
                  <span className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono leading-none mt-0.5 ${
                    activeStrikerIndex === 0 && p1Break > 0 ? 'text-white drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]' : 'text-slate-400'
                  }`}>
                    {p1Break}{activeStrikerIndex === 0 && p1Break > 0 ? '*' : ''}
                  </span>
                </div>
              </div>

              {/* Giant Score Main Display (Right) */}
              <div className="flex-1 min-h-0 flex items-center justify-center h-full bg-slate-950/50 rounded-lg xs:rounded-xl md:rounded-2xl border border-slate-900/80 p-0.5 xs:p-1">
                <span className={`text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 0
                    ? 'text-emerald-300 drop-shadow-[0_0_28px_rgba(52,211,153,0.6)]'
                    : 'text-slate-100'
                }`}>
                  {p1Score}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================== PLAYER 2 CARD ==================== */}
        <div 
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-xl xs:rounded-2xl p-1 xs:p-1.5 sm:p-2.5 md:p-3 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-1 xs:ring-2 sm:ring-4 ring-emerald-500/50 shadow-xl shadow-emerald-950/80'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 2 Header: Name, Active Badge & High Break */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5 xs:pb-1 sm:pb-1.5 flex-shrink-0">
            <div className="flex items-center space-x-1 xs:space-x-1.5 min-w-0 flex-1">
              <div className={`p-0.5 xs:p-1 rounded-md sm:rounded-lg flex-shrink-0 ${
                activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <h2 className="text-xs xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-slate-100 truncate tracking-tight">
                    {player2Name}
                  </h2>
                  {activeStrikerIndex === 1 && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[7px] xs:text-[8px] sm:text-[10px] px-1 xs:px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse flex-shrink-0 shadow">
                      กำลังแทง
                    </span>
                  )}
                </div>
                {!isElectricMode && (
                  <div className="text-[7px] xs:text-[8px] sm:text-xs text-slate-400 font-semibold leading-none">
                    เบรกสูง: <strong className="text-emerald-400 font-bold font-mono">{p2HighBreak}</strong>
                  </div>
                )}
                {hasHandicap && (
                  <div className="text-[7px] xs:text-[8px] font-semibold mt-0.5">
                    <span className={`px-1 py-0.2 rounded font-bold ${
                      currentConfig?.handicapGiverIndex === 1
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {currentConfig?.handicapGiverIndex === 1 ? `ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'รอง 100%'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shot Clock (if striker active) */}
            {activeStrikerIndex === 1 && (
              <div className="text-right flex-shrink-0 pl-1">
                <span className="text-[6px] xs:text-[7px] sm:text-[9px] text-amber-300 font-bold block leading-none">เวลา</span>
                <span className="text-xs xs:text-sm sm:text-lg md:text-xl font-black font-mono text-amber-300 drop-shadow leading-none">
                  {shotDurationSec}s
                </span>
              </div>
            )}
          </div>

          {/* Player 2 Body: Electric 4-Box OR Standard Giant Score & Sub-Boxes */}
          {isElectricMode ? (
            /* ELECTRIC 4-BOX DISPLAY */
            <div className="flex-1 min-h-0 flex flex-col justify-between py-0.5 xs:py-1 space-y-0.5 xs:space-y-1 sm:space-y-2">
              {/* Top Box: Current Game Score */}
              <div className="flex-1 min-h-0 bg-slate-950/80 border border-cyan-900/60 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2.5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] xs:text-xs sm:text-sm text-cyan-300 font-extrabold flex items-center space-x-0.5">
                    <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-cyan-400 flex-shrink-0" />
                    <span>เกมนับลูก</span>
                  </span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] text-slate-400 font-semibold">เกมที่ {currentGameNumber}</span>
                </div>
                <span className={`text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black font-mono leading-none ${
                  activeStrikerIndex === 1 ? 'text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-slate-100'
                }`}>
                  {p2Score}
                </span>
              </div>

              {/* Bottom Box: Cumulative Score */}
              <div className="flex-1 min-h-0 bg-slate-950/90 border border-amber-900/60 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2.5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] xs:text-xs sm:text-sm text-amber-300 font-extrabold flex items-center space-x-0.5">
                    <Trophy className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400 flex-shrink-0" />
                    <span>สะสมรวม</span>
                  </span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] text-slate-400 font-semibold">ทุกเกม</span>
                </div>
                <span className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black font-mono text-amber-300 drop-shadow leading-none">
                  {effectiveP2Cum}
                </span>
              </div>
            </div>
          ) : (
            /* STANDARD GIANT SCORE + FRAMES / BREAKS / GA */
            <div className="flex-1 min-h-0 flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-3 py-0.5 xs:py-1">
              
              {/* Giant Score Main Display (Left) */}
              <div className="flex-1 min-h-0 flex items-center justify-center h-full bg-slate-950/50 rounded-lg xs:rounded-xl md:rounded-2xl border border-slate-900/80 p-0.5 xs:p-1">
                <span className={`text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 1
                    ? 'text-emerald-300 drop-shadow-[0_0_28px_rgba(52,211,153,0.6)]'
                    : 'text-slate-100'
                }`}>
                  {p2Score}
                </span>
              </div>

              {/* Right Sub-Boxes Stack: FRAME & BREAK & GA */}
              <div className="w-[28%] xs:w-[26%] sm:w-[24%] md:w-[22%] flex flex-col justify-between gap-0.5 xs:gap-1 h-full min-h-0">
                {/* Frame Box */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-md xs:rounded-lg p-0.5 xs:p-1 shadow-inner">
                  <div className="text-[7px] xs:text-[8px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                    <Trophy className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-amber-400 flex-shrink-0" />
                    <span>เฟรม</span>
                  </div>
                  <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono text-amber-300 leading-none mt-0.5">
                    {p2Frames}
                  </span>
                </div>

                {/* Ga Box (if Ga mode) */}
                {isGaMode && (
                  <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-purple-950/50 border border-purple-800 rounded-md xs:rounded-lg p-0.5 xs:p-1 shadow-inner">
                    <div className="text-[7px] xs:text-[8px] sm:text-xs text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-0.5">
                      <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-purple-400 flex-shrink-0" />
                      <span>กา</span>
                    </div>
                    <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono text-purple-300 leading-none mt-0.5">
                      {p2Ga}
                    </span>
                  </div>
                )}

                {/* Break Box */}
                <div className={`flex-1 min-h-0 flex flex-col items-center justify-center rounded-md xs:rounded-lg p-0.5 xs:p-1 border transition-all duration-300 shadow-inner ${
                  activeStrikerIndex === 1 && p2Break > 0
                    ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 border-amber-400 text-amber-200 ring-1 ring-amber-400/60 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-0.5">
                    <Flame className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                    <span className={`text-[7px] xs:text-[8px] sm:text-xs font-black uppercase tracking-wider ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>
                      เบรก
                    </span>
                  </div>
                  <span className={`text-base xs:text-lg sm:text-2xl md:text-3xl font-black font-mono leading-none mt-0.5 ${
                    activeStrikerIndex === 1 && p2Break > 0 ? 'text-white drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]' : 'text-slate-400'
                  }`}>
                    {p2Break}{activeStrikerIndex === 1 && p2Break > 0 ? '*' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. POTTED BALLS SEQUENCE IN CURRENT VISIT */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg xs:rounded-xl p-1 xs:p-1.5 sm:p-2 shadow flex items-center justify-between gap-1 flex-shrink-0">
        <div className="flex items-center space-x-1 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-extrabold text-slate-300 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="whitespace-nowrap">ตบ ({pottedInVisit.length}):</span>
        </div>

        {/* Balls List with vibrant spheres */}
        <div className="flex-1 flex items-center space-x-1 xs:space-x-1.5 overflow-x-auto py-0.5 px-1 min-w-0">
          {pottedInVisit.length === 0 ? (
            <span className="text-[8px] xs:text-[10px] sm:text-xs text-slate-500 italic truncate">
              ยังไม่มีลูกที่ตบในไม้นี้ (กดเลข 1-7)
            </span>
          ) : (
            pottedInVisit.map((s, idx) => {
              const b = BALL_MAP[s.ballPotted as BallColor];
              if (!b) return null;
              return (
                <div
                  key={s.id || idx}
                  className={`relative w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-mono font-black text-[8px] xs:text-[9px] sm:text-xs md:text-sm text-white shadow-sm border border-white/40 flex-shrink-0 animate-scaleUp ${b.cssClass}`}
                  title={`ลูก${b.nameTh} (+${b.points}${s.gaCount ? ` | +${s.gaCount} กา` : ''})`}
                >
                  <span className="drop-shadow-sm">{b.points}</span>
                  {s.gaCount && s.gaCount > 0 ? (
                    <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white font-mono text-[6px] xs:text-[7px] sm:text-[9px] font-black px-0.5 rounded-full border border-purple-300 shadow">
                      +{s.gaCount}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Current Break Total Points */}
        {currentBreak > 0 && (
          <div className="bg-amber-950/80 border border-amber-500/80 px-1.5 xs:px-2 py-0.5 rounded-md flex items-center space-x-1 text-amber-300 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex-shrink-0">
            <Flame className="w-3 h-3 text-yellow-400 animate-bounce flex-shrink-0" />
            <span>เบรก: <strong className="font-mono text-xs xs:text-sm text-white">{currentBreak}</strong></span>
          </div>
        )}
      </div>

      {/* 4. KEYBOARD SHORTCUTS REFERENCE & EMERGENCY REFEREE CONTROLS */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg xs:rounded-xl p-1 xs:p-1.5 shadow flex items-center justify-between gap-1 text-[9px] xs:text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
        
        {/* Keyboard Quick Keys Guide: Desktop/Tablet gets full guide, Mobile gets ultra-compact reminder */}
        <div className="flex items-center flex-wrap gap-1 min-w-0">
          <span className="font-bold text-slate-300 flex items-center space-x-0.5 flex-shrink-0">
            <Keyboard className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="hidden sm:inline font-black text-amber-300">ปุ่มคีย์ลัด:</span>
          </span>
          
          {/* Desktop full badges */}
          <div className="hidden md:flex items-center space-x-1 flex-wrap gap-y-1">
            <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono font-bold">[1-7] แต้มตบสี</span>
            <span className="bg-emerald-950/80 border border-emerald-600 px-1.5 py-0.5 rounded text-emerald-300 font-mono font-bold">[Enter] เปลี่ยนเทิร์น / เริ่มเฟรมใหม่</span>
            <span className="bg-slate-900 border border-slate-600 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">[.] ยกเลิก/ปิด</span>
            <span className="bg-amber-950/80 border border-amber-600 px-1.5 py-0.5 rounded text-amber-200 font-mono font-bold">[⌫/*] ย้อนกลับ (Undo)</span>
            <span className="bg-purple-950/80 border border-purple-600 px-1.5 py-0.5 rounded text-purple-200 font-mono font-bold">[/] จบเฟรม</span>
            <span className="bg-rose-950/80 border border-rose-600 px-1.5 py-0.5 rounded text-rose-300 font-mono font-bold">[-/+] โหมดฟาวล์ (4-7)</span>
          </div>

          {/* Mobile compact single-line reminder */}
          <span className="md:hidden text-[8px] xs:text-[9px] text-slate-300 truncate font-mono">
            [1-7] แต้ม | [Enter] เทิร์น/เริ่มเฟรม | [.] ยกเลิก | [⌫] ย้อนกลับ | [/] จบเฟรม | [-/+] ฟาวล์
          </span>
        </div>

        {/* Emergency Touch / Mouse Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
          {onEndTurn && (
            <button
              type="button"
              onClick={() => onEndTurn('miss')}
              className="flex items-center space-x-0.5 px-2 py-0.5 sm:py-1 rounded-lg font-black text-[8px] xs:text-[10px] sm:text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 shadow-sm transition cursor-pointer active:scale-95"
              title="เปลี่ยนเทิร์นสลับคนแทง (คีย์ลัด: Enter)"
            >
              <RotateCcw className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-emerald-400" />
              <span>เปลี่ยนเทิร์น [Enter]</span>
            </button>
          )}

          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center space-x-0.5 px-2 py-0.5 sm:py-1 rounded-lg font-black text-[8px] xs:text-[10px] sm:text-xs border shadow-sm transition cursor-pointer ${
                canUndo
                  ? 'bg-amber-950/90 hover:bg-amber-900 text-amber-200 border-amber-600 active:scale-95'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
              title="ย้อนกลับแต้มก่อนหน้า (คีย์ลัด: Backspace ⌫ หรือ *)"
            >
              <Undo2 className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400" />
              <span>ย้อนกลับ [⌫]</span>
            </button>
          )}

          {onEndFrame && (
            <button
              type="button"
              onClick={onEndFrame}
              className="flex items-center space-x-0.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-black text-[8px] xs:text-[10px] sm:text-xs bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500 text-white border-2 border-fuchsia-300 shadow-md shadow-purple-950 transition cursor-pointer active:scale-95"
              title="จบเฟรมปัจจุบัน (คีย์ลัด: / หรือ =)"
            >
              <Flag className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-yellow-300" />
              <span>จบเฟรม [/]</span>
            </button>
          )}

          {onNewMatch && (
            <>
              <div className="w-px bg-slate-800 self-stretch my-0.5 hidden xs:block mx-0.5" />
              <button
                type="button"
                onClick={onNewMatch}
                className="flex items-center space-x-0.5 ml-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-black text-[8px] xs:text-[10px] sm:text-xs bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 border-2 border-emerald-200 ring-1 ring-teal-400/50 shadow-md shadow-teal-950 transition cursor-pointer active:scale-95"
                title="เริ่มแมตช์ใหม่"
              >
                <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-slate-950" />
                <span>เริ่มใหม่</span>
              </button>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
