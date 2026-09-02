import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Shield, Undo2, Flag, Layers, Edit3, X } from 'lucide-react';
import { BallColor } from '../types/snooker';
import { BALL_MAP } from '../utils/snookerRules';

interface BallPotsProps {
  redsRemaining: number;
  currentVisitShots: any[];
  onPotBall: (ball: BallColor) => void;
  onFoul: (points: number) => void;
  onAddCustomPoints: (points: number, label: string) => void;
  onEndTurn: (reason: 'miss' | 'safety') => void;
  onUndo: () => void;
  onEndFrame: () => void;
  onMultiRedPot: (count: number) => void;
  canUndo: boolean;
}

export const BallPots: React.FC<BallPotsProps> = ({
  redsRemaining,
  currentVisitShots,
  onPotBall,
  onFoul,
  onAddCustomPoints,
  onEndTurn,
  onUndo,
  onEndFrame,
  onMultiRedPot,
  canUndo,
}) => {
  const [isFoulMode, setIsFoulMode] = useState<boolean>(false);
  const [showMultiRedModal, setShowMultiRedModal] = useState<boolean>(false);
  const [customPointsInput, setCustomPointsInput] = useState<string>('');
  const [showCustomPointsModal, setShowCustomPointsModal] = useState<boolean>(false);

  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);
  const normalBallList: BallColor[] = ['red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  const foulBallList: BallColor[] = ['brown', 'blue', 'pink', 'black'];

  const handleCustomPointsSubmit = () => {
    const pts = parseInt(customPointsInput, 10);
    if (!isNaN(pts) && pts > 0) {
      onAddCustomPoints(pts, `เพิ่มแต้มพิเศษ (+${pts})`);
      setCustomPointsInput('');
      setShowCustomPointsModal(false);
    }
  };

  const handleFoulBallSelect = (pts: number) => {
    onFoul(pts);
    setIsFoulMode(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 relative">
      {/* Potted Balls in Current Break - Mini colored spheres with numbers only (No text) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ลูกที่ตบลงในเทิร์นนี้ ({pottedInVisit.length} ลูก):</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto max-w-full py-1 px-1">
          {pottedInVisit.length === 0 ? (
            <span className="text-xs text-slate-500 italic">ยังไม่มีลูกที่ตบลงในรอบนี้</span>
          ) : (
            pottedInVisit.map((s, idx) => {
              const b = BALL_MAP[s.ballPotted as BallColor];
              if (!b) return null;
              return (
                <div
                  key={s.id || idx}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm text-white shadow-md border border-white/30 select-none ${b.cssClass}`}
                  title={`ลูก${b.nameTh} (+${b.points})`}
                >
                  <span className="drop-shadow-sm">{b.points}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ball Potting / Foul Mode Panel */}
      <div className={`rounded-2xl p-2.5 sm:p-3.5 shadow-xl transition-all border ${
        isFoulMode
          ? 'bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/80 ring-2 ring-rose-500/40'
          : 'bg-slate-900/95 border-slate-800'
      }`}>
        {/* Foul Mode Header Bar */}
        {isFoulMode && (
          <div className="mb-2.5 px-2 py-1.5 rounded-xl bg-rose-950/90 border border-rose-600/80 flex items-center justify-between text-xs sm:text-sm font-black text-rose-200 animate-pulse">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>แตะลูกสีเพื่อเสียฟาวล์ (4 - 7 แต้มให้ฝ่ายตรงข้าม):</span>
            </div>
            <button
              onClick={() => setIsFoulMode(false)}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ยกเลิก</span>
            </button>
          </div>
        )}

        {/* Balls Grid */}
        {isFoulMode ? (
          /* Foul Mode: Only Balls 4, 5, 6, 7 */
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {foulBallList.map((ballKey) => {
              const ball = BALL_MAP[ballKey];
              return (
                <button
                  key={ballKey}
                  onClick={() => handleFoulBallSelect(ball.points)}
                  className={`group relative flex flex-col items-center justify-center py-3.5 sm:py-5 px-2 rounded-xl transition-all duration-150 cursor-pointer border active:scale-92 ${ball.cssClass} hover:brightness-115 hover:shadow-xl shadow-lg hover:-translate-y-0.5`}
                >
                  <span className="font-mono font-black text-3xl sm:text-4xl leading-none drop-shadow-md select-none">
                    +{ball.points}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/90 mt-1">
                    ฟาวล์ {ball.points} แต้ม
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Normal Potting Mode: Balls 1 - 7 */
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {normalBallList.map((ballKey) => {
              const ball = BALL_MAP[ballKey];
              const isRed = ballKey === 'red';
              const isDisabled = isRed && redsRemaining === 0;

              return (
                <button
                  key={ballKey}
                  onClick={() => onPotBall(ballKey)}
                  disabled={isDisabled}
                  className={`group relative flex flex-col items-center justify-center py-3 sm:py-4 px-1 rounded-xl transition-all duration-150 cursor-pointer border active:scale-92 ${ball.cssClass} ${
                    isDisabled
                      ? 'opacity-30 cursor-not-allowed border-slate-800'
                      : 'hover:brightness-115 hover:shadow-lg shadow-md hover:-translate-y-0.5'
                  }`}
                  title={`ลูก${ball.nameTh} (+${ball.points} แต้ม)`}
                >
                  {/* Clean Point number directly on the ball without name text */}
                  <span className="font-mono font-black text-2xl sm:text-3xl leading-none drop-shadow-md select-none">
                    {ball.points}
                  </span>

                  {/* Keyboard Shortcut Hint Badge */}
                  <span className="absolute -top-1 -right-1 bg-slate-950/90 text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold px-1 rounded-full border border-slate-700 shadow">
                    {ball.numpadKey}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Action Controls: Foul, Miss, Safety, Undo, End Frame */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setIsFoulMode(prev => !prev)}
          className={`flex items-center justify-center space-x-2 font-extrabold py-3 px-3 rounded-xl border transition-all cursor-pointer active:scale-98 shadow-md ${
            isFoulMode
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400 shadow-rose-950/60 animate-pulse'
              : 'bg-gradient-to-r from-rose-800 to-red-900 hover:from-rose-700 hover:to-red-800 text-white border-rose-700 shadow-rose-950/50'
          }`}
        >
          <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">{isFoulMode ? 'ยกเลิกฟาวล์' : 'เสียฟาวล์'}</div>
            <div className="text-[10px] text-rose-200 font-normal">{isFoulMode ? '[แตะเพื่อปิด]' : '[+] / [F]'}</div>
          </div>
        </button>

        <button
          onClick={() => {
            setIsFoulMode(false);
            onEndTurn('miss');
          }}
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold py-3 px-3 rounded-xl border border-slate-700 shadow-md cursor-pointer active:scale-98 transition-all"
        >
          <RotateCcw className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">แทงพลาด</div>
            <div className="text-[10px] text-slate-400 font-normal">[.] / [Space]</div>
          </div>
        </button>

        <button
          onClick={() => {
            setIsFoulMode(false);
            onEndTurn('safety');
          }}
          className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold py-3 px-3 rounded-xl border border-slate-700 shadow-md cursor-pointer active:scale-98 transition-all"
        >
          <Shield className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <div className="text-left">
            <div className="text-xs sm:text-sm leading-tight">กัน / เซฟตี้</div>
            <div className="text-[10px] text-slate-400 font-normal">[S]</div>
          </div>
        </button>

        <button
          onClick={() => {
            setIsFoulMode(false);
            onUndo();
          }}
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
          onClick={() => {
            setIsFoulMode(false);
            onEndFrame();
          }}
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
