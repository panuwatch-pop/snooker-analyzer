import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';

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
  const [points, setPoints] = useState<number>(4);
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);

  // Keyboard listener inside Modal for 4-7, Enter, and Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text') {
        return;
      }

      if (e.key === '4') {
        setPoints(4);
      } else if (e.key === '5') {
        setPoints(5);
      } else if (e.key === '6') {
        setPoints(6);
      } else if (e.key === '7') {
        setPoints(7);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmitFoul(points, {
          isFreeBall,
          switchStriker,
          note: `ฟาวล์ ${points} แต้ม`,
        });
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, points, isFreeBall, switchStriker, onSubmitFoul, onClose]);

  if (!isOpen) return null;

  const foulOptions = [
    { pts: 4, label: '4 แต้ม', desc: 'ขาว/แดง/เหลือง/เขียว/น้ำตาล', key: '4' },
    { pts: 5, label: '5 แต้ม', desc: 'ลูกน้ำเงิน (Blue)', key: '5' },
    { pts: 6, label: '6 แต้ม', desc: 'ลูกชมพู (Pink)', key: '6' },
    { pts: 7, label: '7 แต้ม', desc: 'ลูกดำ (Black)', key: '7' },
  ];

  const handleConfirmWithPoints = (pts: number) => {
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      note: `ฟาวล์ ${pts} แต้ม`,
    });
    onClose();
  };

  const handleConfirm = () => {
    onSubmitFoul(points, {
      isFreeBall,
      switchStriker,
      note: `ฟาวล์ ${points} แต้ม`,
    });
    onClose();
  };

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
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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

        {/* Big Touch Buttons: One-tap direct submit or select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              แตะเลือกคะแนนฟาวล์ (กดเลข 4-7 บนคีย์บอร์ดได้)
            </label>
            <span className="text-[11px] text-amber-400 font-bold font-mono">เลือก: {points} แต้ม</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {foulOptions.map((opt) => (
              <button
                key={opt.pts}
                type="button"
                onClick={() => setPoints(opt.pts)}
                onDoubleClick={() => handleConfirmWithPoints(opt.pts)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer relative active:scale-95 ${
                  points === opt.pts
                    ? 'bg-gradient-to-b from-rose-600 to-rose-700 border-rose-400 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400 font-black'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 font-bold'
                }`}
              >
                <span className="text-2xl sm:text-3xl font-mono leading-none">+{opt.pts}</span>
                <span className="text-[11px] mt-1 opacity-90">{opt.label}</span>
                <span className="absolute top-1.5 right-1.5 text-[9px] bg-slate-950/80 text-amber-300 px-1 rounded font-mono font-bold">
                  [{opt.key}]
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Buttons (e.g. 1-10) */}
        <div className="flex items-center space-x-1.5 pt-1 text-xs text-slate-400">
          <span>แต้มฟาวล์อื่นๆ:</span>
          {[1, 2, 3, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPoints(num)}
              className={`px-2 py-1 rounded border font-mono font-bold cursor-pointer ${
                points === num
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              +{num}
            </button>
          ))}
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
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ยกเลิก [Esc]
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ยืนยันเสียฟาวล์ (+{points} แต้ม) [Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
