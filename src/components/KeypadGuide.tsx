import React, { useState, useEffect } from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface KeypadGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeypadGuide: React.FC<KeypadGuideProps> = ({ isOpen, onClose }) => {
  const [lastPressedKey, setLastPressedKey] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setLastPressedKey(`${e.key} (${e.code})`);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-2xl w-full p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-shrink-0">
          <div className="flex items-center space-x-2 text-amber-400">
            <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <h3 className="text-sm sm:text-lg font-black text-white">ผังปุ่มกด Wireless Keypad (22 ปุ่ม)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & Live Key Tester */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">วางข้างโต๊ะสนุกเกอร์ ควบคุมแต้มได้ 100% โดยไม่ต้องแตะหน้าจอ</span>
          </div>
          {lastPressedKey && (
            <div className="text-[10px] sm:text-xs text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
              ปุ่มที่กดล่าสุด: <strong className="text-white">{lastPressedKey}</strong>
            </div>
          )}
        </div>

        {/* Visual 22-Keypad Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-4 max-w-md mx-auto shadow-inner">
            
            {/* Row 1: NmLk | = | Clear | Backspace */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-slate-300">NmLk</span>
                <span className="block text-[8px] sm:text-[9px] text-amber-300 font-bold">คู่มือ</span>
              </div>

              <div className="bg-purple-950/80 border border-purple-700/80 rounded-lg p-1 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-purple-300">=</span>
                <span className="block text-[8px] sm:text-[9px] text-purple-400 font-bold">จบเฟรม</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-slate-300">Clear</span>
                <span className="block text-[8px] sm:text-[9px] text-slate-400 font-bold">ยกเลิก</span>
              </div>

              <div className="bg-amber-950/90 border-2 border-amber-500 rounded-lg p-1 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-amber-300">⌫ (BS)</span>
                <span className="block text-[8px] sm:text-[9px] text-amber-200 font-black">ย้อนกลับ Undo</span>
              </div>
            </div>

            {/* Main Keypad Area: 4 columns x 5 rows */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              
              {/* Row 2 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-slate-300">Tab</span>
                <span className="block text-[8px] sm:text-[9px] text-teal-400 font-bold">สลับคน</span>
              </div>

              {/* Slash (/) = จบเฟรม */}
              <div className="bg-purple-950/90 border-2 border-purple-500 rounded-lg p-1.5 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-purple-200">/</span>
                <span className="block text-[8px] sm:text-[9px] text-purple-300 font-black">จบเฟรม</span>
              </div>

              <div className="bg-amber-950/80 border border-amber-700/80 rounded-lg p-1.5 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-amber-300">*</span>
                <span className="block text-[8px] sm:text-[9px] text-amber-300 font-bold">ย้อนกลับ Undo</span>
              </div>

              <div className="bg-rose-950/90 border border-rose-600 rounded-lg p-1.5 text-center shadow">
                <span className="block text-[10px] sm:text-xs font-mono font-black text-rose-300">-</span>
                <span className="block text-[8px] sm:text-[9px] text-rose-300 font-bold">โหมดฟาวล์</span>
              </div>

              {/* Row 3 */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-white">7</span>
                <span className="block text-[8px] sm:text-[9px] text-zinc-300 font-bold">⚫ ดำ (7 แต้ม)</span>
              </div>

              <div className="bg-teal-950/60 border border-teal-800 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-teal-300">8</span>
                <span className="block text-[8px] sm:text-[9px] text-teal-300 font-bold">แทงกัน</span>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-slate-300">9</span>
                <span className="block text-[8px] sm:text-[9px] text-red-400 font-bold">แดงซ้อน</span>
              </div>

              {/* + key (Spans 2 rows vertically) */}
              <div className="row-span-2 bg-rose-950/90 border-2 border-rose-500 rounded-lg p-1.5 flex flex-col justify-center items-center text-center shadow">
                <span className="text-base sm:text-lg font-mono font-black text-rose-300">+</span>
                <span className="text-[8px] sm:text-[9px] text-rose-200 font-black">โหมดฟาวล์</span>
                <span className="text-[7px] text-rose-400">(4-7 แต้ม)</span>
              </div>

              {/* Row 4 */}
              <div className="bg-amber-950/60 border border-amber-800 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-amber-500">4</span>
                <span className="block text-[8px] sm:text-[9px] text-amber-500 font-bold">🟤 นต. (4 แต้ม)</span>
              </div>

              <div className="bg-blue-950/80 border border-blue-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-blue-400">5</span>
                <span className="block text-[8px] sm:text-[9px] text-blue-400 font-bold">🔵 น้ำเงิน (5 แต้ม)</span>
              </div>

              <div className="bg-pink-950/80 border border-pink-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-pink-400">6</span>
                <span className="block text-[8px] sm:text-[9px] text-pink-400 font-bold">🌸 ชมพู (6 แต้ม)</span>
              </div>

              {/* Row 5 */}
              <div className="bg-red-950/80 border border-red-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-red-400">1</span>
                <span className="block text-[8px] sm:text-[9px] text-red-400 font-bold">🔴 แดง (1 แต้ม)</span>
              </div>

              <div className="bg-yellow-950/80 border border-yellow-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-yellow-300">2</span>
                <span className="block text-[8px] sm:text-[9px] text-yellow-300 font-bold">🟡 เหลือง (2 แต้ม)</span>
              </div>

              <div className="bg-emerald-950/80 border border-emerald-700 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-emerald-400">3</span>
                <span className="block text-[8px] sm:text-[9px] text-emerald-400 font-bold">🟢 เขียว (3 แต้ม)</span>
              </div>

              {/* Enter key (Spans 2 rows vertically) = เปลี่ยนเทิร์น / เริ่มเฟรมใหม่ */}
              <div className="row-span-2 bg-gradient-to-b from-emerald-800 to-teal-900 border-2 border-emerald-400 rounded-lg p-1.5 flex flex-col justify-center items-center text-center shadow">
                <span className="text-xs sm:text-sm font-mono font-black text-emerald-200">Enter</span>
                <span className="text-[8px] sm:text-[9px] text-emerald-200 font-black mt-0.5">เปลี่ยนเทิร์น</span>
                <span className="text-[7px] text-emerald-300 font-bold">เริ่มเฟรมใหม่</span>
              </div>

              {/* Row 6: 0 (Spans 2 cols horizontally) & . */}
              <div className="col-span-2 bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex items-center justify-between px-3 shadow">
                <span className="text-xs sm:text-sm font-mono font-black text-slate-400">0 (Ins)</span>
                <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold">-</span>
              </div>

              {/* . (Del) = ยกเลิก */}
              <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-1.5 text-center shadow">
                <span className="block text-xs sm:text-sm font-mono font-black text-amber-300">. (Del)</span>
                <span className="block text-[8px] sm:text-[9px] text-amber-300 font-black">ยกเลิก / ปิด</span>
              </div>

            </div>

          </div>

          {/* Quick Summary Table */}
          <div className="mt-3 bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 max-w-md mx-auto text-[11px] space-y-1.5">
            <div className="text-amber-400 font-bold text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>📋 สรุปหน้าที่ของปุ่มกด Wireless Keypad</span>
              <span className="text-[10px] text-emerald-400">v3.8.8</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
              <div><strong className="text-white font-mono bg-slate-800 px-1 py-0.2 rounded mr-1">1 - 7</strong> แต้มตบลูกสี (1-7)</div>
              <div><strong className="text-emerald-300 font-mono bg-emerald-950 border border-emerald-800 px-1 py-0.2 rounded mr-1">Enter</strong> เปลี่ยนเทิร์น / เริ่มเฟรมใหม่</div>
              <div><strong className="text-amber-300 font-mono bg-slate-800 px-1 py-0.2 rounded mr-1">. (Del)</strong> ยกเลิก / ปิดหน้าต่าง</div>
              <div><strong className="text-amber-300 font-mono bg-amber-950 border border-amber-800 px-1 py-0.2 rounded mr-1">⌫ (BS)</strong> ย้อนกลับ (Undo)</div>
              <div><strong className="text-purple-300 font-mono bg-purple-950 border border-purple-800 px-1 py-0.2 rounded mr-1">/ หรือ =</strong> จบเฟรม</div>
              <div><strong className="text-rose-300 font-mono bg-rose-950 border border-rose-800 px-1 py-0.2 rounded mr-1">- หรือ +</strong> โหมดฟาวล์ (เลือก 4-7)</div>
              <div><strong className="text-teal-300 font-mono bg-teal-950 border border-teal-800 px-1 py-0.2 rounded mr-1">8</strong> แทงกัน (Safety)</div>
              <div><strong className="text-red-400 font-mono bg-slate-800 px-1 py-0.2 rounded mr-1">9</strong> ตบแดงซ้อน (+1)</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-1 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
          >
            เข้าใจแล้ว พร้อมใช้งาน
          </button>
        </div>

      </div>
    </div>
  );
};
