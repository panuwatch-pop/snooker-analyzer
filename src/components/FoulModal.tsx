import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Delete } from 'lucide-react';

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFoul: (points: number, options: { isFreeBall: boolean; switchStriker: boolean; note?: string; recipientPlayerIndex?: 0 | 1 }) => void;
  activeStrikerIndex: 0 | 1;
  player1Name: string;
  player2Name: string;
}

export const FoulModal: React.FC<FoulModalProps> = ({
  isOpen,
  onClose,
  onSubmitFoul,
  activeStrikerIndex,
  player1Name,
  player2Name,
}) => {
  // Recipient: opponent of active striker by default
  const [recipientIndex, setRecipientIndex] = useState<0 | 1>(activeStrikerIndex === 0 ? 1 : 0);
  const [pointsInput, setPointsInput] = useState<string>('4');
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync recipient when activeStrikerIndex or modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipientIndex(activeStrikerIndex === 0 ? 1 : 0);
      setPointsInput('4');
    }
  }, [isOpen, activeStrikerIndex]);

  // Window keydown listener inside modal for fast keys
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;

      if (e.key === 'Escape' || code === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Enter' || code === 'Enter' || code === 'NumpadEnter') {
        e.preventDefault();
        const pts = Math.max(1, parseInt(pointsInput, 10) || 4);
        handleConfirmWithPoints(pts);
        return;
      }

      // Fast number keys 4-7
      if (key === '4' || code === 'Digit4' || code === 'Numpad4' || key === 'ภ') {
        e.preventDefault();
        handleConfirmWithPoints(4);
        return;
      }
      if (key === '5' || code === 'Digit5' || code === 'Numpad5' || key === 'ถ') {
        e.preventDefault();
        handleConfirmWithPoints(5);
        return;
      }
      if (key === '6' || code === 'Digit6' || code === 'Numpad6' || key === 'ุ') {
        e.preventDefault();
        handleConfirmWithPoints(6);
        return;
      }
      if (key === '7' || code === 'Digit7' || code === 'Numpad7' || key === 'ึ') {
        e.preventDefault();
        handleConfirmWithPoints(7);
        return;
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [isOpen, pointsInput, isFreeBall, switchStriker, recipientIndex, onSubmitFoul, onClose]);

  if (!isOpen) return null;

  const currentPoints = parseInt(pointsInput, 10) || 0;
  const foulPlayerName = recipientIndex === 1 ? player1Name : player2Name;
  const recipientPlayerName = recipientIndex === 1 ? player2Name : player1Name;

  const handleConfirmWithPoints = (pts: number) => {
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      recipientPlayerIndex: recipientIndex,
      note: `ฟาวล์ ${pts} แต้ม (ให้ ${recipientPlayerName})`,
    });
    onClose();
  };

  const handleConfirm = () => {
    const pts = Math.max(1, parseInt(pointsInput, 10) || 4);
    handleConfirmWithPoints(pts);
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setPointsInput('');
    } else if (val === 'DEL') {
      setPointsInput(prev => prev.slice(0, -1));
    } else {
      setPointsInput(prev => {
        if (prev === '0' || prev === '4') return val;
        return prev + val;
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPointsInput(val);
  };

  const quickPresets = [
    { pts: 4, label: 'ทั่วไป / แดง / ขาว', key: '4' },
    { pts: 5, label: 'ลูกน้ำเงิน (Blue)', key: '5' },
    { pts: 6, label: 'ลูกชมพู (Pink)', key: '6' },
    { pts: 7, label: 'ลูกดำ (Black)', key: '7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-base sm:text-lg font-black text-white">บันทึกแต้มฟาวล์ (Foul Penalty)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fouling & Benefiting Player Selector */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            ใครทำฟาวล์ &rarr; ใครได้แต้ม:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRecipientIndex(1)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 1
                  ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] text-rose-300 font-bold">❌ {player1Name} ฟาวล์</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">&rarr; ให้ {player2Name}</div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientIndex(0)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 0
                  ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] text-rose-300 font-bold">❌ {player2Name} ฟาวล์</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">&rarr; ให้ {player1Name}</div>
            </button>
          </div>
        </div>

        {/* 1-Tap Quick Action Presets (4, 5, 6, 7) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex justify-between items-center">
            <span>แตะคะแนนฟาวล์ (บันทึกแต้มทันที):</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">[กดเลข 4-7 ได้]</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset.pts}
                type="button"
                onClick={() => handleConfirmWithPoints(preset.pts)}
                className="py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center border bg-gradient-to-b from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 border-rose-500 text-white shadow-lg shadow-rose-950/40 transition-all cursor-pointer relative active:scale-95 hover:scale-102"
              >
                <span className="font-mono font-black text-2xl sm:text-3xl leading-none drop-shadow">+{preset.pts}</span>
                <span className="text-[10px] font-bold mt-1 text-rose-100">{preset.pts} แต้ม</span>
                <span className="text-[9px] text-rose-300 opacity-80 truncate max-w-full">{preset.label}</span>
                <span className="absolute top-1 right-1 text-[8px] bg-slate-950/90 text-amber-300 px-1 rounded font-mono font-bold border border-slate-700">
                  [{preset.key}]
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Input + Keypad */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">หรือใส่แต้มฟาวล์อื่นๆ:</span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">เพิ่มให้ {recipientPlayerName}: +{currentPoints || 0} แต้ม</span>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pointsInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirm();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="ใส่ตัวเลขแต้มฟาวล์..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white font-mono font-black text-2xl text-center py-2 px-4 rounded-xl outline-none shadow-inner"
            />
            {pointsInput && (
              <button
                type="button"
                onClick={() => setPointsInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-6 gap-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', 'DEL'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-1.5 rounded-lg font-mono font-bold text-xs transition-all active:scale-95 cursor-pointer border ${
                  btn === 'C'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                    : btn === 'DEL'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/80 flex items-center justify-center'
                    : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
                }`}
              >
                {btn === 'DEL' ? <Delete className="w-3.5 h-3.5" /> : btn}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={switchStriker}
              onChange={(e) => setSwitchStriker(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-slate-200">สลับให้อีกฝ่ายขึ้นมาแทง (Pass turn)</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-amber-300 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>สนุ๊กเกอร์ขัง / เกิดฟรีบอล (Award Free Ball)</span>
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ยกเลิก [Esc]
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>เพิ่ม +{currentPoints || 4} แต้มให้ {recipientPlayerName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
