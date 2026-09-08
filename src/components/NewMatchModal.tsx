import React, { useState } from 'react';
import { GameMode, MatchLengthType, ElectricConfig } from '../types/snooker';
import { Trophy, X, Play, Infinity as InfinityIcon, Sparkles, Zap, Percent } from 'lucide-react';
import { DEFAULT_ELECTRIC_CONFIG } from '../utils/snookerRules';

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
    electricConfig?: ElectricConfig;
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

  // Electric Snooker / Ball Count Mode State
  const [countMode, setCountMode] = useState<'ball-only' | 'ball-plus-ga'>('ball-only');
  const [yellowPoints, setYellowPoints] = useState<number>(2);
  const [blackPoints, setBlackPoints] = useState<number>(4);
  const [lastBlackPoints, setLastBlackPoints] = useState<number>(7);
  const [foulPenalty, setFoulPenalty] = useState<number>(4);
  const [handicapEnabled, setHandicapEnabled] = useState<boolean>(false);
  const [handicapGiverIndex, setHandicapGiverIndex] = useState<0 | 1>(0);
  const [handicapGiverRatio, setHandicapGiverRatio] = useState<number>(80);
  const [customRatioInput, setCustomRatioInput] = useState<string>('80');

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

    let electricConfig: ElectricConfig | undefined = undefined;
    if (gameMode === 'electric-count') {
      electricConfig = {
        countMode,
        redPoints: 1,
        yellowPoints,
        greenPoints: 1,
        brownPoints: 1,
        bluePoints: 1,
        pinkPoints: 1,
        blackPoints,
        lastBlackPoints,
        foulPenalty,
        handicapEnabled,
        handicapGiverIndex,
        handicapGiverRatio: Math.max(1, Math.min(100, handicapGiverRatio)),
        handicapReceiverRatio: 100,
      };
    }

    onStartMatch({
      player1Name: player1Name.trim() || 'ผู้เล่น 1',
      player2Name: player2Name.trim() || 'ผู้เล่น 2',
      gameMode,
      matchLengthType,
      bestOfFrames: finalBestOf,
      title: title.trim() || (matchLengthType === 'unlimited' ? 'เล่นซ้อม/ไปเรื่อยๆ' : `Best of ${finalBestOf}`),
      date,
      electricConfig,
    });
    onClose();
  };

  const p1Display = player1Name.trim() || 'ผู้เล่น 1';
  const p2Display = player2Name.trim() || 'ผู้เล่น 2';
  const giverName = handicapGiverIndex === 0 ? p1Display : p2Display;
  const receiverName = handicapGiverIndex === 0 ? p2Display : p1Display;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 text-amber-400">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-base sm:text-lg font-black text-white">ตั้งค่าแมตช์ใหม่ (New Match Setup)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          {/* Format Selection: 15 Reds vs 6 Reds vs Snooker Ga vs Electric Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">1. เลือกรูปแบบกติกา</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setGameMode('15-reds')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === '15-reds'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-black">🔴 15 แดง</span>
                <span className="text-[9px] opacity-80">มาตรฐานสากล</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('6-reds')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === '6-reds'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-black">🔴 6 แดง</span>
                <span className="text-[9px] opacity-80">Six-reds</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('snooker-ga')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === 'snooker-ga'
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/40 font-bold ring-2 ring-amber-400/50'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-black text-amber-200">🎯 สนุ๊กกา</span>
                <span className="text-[9px] opacity-90 text-amber-300">6 แดง + กา</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('electric-count')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === 'electric-count'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/40 font-bold ring-2 ring-cyan-400/50'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-0.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-xs font-black text-cyan-100">สนุ๊กไฟฟ้า</span>
                </div>
                <span className="text-[9px] opacity-90 text-cyan-200">นับลูก / แต้มต่อ</span>
              </button>
            </div>
          </div>

          {/* Electric Snooker / Ball Count Configuration Box */}
          {gameMode === 'electric-count' && (
            <div className="bg-cyan-950/40 border border-cyan-700/60 rounded-xl p-3 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-cyan-300 border-b border-cyan-800/60 pb-1.5">
                <div className="flex items-center space-x-1.5 font-black text-xs">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>ตั้งค่าสนุ๊กไฟฟ้า / นับเป็นลูก (Electric Snooker Settings)</span>
                </div>
              </div>

              {/* Sub-Option A: Count Mode (Ball-only vs Ball+Ga) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-cyan-200">ระบบการนับลูก</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCountMode('ball-only')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      countMode === 'ball-only'
                        ? 'bg-cyan-600 border-cyan-300 text-white font-black shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-black">🔢 นับเป็นลูกล้วน</div>
                    <div className="text-[9px] opacity-80">ตบเท่าไหร่นับเท่านั้น (ลูกละ 1 แต้ม)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCountMode('ball-plus-ga')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      countMode === 'ball-plus-ga'
                        ? 'bg-cyan-600 border-cyan-300 text-white font-black shadow'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-black">🎯 นับลูกผสมกา</div>
                    <div className="text-[9px] opacity-80">แดงนับ 1, ลูกสีหลุมกานับแต้มพิเศษ</div>
                  </button>
                </div>
              </div>

              {/* Sub-Option B: Custom Points (Yellow, Black, Last Black, Foul) */}
              <div className="space-y-2 pt-1 border-t border-cyan-900/50">
                <label className="text-[11px] font-bold text-cyan-200">กำหนดแต้มลูกพิเศษ & ฟาวล์</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Yellow Points */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 space-y-1">
                    <span className="text-[10px] text-yellow-300 font-bold block">🟡 แต้มลูกเหลือง</span>
                    <div className="flex gap-1">
                      {[1, 2, 4].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setYellowPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-black text-xs cursor-pointer ${
                            yellowPoints === pts
                              ? 'bg-yellow-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Black Points */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 space-y-1">
                    <span className="text-[10px] text-slate-300 font-bold block">⚫ แต้มลูกดำระหว่างเกม</span>
                    <div className="flex gap-1">
                      {[1, 2, 4, 7].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setBlackPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-black text-xs cursor-pointer ${
                            blackPoints === pts
                              ? 'bg-slate-200 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Last Black Points */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 space-y-1">
                    <span className="text-[10px] text-amber-300 font-bold block">🏆 แต้มลูกดำสุดท้าย</span>
                    <div className="flex gap-1">
                      {[2, 4, 7, 10].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setLastBlackPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-black text-xs cursor-pointer ${
                            lastBlackPoints === pts
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Foul Penalty */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2 space-y-1">
                    <span className="text-[10px] text-rose-300 font-bold block">⚠️ แต้มเสียฟาวล์</span>
                    <div className="flex gap-1">
                      {[1, 4, 7].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setFoulPenalty(pts)}
                          className={`flex-1 py-1 rounded font-mono font-black text-xs cursor-pointer ${
                            foulPenalty === pts
                              ? 'bg-rose-500 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Option C: Handicap Rate System (เช่น 100 ต่อ 80) */}
              <div className="space-y-2 pt-1 border-t border-cyan-900/50">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-cyan-200 flex items-center space-x-1">
                    <Percent className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ระบบแต้มต่อ (Handicap Rate)</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={handicapEnabled}
                      onChange={(e) => setHandicapEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                {handicapEnabled && (
                  <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 space-y-2 animate-fadeIn">
                    {/* Choose Handicap Giver */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-300 font-bold block">1. เลือกผู้ต่อ (Handicap Giver)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHandicapGiverIndex(0)}
                          className={`p-1.5 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                            handicapGiverIndex === 0
                              ? 'bg-cyan-600 border-cyan-300 text-white shadow'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {p1Display} (ผู้ต่อ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHandicapGiverIndex(1)}
                          className={`p-1.5 rounded-lg border text-center font-bold text-xs cursor-pointer ${
                            handicapGiverIndex === 1
                              ? 'bg-cyan-600 border-cyan-300 text-white shadow'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {p2Display} (ผู้ต่อ)
                        </button>
                      </div>
                    </div>

                    {/* Choose Handicap Ratio */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-300 font-bold block">2. เลือกอัตราต่อ (เช่น 100 ต่อ 80)</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[90, 80, 70, 50].map((ratio) => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => {
                              setHandicapGiverRatio(ratio);
                              setCustomRatioInput(ratio.toString());
                            }}
                            className={`p-1.5 rounded-lg border text-center font-mono font-bold text-xs cursor-pointer ${
                              handicapGiverRatio === ratio
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            100:{ratio}
                          </button>
                        ))}
                      </div>

                      {/* Custom Ratio */}
                      <div className="flex items-center space-x-2 pt-1 text-xs">
                        <span className="text-slate-400">หรือกำหนดอัตรา: 100 ต่อ</span>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={customRatioInput}
                          onChange={(e) => {
                            setCustomRatioInput(e.target.value);
                            const val = parseInt(e.target.value, 10);
                            if (val > 0) setHandicapGiverRatio(val);
                          }}
                          className="w-16 bg-slate-950 border border-slate-700 rounded-md px-2 py-0.5 text-center font-mono font-bold text-cyan-300 outline-none focus:border-cyan-500"
                        />
                        <span className="text-slate-400">แต้ม</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-cyan-950/60 border border-cyan-800/60 rounded-md p-1.5 text-[10px] text-cyan-200">
                      💡 <strong>สรุปแต้มต่อ:</strong> {giverName} แทงได้ 100 แต้ม จะได้รับจริง <strong>{handicapGiverRatio} แต้ม (x{handicapGiverRatio / 100})</strong> ส่วน {receiverName} ได้รับเต็ม 100%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
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
              <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl text-xs text-purple-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>โหมดเล่นไปเรื่อยๆ:</strong> ระบบจะนับเฟรมสะสมไปเรื่อยๆ (เช่น 1, 2, 3, ...) โดยไม่มีการตัดจบเกมอัตโนมัติ เมื่อต้องการเลิกเล่นสามารถกดปุ่ม <strong>"บันทึกและจบแมตช์"</strong> ได้ตลอดเวลา
                </span>
              </div>
            )}
          </div>

          {/* Players Names */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">3. รายชื่อผู้เล่น</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <div className="pt-1.5">
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
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
