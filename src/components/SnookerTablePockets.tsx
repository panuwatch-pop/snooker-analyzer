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

  // Pockets metadata oriented correctly:
  // TOP = ฝั่งจุดดำ / จุดชมพู (หลุมบน)
  // MIDDLE = หลุมกลาง (จุดน้ำเงิน)
  // BOTTOM = ฝั่งเส้นเมือง / ตัว D (หลุมล่าง)
  const pockets: { id: PocketLocation; nameTh: string; posClass: string; desc: string }[] = [
    { id: 'top-left', nameTh: 'หลุมบนซ้าย', posClass: 'top-2 left-2', desc: 'ฝั่งจุดดำ' },
    { id: 'top-right', nameTh: 'หลุมบนขวา', posClass: 'top-2 right-2', desc: 'ฝั่งจุดดำ' },
    { id: 'middle-left', nameTh: 'หลุมกลางซ้าย', posClass: 'top-1/2 -translate-y-1/2 left-2', desc: 'หลุมกลาง' },
    { id: 'middle-right', nameTh: 'หลุมกลางขวา', posClass: 'top-1/2 -translate-y-1/2 right-2', desc: 'หลุมกลาง' },
    { id: 'bottom-left', nameTh: 'หลุมล่างซ้าย', posClass: 'bottom-2 left-2', desc: 'หลังเส้นเมือง' },
    { id: 'bottom-right', nameTh: 'หลุมล่างขวา', posClass: 'bottom-2 right-2', desc: 'หลังเส้นเมือง' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-600/80 rounded-3xl max-w-md w-full p-4 sm:p-5 space-y-3 shadow-2xl relative overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm text-white shadow-md border border-white/30 ${ballInfo.cssClass}`}>
              {ballInfo.points}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-1.5">
                <span>เลือกหลุมที่ลูกลง</span>
                <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 font-bold">
                  สนุ๊กกา 🎯
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

        {/* Snooker Table Graphic Oriented Correctly (Top = Black Spot end, Bottom = Baulk line end) */}
        <div className="relative w-full aspect-[3/4] max-h-[380px] sm:max-h-[420px] bg-gradient-to-b from-emerald-900 via-emerald-950 to-emerald-900 rounded-3xl border-8 border-amber-950 shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
          {/* Top Label (ฝั่งจุดดำ / หลุมบน) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30 shadow">
              ⚫ ฝั่งจุดดำ (หลุมบน)
            </span>
          </div>

          {/* Table markings: Black Spot, Pink Spot, Blue Spot */}
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black border border-white/40 shadow-sm pointer-events-none" title="จุดดำ" />
          <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-pink-400/80 pointer-events-none" title="จุดชมพู" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-400/80 pointer-events-none" title="จุดน้ำเงิน" />

          {/* Table markings: Baulk line & D (ด้านล่าง) */}
          <div className="absolute bottom-[22%] left-0 right-0 h-0.5 bg-white/25 pointer-events-none" />
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-20 h-10 border-b-2 border-l-2 border-r-2 border-white/25 rounded-b-full pointer-events-none" />
          <div className="absolute bottom-[22%] left-[32%] -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-400/80 pointer-events-none" title="จุดเหลือง" />
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-700/80 pointer-events-none" title="จุดน้ำตาล" />
          <div className="absolute bottom-[22%] right-[32%] -translate-y-1/2 w-2 h-2 rounded-full bg-green-500/80 pointer-events-none" title="จุดเขียว" />

          {/* Bottom Label (หลังเส้นเมือง / หลุมล่าง) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow">
              🏁 หลังเส้นเมือง / ตัว D (หลุมล่าง)
            </span>
          </div>

          {/* 6 Interactive Pocket Buttons */}
          {pockets.map((p) => {
            const ga = calculateGaForPot(selectedBall, p.id);
            const isGaTarget = ga > 0;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPocket(p.id)}
                className={`absolute ${p.posClass} z-10 flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl transition-all duration-150 cursor-pointer active:scale-90 ${
                  isGaTarget
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-400/60 shadow-2xl shadow-amber-950 scale-105 animate-pulse'
                    : 'bg-slate-950/90 hover:bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-1">
                  {isGaTarget && <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />}
                  <span className="text-xs sm:text-sm font-black tracking-tight">
                    {p.nameTh}
                  </span>
                </div>

                {isGaTarget ? (
                  <span className="text-[10px] sm:text-xs font-black bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md mt-1 shadow">
                    +{ga} กา 🎯
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 mt-0.5 font-medium">
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
            className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer active:scale-98 text-center"
          >
            หลุมอื่น (0 กา)
          </button>

          <button
            onClick={onCancel}
            className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm border border-slate-800 transition-all cursor-pointer active:scale-98"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
