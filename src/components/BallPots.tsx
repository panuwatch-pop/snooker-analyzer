import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Shield, Undo2, Flag, Layers, Edit3, Target, Plus, Minus, Sparkles, Zap } from 'lucide-react';
import { BallColor, PocketLocation, ElectricConfig } from '../types/snooker';
import { BALL_MAP, getBallBasePoints } from '../utils/snookerRules';
import { SnookerTablePockets } from './SnookerTablePockets';

interface BallPotsProps {
  redsRemaining: number;
  currentVisitShots: any[];
  isFoulMode: boolean;
  isGaMode?: boolean;
  isElectricMode?: boolean;
  electricConfig?: ElectricConfig;
  onToggleFoulMode: () => void;
  onPotBall: (ball: BallColor, pocket?: PocketLocation) => void;
  onFoul: (points: number, gaPenalty?: number) => void;
  onAddCustomPoints: (points: number, label: string) => void;
  onManualAddGa: (gaCount: number) => void;
  onEndTurn: (reason: 'miss' | 'safety') => void;
  onUndo: () => void;
  onEndFrame: () => void;
  onNewMatch: () => void;
  onMultiRedPot: (count: number) => void;
  canUndo: boolean;
}

export const BallPots: React.FC<BallPotsProps> = ({
  redsRemaining,
  currentVisitShots,
  isFoulMode,
  isGaMode = false,
  isElectricMode = false,
  electricConfig,
  onToggleFoulMode,
  onPotBall,
  onFoul,
  onAddCustomPoints,
  onManualAddGa,
  onEndTurn,
  onUndo,
  onEndFrame,
  onNewMatch,
  onMultiRedPot,
  canUndo,
}) => {
  const [pendingGaBall, setPendingGaBall] = useState<BallColor | null>(null);
  const [showMultiRedModal, setShowMultiRedModal] = useState<boolean>(false);
  const [customPointsInput, setCustomPointsInput] = useState<string>('');
  const [showCustomPointsModal, setShowCustomPointsModal] = useState<boolean>(false);
  const [showManualGaModal, setShowManualGaModal] = useState<boolean>(false);
  const [selectedGaPenalty, setSelectedGaPenalty] = useState<number>(0);

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

  const getDisplayedBallPoints = (ballKey: BallColor): number => {
    if (isElectricMode && electricConfig) {
      return getBallBasePoints(ballKey, redsRemaining === 0 && ballKey === 'black', electricConfig);
    }
    return BALL_MAP[ballKey].points;
  };

  const handleBallClick = (ballKey: BallColor) => {
    if (isFoulMode) {
      if (isGaMode) {
        onFoul(7, selectedGaPenalty);
      } else if (isElectricMode && electricConfig) {
        onFoul(electricConfig.foulPenalty);
      } else {
        onFoul(BALL_MAP[ballKey].points);
      }
      return;
    }

    // In Snooker Ga mode or Electric + Ga mode, show the 6-pocket selector for color balls
    const isBallPlusGa = isElectricMode && electricConfig?.countMode === 'ball-plus-ga';
    if ((isGaMode || isBallPlusGa) && ballKey !== 'red') {
      setPendingGaBall(ballKey);
      return;
    }

    // Standard pot
    onPotBall(ballKey);
  };

  const handlePocketSelected = (pocket: PocketLocation) => {
    if (pendingGaBall) {
      onPotBall(pendingGaBall, pocket);
      setPendingGaBall(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-0.5 xs:space-y-1 sm:space-y-1.5 flex-shrink-0 relative">
      {/* Potted Balls in Current Break - Mini colored spheres with numbers and Ga badges */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md xs:rounded-lg md:rounded-xl p-0.5 xs:p-1 shadow-sm flex flex-wrap items-center justify-between gap-0.5 xs:gap-1">
        <div className="flex items-center space-x-1 text-[7px] xs:text-[9px] md:text-xs font-bold text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ลูกที่ตบ ({pottedInVisit.length}):</span>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto max-w-full py-0.2 px-0.5">
          {pottedInVisit.length === 0 ? (
            <span className="text-[7px] xs:text-[9px] md:text-xs text-slate-500 italic">ยังไม่มีลูกที่ตบในรอบนี้</span>
          ) : (
            pottedInVisit.map((s, idx) => {
              const b = BALL_MAP[s.ballPotted as BallColor];
              if (!b) return null;
              return (
                <div
                  key={s.id || idx}
                  className={`relative w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-mono font-black text-[7px] xs:text-[9px] md:text-xs text-white shadow border border-white/30 select-none ${b.cssClass}`}
                  title={`ลูก${b.nameTh} (+${b.points}${s.gaCount ? ` | +${s.gaCount} กา` : ''})`}
                >
                  <span className="drop-shadow-sm">{b.points}</span>
                  {s.gaCount && s.gaCount > 0 ? (
                    <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white font-mono text-[5px] xs:text-[6px] md:text-[8px] font-black px-0.5 rounded-full border border-purple-300 shadow">
                      +{s.gaCount}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ball Potting / Foul Mode Panel */}
      <div className={`rounded-md xs:rounded-lg md:rounded-xl p-0.5 xs:p-1 md:p-1.5 shadow transition-all border ${
        isFoulMode
          ? 'bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/80 ring-1 ring-rose-500/40'
          : 'bg-slate-900/95 border-slate-800'
      }`}>
        {/* If in Foul Mode & Ga Mode: Show Snooker Ga Dedicated Foul Selector */}
        {isFoulMode && isGaMode ? (
          <div className="space-y-0.5 xs:space-y-1 py-0.2 animate-fadeIn">
            {/* Compact Ga deduction options */}
            <div className="bg-slate-950/80 p-0.5 xs:p-1 rounded-md border border-rose-900/60 space-y-0.5">
              <div className="flex items-center justify-between text-[7px] xs:text-[9px] md:text-xs text-slate-300 font-bold">
                <span className="flex items-center space-x-1">
                  <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-purple-400" />
                  <span>เลือกจำนวนกาที่เสีย:</span>
                </span>
                <span className="text-purple-300 font-mono font-black text-[7px] xs:text-[9px] md:text-xs">
                  {selectedGaPenalty > 0 ? `-${selectedGaPenalty} กา` : 'ไม่เสียกา (0 กา)'}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-0.5 xs:gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((ga) => (
                  <button
                    key={ga}
                    type="button"
                    onClick={() => setSelectedGaPenalty(ga)}
                    className={`py-0.5 xs:py-1 px-0.5 rounded-md font-mono font-bold text-[8px] xs:text-[10px] md:text-xs border transition-all cursor-pointer ${
                      selectedGaPenalty === ga
                        ? 'bg-purple-600 text-white border-purple-400 ring-1 ring-purple-400 font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {ga === 0 ? '0 กา' : `-${ga} กา`}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons for Submitting Ga Foul */}
            <div className="flex space-x-1 pt-0.2">
              <button
                type="button"
                onClick={onToggleFoulMode}
                className="flex-1 py-1 xs:py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[8px] xs:text-[10px] md:text-xs border border-slate-700 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onFoul(7, selectedGaPenalty);
                  setSelectedGaPenalty(0);
                }}
                className="flex-2 py-1 xs:py-1.5 rounded-md bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-[8px] xs:text-[10px] md:text-xs border border-rose-400 shadow-md flex items-center justify-center space-x-1"
              >
                <AlertTriangle className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-300" />
                <span>ยืนยันฟาวล์ {selectedGaPenalty > 0 ? `(-${selectedGaPenalty} กา)` : ''}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Ball Potting Grid / Standard Foul 4-7 */
          <div className="grid grid-cols-7 gap-0.5 xs:gap-1 sm:gap-1.5">
            {ballList.map((ballKey) => {
              const ball = BALL_MAP[ballKey];
              const displayPts = getDisplayedBallPoints(ballKey);
              const isFoulTarget = isElectricMode ? true : ball.points >= 4;

              if (isFoulMode && !isFoulTarget) {
                return (
                  <div
                    key={ballKey}
                    className="invisible pointer-events-none py-1 xs:py-1.5 sm:py-2 px-0.5"
                  />
                );
              }

              return (
                <button
                  key={ballKey}
                  onClick={() => handleBallClick(ballKey)}
                  className={`group relative flex flex-col items-center justify-center py-1 xs:py-1.5 sm:py-2 md:py-2.5 px-0.5 rounded-md xs:rounded-lg md:rounded-xl transition-all duration-150 cursor-pointer border active:scale-92 ${ball.cssClass} hover:brightness-115 shadow`}
                  title={isFoulMode ? `เสียฟาวล์ ${isElectricMode && electricConfig ? electricConfig.foulPenalty : ball.points} แต้ม` : `ลูก${ball.nameTh} (+${displayPts} แต้ม)`}
                >
                  <span className="font-mono font-black text-base xs:text-lg sm:text-2xl md:text-3xl leading-none drop-shadow select-none">
                    {isFoulMode ? `-${isElectricMode && electricConfig ? electricConfig.foulPenalty : ball.points}` : displayPts}
                  </span>

                  <span className="absolute -top-0.5 -right-0.5 bg-slate-950/90 text-amber-300 text-[5px] xs:text-[6px] sm:text-[7px] font-mono font-bold px-0.5 rounded-full border border-slate-700">
                    {ball.numpadKey}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Action Controls: Foul Button Large & Dominant, Other Buttons Compact */}
      <div className="flex items-stretch gap-0.5 xs:gap-1 sm:gap-1.5">
        {/* Foul Button */}
        <button
          onClick={onToggleFoulMode}
          className={`w-16 xs:w-20 sm:w-28 md:w-36 flex-shrink-0 flex items-center justify-center space-x-0.5 xs:space-x-1 font-extrabold py-1 xs:py-1.5 md:py-2 px-0.5 xs:px-1 rounded-md xs:rounded-lg md:rounded-xl border transition-all cursor-pointer active:scale-98 shadow ${
            isFoulMode
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-500/50 animate-pulse'
              : 'bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 hover:from-rose-600 hover:to-red-800 text-white border-rose-600'
          }`}
        >
          <AlertTriangle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0 animate-bounce" />
          <div className="text-left min-w-0">
            <div className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm leading-none font-black truncate">{isFoulMode ? 'ยกเลิก' : 'ฟาวล์'}</div>
            <div className="text-[5px] xs:text-[6px] sm:text-[8px] text-rose-200 font-normal hidden xs:block mt-0.5">[-] / [F]</div>
          </div>
        </button>

        {/* Snooker Ga Button */}
        {isGaMode && (
          <button
            onClick={() => setShowManualGaModal(true)}
            className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border border-purple-500 shadow-sm cursor-pointer active:scale-98 transition-all"
            title="เพิ่ม/ปรับจำนวนกาโดยตรง"
          >
            <Target className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 text-amber-300 flex-shrink-0" />
            <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs leading-tight font-black truncate mt-0.5">เพิ่มกา</span>
          </button>
        )}

        {/* Miss Button */}
        <button
          onClick={() => onEndTurn('miss')}
          className="flex-1 flex flex-col items-center justify-center bg-slate-800/95 hover:bg-slate-700 text-slate-100 font-bold py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border border-slate-700 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <RotateCcw className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs leading-tight font-bold truncate mt-0.5">พลาด</span>
        </button>

        {/* Safety Button */}
        <button
          onClick={() => onEndTurn('safety')}
          className="flex-1 flex flex-col items-center justify-center bg-slate-800/95 hover:bg-slate-700 text-slate-100 font-bold py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border border-slate-700 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <Shield className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 text-sky-400 flex-shrink-0" />
          <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs leading-tight font-bold truncate mt-0.5">กัน/เซฟ</span>
        </button>

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 flex flex-col items-center justify-center font-bold py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border transition-all cursor-pointer ${
            canUndo
              ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-500 shadow-sm active:scale-98'
              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs leading-tight font-bold truncate mt-0.5">ย้อนกลับ</span>
        </button>

        {/* End Frame Button */}
        <button
          onClick={onEndFrame}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border border-amber-400 shadow-sm cursor-pointer active:scale-98 transition-all"
        >
          <Flag className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 text-slate-950 flex-shrink-0" />
          <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-black leading-tight truncate mt-0.5">จบเฟรม</span>
        </button>

        {/* New Match Button */}
        <button
          onClick={onNewMatch}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black py-0.5 xs:py-1 md:py-1.5 px-0.5 rounded-md xs:rounded-lg border-2 border-cyan-300 ring-1 ring-cyan-400/50 shadow-sm cursor-pointer active:scale-98 transition-all"
          title="เริ่มแมตช์ใหม่"
        >
          <Sparkles className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3.5 sm:h-3.5 text-slate-950 flex-shrink-0 animate-pulse" />
          <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-black leading-tight truncate mt-0.5">เริ่มใหม่</span>
        </button>
      </div>

      {/* Snooker Table 6-Pocket Selector Modal for Snooker Ga */}
      {pendingGaBall && (
        <SnookerTablePockets
          selectedBall={pendingGaBall}
          onSelectPocket={handlePocketSelected}
          onCancel={() => setPendingGaBall(null)}
        />
      )}

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

      {/* Manual Add / Adjust Ga Modal */}
      {showManualGaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/80 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl ring-2 ring-purple-500/30">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400 animate-pulse" />
              <span>เพิ่ม / ปรับจำนวนกา (Manual Ga)</span>
            </h3>
            <p className="text-xs text-slate-300">
              กดเลือกจำนวนกาที่ต้องการเพิ่มให้ผู้เล่นคนปัจจุบัน:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    onManualAddGa(cnt);
                    setShowManualGaModal(false);
                  }}
                  className="py-3.5 rounded-xl bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-mono font-black text-lg border border-purple-400 shadow-md active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="leading-tight">+{cnt}</span>
                  <span className="text-[10px] opacity-80 font-sans font-semibold">กา</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowManualGaModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
