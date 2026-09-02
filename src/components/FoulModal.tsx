import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Delete, ArrowRight } from 'lucide-react';

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFoul: (points: number, options: { isFreeBall: boolean; switchStriker: boolean; note?: string; recipientPlayerIndex?: 0 | 1 }) => void;
  activeStrikerIndex: 0 | 1;
  player1Name: string;
  player2Name: string;
  player1Score?: number;
  player2Score?: number;
}

export const FoulModal: React.FC<FoulModalProps> = ({
  isOpen,
  onClose,
  onSubmitFoul,
  activeStrikerIndex,
  player1Name,
  player2Name,
  player1Score = 0,
  player2Score = 0,
}) => {
  // Recipient: opponent of active striker by default
  const [recipientIndex, setRecipientIndex] = useState<0 | 1>(activeStrikerIndex === 0 ? 1 : 0);
  const [selectedPoints, setSelectedPoints] = useState<number>(4);
  const [pointsInput, setPointsInput] = useState<string>('4');
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync recipient and points when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipientIndex(activeStrikerIndex === 0 ? 1 : 0);
      setSelectedPoints(4);
      setPointsInput('4');
    }
  }, [isOpen, activeStrikerIndex]);

  // Window keydown listener inside modal for fast typing & enter
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
        handleExecuteSubmit();
        return;
      }

      // Fast number keys 1-9
      const numMap: Record<string, number> = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'Digit1': 1, 'Digit2': 2, 'Digit3': 3, 'Digit4': 4, 'Digit5': 5, 'Digit6': 6, 'Digit7': 7, 'Digit8': 8, 'Digit9': 9,
        'Numpad1': 1, 'Numpad2': 2, 'Numpad3': 3, 'Numpad4': 4, 'Numpad5': 5, 'Numpad6': 6, 'Numpad7': 7, 'Numpad8': 8, 'Numpad9': 9,
        'ๅ': 1, '/': 2, '-': 3, 'ภ': 4, 'ถ': 5, 'ุ': 6, 'ึ': 7, 'ค': 8, 'ต': 9,
      };

      const num = numMap[code] || numMap[key];
      if (num !== undefined) {
        setSelectedPoints(num);
        setPointsInput(num.toString());
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  });

  if (!isOpen) return null;

  const currentPoints = Math.max(1, parseInt(pointsInput, 10) || selectedPoints || 4);
  const foulPlayerName = recipientIndex === 1 ? player1Name : player2Name;
  const recipientPlayerName = recipientIndex === 1 ? player2Name : player1Name;
  
  const currentRecipientScore = recipientIndex === 0 ? player1Score : player2Score;
  const newRecipientScore = currentRecipientScore + currentPoints;

  const handleExecuteSubmit = (overridePoints?: number) => {
    const pts = overridePoints !== undefined ? overridePoints : currentPoints;
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      recipientPlayerIndex: recipientIndex,
      note: `ฟาวล์ ${pts} แต้ม (ให้ ${recipientPlayerName})`,
    });
    onClose();
  };

  const handleSelectPreset = (pts: number) => {
    setSelectedPoints(pts);
    setPointsInput(pts.toString());
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setPointsInput('');
      setSelectedPoints(0);
    } else if (val === 'DEL') {
      const next = pointsInput.slice(0, -1);
      setPointsInput(next);
      setSelectedPoints(parseInt(next, 10) || 0);
    } else {
      const next = (pointsInput === '0' || pointsInput === '4' ? '' : pointsInput) + val;
      setPointsInput(next);
      setSelectedPoints(parseInt(next, 10) || 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPointsInput(val);
    setSelectedPoints(parseInt(val, 10) || 0);
  };

  const presets = [
    { pts: 4, label: 'ทั่วไป / แดง / ขาว', color: 'border-rose-500' },
    { pts: 5, label: 'ลูกน้ำเงิน (Blue)', color: 'border-blue-500' },
    { pts: 6, label: 'ลูกชมพู (Pink)', color: 'border-pink-500' },
    { pts: 7, label: 'ลูกดำ (Black)', color: 'border-slate-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4">
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

        {/* Player Selector Card */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            เลือกผู้ทำฟาวล์ &rarr; ผู้ได้รับคะแนน:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRecipientIndex(1)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 1
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-rose-300 font-bold flex items-center space-x-1">
                <span>❌ {player1Name} ฟาวล์</span>
              </div>
              <div className="text-sm font-black text-emerald-400 mt-1 flex items-center space-x-1">
                <span>➡️ {player2Name} (+{currentPoints} แต้ม)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientIndex(0)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 0
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-rose-300 font-bold flex items-center space-x-1">
                <span>❌ {player2Name} ฟาวล์</span>
              </div>
              <div className="text-sm font-black text-emerald-400 mt-1 flex items-center space-x-1">
                <span>➡️ {player1Name} (+{currentPoints} แต้ม)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Score Preview Banner */}
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="text-slate-300">
            แต้มของ <strong>{recipientPlayerName}</strong>:
          </div>
          <div className="flex items-center space-x-2 font-mono font-black text-base">
            <span className="text-slate-400">{currentRecipientScore}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-lg bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-400/50">
              {newRecipientScore} แต้ม (+{currentPoints})
            </span>
          </div>
        </div>

        {/* 4 Standard Presets (4, 5, 6, 7) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex justify-between items-center">
            <span>แตะเลือกคะแนนฟาวล์:</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">[กดเลข 4-7 บนคีย์บอร์ดได้]</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => {
              const isSelected = currentPoints === preset.pts;
              return (
                <button
                  key={preset.pts}
                  type="button"
                  onClick={() => handleSelectPreset(preset.pts)}
                  className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-rose-600 to-red-700 border-rose-400 text-white shadow-lg ring-2 ring-rose-400/50 scale-102'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono font-black text-2xl sm:text-3xl leading-none">+{preset.pts}</span>
                  <span className="text-[10px] font-bold mt-1">{preset.pts} แต้ม</span>
                  <span className="text-[8px] opacity-75 truncate max-w-full">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Point Input + Keypad */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">หรือใส่ตัวเลขแต้มอื่นๆ:</span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">ระบุ: +{currentPoints} แต้ม</span>
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
                  handleExecuteSubmit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="ใส่ตัวเลขแต้มฟาวล์..."
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-white font-mono font-black text-2xl text-center py-2 px-4 rounded-xl outline-none shadow-inner"
            />
            {pointsInput && (
              <button
                type="button"
                onClick={() => {
                  setPointsInput('');
                  setSelectedPoints(0);
                }}
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

        {/* Big Action Submit Buttons */}
        <div className="flex items-center justify-between space-x-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ยกเลิก [Esc]
          </button>
          <button
            type="button"
            onClick={() => handleExecuteSubmit()}
            className="flex-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span>✓ ยืนยันเพิ่ม +{currentPoints} แต้มให้ {recipientPlayerName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
