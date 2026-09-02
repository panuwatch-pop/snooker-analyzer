import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Shield, Undo2, Lock, Unlock, Flag, Layers, Edit3 } from 'lucide-react';
import { BallColor } from '../types/snooker';
import { BALLS, BALL_MAP } from '../utils/snookerRules';

interface BallPotsProps {
  redsRemaining: number;
  currentVisitShots: any[];
  isScreenLocked: boolean;
  onToggleScreenLock: () => void;
  onPotBall: (ball: BallColor) => void;
  onAddCustomPoints: (points: number, label: string) => void;
  onOpenFoulModal: () => void;
  onDirectFoul: (points: number) => void;
  onEndTurn: (reason: 'miss' | 'safety') => void;
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
  const [showMultiRedModal, setShowMultiRedModal] = useState<boolean>(false);
  const [customPointsInput, setCustomPointsInput] = useState<string>('');
  const [showCustomPointsModal, setShowCustomPointsModal] = useState<boolean>(false);

  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);

  const ballList: BallColor[] = ['red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];

  const handleCustomPointsSubmit = () => {
    const pts = parseInt(customPointsInput, 10);
    if (!isNaN(pts) && pts > 0) {
      onAddCustomPoints(pts, `เพิ่มแต้มพิเศษ (+${pts})`);
      setCustomPointsInput('');
      setShowCustomPointsModal(false);
    }
  };

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

      {/* Potted Balls in Current Break */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ลูกที่ตบลงในเทิร์นนี้ ({pottedInVisit.length} ลูก):</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1 px-1">
          {pottedInVisit.length === 0 ? (
            <span className="text-xs text-slate-500 italic">ยังไม่มีลูกที่ตบลงในรอบนี้</span>
          ) : (
            pottedInVisit.map((s, idx) => {
              const b = BALL_MAP[s.ballPotted as BallColor];
              if (!b) return null;
              return (
                <div
                  key={s.id || idx}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-700 shadow-sm text-xs font-bold"
                >
                  <span className={`w-3.5 h-3.5 rounded-full shadow-inner ${b.cssClass}`} />
                  <span className="text-slate-200">{b.nameTh}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">+{b.points}</span>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onToggleScreenLock}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer transition-colors"
          title="ล็อคหน้าจอเพื่อป้องกันการเผลอกด"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>ล็อคจอ</span>
        </button>
      </div>

      {/* Ball Potting Buttons */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
          <span>แตะลูกสนุ๊กเกอร์ที่ตบลง:</span>
          <span className="text-rose-400">แดงเหลือ: <strong className="text-white font-mono text-sm">{redsRemaining}</strong> ลูก</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {ballList.map((ballKey) => {
            const ball = BALL_MAP[ballKey];
            const isRed = ballKey === 'red';
            const isDisabled = isRed && redsRemaining === 0;

            return (
              <button
                key={ballKey}
                onClick={() => onPotBall(ballKey)}
                disabled={isDisabled}
                className={`group relative flex flex-col items-center justify-center py-2 sm:py-3 px-1 rounded-xl transition-all duration-150 cursor-pointer border active:scale-92 ${ball.cssClass} ${
                  isDisabled
                    ? 'opacity-30 cursor-not-allowed border-slate-800'
                    : 'hover:brightness-115 hover:shadow-lg shadow-md hover:-translate-y-0.5'
                }`}
              >
                <span className="font-mono font-black text-xl sm:text-2xl leading-none drop-shadow-md">
                  {ball.points}
                </span>
                <span className="text-[10px] sm:text-xs font-bold leading-tight mt-0.5 opacity-90 truncate max-w-full">
                  {ball.nameTh}
                </span>
                <span className="absolute -top-1 -right-1 bg-slate-950/90 text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold px-1 rounded-full border border-slate-700 shadow">
                  {ball.numpadKey}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action Controls: Foul, Miss, Safety, Undo, End Frame */}
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

      {/* Multi-Red Pot Modal */}
      {showMultiRedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-rose-400" />
              <span>ตบลูกแดงลงพร้อมกันหลายลูก</span>
            </h3>
            <p className="text-xs text-slate-300">
              เลือกจำนวนลูกแดงที่ตบลงในไม้เดียว (แดงเหลือ: {redsRemaining} ลูก)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  disabled={cnt > redsRemaining}
                  onClick={() => {
                    onMultiRedPot(cnt);
                    setShowMultiRedModal(false);
                  }}
                  className={`py-3 rounded-xl font-mono font-black text-lg border transition-all cursor-pointer ${
                    cnt > redsRemaining
                      ? 'bg-slate-950 text-slate-700 border-slate-800 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 active:scale-95 shadow-lg'
                  }`}
                >
                  +{cnt}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMultiRedModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Custom Points Modal */}
      {showCustomPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>ระบุแต้มพิเศษเอง</span>
            </h3>
            <div className="space-y-2">
              <input
                type="number"
                min="1"
                max="147"
                value={customPointsInput}
                onChange={(e) => setCustomPointsInput(e.target.value)}
                placeholder="ใส่จำนวนแต้มที่ต้องการ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-black text-xl text-center outline-none focus:border-amber-400"
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCustomPointsModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCustomPointsSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
