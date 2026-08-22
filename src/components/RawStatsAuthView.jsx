import React, { useState } from 'react';
import { Lock, Unlock, Key, Calculator, Table, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, Zap, RefreshCw } from 'lucide-react';

const getDisplayName = (name) => {
  if (!name) return 'ผู้เล่น';
  return name.replace(/\s*\(.*?\)/g, '').trim();
};

export function RawStatsAuthView({ players, p1Stats, p2Stats }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const CORRECT_PASSWORD = 'Scorer@Kornsiri1234';

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      setErrorMessage('');
    } else {
      setErrorMessage('❌ รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setErrorMessage('');
  };

  const p1 = players[0];
  const p2 = players[1];

  // 🔒 หน้าต่างกรอกรหัสผ่านเพื่อเข้าถึงข้อมูลดิบ (Password Gate)
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-6 p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            เข้าสู่ระบบสถิติคัดกรองข้อมูลดิบ
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            กรุณากรอกรหัสผ่านเพื่อเข้าดูที่มาของการคิดคำนวณและข้อมูลดิบย้อนหลัง
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>รหัสผ่านเข้าถึงข้อมูล (Password):</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full bg-slate-950 text-amber-300 font-mono text-sm px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none pr-10 shadow-inner"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-red-400 font-semibold bg-red-950/80 border border-red-800 p-2 rounded-lg text-center animate-shake">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Unlock className="w-4 h-4" />
            <span>ปลดล็อกเข้าดูข้อมูลดิบ</span>
          </button>
        </form>

        <div className="text-[10px] text-center text-slate-500 font-mono">
          🔒 Secured Area • Protected by Authorization
        </div>
      </div>
    );
  }

  // 🔓 แสดงข้อมูลดิบและสูตรคำนวณทั้งหมดเมื่อปลดล็อกรหัสผ่านสำเร็จ
  return (
    <div className="space-y-4 animate-in fade-in pb-8 max-w-7xl mx-auto">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
              <span>รายงานวิเคราะห์คะแนนดิบ & วิธีการคิดสถิติ</span>
              <span className="bg-emerald-950 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded border border-emerald-800 font-mono font-bold">
                UNLOCKED
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              แสดงตัวแปรทั้งหมดเพื่อตรวจสอบความถูกต้องของระบบและสูตรคณิตศาสตร์
            </p>
          </div>
        </div>

        <button
          onClick={handleLock}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 active:scale-95 transition-all shadow"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>ล็อกสิทธิ์</span>
        </button>
      </div>

      {/* 📊 1. ตารางแสดงตัวแปรข้อมูลดิบ (Raw Data Table) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-md space-y-3">
        <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Table className="w-4 h-4 text-amber-400" />
          <span>ตารางตัวแปรดิบสะสม (Raw Match Data Variables)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <th className="p-2">ตัวแปรข้อมูล (Variable Name)</th>
                <th className="p-2 text-sky-400 text-center">{getDisplayName(p1.name)} (P1)</th>
                <th className="p-2 text-amber-400 text-center">{getDisplayName(p2.name)} (P2)</th>
                <th className="p-2 text-slate-500 hidden sm:table-cell">คำอธิบายทางเทคนิค</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">1. ลูกที่ตบลงสำเร็จ (successfulPots)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.successfulPots} ลูก</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.successfulPots} ลูก</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">นับจากการกดปุ่มตบลูกสี 1-7</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">2. ลูกที่ตั้งใจตบทั้งหมด (attemptedPots)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.attemptedPots} ครั้ง</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.attemptedPots} ครั้ง</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">รวมช็อตตบสำเร็จ + แทงพลาด + เปลี่ยนฝั่ง</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">3. เวลารวมแทงบนโต๊ะ (totalTimeOnTable)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.totalTimeOnTable} วินาที</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.totalTimeOnTable} วินาที</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">เวลารวมของนาฬิกาช็อตทุกไม้ที่อยู่บนโต๊ะ</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">4. จำนวนช็อตออกคิวทั้งหมด (totalShots)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.totalShots} ช็อต</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.totalShots} ช็อต</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">จำนวนครั้งการออกคิวทั้งหมดที่บันทึก</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">5. ช็อตแทงกันสำเร็จ (successfulSafeties)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.successfulSafeties} ช็อต</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.successfulSafeties} ช็อต</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">จำนวนช็อตกันที่คู่แข่งแทงไม่ลงหรือฟาวล์</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">6. ช็อตแทงกันทั้งหมด (totalSafeties)</td>
                <td className="p-2 text-center font-bold text-sky-300">{p1.totalSafeties} ช็อต</td>
                <td className="p-2 text-center font-bold text-amber-300">{p2.totalSafeties} ช็อต</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">จำนวนครั้งที่กดปุ่ม 'แทงกัน' ทั้งหมด</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">7. ฟาวล์ที่ทำเสีย (foulsCommitted)</td>
                <td className="p-2 text-center font-bold text-red-400">{p1.foulsCommitted} ครั้ง</td>
                <td className="p-2 text-center font-bold text-red-400">{p2.foulsCommitted} ครั้ง</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">จำนวนครั้งที่ทำฟาวล์เสียแต้ม</td>
              </tr>
              <tr className="hover:bg-slate-950/40">
                <td className="p-2 font-semibold">8. แต้มฟาวล์ที่เสียให้คู่แข่ง (foulPointsConceded)</td>
                <td className="p-2 text-center font-bold text-red-400">+{p1.foulPointsConceded} แต้ม</td>
                <td className="p-2 text-center font-bold text-red-400">+{p2.foulPointsConceded} แต้ม</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">แต้มฟาวล์ที่ถูกยกไปเพิ่มให้คู่แข่ง</td>
              </tr>
              <tr className="hover:bg-slate-950/40 bg-slate-950">
                <td className="p-2 font-semibold text-emerald-400">9. เบรกสูงสุดในแมตช์ (highestBreak)</td>
                <td className="p-2 text-center font-black text-sky-400">{p1.highestBreak} แต้ม</td>
                <td className="p-2 text-center font-black text-amber-400">{p2.highestBreak} แต้ม</td>
                <td className="p-2 text-slate-400 text-[10px] hidden sm:table-cell">แต้มเบรกต่อเนื่องสูงสุดในไม้เดียว</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧮 2. วิธีการคิดและแจกแจงสูตรคำนวณสด (Step-by-Step Formula Calculation Breakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Card 1: AST Formula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs border-b border-slate-800 pb-1.5">
            <Zap className="w-4 h-4" />
            <span>1. ความเร็วเฉลี่ย (AST - Average Shot Time)</span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-semibold text-[10px]">📐 สูตรคำนวณ:</div>
            <div className="text-sky-300 font-bold text-center">
              AST = เวลารวมบนโต๊ะ (วินาที) ÷ จำนวนช็อตออกคิวทั้งหมด
            </div>

            <div className="pt-1.5 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>{getDisplayName(p1.name)} (P1):</span>
                <span className="font-bold text-sky-400">{p1.totalTimeOnTable}s ÷ {p1.totalShots || 1} ช็อต = <strong className="text-white text-xs">{p1Stats.ast}s</strong></span>
              </div>
              <div className="flex justify-between">
                <span>{getDisplayName(p2.name)} (P2):</span>
                <span className="font-bold text-amber-400">{p2.totalTimeOnTable}s ÷ {p2.totalShots || 1} ช็อต = <strong className="text-white text-xs">{p2Stats.ast}s</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Pot Accuracy Formula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs border-b border-slate-800 pb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. ความแม่นยำ (Pot Accuracy %)</span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-semibold text-[10px]">📐 สูตรคำนวณ:</div>
            <div className="text-emerald-300 font-bold text-center">
              POT% = (ตบลงสำเร็จ ÷ ช็อตตั้งใจตบทั้งหมด) × 100
            </div>

            <div className="pt-1.5 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>{getDisplayName(p1.name)} (P1):</span>
                <span className="font-bold text-sky-400">({p1.successfulPots} ÷ {p1.attemptedPots || 1}) × 100 = <strong className="text-white text-xs">{p1Stats.potAccuracy}%</strong></span>
              </div>
              <div className="flex justify-between">
                <span>{getDisplayName(p2.name)} (P2):</span>
                <span className="font-bold text-amber-400">({p2.successfulPots} ÷ {p2.attemptedPots || 1}) × 100 = <strong className="text-white text-xs">{p2Stats.potAccuracy}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Safety Rate Formula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs border-b border-slate-800 pb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>3. อัตราการกันสำเร็จ (Safety Success %)</span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-slate-400 font-semibold text-[10px]">📐 สูตรคำนวณ:</div>
            <div className="text-amber-300 font-bold text-center">
              SAF% = (แทงกันสำเร็จ ÷ จำนวนช็อตกันทั้งหมด) × 100
            </div>

            <div className="pt-1.5 border-t border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>{getDisplayName(p1.name)} (P1):</span>
                <span className="font-bold text-sky-400">({p1.successfulSafeties} ÷ {p1.totalSafeties || 1}) × 100 = <strong className="text-white text-xs">{p1Stats.safetyRate}%</strong></span>
              </div>
              <div className="flex justify-between">
                <span>{getDisplayName(p2.name)} (P2):</span>
                <span className="font-bold text-amber-400">({p2.successfulSafeties} ÷ {p2.totalSafeties || 1}) × 100 = <strong className="text-white text-xs">{p2Stats.safetyRate}%</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
