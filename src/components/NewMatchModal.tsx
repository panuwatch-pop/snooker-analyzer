import React, { useState } from 'react';
import { GameMode, MatchLengthType } from '../types/snooker';
import { Trophy, X, Play, Infinity as InfinityIcon, Sparkles } from 'lucide-react';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (config: {
    player1Name: string;
    player2Name: string;
    gameMode: GameMode;
    matchLengthType: MatchLengthType;
    bestOfFrames: number;
    title: string;
    date: string;
  }) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [player1Name, setPlayer1Name] = useState<string>('ผู้เล่น 1');
  const [player2Name, setPlayer2Name] = useState<string>('ผู้เล่น 2');
  const [gameMode, setGameMode] = useState<GameMode>('15-reds');
  const [matchLengthType, setMatchLengthType] = useState<MatchLengthType>('best-of');
  const [bestOfFrames, setBestOfFrames] = useState<number>(5);
  const [customFramesInput, setCustomFramesInput] = useState<string>('5');
  const [title, setTitle] = useState<string>('แมตช์กระชับมิตร');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const quickBestOfOptions = [
    { value: 1, label: '1 เฟรม', desc: 'Single Frame' },
    { value: 3, label: 'Best of 3', desc: 'ชนะ 2 เฟรม' },
    { value: 5, label: 'Best of 5', desc: 'ชนะ 3 เฟรม' },
    { value: 7, label: 'Best of 7', desc: 'ชนะ 4 เฟรม' },
    { value: 9, label: 'Best of 9', desc: 'ชนะ 5 เฟรม' },
    { value: 11, label: 'Best of 11', desc: 'ชนะ 6 เฟรม' },
    { value: 17, label: 'Best of 17', desc: 'ชนะ 9 เฟรม' },
    { value: 19, label: 'Best of 19', desc: 'ชนะ 10 เฟรม' },
    { value: 35, label: 'Best of 35', desc: 'ชิงแชมป์โลก' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBestOf = matchLengthType === 'unlimited' ? 0 : Math.max(1, bestOfFrames);

    onStartMatch({
      player1Name: player1Name.trim() || 'ผู้เล่น 1',
      player2Name: player2Name.trim() || 'ผู้เล่น 2',
      gameMode,
      matchLengthType,
      bestOfFrames: finalBestOf,
      title: title.trim() || (matchLengthType === 'unlimited' ? 'เล่นซ้อม/ไปเรื่อยๆ' : `Best of ${finalBestOf}`),
      date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Trophy className="w-6 h-6" />
            <h3 className="text-lg font-black text-white">ตั้งค่าแมตช์ใหม่ (New Match Setup)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Format Selection: 15 Reds vs 6 Reds */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">1. เลือกประเภทลูก</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGameMode('15-reds')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === '15-reds'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-sm sm:text-base font-black">🔴 15 แดง (Standard)</span>
                <span className="text-[10px] opacity-80">Max Break 147</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('6-reds')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === '6-reds'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-sm sm:text-base font-black">🔴 6 แดง (Six-red)</span>
                <span className="text-[10px] opacity-80">Max Break 75</span>
              </button>
            </div>
          </div>

          {/* Match Length Mode: Best of vs Unlimited */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">2. เลือกความยาวของเกม / รูปแบบการแข่ง</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMatchLengthType('best-of')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  matchLengthType === 'best-of'
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-400 text-white shadow-md font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-black">แข่งแบบนับเฟรม (Best of)</span>
                </div>
                <span className="text-[10px] opacity-90 mt-0.5">ชนะครบตามที่ตั้งไว้จบแมตช์</span>
              </button>

              <button
                type="button"
                onClick={() => setMatchLengthType('unlimited')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  matchLengthType === 'unlimited'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white shadow-md font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <InfinityIcon className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-black">เล่นไปเรื่อยๆ (Unlimited)</span>
                </div>
                <span className="text-[10px] opacity-90 mt-0.5">ไม่จำกัดเฟรม / เล่นซ้อมทั้งวัน</span>
              </button>
            </div>

            {/* If Best of selected: choose Quick Frame Chips */}
            {matchLengthType === 'best-of' ? (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>เลือกจำนวนเฟรม (ชนะ {Math.ceil(bestOfFrames / 2)} ใน {bestOfFrames} เฟรม):</span>
                  <span className="text-amber-400 font-mono font-bold">Best of {bestOfFrames}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {quickBestOfOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setBestOfFrames(opt.value);
                        setCustomFramesInput(opt.value.toString());
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        bestOfFrames === opt.value
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 font-semibold'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[9px] opacity-80 truncate">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Frames Input */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">หรือกำหนดเอง:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={customFramesInput}
                    onChange={(e) => {
                      setCustomFramesInput(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (val > 0) setBestOfFrames(val);
                    }}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-300 outline-none focus:border-amber-500"
                    placeholder="เช่น 13"
                  />
                  <span className="text-slate-400">เฟรม (ชนะ {Math.ceil(bestOfFrames / 2)} เฟรม)</span>
                </div>
              </div>
            ) : (
              <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded-xl text-xs text-purple-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>โหมดเล่นไปเรื่อยๆ:</strong> ระบบจะนับเฟรมสะสมไปเรื่อยๆ (เช่น 1, 2, 3, ...) โดยไม่มีการตัดจบเกมอัตโนมัติ เหมาะสำหรับการซ้อมหรือเล่นกระชับมิตรทั้งวัน เมื่อต้องการเลิกเล่นสามารถกดปุ่ม <strong>"บันทึกและจบแมตช์"</strong> ได้ตลอดเวลา
                </span>
              </div>
            )}
          </div>

          {/* Players Names */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">3. รายชื่อผู้เล่น</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 font-semibold"
                placeholder="ผู้เล่น 1"
              />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 font-semibold"
                placeholder="ผู้เล่น 2"
              />
            </div>
          </div>

          {/* Match Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">ชื่อรายการ / หมายเหตุ</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 font-semibold"
                placeholder="เช่น ซ้อมประจำวัน"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">วันที่เล่น</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 font-semibold cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <Play className="w-4 h-4" />
              <span>เริ่มการแข่งขัน (Start Game)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
