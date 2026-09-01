import React from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface KeypadGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeypadGuide: React.FC<KeypadGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const mappings = [
    { key: '1 / Numpad 1', action: 'แทงลูกแดง (Red - 1 แต้ม)', color: 'text-red-400' },
    { key: '2 / Numpad 2', action: 'แทงลูกเหลือง (Yellow - 2 แต้ม)', color: 'text-yellow-400' },
    { key: '3 / Numpad 3', action: 'แทงลูกเขียว (Green - 3 แต้ม)', color: 'text-emerald-400' },
    { key: '4 / Numpad 4', action: 'แทงลูกน้ำตาล (Brown - 4 แต้ม)', color: 'text-amber-600' },
    { key: '5 / Numpad 5', action: 'แทงลูกน้ำเงิน (Blue - 5 แต้ม)', color: 'text-blue-400' },
    { key: '6 / Numpad 6', action: 'แทงลูกชมพู (Pink - 6 แต้ม)', color: 'text-pink-400' },
    { key: '7 / Numpad 7', action: 'แทงลูกดำ (Black - 7 แต้ม)', color: 'text-slate-300' },
    { key: '+ (Plus)', action: 'เปิดเมนูฟาวล์ (Foul Menu)', color: 'text-rose-400 font-bold' },
    { key: '. / Del / Space', action: 'จบเทิร์น / แทงพลาด (Miss / End Turn)', color: 'text-amber-300 font-bold' },
    { key: '* / Ctrl+Z', action: 'ย้อนกลับคะแนนล่าสุด (Undo)', color: 'text-sky-400 font-bold' },
    { key: 'S / s', action: 'จบเทิร์นแบบกัน (Safety)', color: 'text-teal-400' },
    { key: 'F / f', action: 'เปิด/ปิด สิทธิ์ฟรีบอล (Free Ball)', color: 'text-purple-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Keyboard className="w-6 h-6" />
            <h3 className="text-lg font-black text-white">ปุ่มลัดคีย์บอร์ด & Wireless Numpad</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-700/50 p-3 rounded-xl text-xs text-emerald-200 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            ออกแบบมาสำหรับ <strong>แป้นตัวเลขไร้สาย (Wireless Numpad)</strong> วางข้างโต๊ะสนุ๊กเกอร์ กดแต้มได้สะดวกรวดเร็วโดยไม่ต้องแตะหน้าจอ!
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5">
          {mappings.map((m, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm font-semibold"
            >
              <span className="font-mono bg-slate-800 text-amber-300 px-2 py-1 rounded border border-slate-700 font-bold">
                {m.key}
              </span>
              <span className={`text-right ${m.color}`}>
                {m.action}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            เข้าใจแล้ว พร้อมใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};
