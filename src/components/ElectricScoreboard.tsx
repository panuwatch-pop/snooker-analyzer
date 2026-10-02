import React, { useState } from 'react';
import { Trophy, Target, Shield, Zap, RotateCcw, AlertTriangle, Play, ChevronRight, X, Sparkles } from 'lucide-react';
import { BallColor, ElectricConfig, ElectricPlayer, Frame, Match } from '../types/snooker';
import { BALL_MAP, getElectricDefenderIndex } from '../utils/snookerRules';

interface ElectricScoreboardProps {
  match: Match;
  frame?: Frame;
  electricConfig: ElectricConfig;
  activeStrikerIndex: number;
  redsRemaining: number;
  currentBreak: number;
  ballsInCurrentVisit: number;
  shotDurationSec: number;
  onPotBall: (ball: BallColor) => void;
  onFoul: () => void;
  onNextTurn: () => void;
  onUndo: () => void;
  onResetMatch: () => void;
  onContinueMatch: () => void;
  onFinishMatch: () => void;
  onEndGame?: () => void;
  isKeyboardDisplay?: boolean;
}

export const ElectricScoreboard: React.FC<ElectricScoreboardProps> = ({
  match,
  frame,
  electricConfig,
  activeStrikerIndex,
  redsRemaining,
  currentBreak,
  ballsInCurrentVisit,
  shotDurationSec,
  onPotBall,
  onFoul,
  onNextTurn,
  onUndo,
  onResetMatch,
  onContinueMatch,
  onFinishMatch,
  onEndGame,
  isKeyboardDisplay = false,
}) => {
  const [showFinalReport, setShowFinalReport] = useState<boolean>(false);

  const players: ElectricPlayer[] = electricConfig.players || [
    { id: 'p1', name: match.player1Name || 'ผู้เล่น 1', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
    { id: 'p2', name: match.player2Name || 'ผู้เล่น 2', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
  ];

  const targetGames = electricConfig.targetGames ?? 5;
  const currentGame = electricConfig.currentGame ?? (match.currentFrameIndex + 1);
  const strikerIdx = activeStrikerIndex % players.length;
  const defenderIdx = getElectricDefenderIndex(strikerIdx, players.length);
  const currentStriker = players[strikerIdx] || players[0];
  const currentDefender = players[defenderIdx] || players[1] || players[0];

  const feeBalls = electricConfig.feeBalls || ['yellow', 'brown', 'black'];
  const yellowPts = electricConfig.yellowPoints ?? 1;
  const blackPts = electricConfig.blackPoints ?? 2;
  const lastBlackPts = electricConfig.lastBlackPoints ?? 4;
  const ballPts = electricConfig.ballPoints ?? 1;
  const foulPenalty = electricConfig.foulPenalty ?? 2;

  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-500',
    brown: 'bg-amber-800',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
    black: 'bg-slate-900 border border-slate-500',
  };

  const colorNameTh: Record<string, string> = {
    yellow: 'เหลือง',
    green: 'เขียว',
    brown: 'น้ำตาล',
    blue: 'น้ำเงิน',
    pink: 'ชมพู',
    black: 'ดำ',
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-1 xs:space-y-1.5 sm:space-y-2 flex-shrink-0 animate-in fade-in duration-200">
      
      {/* 1. MATCH PROGRESS & SCHEDULED GAMES TRACKER (❌ กากบาทเกมที่จบแล้ว) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg xs:rounded-xl p-1.5 xs:p-2 sm:p-2.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="text-[9px] xs:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ความคืบหน้าการแข่งขัน</div>
            <div className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
              {targetGames === 0 ? `เกมที่ ${currentGame} (เล่นเรื่อยๆ ไม่จำกัด)` : `เกมที่ ${currentGame} / ${targetGames}`}
            </div>
          </div>
        </div>

        {/* Games Pills */}
        <div className="flex flex-wrap items-center gap-1 xs:gap-1.5">
          {targetGames > 0 ? (
            Array.from({ length: targetGames }, (_, i) => i + 1).map((g) => {
              if (g < currentGame) {
                return (
                  <div
                    key={g}
                    className="px-1.5 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-800/40 text-[10px] xs:text-xs font-mono font-bold flex items-center gap-1 opacity-75"
                    title={`เกมที่ ${g} จบแล้ว`}
                  >
                    <span className="text-rose-400 font-black">❌</span>
                    <span className="line-through text-slate-400">เกม {g}</span>
                  </div>
                );
              } else if (g === currentGame) {
                return (
                  <div
                    key={g}
                    className="px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/50 text-[10px] xs:text-xs font-mono font-black flex items-center gap-1 shadow-sm ring-1 ring-amber-500/30"
                  >
                    <span className="animate-spin text-amber-400">⏳</span>
                    <span>เกม {g} (กำลังเล่น)</span>
                  </div>
                );
              } else {
                return (
                  <div
                    key={g}
                    className="px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 text-[10px] xs:text-xs font-mono font-medium"
                  >
                    <span>เกม {g}</span>
                  </div>
                );
              }
            })
          ) : (
            <div className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] xs:text-xs font-mono font-bold flex items-center gap-1.5">
              <span>⏳ กำลังเล่นเกมที่ {currentGame}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. STATUS CARDS: Striker, Defender, Table Phase, Special Points Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {/* Striker Card */}
        <div className={`bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-lg xs:rounded-xl flex items-center justify-between shadow-md ${isKeyboardDisplay ? 'p-2 xs:p-2.5 sm:p-3' : 'p-1.5 xs:p-2 sm:p-2.5'}`}>
          <div className="min-w-0">
            <span className={`uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1 ${isKeyboardDisplay ? 'text-[10px] xs:text-xs' : 'text-[9px] xs:text-[10px]'}`}>
              <span>🎯 คนกำลังแทง</span>
            </span>
            <div className={`font-black text-white mt-0.5 truncate ${isKeyboardDisplay ? 'text-base xs:text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>{currentStriker.name}</div>
            <div className={`text-amber-300/80 font-mono mt-0.5 ${isKeyboardDisplay ? 'text-xs xs:text-sm font-bold' : 'text-[9px] xs:text-[10px]'}`}>
              เบรก: <span className="text-amber-300 font-black">{currentBreak}</span> แต้ม {ballsInCurrentVisit > 0 ? `(${ballsInCurrentVisit} ลูก)` : ''}
            </div>
          </div>
          <div className={`rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 ${isKeyboardDisplay ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm sm:text-base' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'}`}>
            ▶
          </div>
        </div>

        {/* Defender Card */}
        <div className={`bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 rounded-lg xs:rounded-xl flex items-center justify-between shadow-md ${isKeyboardDisplay ? 'p-2 xs:p-2.5 sm:p-3' : 'p-1.5 xs:p-2 sm:p-2.5'}`}>
          <div className="min-w-0">
            <span className={`uppercase tracking-wider font-semibold text-rose-400 flex items-center gap-1 ${isKeyboardDisplay ? 'text-[10px] xs:text-xs' : 'text-[9px] xs:text-[10px]'}`}>
              <span>🛡️ คนป้องกันก่อนหน้า</span>
            </span>
            <div className={`font-black text-white mt-0.5 truncate ${isKeyboardDisplay ? 'text-base xs:text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>{currentDefender.name}</div>
            <div className={`text-rose-300/80 font-mono mt-0.5 ${isKeyboardDisplay ? 'text-xs xs:text-sm' : 'text-[9px] xs:text-[10px]'}`}>
              (คนเสียแต้ม/ค่าไฟในไม้นี้)
            </div>
          </div>
          <div className={`rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 flex-shrink-0 ${isKeyboardDisplay ? 'w-8 h-8 sm:w-9 sm:h-9 text-sm sm:text-base' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'}`}>
            🛡️
          </div>
        </div>

        {/* 6 Reds Status */}
        <div className={`bg-slate-900 border border-slate-800 rounded-lg xs:rounded-xl flex items-center justify-between shadow-md ${isKeyboardDisplay ? 'p-2 xs:p-2.5 sm:p-3' : 'p-1.5 xs:p-2 sm:p-2.5'}`}>
          <div>
            <span className={`uppercase tracking-wider font-semibold text-slate-400 ${isKeyboardDisplay ? 'text-[10px] xs:text-xs' : 'text-[9px] xs:text-[10px]'}`}>สถานะโต๊ะ (เฉพาะ 6 แดง)</span>
            <div className={`font-black text-red-400 mt-0.5 font-mono ${isKeyboardDisplay ? 'text-base xs:text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
              {redsRemaining > 0 ? `${redsRemaining} แดง` : 'ลูกแดงหมด'}
            </div>
            <div className={`text-slate-400 mt-0.5 ${isKeyboardDisplay ? 'text-xs xs:text-sm' : 'text-[9px] xs:text-[10px]'}`}>
              เวลาไม้: <span className="font-mono text-amber-300 font-bold">{shotDurationSec}s</span>
            </div>
          </div>
          <div className={`font-semibold rounded ${isKeyboardDisplay ? 'px-2 py-1 text-xs xs:text-sm' : 'px-1.5 py-0.5 text-[10px] xs:text-xs'} ${
            redsRemaining > 0
              ? 'bg-red-500/10 text-red-300 border border-red-500/20'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
          }`}>
            {redsRemaining > 0 ? 'ช่วง 6 แดง' : '⚡ ช่วงคิดค่าไฟ'}
          </div>
        </div>

        {/* Special Points Info (Yellow, Black, Last Black, Foul) */}
        <div className={`bg-slate-900 border border-slate-800 rounded-lg xs:rounded-xl flex flex-col justify-between shadow-md ${isKeyboardDisplay ? 'p-2 xs:p-2.5 sm:p-3' : 'p-1.5 xs:p-2 sm:p-2.5'}`}>
          <div className="flex items-center justify-between">
            <span className={`uppercase tracking-wider font-semibold text-amber-400 ${isKeyboardDisplay ? 'text-[10px] xs:text-xs' : 'text-[9px] xs:text-[10px]'}`}>แต้มพิเศษ</span>
            <span className={`text-rose-400 font-mono font-bold ${isKeyboardDisplay ? 'text-xs xs:text-sm' : 'text-[9px] xs:text-[10px]'}`}>ฟาวล์: -{foulPenalty}</span>
          </div>
          <div className={`text-slate-300 space-y-0.5 mt-0.5 font-mono ${isKeyboardDisplay ? 'text-[10px] xs:text-xs sm:text-sm' : 'text-[9px] xs:text-[10px]'}`}>
            <div>เหลือง: <span className="text-yellow-400 font-bold">+{yellowPts}</span> | ดำ: <span className="text-slate-200 font-bold">+{blackPts}</span></div>
            <div>ดำสุดท้าย: <span className="text-amber-400 font-bold">+{lastBlackPts}</span></div>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-slate-400 ${isKeyboardDisplay ? 'text-[9px] xs:text-[10px]' : 'text-[8px] xs:text-[9px]'}`}>ค่าไฟ:</span>
            {feeBalls.map(c => (
              <span key={c} className={`${isKeyboardDisplay ? 'w-2.5 h-2.5' : 'w-2 h-2'} rounded-full ${colorMap[c] || 'bg-slate-500'} inline-block`} title={colorNameTh[c]} />
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN SCORING TABLE (ตารางคะแนนตามสเปก 5 คอลัมน์) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
          <h2 className={`font-bold text-slate-200 flex items-center gap-2 ${isKeyboardDisplay ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'}`}>
            <span>📊 ตารางคะแนนและค่าไฟ</span>
            <span className="text-[10px] sm:text-xs font-normal text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              (เกมที่ {currentGame}: {players[0]?.name || ''} เปิดเกม)
            </span>
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onEndGame && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ยืนยันจบเกมที่ ${currentGame} และเริ่มต้นเกมถัดไปหรือไม่?`)) {
                    onEndGame();
                  }
                }}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] sm:text-xs rounded-lg shadow-sm border border-purple-400/50 flex items-center gap-1 active:scale-95 transition cursor-pointer"
                title="จบเกมปัจจุบัน และย้ายคนชนะขึ้นเปิดเกมถัดไป (คีย์ลัด: /)"
              >
                <span>🏁 จบเกมนี้</span>
              </button>
            )}
            <span className="text-[10px] sm:text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> แข่งขัน
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-300 text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider border-b border-slate-800">
                <th className={`py-2 px-1 xs:px-2 font-bold w-12 sm:w-14 text-center ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>คิว</th>
                <th className={`py-2 px-3 font-bold ${isKeyboardDisplay ? 'py-3 sm:py-3.5 text-sm sm:text-base' : ''}`}>ชื่อผู้เล่น</th>
                <th className={`py-2 px-1 font-bold text-center text-emerald-400 bg-emerald-950/30 w-16 sm:w-20 md:w-24 ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>แต้ม +</th>
                <th className={`py-2 px-1 font-bold text-center text-rose-400 bg-rose-950/30 w-16 sm:w-20 md:w-24 ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>แต้ม -</th>
                <th className={`py-2 px-1 font-bold text-center text-amber-400 bg-amber-950/30 w-16 sm:w-20 md:w-24 ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>⚡ ค่าไฟ</th>
                <th className={`py-2 px-1 font-extrabold text-center text-indigo-300 bg-slate-800/60 w-20 sm:w-24 md:w-28 ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>แต้มรวม</th>
                <th className={`py-2 px-1 font-extrabold text-center text-amber-300 bg-slate-800/60 w-20 sm:w-24 md:w-28 ${isKeyboardDisplay ? 'py-3 sm:py-3.5' : ''}`}>⚡ ค่าไฟรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {players.map((p, idx) => {
                const isStriker = idx === strikerIdx;
                const isDefender = idx === defenderIdx;
                const isOpener = idx === 0;
                const netCurrent = p.currentPlus - p.currentMinus;

                return (
                  <tr
                    key={p.id || idx}
                    className={`transition-colors ${
                      isStriker
                        ? 'bg-amber-500/10 font-medium'
                        : isDefender
                        ? 'bg-rose-500/5'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className={`px-1 xs:px-2 text-center font-mono ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      {isStriker ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 font-black text-xs sm:text-sm animate-pulse">
                          ▶{idx + 1}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/60 text-slate-400 font-bold text-xs sm:text-sm">
                          {idx + 1}
                        </span>
                      )}
                    </td>
                    <td className={`px-2 xs:px-3 text-slate-200 ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                        <span className={`font-black text-white tracking-wide ${isKeyboardDisplay ? 'text-base xs:text-lg sm:text-xl md:text-2xl' : 'text-sm sm:text-base'}`}>
                          {p.name}
                        </span>
                        {isOpener && (
                          <span className={`rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ${isKeyboardDisplay ? 'px-1.5 py-0.5 text-[10px] xs:text-xs' : 'px-1 py-0.2 text-[8px] xs:text-[9px]'}`}>
                            👑 เปิดเกม
                          </span>
                        )}
                        {isStriker && (
                          <span className={`rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 ${isKeyboardDisplay ? 'px-1.5 py-0.5 text-[10px] xs:text-xs' : 'px-1 py-0.2 text-[8px] xs:text-[9px]'}`}>
                            🎯 คนแทง
                          </span>
                        )}
                        {isDefender && (
                          <span className={`rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 ${isKeyboardDisplay ? 'px-1.5 py-0.5 text-[10px] xs:text-xs' : 'px-1 py-0.2 text-[8px] xs:text-[9px]'}`}>
                            🛡️ คนป้องกัน
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-1 text-center ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="inline-flex items-center justify-center min-w-[38px] sm:min-w-[48px] md:min-w-[56px] py-1 px-1.5 sm:px-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono font-black tracking-wider text-xs sm:text-sm md:text-base shadow-sm">
                        {p.currentPlus > 0 ? `+${p.currentPlus}` : '0'}
                      </div>
                    </td>
                    <td className={`px-1 text-center ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="inline-flex items-center justify-center min-w-[38px] sm:min-w-[48px] md:min-w-[56px] py-1 px-1.5 sm:px-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono font-black tracking-wider text-xs sm:text-sm md:text-base shadow-sm">
                        {p.currentMinus > 0 ? `-${p.currentMinus}` : '0'}
                      </div>
                    </td>
                    <td className={`px-1 text-center ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="inline-flex items-center justify-center min-w-[38px] sm:min-w-[48px] md:min-w-[56px] py-1 px-1.5 sm:px-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono font-black tracking-wider text-xs sm:text-sm md:text-base shadow-sm">
                        {p.currentFee}
                      </div>
                    </td>
                    <td className={`px-1 text-center ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="inline-flex items-center justify-center min-w-[46px] sm:min-w-[58px] md:min-w-[68px] py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-lg bg-gradient-to-r from-indigo-950/90 to-slate-900 border-2 border-indigo-400/70 text-indigo-200 font-mono font-black tracking-wider text-sm sm:text-base md:text-lg shadow-md">
                        {p.totalScore + netCurrent}
                      </div>
                    </td>
                    <td className={`px-1 text-center ${isKeyboardDisplay ? 'py-3 xs:py-3.5' : 'py-1.5 xs:py-2'}`}>
                      <div className="inline-flex items-center justify-center min-w-[46px] sm:min-w-[58px] md:min-w-[68px] py-1 sm:py-1.5 px-2 sm:px-2.5 rounded-lg bg-gradient-to-r from-amber-950/90 to-slate-900 border-2 border-amber-400/70 text-amber-300 font-mono font-black tracking-wider text-sm sm:text-base md:text-lg shadow-md">
                        {p.totalFee + p.currentFee}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-2.5 py-1 bg-slate-950/60 border-t border-slate-800/80 text-[9px] sm:text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse"></span> สีเหลือง = คนแทง</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span> สีแดง = คนป้องกัน</span>
            <span className="flex items-center gap-1"><span className="text-amber-400 font-bold">👑 บนสุด</span> = คนเปิดเกม</span>
          </div>
          <div className="text-slate-400 hidden xs:block">
            *หมด 6 แดง ตบลูกสีที่เป็นค่าไฟจะสะสมค่าไฟให้คนป้องกันทันที
          </div>
        </div>
      </div>

      {/* 4. MODAL: END OF SCHEDULED GAMES POPUP */}
      {electricConfig.isMatchCompleted && !showFinalReport && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl mx-auto text-amber-400">
              🏆
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">แข่งขันครบตามจำนวนเกมที่กำหนดแล้ว!</h3>
              <p className="text-xs text-slate-400">
                เล่นครบ {targetGames} เกมเรียบร้อยแล้ว ต้องการจบเกมเลยหรือเล่นต่อ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onContinueMatch}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-semibold text-sm transition cursor-pointer"
              >
                ➕ เล่นต่อ (นับต่อจากเดิม)
              </button>
              <button
                onClick={() => {
                  onFinishMatch();
                  setShowFinalReport(true);
                }}
                className="p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                🏁 จบเกม & สรุปผล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: FINAL MATCH SUMMARY REPORT */}
      {showFinalReport && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="text-lg font-bold text-white">สรุปผลการแข่งขันสนุกเกอร์ไฟฟ้า</h3>
                  <p className="text-xs text-slate-400">สรุปผลรวมทั้งหมด {currentGame} เกม (โต๊ะ 6 แดง)</p>
                </div>
              </div>
              <button onClick={() => setShowFinalReport(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4 text-center">อันดับ</th>
                    <th className="py-3 px-4">ชื่อผู้เล่น</th>
                    <th className="py-3 px-4 text-center text-indigo-300 font-bold bg-slate-800/40">แต้มสุทธิรวม</th>
                    <th className="py-3 px-4 text-center text-amber-300 font-bold bg-slate-800/40">⚡ รวมค่าไฟที่เสีย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {[...players]
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((p, idx) => {
                      const isWinner = idx === 0;
                      return (
                        <tr key={p.id || idx} className={isWinner ? 'bg-amber-500/10 font-semibold' : 'hover:bg-slate-800/40'}>
                          <td className="py-3 px-4 text-center font-bold">
                            {isWinner ? '🥇 1' : idx + 1}
                          </td>
                          <td className="py-3 px-4 text-slate-200">
                            {p.name} {isWinner && <span className="text-amber-400 text-xs ml-1.5">★ ผู้ชนะเลิศ</span>}
                          </td>
                          <td className={`py-3 px-4 text-center font-bold text-base ${p.totalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.totalScore > 0 ? `+${p.totalScore}` : p.totalScore}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-amber-300 text-base">
                            {p.totalFee}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>• <strong>แต้มสุทธิรวม:</strong> คำนวณจาก (แต้มบวกทั้งหมด - แต้มลบทั้งหมดตลอดแมตช์)</p>
              <p>• <strong>รวมค่าไฟที่เสีย:</strong> จำนวนครั้งที่ถูกผู้เล่นอื่นตบลูกค่าไฟลงใส่</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFinalReport(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                ปิดหน้านี้
              </button>
              <button
                onClick={() => {
                  setShowFinalReport(false);
                  onResetMatch();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                เริ่มแมตช์ใหม่
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
