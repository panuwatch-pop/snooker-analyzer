import React, { useState } from 'react';
import { 
  User, 
  Flame, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
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
import { Frame, ElectricConfig, Shot, BallColor } from '../types/snooker';
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
  isGaMode?: boolean;
  isElectricMode?: boolean;
  electricConfig?: ElectricConfig;
  p1CumulativeScore?: number;
  p2CumulativeScore?: number;
  currentGameNumber?: number;
  totalGames?: number;
  currentVisitShots: Shot[];
  onSwitchStriker: () => void;
  onEndTurn?: (reason: 'miss' | 'safety') => void;
  onUndo?: () => void;
  onEndFrame?: () => void;
  onNewMatch?: () => void;
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
  isGaMode = false,
  isElectricMode = false,
  electricConfig,
  p1CumulativeScore,
  p2CumulativeScore,
  currentGameNumber = 1,
  totalGames = 0,
  currentVisitShots = [],
  onSwitchStriker,
  onEndTurn,
  onUndo,
  onEndFrame,
  onNewMatch,
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

  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col justify-between select-none overflow-hidden animate-fadeIn p-1 sm:p-2 md:p-3 space-y-1.5 md:space-y-2.5">
      
      {/* 1. TOP HEADER / MATCH STATUS BAR */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-lg flex items-center justify-between gap-2 flex-shrink-0">
        
        {/* Left: Mode Badge & Frame/Game */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold px-2.5 py-1 rounded-lg shadow-sm text-xs sm:text-sm md:text-base uppercase tracking-wider">
            <Keyboard className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>โหมดคีย์บอร์ด / TV</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-bold text-xs sm:text-sm ${
            isElectricMode
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500'
              : (isGaMode ? 'bg-amber-950/90 text-amber-300 border-amber-500' : 'bg-emerald-950/90 text-emerald-300 border-emerald-600')
          }`}>
            {isElectricMode ? '⚡ ไฟฟ้า' : (isGaMode ? '🎯 กา' : (frame?.gameMode === '6-reds' ? '6 แดง' : '15 แดง'))}
          </div>

          <div className="bg-slate-800/90 border border-slate-700 text-amber-300 px-2.5 py-1 rounded-lg font-bold text-xs sm:text-sm flex items-center space-x-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{isElectricMode ? `เกม ${currentGameNumber}${totalGames ? `/${totalGames}` : ''}` : `เฟรม ${currentGameNumber}${totalGames ? `/${totalGames}` : ''}`}</span>
          </div>
        </div>

        {/* Center: Table Situation Indicators */}
        <div className="hidden lg:flex items-center space-x-2 text-xs sm:text-sm font-bold">
          <div className="bg-slate-950 border border-red-900/80 px-2 py-1 rounded-lg flex items-center space-x-1.5 text-red-400">
            <span>แดงบนโต๊ะ:</span>
            <span className="font-mono text-base font-black text-red-300">{redsRemaining}</span>
          </div>

          <div className="bg-slate-950 border border-emerald-900/80 px-2 py-1 rounded-lg flex items-center space-x-1.5 text-emerald-400">
            <span>แต้มบนโต๊ะ:</span>
            <span className="font-mono text-base font-black text-emerald-300">{remaining}</span>
          </div>

          <div className="bg-slate-950 border border-amber-900/80 px-2 py-1 rounded-lg flex items-center space-x-1.5 text-amber-400">
            <span>นำ/ตาม:</span>
            <span className="font-mono text-base font-black text-amber-300">{diff}</span>
          </div>

          {isSafeLead ? (
            <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 animate-pulse font-extrabold shadow">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>แต้มขาด! {remaining > 0 ? `สนุ๊ก: ${snookersNeeded}` : `(${leaderName} ชนะ)`}</span>
            </div>
          ) : (
            <div className="bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>แต้มยังไม่ขาด</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Fullscreen Toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold text-xs sm:text-sm text-slate-200 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>เวลาเฟรม: {frameDurationFormatted}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
            title="ขยายเต็มจอ (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. GIANT MAIN SCOREBOARDS (2 PLAYERS) */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        
        {/* ==================== PLAYER 1 CARD ==================== */}
        <div 
          onClick={onSwitchStriker}
          className={`relative overflow-hidden rounded-2xl p-2 sm:p-3 md:p-4 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
            activeStrikerIndex === 0
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-2 sm:ring-4 ring-emerald-500/50 shadow-2xl shadow-emerald-950/80'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 0 && (
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 1 Header: Name, Active Badge & High Break */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                activeStrikerIndex === 0 ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-100 truncate tracking-tight">
                    {player1Name}
                  </h2>
                  {activeStrikerIndex === 0 && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex-shrink-0 shadow">
                      กำลังแทง
                    </span>
                  )}
                </div>
                {!isElectricMode && (
                  <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-0.5">
                    เบรกสูงสุด: <strong className="text-emerald-400 font-bold font-mono">{p1HighBreak}</strong>
                  </div>
                )}
                {hasHandicap && (
                  <div className="text-xs sm:text-sm font-semibold mt-0.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-xs ${
                      currentConfig?.handicapGiverIndex === 0
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {currentConfig?.handicapGiverIndex === 0 ? `ผู้ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'ผู้รอง 100%'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shot Clock (if striker active) */}
            {activeStrikerIndex === 0 && (
              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-amber-300 font-bold block">เวลาแทง</span>
                <span className="text-lg sm:text-2xl font-black font-mono text-amber-300 drop-shadow">
                  {shotDurationSec}s
                </span>
              </div>
            )}
          </div>

          {/* Player 1 Body: Electric 4-Box OR Standard Giant Score & Sub-Boxes */}
          {isElectricMode ? (
            /* ELECTRIC 4-BOX GIANT DISPLAY */
            <div className="flex-1 flex flex-col justify-center py-2 space-y-2 md:space-y-3">
              {/* Top Box: Current Game Score */}
              <div className="flex-1 bg-slate-950/80 border border-cyan-900/60 rounded-xl p-2 sm:p-3 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm md:text-base text-cyan-300 font-extrabold flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>คะแนนเกมนับลูก</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">เกมที่ {currentGameNumber}</span>
                </div>
                <span className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono ${
                  activeStrikerIndex === 0 ? 'text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]' : 'text-slate-100'
                }`}>
                  {p1Score}
                </span>
              </div>

              {/* Bottom Box: Cumulative Score */}
              <div className="flex-1 bg-slate-950/90 border border-amber-900/60 rounded-xl p-2 sm:p-3 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm md:text-base text-amber-300 font-extrabold flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>คะแนนสะสมรวม</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">รวมทุกเกม</span>
                </div>
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono text-amber-300 drop-shadow">
                  {effectiveP1Cum}
                </span>
              </div>
            </div>
          ) : (
            /* STANDARD GIANT SCORE + FRAMES / BREAKS / GA */
            <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 py-2">
              
              {/* Left Sub-Boxes Stack: FRAME & BREAK & GA */}
              <div className="w-[30%] sm:w-[28%] md:w-[25%] flex flex-col justify-center gap-2 sm:gap-3 h-full">
                {/* Frame Box */}
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 sm:p-2.5 shadow-inner">
                  <div className="text-[10px] sm:text-xs md:text-sm text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-1">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span>เฟรม</span>
                  </div>
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-amber-300 mt-1">
                    {p1Frames}
                  </span>
                </div>

                {/* Ga Box (if Ga mode) */}
                {isGaMode && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-purple-950/50 border border-purple-800 rounded-xl p-1.5 sm:p-2.5 shadow-inner">
                    <div className="text-[10px] sm:text-xs md:text-sm text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-1">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      <span>กา</span>
                    </div>
                    <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-purple-300 mt-1">
                      {p1Ga}
                    </span>
                  </div>
                )}

                {/* Break Box */}
                <div className={`flex-1 flex flex-col items-center justify-center rounded-xl p-1.5 sm:p-2.5 border transition-all duration-300 shadow-inner ${
                  activeStrikerIndex === 0 && p1Break > 0
                    ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 border-amber-400 text-amber-200 ring-2 ring-amber-400/60 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-1">
                    <Flame className={`w-3 h-3 sm:w-4 sm:h-4 ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                    <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider ${activeStrikerIndex === 0 && p1Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>
                      เบรก
                    </span>
                  </div>
                  <span className={`text-2xl sm:text-4xl md:text-5xl font-black font-mono mt-1 ${
                    activeStrikerIndex === 0 && p1Break > 0 ? 'text-white drop-shadow-[0_0_16px_rgba(234,179,8,0.9)]' : 'text-slate-400'
                  }`}>
                    {p1Break}{activeStrikerIndex === 0 && p1Break > 0 ? '*' : ''}
                  </span>
                </div>
              </div>

              {/* Giant Score Main Display (Right 70%) */}
              <div className="flex-1 flex items-center justify-center h-full bg-slate-950/50 rounded-2xl border border-slate-900/80 p-2">
                <span className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 0
                    ? 'text-emerald-300 drop-shadow-[0_0_36px_rgba(52,211,153,0.6)]'
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
          className={`relative overflow-hidden rounded-2xl p-2 sm:p-3 md:p-4 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
            activeStrikerIndex === 1
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-2 sm:ring-4 ring-emerald-500/50 shadow-2xl shadow-emerald-950/80'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-90'
          }`}
        >
          {activeStrikerIndex === 1 && (
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
          )}

          {/* Player 2 Header: Name, Active Badge & High Break */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                activeStrikerIndex === 1 ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-100 truncate tracking-tight">
                    {player2Name}
                  </h2>
                  {activeStrikerIndex === 1 && (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex-shrink-0 shadow">
                      กำลังแทง
                    </span>
                  )}
                </div>
                {!isElectricMode && (
                  <div className="text-xs sm:text-sm text-slate-400 font-semibold mt-0.5">
                    เบรกสูงสุด: <strong className="text-emerald-400 font-bold font-mono">{p2HighBreak}</strong>
                  </div>
                )}
                {hasHandicap && (
                  <div className="text-xs sm:text-sm font-semibold mt-0.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-xs ${
                      currentConfig?.handicapGiverIndex === 1
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {currentConfig?.handicapGiverIndex === 1 ? `ผู้ต่อ 100:${currentConfig?.handicapGiverRatio}` : 'ผู้รอง 100%'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shot Clock (if striker active) */}
            {activeStrikerIndex === 1 && (
              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-amber-300 font-bold block">เวลาแทง</span>
                <span className="text-lg sm:text-2xl font-black font-mono text-amber-300 drop-shadow">
                  {shotDurationSec}s
                </span>
              </div>
            )}
          </div>

          {/* Player 2 Body: Electric 4-Box OR Standard Giant Score & Sub-Boxes */}
          {isElectricMode ? (
            /* ELECTRIC 4-BOX GIANT DISPLAY */
            <div className="flex-1 flex flex-col justify-center py-2 space-y-2 md:space-y-3">
              {/* Top Box: Current Game Score */}
              <div className="flex-1 bg-slate-950/80 border border-cyan-900/60 rounded-xl p-2 sm:p-3 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm md:text-base text-cyan-300 font-extrabold flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>คะแนนเกมนับลูก</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">เกมที่ {currentGameNumber}</span>
                </div>
                <span className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono ${
                  activeStrikerIndex === 1 ? 'text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.5)]' : 'text-slate-100'
                }`}>
                  {p2Score}
                </span>
              </div>

              {/* Bottom Box: Cumulative Score */}
              <div className="flex-1 bg-slate-950/90 border border-amber-900/60 rounded-xl p-2 sm:p-3 flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm md:text-base text-amber-300 font-extrabold flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>คะแนนสะสมรวม</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">รวมทุกเกม</span>
                </div>
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-mono text-amber-300 drop-shadow">
                  {effectiveP2Cum}
                </span>
              </div>
            </div>
          ) : (
            /* STANDARD GIANT SCORE + FRAMES / BREAKS / GA */
            <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 py-2">
              
              {/* Giant Score Main Display (Left 70%) */}
              <div className="flex-1 flex items-center justify-center h-full bg-slate-950/50 rounded-2xl border border-slate-900/80 p-2">
                <span className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black font-mono tracking-tight select-none leading-none drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)] ${
                  activeStrikerIndex === 1
                    ? 'text-emerald-300 drop-shadow-[0_0_36px_rgba(52,211,153,0.6)]'
                    : 'text-slate-100'
                }`}>
                  {p2Score}
                </span>
              </div>

              {/* Right Sub-Boxes Stack: FRAME & BREAK & GA */}
              <div className="w-[30%] sm:w-[28%] md:w-[25%] flex flex-col justify-center gap-2 sm:gap-3 h-full">
                {/* Frame Box */}
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 sm:p-2.5 shadow-inner">
                  <div className="text-[10px] sm:text-xs md:text-sm text-amber-300 font-extrabold uppercase tracking-wider flex items-center space-x-1">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                    <span>เฟรม</span>
                  </div>
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-amber-300 mt-1">
                    {p2Frames}
                  </span>
                </div>

                {/* Ga Box (if Ga mode) */}
                {isGaMode && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-purple-950/50 border border-purple-800 rounded-xl p-1.5 sm:p-2.5 shadow-inner">
                    <div className="text-[10px] sm:text-xs md:text-sm text-purple-300 font-extrabold uppercase tracking-wider flex items-center space-x-1">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                      <span>กา</span>
                    </div>
                    <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono text-purple-300 mt-1">
                      {p2Ga}
                    </span>
                  </div>
                )}

                {/* Break Box */}
                <div className={`flex-1 flex flex-col items-center justify-center rounded-xl p-1.5 sm:p-2.5 border transition-all duration-300 shadow-inner ${
                  activeStrikerIndex === 1 && p2Break > 0
                    ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 border-amber-400 text-amber-200 ring-2 ring-amber-400/60 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-1">
                    <Flame className={`w-3 h-3 sm:w-4 sm:h-4 ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-slate-500'}`} />
                    <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider ${activeStrikerIndex === 1 && p2Break > 0 ? 'text-yellow-200' : 'text-slate-400'}`}>
                      เบรก
                    </span>
                  </div>
                  <span className={`text-2xl sm:text-4xl md:text-5xl font-black font-mono mt-1 ${
                    activeStrikerIndex === 1 && p2Break > 0 ? 'text-white drop-shadow-[0_0_16px_rgba(234,179,8,0.9)]' : 'text-slate-400'
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
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 sm:p-3 shadow-lg flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center space-x-2 text-xs sm:text-sm md:text-base font-extrabold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="whitespace-nowrap">ลูกที่ตบลงในไม้นี้ ({pottedInVisit.length}):</span>
        </div>

        {/* Balls List with vibrant spheres */}
        <div className="flex-1 flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1 px-2">
          {pottedInVisit.length === 0 ? (
            <span className="text-xs sm:text-sm text-slate-500 italic">
              ยังไม่มีลูกที่ตบลงในไม้นี้ (ใช้แป้นพิมพ์ 1-7 เพื่อบันทึกแต้ม)
            </span>
          ) : (
            pottedInVisit.map((s, idx) => {
              const b = BALL_MAP[s.ballPotted as BallColor];
              if (!b) return null;
              return (
                <div
                  key={s.id || idx}
                  className={`relative w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm md:text-base text-white shadow-md border-2 border-white/40 flex-shrink-0 animate-scaleUp ${b.cssClass}`}
                  title={`ลูก${b.nameTh} (+${b.points}${s.gaCount ? ` | +${s.gaCount} กา` : ''})`}
                >
                  <span className="drop-shadow-md">{b.points}</span>
                  {s.gaCount && s.gaCount > 0 ? (
                    <span className="absolute -bottom-1 -right-1.5 bg-purple-600 text-white font-mono text-[9px] sm:text-[10px] font-black px-1 rounded-full border border-purple-300 shadow">
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
          <div className="bg-amber-950/80 border border-amber-500/80 px-3 py-1 rounded-lg flex items-center space-x-1.5 text-amber-300 font-extrabold text-xs sm:text-sm flex-shrink-0">
            <Flame className="w-4 h-4 text-yellow-400 animate-bounce" />
            <span>เบรกสะสม: <strong className="font-mono text-base text-white">{currentBreak}</strong> แต้ม</span>
          </div>
        )}
      </div>

      {/* 4. KEYBOARD SHORTCUTS REFERENCE & EMERGENCY REFEREE CONTROLS */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-1.5 sm:p-2 shadow flex flex-wrap items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
        
        {/* Keyboard Quick Keys Guide */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="font-bold text-slate-300 flex items-center space-x-1">
            <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>คีย์ลัด:</span>
          </span>
          
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono font-bold">
            [1-7] ตบลูกสี
          </span>
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono font-bold">
            [Space / .] เปลี่ยนเทิร์น
          </span>
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono font-bold">
            [S] กัน (Safety)
          </span>
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-rose-300 border-rose-900 font-mono font-bold">
            [F / -] ฟาวล์
          </span>
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-amber-300 border-amber-900 font-mono font-bold">
            [Ctrl+Z / *] ยกเลิก
          </span>
          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-purple-300 border-purple-900 font-mono font-bold">
            [E] จบเฟรม
          </span>
        </div>

        {/* Emergency Touch / Mouse Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg font-bold text-xs border transition cursor-pointer ${
                canUndo
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>ยกเลิก</span>
            </button>
          )}

          {onEndTurn && (
            <button
              type="button"
              onClick={() => onEndTurn('miss')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เปลี่ยนเทิร์น</span>
            </button>
          )}

          {onEndFrame && (
            <button
              type="button"
              onClick={onEndFrame}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-xs bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>จบเฟรม</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
