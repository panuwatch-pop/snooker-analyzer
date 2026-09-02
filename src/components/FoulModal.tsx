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
}) => {
  const [recipientIndex, setRecipientIndex] = useState<0 | 1>(activeStrikerIndex === 0 ? 1 : 0);
  const [customPoints, setCustomPoints] = useState<string>('4');
  const [isFreeBall, setIsFreeBall] = useState<boolean>(false);
  const [switchStriker, setSwitchStriker] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setRecipientIndex(activeStrikerIndex === 0 ? 1 : 0);
    }
  }, [isOpen, activeStrikerIndex]);

  if (!isOpen) return null;

  const recipientName = recipientIndex === 0 ? (player1Name || 'ผู้เล่น 1') : (player2Name || 'ผู้เล่น 2');
  const foulPlayerName = recipientIndex === 1 ? (player1Name || 'ผู้เล่น 1') : (player2Name || 'ผู้เล่น 2');

  const handleApplyFoul = (points: number) => {
    onClose();
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
    { pts: 4, label: 'ทั่วไป / แดง / ขาว', bg: '#e11d48', border: '#fb7185' },
    { pts: 5, label: 'ลูกน้ำเงิน (Blue)', bg: '#2563eb', border: '#60a5fa' },
    { pts: 6, label: 'ลูกชมพู (Pink)', bg: '#db2777', border: '#f472b6' },
    { pts: 7, label: 'ลูกดำ (Black)', bg: '#334155', border: '#94a3b8' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div
        className="border-2 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4"
        style={{ backgroundColor: '#0f172a', borderColor: '#f43f5e', color: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: '#334155' }}>
          <div className="flex items-center space-x-2 font-black text-lg" style={{ color: '#fb7185' }}>
            <AlertTriangle className="w-6 h-6" style={{ color: '#fbbf24' }} />
            <span style={{ color: '#ffffff' }}>เสียฟาวล์ (Foul)</span>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full shadow"
              style={{ backgroundColor: '#fbbf24', color: '#0f172a' }}
            >
              v2.5.0 LIVE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg cursor-pointer"
            style={{ color: '#94a3b8', backgroundColor: '#1e293b' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recipient / Fouler Toggle */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold block" style={{ color: '#cbd5e1' }}>
            เลือกผู้ทำฟาวล์ ➡️ ผู้ได้รับแต้ม:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRecipientIndex(1)}
              className="p-3 rounded-xl border-2 text-left cursor-pointer transition-all"
              style={{
                backgroundColor: recipientIndex === 1 ? '#4c0519' : '#020617',
                borderColor: recipientIndex === 1 ? '#f43f5e' : '#334155',
                color: '#ffffff',
              }}
            >
              <div className="text-xs font-bold" style={{ color: '#fda4af' }}>
                ❌ {player1Name || 'ผู้เล่น 1'} ฟาวล์
              </div>
              <div className="text-sm font-black mt-1" style={{ color: '#4ade80' }}>
                ➡️ ให้ {player2Name || 'ผู้เล่น 2'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRecipientIndex(0)}
              className="p-3 rounded-xl border-2 text-left cursor-pointer transition-all"
              style={{
                backgroundColor: recipientIndex === 0 ? '#4c0519' : '#020617',
                borderColor: recipientIndex === 0 ? '#f43f5e' : '#334155',
                color: '#ffffff',
              }}
            >
              <div className="text-xs font-bold" style={{ color: '#fda4af' }}>
                ❌ {player2Name || 'ผู้เล่น 2'} ฟาวล์
              </div>
              <div className="text-sm font-black mt-1" style={{ color: '#4ade80' }}>
                ➡️ ให้ {player1Name || 'ผู้เล่น 1'}
              </div>
            </button>
          </div>
        </div>

        {/* Point Buttons (4, 5, 6, 7) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#fde047' }}>
            <span>แตะแต้มที่ต้องการ (เพิ่มคะแนนทันที):</span>
            <span style={{ color: '#4ade80' }}>เพิ่มให้: {recipientName}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {commonFouls.map((foul) => (
              <button
                key={foul.pts}
                type="button"
                onClick={() => handleApplyFoul(foul.pts)}
                className="py-4 px-3 rounded-xl font-bold border-2 shadow-lg active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
                style={{
                  backgroundColor: foul.bg,
                  borderColor: foul.border,
                  color: '#ffffff',
                }}
              >
                <span className="font-mono font-black text-3xl leading-none" style={{ color: '#ffffff' }}>
                  +{foul.pts}
                </span>
                <span className="text-xs font-black mt-1" style={{ color: '#ffffff' }}>
                  {foul.pts} แต้ม
                </span>
                <span className="text-[10px]" style={{ color: '#f1f5f9' }}>
                  {foul.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Point Input */}
        <div className="p-3 rounded-xl border space-y-2" style={{ backgroundColor: '#020617', borderColor: '#334155' }}>
          <div className="flex items-center justify-between text-xs font-bold" style={{ color: '#cbd5e1' }}>
            <span>หรือระบุแต้มฟาวล์อื่นๆ:</span>
            <span style={{ color: '#4ade80' }}>เพิ่มให้ {recipientName}</span>
          </div>

          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max="147"
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              placeholder="ใส่จำนวนแต้ม..."
              className="flex-1 border-2 rounded-xl px-4 py-2 font-mono font-black text-xl text-center outline-none"
              style={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#ffffff' }}
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-5 py-2 rounded-xl font-black text-sm cursor-pointer shadow-md active:scale-95 border"
              style={{ backgroundColor: '#059669', borderColor: '#34d399', color: '#ffffff' }}
            >
              ✓ ยืนยัน
            </button>
          </div>
        </div>

        {/* Pass turn option */}
        <div className="space-y-1.5 p-2.5 rounded-xl border text-xs" style={{ backgroundColor: '#020617', borderColor: '#334155' }}>
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={switchStriker}
              onChange={(e) => setSwitchStriker(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-semibold" style={{ color: '#e2e8f0' }}>
              สลับให้อีกฝ่ายขึ้นมาแทง (Pass turn)
            </span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFreeBall}
              onChange={(e) => setIsFreeBall(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-semibold flex items-center space-x-1" style={{ color: '#fde047' }}>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>สนุ๊กเกอร์ขัง / เกิดฟรีบอล (Award Free Ball)</span>
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer border"
          style={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#ffffff' }}
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
};
