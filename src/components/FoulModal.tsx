import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

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

  // Sync recipient when modal opens or striker changes
  useEffect(() => {
    if (isOpen) {
      setRecipientIndex(activeStrikerIndex === 0 ? 1 : 0);
    }
  }, [isOpen, activeStrikerIndex]);

  if (!isOpen) return null;

  const recipientName = recipientIndex === 0 ? player1Name : player2Name;
  const foulPlayerName = recipientIndex === 1 ? player1Name : player2Name;

  const handleApplyFoul = (points: number) => {
    // 1. Close modal immediately
    onClose();
    // 2. Submit foul score & update match
    onSubmitFoul(points, {
      isFreeBall,
      switchStriker,
      recipientPlayerIndex: recipientIndex,
      note: `ฟาวล์ ${points} แต้ม (ให้ ${recipientName})`,
    });
  };

  const handleCustomSubmit = () => {
    const pts = Math.max(1, parseInt(customPoints, 10) || 4);
    handleApplyFoul(pts);
  };

  const commonFouls = [
    { pts: 4, label: 'ทั่วไป / แดง / ขาว', color: 'bg-rose-600 hover:bg-rose-500 border-rose-400' },
    { pts: 5, label: 'ลูกน้ำเงิน (Blue)', color: 'bg-blue-600 hover:bg-blue-500 border-blue-400' },
    { pts: 6, label: 'ลูกชมพู (Pink)', color: 'bg-pink-600 hover:bg-pink-500 border-pink-400' },
    { pts: 7, label: 'ลูกดำ (Black)', color: 'bg-slate-700 hover:bg-slate-600 border-slate-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 text-rose-400 font-black text-lg">
            <AlertTriangle className="w-6 h-6" />
            <span>เสียฟาวล์ (Foul Penalty)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recipient / Fouler Toggle */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300 block">เลือกผู้ทำฟาวล์ ➡️ ผู้ได้แต้ม:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRecipientIndex(1)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                recipientIndex === 1
                  ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-500/50 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-rose-300 font-bold">❌ {player1Name} ฟาวล์</div>
              <div className="text-sm font-black text-emerald-400 mt-1">➡️ ให้ {player2Name}</div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientIndex(0)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                recipientIndex === 0
                  ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-500/50 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-rose-300 font-bold">❌ {player2Name} ฟาวล์</div>
              <div className="text-sm font-black text-emerald-400 mt-1">➡️ ให้ {player1Name}</div>
            </button>
          </div>
        </div>

        {/* Point Buttons (4, 5, 6, 7) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>แตะแต้มที่ต้องการ (เพิ่มคะแนนทันที 1 คลิก):</span>
            <span className="text-[10px] text-emerald-400 font-bold">เพิ่มให้: {recipientName}</span>
          </span>

          <div className="grid grid-cols-2 gap-2">
            {commonFouls.map((foul) => (
              <button
                key={foul.pts}
                type="button"
                onClick={() => handleApplyFoul(foul.pts)}
                className={`py-4 px-3 rounded-xl font-bold ${foul.color} text-white border-2 shadow-lg active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center`}
              >
                <span className="font-mono font-black text-3xl leading-none">+{foul.pts}</span>
                <span className="text-xs font-black mt-1 text-white">{foul.pts} แต้ม</span>
                <span className="text-[10px] text-white/90">{foul.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Input */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>หรือระบุแต้มฟาวล์อื่นๆ:</span>
            <span className="text-emerald-400 font-mono">เพิ่มให้ {recipientName}</span>
          </div>

          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max="147"
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              placeholder="ใส่จำนวนแต้ม..."
              className="flex-1 bg-slate-900 border-2 border-slate-700 focus:border-rose-400 rounded-xl px-4 py-2 text-white font-mono font-black text-xl text-center outline-none"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm cursor-pointer shadow-md active:scale-95 border border-emerald-400"
            >
              ✓ ยืนยัน
            </button>
          </div>
        </div>

        {/* Pass turn option */}
        <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={switchStriker}
              onChange={(e) => setSwitchStriker(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-slate-300">สลับให้อีกฝ่ายขึ้นมาแทง (Pass turn)</span>
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

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};
