import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';

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
  const [recipientIndex, setRecipientIndex] = useState<0 | 1>(activeStrikerIndex === 0 ? 1 : 0);
  const [customPoints, setCustomPoints] = useState<string>('4');
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);

  if (!isOpen) return null;

  const recipientName = recipientIndex === 0 ? player1Name : player2Name;
  const currentRecipientScore = recipientIndex === 0 ? player1Score : player2Score;

  const handleApplyFoul = (points: number) => {
    onSubmitFoul(points, {
      isFreeBall,
      switchStriker,
      recipientPlayerIndex: recipientIndex,
      note: `ฟาวล์ ${points} แต้ม (ให้ ${recipientName})`,
    });
    onClose();
  };

  const handleCustomSubmit = () => {
    const pts = Math.max(1, parseInt(customPoints, 10) || 4);
    handleApplyFoul(pts);
  };

  const commonFouls = [
    { pts: 4, label: '4 แต้ม (ทั่วไป/แดง/ขาว)' },
    { pts: 5, label: '5 แต้ม (น้ำเงิน)' },
    { pts: 6, label: '6 แต้ม (ชมพู)' },
    { pts: 7, label: '7 แต้ม (ดำ)' },
    { pts: 8, label: '8 แต้ม' },
    { pts: 9, label: '9 แต้ม' },
    { pts: 10, label: '10 แต้ม' },
    { pts: 12, label: '12 แต้ม' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-rose-400 font-black text-base sm:text-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>ระบุแต้มเสียฟาวล์ (Foul)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Selector */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 block">เลือกผู้ได้รับแต้มฟาวล์:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRecipientIndex(1)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 1
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-rose-300">❌ {player1Name} ฟาวล์</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">➡️ ให้ {player2Name}</div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientIndex(0)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                recipientIndex === 0
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] text-rose-300">❌ {player2Name} ฟาวล์</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">➡️ ให้ {player1Name}</div>
            </button>
          </div>
        </div>

        {/* Quick Point Grid (Tap any button to submit immediately) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 block">แตะเลือกแต้ม (บันทึกทันที 1 คลิก):</span>
          <div className="grid grid-cols-4 gap-1.5">
            {commonFouls.map((foul) => (
              <button
                key={foul.pts}
                type="button"
                onClick={() => handleApplyFoul(foul.pts)}
                className="py-2.5 px-1 rounded-xl font-bold bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 hover:border-rose-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <span className="font-mono font-black text-lg leading-none">+{foul.pts}</span>
                <span className="text-[9px] opacity-75 mt-0.5">{foul.pts} แต้ม</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Input */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>หรือพิมพ์จำนวนแต้มเอง:</span>
            <span className="text-emerald-400 font-mono">เพิ่มให้ {recipientName}</span>
          </div>

          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max="147"
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              placeholder="จำนวนแต้ม..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-black text-lg text-center outline-none focus:border-rose-400"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
            >
              ✓ ยืนยัน
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={switchStriker}
              onChange={(e) => setSwitchStriker(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-slate-300">สลับให้อีกฝ่ายขึ้นมาแทง (Pass turn)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-amber-300 flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>สนุ๊กเกอร์ขัง / เกิดฟรีบอล (Award Free Ball)</span>
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};
