import React from 'react';
import { BALLS, BALL_MAP } from '../utils/snookerRules';
import { BallColor, Shot } from '../types/snooker';
import { Undo2, RotateCcw, AlertTriangle, Shield, Lock, Unlock, Flag } from 'lucide-react';

interface BallPotsProps {
  redsRemaining: number;
  currentVisitShots: Shot[];
  isScreenLocked: boolean;
  onToggleScreenLock: () => void;
  onPotBall: (ball: BallColor) => void;
  onAddCustomPoints: (points: number, label: string) => void;
  onOpenFoulModal: () => void;
  onDirectFoul?: (points: number) => void;
  onEndTurn: (reason?: 'miss' | 'safety' | 'end-turn') => void;
  onUndo: () => void;
  onEndFrame: () => void;
  onMultiRedPot: (count: number) => void;
  canUndo: boolean;
}

export const BallPots: React.FC<BallPotsProps> = ({
  redsRemaining,
  currentVisitShots,
  isScreenLocked,
  onToggleScreenLock,
  onPotBall,
  onAddCustomPoints,
  onOpenFoulModal,
  onDirectFoul,
  onEndTurn,
  onUndo,
  onEndFrame,
  onMultiRedPot,
  canUndo,
}) => {
  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 relative">
      {/* Screen Lock Overlay */}
      {isScreenLocked && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-3 p-6 border-2 border-amber-500/50 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white">หน้าจอถูกล็อคอยู่ (Screen Locked)</h3>
            <p className="text-xs text-slate-400">ป้องกันการเผลอกดโดนปุ่มคะแนนขณะถือหรือวางเครื่อง</p>
          </div>
          <button
            onClick={onToggleScreenLock}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Unlock className="w-4 h-4" />
            <span>แตะที่นี่เพื่อปลดล็อค (Unlock)</span>
          </button>
        </div>
      )}

      {/* Potted Balls in Current Break (แถบแสดงลูกที่ตบลงไป) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ลูกที่ตบลงในเทิร์นนี้ ({pottedInVisit.length} ลูก):</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1 px-1">
          {pottedInVisit.length === 0 ? (
            <span className="text-xs text-slate-500 italic">ยังไม่มีลูกที่ตบลงในรอบนี้</span>
          ) : (
            pottedInVisit.map((shot, idx) => {
              const ball = shot.ballPotted ? BALL_MAP[shot.ballPotted] : null;
              if (!ball) return null;
              return (
                <div
                  key={idx}
                  title={`ลูกที่ ${idx + 1}: ${ball.nameTh} (+${ball.points})`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-white/40 flex-shrink-0 ${ball.cssClass}`}
                >
                  <span className="drop-shadow">{ball.points}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3D Snooker Ball Rectangular Buttons (ลดความสูง เป็นสี่เหลี่ยมผืนผ้า) */}
      <div className="snooker-felt rounded-2xl p-2.5 sm:p-3 border-2 border-emerald-700/60 shadow-2xl relative">
        {/* 7 Always-Active Snooker Balls - Sleek Rectangles */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {BALLS.map((ball) => (
            <button
              key={ball.color}
              onClick={() => onPotBall(ball.color)}
              className={`h-11 sm:h-13 rounded-xl flex flex-col items-center justify-center font-extrabold text-white transition-all transform active:scale-95 cursor-pointer relative shadow-lg hover:brightness-110 border border-white/20 ${ball.cssClass}`}
            >
              <div className="flex items-center space-x-1">
                <span className="text-base sm:text-lg font-black drop-shadow leading-none">
                  {ball.points}
                </span>
                <span className="text-[10px] sm:text-xs font-bold drop-shadow hidden sm:inline">
                  {ball.nameTh}
                </span>
              </div>
              <span className="text-[9px] font-semibold opacity-90 leading-tight sm:hidden">
                {ball.nameTh}
              </span>

              <span className="absolute -top-1 -right-1 bg-slate-950/90 text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold px-1 rounded-full border border-slate-700 shadow">
                {ball.numpadKey}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls: Foul, Miss, Safety, Undo, End Frame */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={onOpenFoulModal}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-extrabold py-3 px-3 rounded-xl border border-rose-600 shadow-lg shadow-rose-950/50 cursor-pointer active:scale-98 transition-all"
        >
          <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">เสียฟาวล์</div>
            <div className="text-[10px] text-rose-200 font-normal">[+] / [F]</div>
          </div>
        </button>

        <button
          onClick={() => onEndTurn('miss')}
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold py-3 px-3 rounded-xl border border-slate-700 shadow-md cursor-pointer active:scale-98 transition-all"
        >
          <RotateCcw className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">แทงพลาด</div>
            <div className="text-[10px] text-slate-400 font-normal">[.] / [Space]</div>
          </div>
        </button>

        <button
          onClick={() => onEndTurn('safety')}
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold py-3 px-3 rounded-xl border border-slate-700 shadow-md cursor-pointer active:scale-98 transition-all"
        >
          <Shield className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">กัน / เซฟตี้</div>
            <div className="text-[10px] text-slate-400 font-normal">[S]</div>
          </div>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center space-x-2 font-extrabold py-3 px-3 rounded-xl border transition-all cursor-pointer ${
            canUndo
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-950/40 active:scale-98'
              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">ย้อนกลับ</div>
            <div className="text-[10px] opacity-80 font-normal">[*] / [Ctrl+Z]</div>
          </div>
        </button>

        <button
          onClick={onEndFrame}
          className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-extrabold py-3 px-3 rounded-xl border border-amber-400 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-98 transition-all"
        >
          <Flag className="w-5 h-5 text-slate-950 flex-shrink-0" />
          <div className="text-left text-slate-950">
            <div className="text-xs sm:text-sm font-black leading-tight">จบเฟรมนี้ 🏁</div>
            <div className="text-[10px] font-bold opacity-90">ดูผู้ชนะ / ถัดไป</div>
          </div>
        </button>
      </div>
    </div>
  );
};
