import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert, Delete } from 'lucide-react';

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
  const [pointsInput, setPointsInput] = useState<string>('4');
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPointsInput('4');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 60);
    }
  }, [isOpen]);

  // Global window keydown listener inside modal so all keys (numpad/digit/enter/esc) work without requiring input focus
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
        onSubmitFoul(pts, {
          isFreeBall,
          switchStriker,
          note: `ฟาวล์ ${pts} แต้ม`,
        });
        onClose();
        return;
      }

      // If user presses digit keys (0-9, Numpad, or Thai digits)
      const digitMap: Record<string, string> = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
        'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9',
        'Numpad0': '0', 'Numpad1': '1', 'Numpad2': '2', 'Numpad3': '3', 'Numpad4': '4',
        'Numpad5': '5', 'Numpad6': '6', 'Numpad7': '7', 'Numpad8': '8', 'Numpad9': '9',
        'จ': '0', 'ๅ': '1', '/': '2', '-': '3', 'ภ': '4',
        'ถ': '5', 'ุ': '6', 'ึ': '7', 'ค': '8', 'ต': '9',
      };

      const digit = digitMap[code] || digitMap[key];
      if (digit !== undefined) {
        // If target is not the input itself, append/replace
        const target = e.target as HTMLElement;
        if (target !== inputRef.current) {
          e.preventDefault();
          setPointsInput(prev => {
            if (prev === '0' || prev === '4') return digit;
            return prev + digit;
          });
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [isOpen, pointsInput, isFreeBall, switchStriker, onSubmitFoul, onClose]);

  if (!isOpen) return null;

  const currentPoints = parseInt(pointsInput, 10) || 0;

  const handleConfirmWithPoints = (pts: number) => {
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      note: `ฟาวล์ ${pts} แต้ม`,
    });
    onClose();
  };

  const handleConfirm = () => {
    const pts = Math.max(1, parseInt(pointsInput, 10) || 4);
    onSubmitFoul(pts, {
      isFreeBall,
      switchStriker,
      note: `ฟาวล์ ${pts} แต้ม`,
    });
    onClose();
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPointsInput(val);
  };

  const quickPresets = [
    { pts: 4, label: '4 แต้ม (ทั่วไป/แดง/ขาว)' },
    { pts: 5, label: '5 แต้ม (น้ำเงิน)' },
    { pts: 6, label: '6 แต้ม (ชมพู)' },
    { pts: 7, label: '7 แต้ม (ดำ)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-3.5">
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

        {/* Players Context */}
        <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 flex items-center justify-between">
          <div>
            ผู้ทำฟาวล์: <strong className="text-rose-400 font-bold">{currentStrikerName}</strong>
          </div>
          <div>
            แต้มให้คู่แข่ง: <strong className="text-emerald-400 font-bold">{opponentName}</strong>
          </div>
        </div>

        {/* Big Number Input Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex justify-between items-center">
            <span>ระบุจำนวนแต้มฟาวล์:</span>
            <span className="text-[11px] text-amber-400 font-mono">ให้แต้มคู่แข่ง: +{currentPoints || 0} แต้ม</span>
          </label>

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
              className="w-full bg-slate-950 border-2 border-rose-500/80 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20 text-white font-mono font-black text-3xl sm:text-4xl text-center py-2.5 px-4 rounded-xl outline-none shadow-inner tracking-wider"
            />
            {pointsInput && (
              <button
                type="button"
                onClick={() => setPointsInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Presets (4, 5, 6, 7) */}
        <div className="grid grid-cols-4 gap-1.5">
          {quickPresets.map((preset) => (
            <button
              key={preset.pts}
              type="button"
              onClick={() => setPointsInput(preset.pts.toString())}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${
                pointsInput === preset.pts.toString()
                  ? 'bg-rose-600 border-rose-400 text-white shadow-md ring-2 ring-rose-400/50'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <span className="font-mono font-black text-base leading-tight">+{preset.pts}</span>
              <span className="text-[9px] opacity-80 truncate">{preset.pts === 4 ? 'ทั่วไป' : preset.pts === 5 ? 'น้ำเงิน' : preset.pts === 6 ? 'ชมพู' : 'ดำ'}</span>
            </button>
          ))}
        </div>

        {/* On-screen Numeric Keypad (for Touch Screen & Mouse) */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 text-center">แป้นตัวเลข (แตะเพื่อพิมพ์แต้ม):</div>
          <div className="grid grid-cols-3 gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-2 rounded-lg font-mono font-bold text-base transition-all active:scale-95 cursor-pointer border ${
                  btn === 'C'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                    : btn === 'DEL'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/80 flex items-center justify-center'
                    : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700 shadow-sm'
                }`}
              >
                {btn === 'DEL' ? <Delete className="w-4 h-4" /> : btn}
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
            <span>ยืนยันเสียฟาวล์ (+{currentPoints || 4} แต้ม) [Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
