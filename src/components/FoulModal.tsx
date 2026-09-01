import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFoul: (points: number, options: { isFreeBall: boolean; switchStriker: boolean; note?: string }) => void;
  currentStrikerName: string;
  opponentName: string;
}

export const FoulModal: React.FC<FoulModalProps> = ({
  isOpen,
  onClose,
  onSubmitFoul,
  currentStrikerName,
  opponentName,
}) => {
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);

  const handleConfirmWithPoints = (pts: number) => {
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      note: `ฟาวล์ ${pts} แต้ม`,
    });
    onClose();
  };

  // Keyboard listener inside Modal for 1-9, Enter, and Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Direct instant foul keys: 4, 5, 6, 7 (and 1, 2, 3, 8, 9)
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        const pts = parseInt(key, 10);
        handleConfirmWithPoints(pts);
        return;
      }

      if (key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleConfirmWithPoints(4);
        return;
      }

      if (key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleModalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleModalKeyDown, { capture: true });
  }, [isOpen, isFreeBall, switchStriker, onSubmitFoul, onClose]);

  if (!isOpen) return null;

  const foulOptions = [
    { pts: 4, label: '4 แต้ม', desc: 'ขาว/แดง/เหลือง/เขียว/น้ำตาล', key: '4' },
    { pts: 5, label: '5 แต้ม', desc: 'ลูกน้ำเงิน (Blue)', key: '5' },
    { pts: 6, label: '6 แต้ม', desc: 'ลูกชมพู (Pink)', key: '6' },
    { pts: 7, label: '7 แต้ม', desc: 'ลูกดำ (Black)', key: '7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-black text-white">บันทึกแต้มฟาวล์ (Foul Penalty)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs sm:text-sm text-slate-300 flex items-center justify-between">
          <div>
            ผู้ทำฟาวล์: <strong className="text-rose-400 font-bold">{currentStrikerName}</strong>
          </div>
          <div>
            แต้มให้คู่แข่ง: <strong className="text-emerald-400 font-bold">{opponentName}</strong>
          </div>
        </div>

        {/* Big Touch Buttons: One-tap direct submit */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            แตะเลือกคะแนนฟาวล์ (กดเลข 4-7 บนคีย์บอร์ดได้ทันที)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {foulOptions.map((opt) => (
              <button
                key={opt.pts}
                type="button"
                onClick={() => handleConfirmWithPoints(opt.pts)}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border bg-gradient-to-b from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 border-rose-500 text-white shadow-lg shadow-rose-950/50 transition-all cursor-pointer relative active:scale-95 hover:scale-105"
              >
                <span className="text-3xl sm:text-4xl font-black font-mono leading-none drop-shadow">+{opt.pts}</span>
                <span className="text-[11px] mt-1 font-bold opacity-95">{opt.label}</span>
                <span className="text-[9px] text-rose-200 opacity-80 truncate max-w-full">{opt.desc}</span>
                <span className="absolute top-1.5 right-1.5 text-[9px] bg-slate-950/90 text-amber-300 px-1 rounded font-mono font-bold border border-slate-700">
                  [{opt.key}]
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Buttons (e.g. 1, 2, 3, 8, 9, 10) */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-slate-400 font-semibold block">แต้มฟาวล์อื่นๆ (แตะเพื่อส่งค่าทันที):</span>
          <div className="flex items-center flex-wrap gap-2">
            {[1, 2, 3, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleConfirmWithPoints(num)}
                className="px-3 py-1.5 rounded-lg border font-mono font-bold text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-rose-700 hover:text-white hover:border-rose-500 cursor-pointer active:scale-95 transition-all"
              >
                +{num} แต้ม
              </button>
            ))}
          </div>
        </div>

        {/* Options: Pass Turn & Free Ball */}
        <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={switchStriker}
              onChange={(e) => setSwitchStriker(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              สลับให้อีกฝ่ายขึ้นมาแทง (Pass turn)
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-800 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-amber-300 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>สนุ๊กเกอร์ขัง / เกิดฟรีบอล (Award Free Ball)</span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ยกเลิก [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
