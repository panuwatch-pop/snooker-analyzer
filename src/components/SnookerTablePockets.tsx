import React from 'react';
import { Target, X, Sparkles } from 'lucide-react';
import { BallColor, PocketLocation } from '../types/snooker';
import { BALL_MAP, calculateGaForPot } from '../utils/snookerRules';

interface SnookerTablePocketsProps {
  selectedBall: BallColor;
  onSelectPocket: (pocket: PocketLocation) => void;
  onCancel: () => void;
}

export const SnookerTablePockets: React.FC<SnookerTablePocketsProps> = ({
  selectedBall,
  onSelectPocket,
  onCancel,
}) => {
  const ballInfo = BALL_MAP[selectedBall];

  // Pockets metadata
  const pockets: { id: PocketLocation; nameTh: string; posClass: string }[] = [
    { id: 'top-left', nameTh: 'บนซ้าย', posClass: 'top-2 left-2' },
    { id: 'top-right', nameTh: 'บนขวา', posClass: 'top-2 right-2' },
    { id: 'middle-left', nameTh: 'กลางซ้าย', posClass: 'top-1/2 -translate-y-1/2 left-2' },
    { id: 'middle-right', nameTh: 'กลางขวา', posClass: 'top-1/2 -translate-y-1/2 right-2' },
    { id: 'bottom-left', nameTh: 'ล่างซ้าย', posClass: 'bottom-2 left-2' },
    { id: 'bottom-right', nameTh: 'ล่างขวา', posClass: 'bottom-2 right-2' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-600/80 rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm text-white shadow-md border border-white/30 ${ballInfo.cssClass}`}>
              {ballInfo.points}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-1.5">
                <span>แตะเลือกหลุมที่ลูกลง</span>
                <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                  โหมดสนุ๊กกา 🎯
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                ตบลูก <strong className="text-slate-200">{ballInfo.nameTh}</strong> (+{ballInfo.points} แต้ม)
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Snooker Table Graphic */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-emerald-900 rounded-2xl border-4 border-amber-900 shadow-inner p-3 flex flex-col justify-between overflow-hidden">
          {/* Table markings: Baulk line & D */}
          <div className="absolute left-[20%] top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none" />
          <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-14 h-24 border-r border-t border-b border-white/20 rounded-r-full -translate-x-1/2 pointer-events-none" />
          
          {/* Spot markings */}
          <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400/40 pointer-events-none" />
          <div className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-400/40 pointer-events-none" />
          <div className="absolute left-[88%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black/40 pointer-events-none" />

          {/* Center Table Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <div className="flex items-center space-x-1.5 bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/10 shadow-lg">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                แตะหลุมเพื่อคำนวณกาอัตโนมัติ
              </span>
            </div>
          </div>

          {/* 6 Interactive Pockets */}
          {pockets.map((p) => {
            const ga = calculateGaForPot(selectedBall, p.id);
            const isGaTarget = ga > 0;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPocket(p.id)}
                className={`absolute ${p.posClass} z-10 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 cursor-pointer active:scale-90 ${
                  isGaTarget
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-400/50 shadow-xl shadow-amber-950/80 animate-pulse scale-105'
                    : 'bg-slate-950/85 hover:bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 shadow-md'
                }`}
              >
                <div className="flex items-center space-x-1">
                  {isGaTarget && <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />}
                  <span className="text-xs sm:text-sm font-black tracking-tight">
                    {p.nameTh}
                  </span>
                </div>
                
                {isGaTarget ? (
                  <span className="text-[10px] sm:text-xs font-black bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-md mt-0.5">
                    +{ga} กา 🎯
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    (0 กา)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={() => onSelectPocket('any')}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer active:scale-98 text-center"
          >
            ลงหลุมอื่น / ไม่เอากา (0 กา)
          </button>

          <button
            onClick={onCancel}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm border border-slate-800 transition-all cursor-pointer active:scale-98"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
