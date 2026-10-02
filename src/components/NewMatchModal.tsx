import React, { useState } from 'react';
import { GameMode, MatchLengthType, ElectricConfig, ShootOutConfig } from '../types/snooker';
import { Trophy, X, Play, Infinity as InfinityIcon, Sparkles, Zap, Percent, Timer } from 'lucide-react';
import { DEFAULT_ELECTRIC_CONFIG, DEFAULT_SHOOT_OUT_CONFIG } from '../utils/snookerRules';

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
    shootOutConfig?: ShootOutConfig;
    player1HandicapPoints?: number;
    player2HandicapPoints?: number;
  }) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [player1Name, setPlayer1Name] = useState<string>('ผู้เล่น 1');
  const [player2Name, setPlayer2Name] = useState<string>('ผู้เล่น 2');
  const [player1HandicapPoints, setPlayer1HandicapPoints] = useState<number>(0);
  const [player2HandicapPoints, setPlayer2HandicapPoints] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>('15-reds');
  const [matchLengthType, setMatchLengthType] = useState<MatchLengthType>('best-of');
  const [bestOfFrames, setBestOfFrames] = useState<number>(5);
  const [customFramesInput, setCustomFramesInput] = useState<string>('5');
  const [title, setTitle] = useState<string>('แมตช์กระชับมิตร');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Electric Snooker / Ball Count Mode State
  const [countMode, setCountMode] = useState<'ball-only' | 'ball-plus-ga'>('ball-only');
  const [electricPlayers, setElectricPlayers] = useState<string[]>(['Pop', 'A', 'C']);
  const [targetGames, setTargetGames] = useState<number>(5);
  const [customTargetGamesInput, setCustomTargetGamesInput] = useState<string>('7');
  const [isCustomTargetGames, setIsCustomTargetGames] = useState<boolean>(false);
  const [feeBalls, setFeeBalls] = useState<BallColor[]>(['yellow', 'brown', 'black']);
  const [ballPoints, setBallPoints] = useState<number>(1);
  const [yellowPoints, setYellowPoints] = useState<number>(1);
  const [blackPoints, setBlackPoints] = useState<number>(2);
  const [lastBlackPoints, setLastBlackPoints] = useState<number>(4);
  const [foulPenalty, setFoulPenalty] = useState<number>(2);
  const [handicapEnabled, setHandicapEnabled] = useState<boolean>(false);
  const [handicapGiverIndex, setHandicapGiverIndex] = useState<0 | 1>(0);
  const [handicapGiverRatio, setHandicapGiverRatio] = useState<number>(80);
  const [customRatioInput, setCustomRatioInput] = useState<string>('80');
  const [presetNameInput, setPresetNameInput] = useState<string>('');
  const [presets, setPresets] = useState<{ name: string; config: any }[]>(() => {
    try {
      const saved = localStorage.getItem('electric_snooker_presets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { name: 'ก๊วนมาตรฐาน (เหลือง 1, ดำ 2, ดำท้าย 4)', config: { yellowPoints: 1, blackPoints: 2, lastBlackPoints: 4, foulPenalty: 2, feeBalls: ['yellow', 'brown', 'black'], ballPoints: 1 } },
      { name: 'ก๊วนเหลือง 2 แต้ม (ดำปกติ 2, ดำท้าย 4)', config: { yellowPoints: 2, blackPoints: 2, lastBlackPoints: 4, foulPenalty: 2, feeBalls: ['yellow', 'brown', 'black'], ballPoints: 1 } },
      { name: 'ก๊วนลูกดำดุ (ดำปกติ 2, ดำท้าย 7)', config: { yellowPoints: 1, blackPoints: 2, lastBlackPoints: 7, foulPenalty: 2, feeBalls: ['yellow', 'brown', 'black'], ballPoints: 1 } },
    ];
  });

  const handleAddElectricPlayer = () => {
    if (electricPlayers.length >= 5) {
      alert('จำนวนผู้เล่นสูงสุด 5 คน');
      return;
    }
    setElectricPlayers(prev => [...prev, `ผู้เล่น ${prev.length + 1}`]);
  };

  const handleRemoveElectricPlayer = (index: number) => {
    if (electricPlayers.length <= 2) {
      alert('กติกาต้องมีผู้เล่นอย่างน้อย 2 คน');
      return;
    }
    setElectricPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleFeeBall = (color: BallColor) => {
    setFeeBalls(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSavePreset = () => {
    const name = presetNameInput.trim();
    if (!name) {
      alert('กรุณาใส่ชื่อพรีเซ็ต');
      return;
    }
    const newPreset = {
      name,
      config: {
        yellowPoints,
        blackPoints,
        lastBlackPoints,
        foulPenalty,
        feeBalls,
        ballPoints,
        electricPlayers,
        targetGames,
      },
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    try {
      localStorage.setItem('electric_snooker_presets', JSON.stringify(updated));
    } catch {}
    setPresetNameInput('');
    alert(`บันทึกพรีเซ็ต "${name}" เรียบร้อยแล้ว`);
  };

  const handleLoadPreset = (p: { name: string; config: any }) => {
    if (p.config.yellowPoints !== undefined) setYellowPoints(p.config.yellowPoints);
    if (p.config.blackPoints !== undefined) setBlackPoints(p.config.blackPoints);
    if (p.config.lastBlackPoints !== undefined) setLastBlackPoints(p.config.lastBlackPoints);
    if (p.config.foulPenalty !== undefined) setFoulPenalty(p.config.foulPenalty);
    if (p.config.feeBalls) setFeeBalls(p.config.feeBalls);
    if (p.config.ballPoints !== undefined) setBallPoints(p.config.ballPoints);
    if (p.config.electricPlayers && Array.isArray(p.config.electricPlayers)) setElectricPlayers(p.config.electricPlayers);
    if (p.config.targetGames !== undefined) {
      setTargetGames(p.config.targetGames);
      if (p.config.targetGames !== 5 && p.config.targetGames !== 10 && p.config.targetGames !== 15 && p.config.targetGames > 0) {
        setIsCustomTargetGames(true);
        setCustomTargetGamesInput(p.config.targetGames.toString());
      } else {
        setIsCustomTargetGames(false);
      }
    }
  };

  // Shoot Out Mode State
  const [shootOutDurationMins, setShootOutDurationMins] = useState<number>(10);
  const [firstHalfShotSec, setFirstHalfShotSec] = useState<number>(15);
  const [secondHalfRule, setSecondHalfRule] = useState<'reduced' | 'same' | 'custom'>('reduced');
  const [secondHalfCustomSec, setSecondHalfCustomSec] = useState<number>(10);
  const [minFoulPenalty, setMinFoulPenalty] = useState<number>(5);

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
      const finalPlayers: ElectricPlayer[] = electricPlayers
        .filter(n => n.trim().length > 0)
        .map((name, idx) => ({
          id: `ep-${Date.now()}-${idx}`,
          name: name.trim(),
          currentPlus: 0,
          currentMinus: 0,
          currentFee: 0,
          totalScore: 0,
          totalFee: 0,
        }));

      const resolvedPlayers = finalPlayers.length >= 2 ? finalPlayers : [
        { id: 'ep-1', name: 'Pop', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
        { id: 'ep-2', name: 'A', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
      ];

      electricConfig = {
        countMode,
        targetGames: matchLengthType === 'unlimited' ? 0 : targetGames,
        currentGame: 1,
        players: resolvedPlayers,
        strikerIndex: 0,
        feeBalls,
        ballPoints,
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

    let shootOutConfig: ShootOutConfig | undefined = undefined;
    if (gameMode === 'shoot-out') {
      shootOutConfig = {
        matchDurationMinutes: Math.max(1, shootOutDurationMins),
        firstHalfShotClockSec: Math.max(5, firstHalfShotSec),
        secondHalfRule,
        secondHalfCustomSec: Math.max(5, secondHalfCustomSec),
        minFoulPenalty: Math.max(4, minFoulPenalty),
      };
    }

    const defaultTitle = gameMode === 'electric-count'
      ? `สนุ๊กเกอร์ไฟฟ้า 6 แดง (${matchLengthType === 'unlimited' ? 'เล่นเรื่อยๆ' : `${targetGames} เกม`})`
      : (matchLengthType === 'unlimited' ? 'เล่นซ้อม/ไปเรื่อยๆ' : (gameMode === 'shoot-out' ? 'Shoot Out' : `Best of ${finalBestOf}`));

    onStartMatch({
      player1Name: gameMode === 'electric-count' ? (electricPlayers[0] || 'ผู้เล่น 1') : (player1Name.trim() || 'ผู้เล่น 1'),
      player2Name: gameMode === 'electric-count' ? (electricPlayers[1] || 'ผู้เล่น 2') : (player2Name.trim() || 'ผู้เล่น 2'),
      gameMode,
      matchLengthType,
      bestOfFrames: finalBestOf,
      title: title.trim() || defaultTitle,
      date,
      electricConfig,
      shootOutConfig,
      player1HandicapPoints: Math.max(0, player1HandicapPoints || 0),
      player2HandicapPoints: Math.max(0, player2HandicapPoints || 0),
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
          {/* Format Selection: 15 Reds vs 6 Reds vs Snooker Ga vs Electric Count vs Shoot Out */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">1. เลือกรูปแบบกติกา</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
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

              <button
                type="button"
                onClick={() => {
                  setGameMode('shoot-out');
                  setMatchLengthType('best-of');
                  setBestOfFrames(1);
                  setTitle('Shoot Out (1 เฟรม)');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  gameMode === 'shoot-out'
                    ? 'bg-amber-600 border-amber-300 text-white shadow-lg shadow-amber-600/40 font-bold ring-2 ring-amber-400/50'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-0.5">
                  <span className="text-xs">⏱️</span>
                  <span className="text-xs font-black text-amber-200">ชู๊ตเอาท์</span>
                </div>
                <span className="text-[9px] opacity-90 text-amber-300">Shoot Out จับเวลา</span>
              </button>
            </div>
          </div>

          {/* Shoot Out Configuration Box */}
          {gameMode === 'shoot-out' && (
            <div className="bg-amber-950/30 border border-amber-700/60 rounded-xl p-3 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-amber-300 border-b border-amber-800/60 pb-1.5">
                <div className="flex items-center space-x-1.5 font-black text-xs">
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span>ตั้งค่าเวลาการแข่งขัน Shoot Out (Shoot Out Time Settings)</span>
                </div>
                <span className="text-[10px] text-amber-300/80 font-mono">1 เฟรมจบ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 1. Match Duration */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <label className="font-bold text-slate-300 block text-[11px]">1. เวลาแข่งขันรวม</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[10, 7, 5].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setShootOutDurationMins(mins)}
                        className={`py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                          shootOutDurationMins === mins
                            ? 'bg-amber-500 text-slate-950 font-black shadow'
                            : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {mins} นาที
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>หรือกำหนดเอง:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={shootOutDurationMins}
                        onChange={(e) => setShootOutDurationMins(Math.max(1, parseInt(e.target.value, 10) || 10))}
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-center font-mono font-bold text-amber-300 text-xs outline-none"
                      />
                      <span>นาที</span>
                    </div>
                  </div>
                </div>

                {/* 2. First Half Shot Clock */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <label className="font-bold text-slate-300 block text-[11px]">2. ช็อตคล็อกครึ่งแรก</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[15, 20, 12].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setFirstHalfShotSec(sec)}
                        className={`py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                          firstHalfShotSec === sec
                            ? 'bg-emerald-500 text-slate-950 font-black shadow'
                            : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {sec} วิ
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>หรือกำหนดเอง:</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={5}
                        max={60}
                        value={firstHalfShotSec}
                        onChange={(e) => setFirstHalfShotSec(Math.max(5, parseInt(e.target.value, 10) || 15))}
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-center font-mono font-bold text-emerald-300 text-xs outline-none"
                      />
                      <span>วิ</span>
                    </div>
                  </div>
                </div>

                {/* 3. Second Half Shot Clock (User's specific request) */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/40 space-y-1.5">
                  <label className="font-bold text-amber-300 block text-[11px]">3. ช็อตคล็อกครึ่งหลัง (5 นาทีหลัง)</label>
                  <div className="space-y-1 text-[11px]">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="secondHalfRule"
                        checked={secondHalfRule === 'reduced'}
                        onChange={() => setSecondHalfRule('reduced')}
                        className="accent-amber-400 cursor-pointer"
                      />
                      <span className="text-white font-bold">ลดเหลือ 10 วินาที (สากล)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="secondHalfRule"
                        checked={secondHalfRule === 'same'}
                        onChange={() => setSecondHalfRule('same')}
                        className="accent-amber-400 cursor-pointer"
                      />
                      <span className="text-amber-200 font-bold">คงไว้ที่ {firstHalfShotSec} วิ เท่าเดิม</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="secondHalfRule"
                        checked={secondHalfRule === 'custom'}
                        onChange={() => setSecondHalfRule('custom')}
                        className="accent-amber-400 cursor-pointer"
                      />
                      <span className="text-slate-300">กำหนดเอง:</span>
                      <input
                        type="number"
                        min={5}
                        max={30}
                        value={secondHalfCustomSec}
                        onChange={(e) => {
                          setSecondHalfCustomSec(Math.max(5, parseInt(e.target.value, 10) || 10));
                          setSecondHalfRule('custom');
                        }}
                        className="w-10 bg-slate-900 border border-slate-700 rounded px-1 text-center font-mono font-bold text-white text-xs outline-none"
                      />
                      <span className="text-[10px] text-slate-400">วิ</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/50 border border-amber-800/60 rounded-lg p-2 text-[10px] text-amber-200">
                💡 <strong>กติกาฟาวล์ Shoot Out:</strong> ฟาวล์ทุกกรณี ฝ่ายตรงข้ามได้สิทธิ์ <strong>Ball in Hand</strong> วางขาวตำแหน่งใดก็ได้บนโต๊ะ และได้แต้มฟาวล์ขั้นต่ำ 5 แต้ม
              </div>
            </div>
          )}

          {/* Electric Snooker / Ball Count Configuration Box */}
          {gameMode === 'electric-count' && (
            <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-3.5 sm:p-4 space-y-4 animate-fadeIn shadow-xl">
              <div className="flex items-center justify-between text-amber-300 border-b border-amber-800/60 pb-2">
                <div className="flex items-center space-x-2 font-black text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>⚡ ตั้งค่าสนุ๊กเกอร์ไฟฟ้า 6 แดง (Electric 6-Reds Settings)</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  6 แดงเท่านั้น
                </span>
              </div>

              {/* Presets Bar */}
              <div className="space-y-1.5 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold">💾 พรีเซ็ตก๊วน (Presets):</span>
                  <span className="text-[10px] text-slate-400">คลิกเพื่อโหลดการตั้งค่า</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="บันทึกชื่อก๊วนใหม่..."
                    value={presetNameInput}
                    onChange={(e) => setPresetNameInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    บันทึกพรีเซ็ต
                  </button>
                </div>
              </div>

              {/* 1. Players Management (2 - 5 Players) */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-200">1. รายชื่อผู้เล่น (2 - 5 คน):</label>
                    <p className="text-[10px] text-slate-400">เรียงตามลำดับคิวแทงจากบนลงล่าง</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddElectricPlayer}
                    disabled={electricPlayers.length >= 5}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      electricPlayers.length >= 5
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    + เพิ่มผู้เล่น ({electricPlayers.length}/5)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {electricPlayers.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 px-2">
                      <span className="font-mono text-xs text-amber-400 font-bold w-4 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setElectricPlayers(prev => {
                            const copy = [...prev];
                            copy[idx] = val;
                            return copy;
                          });
                        }}
                        placeholder={`ผู้เล่น ${idx + 1}`}
                        className="flex-1 bg-transparent text-xs text-slate-100 font-semibold outline-none"
                      />
                      {electricPlayers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveElectricPlayer(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                          title="ลบผู้เล่นนี้"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Target Games Selector */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200">2. รูปแบบจำนวนเกมที่เล่น:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetGames(5);
                      setMatchLengthType('best-of');
                      setIsCustomTargetGames(false);
                    }}
                    className={`py-2 px-2 rounded-lg border font-bold text-center transition cursor-pointer ${
                      matchLengthType === 'best-of' && !isCustomTargetGames && targetGames === 5
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    5 เกม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetGames(10);
                      setMatchLengthType('best-of');
                      setIsCustomTargetGames(false);
                    }}
                    className={`py-2 px-2 rounded-lg border font-bold text-center transition cursor-pointer ${
                      matchLengthType === 'best-of' && !isCustomTargetGames && targetGames === 10
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    10 เกม (มาตรฐาน)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetGames(15);
                      setMatchLengthType('best-of');
                      setIsCustomTargetGames(false);
                    }}
                    className={`py-2 px-2 rounded-lg border font-bold text-center transition cursor-pointer ${
                      matchLengthType === 'best-of' && !isCustomTargetGames && targetGames === 15
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    15 เกม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTargetGames(true);
                      setMatchLengthType('best-of');
                      const val = parseInt(customTargetGamesInput, 10) || 7;
                      setTargetGames(val);
                    }}
                    className={`py-2 px-2 rounded-lg border font-bold text-center transition cursor-pointer ${
                      matchLengthType === 'best-of' && isCustomTargetGames
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    ✏️ กำหนดเอง
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetGames(0);
                      setMatchLengthType('unlimited');
                      setIsCustomTargetGames(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg border font-bold text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
                      matchLengthType === 'unlimited'
                        ? 'bg-purple-600 text-white border-purple-400 shadow font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    เล่นเรื่อยๆ (ไม่จำกัด)
                  </button>
                </div>

                {matchLengthType === 'best-of' && isCustomTargetGames && (
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs animate-fadeIn">
                    <span className="text-amber-300 font-bold">ระบุจำนวนเกมที่ต้องการเล่น:</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={customTargetGamesInput}
                      onChange={(e) => {
                        setCustomTargetGamesInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) setTargetGames(val);
                      }}
                      className="w-20 bg-slate-950 border border-amber-400 text-amber-300 font-mono font-black text-sm text-center rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-amber-400"
                      placeholder="เช่น 7"
                      autoFocus
                    />
                    <span className="text-slate-300 font-semibold">เกม (แข่งขัน {targetGames} เกม)</span>
                  </div>
                )}
              </div>

              {/* 3. Fee Balls Selection (Checkboxes) */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">3. เลือกลูกสีที่เป็น "ค่าไฟ":</label>
                  <span className="text-[10px] text-amber-400">*คิดค่าไฟเมื่อ 6 แดงหมดโต๊ะเท่านั้น</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  {(['yellow', 'green', 'brown', 'blue', 'pink', 'black'] as BallColor[]).map((c) => {
                    const isChecked = feeBalls.includes(c);
                    const colorStyleMap: Record<string, string> = {
                      yellow: 'bg-yellow-400',
                      green: 'bg-emerald-500',
                      brown: 'bg-amber-800',
                      blue: 'bg-blue-500',
                      pink: 'bg-pink-500',
                      black: 'bg-slate-900 border border-slate-500',
                    };
                    const colorNameTh: Record<string, string> = {
                      yellow: 'เหลือง',
                      green: 'เขียว',
                      brown: 'น้ำตาล',
                      blue: 'น้ำเงิน',
                      pink: 'ชมพู',
                      black: 'ดำ',
                    };

                    return (
                      <label
                        key={c}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFeeBall(c)}
                          className="accent-amber-500 rounded cursor-pointer"
                        />
                        <span className={`w-3 h-3 rounded-full ${colorStyleMap[c]} inline-block flex-shrink-0`}></span>
                        <span>{colorNameTh[c]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Custom Points Setting (Yellow, Black, Last Black, Foul, Other balls) */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-200">4. กำหนดแต้มลูกพิเศษ & ฟาวล์:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Yellow Points */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-yellow-300 block">🟡 แต้มลูกเหลือง</span>
                    <div className="flex items-center gap-1">
                      {[1, 2].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setYellowPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-bold text-xs cursor-pointer ${
                            yellowPoints === pts ? 'bg-yellow-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pts} แต้ม
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Black Normal Points */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-slate-200 block">⚫ ลูกดำระหว่างเกม</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 4].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setBlackPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-bold text-xs cursor-pointer ${
                            blackPoints === pts ? 'bg-slate-200 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Final Black Points */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-amber-500/40 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 block">👑 ดำสุดท้ายปิดเกม</span>
                    <div className="flex items-center gap-1">
                      {[2, 4, 7].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setLastBlackPoints(pts)}
                          className={`flex-1 py-1 rounded font-mono font-bold text-xs cursor-pointer ${
                            lastBlackPoints === pts ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Foul Penalty */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-rose-500/40 space-y-1">
                    <span className="text-[11px] font-bold text-rose-300 block">🚨 แต้มเสียฟาวล์</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 4].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setFoulPenalty(pts)}
                          className={`flex-1 py-1 rounded font-mono font-bold text-xs cursor-pointer ${
                            foulPenalty === pts ? 'bg-rose-500 text-white shadow' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pts}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>แต้มลูกอื่นๆ (แดง, เขียว, น้ำตาล, น้ำเงิน, ชมพู): <strong>{ballPoints} แต้ม</strong></span>
                  <span className="text-amber-400/90 font-mono">ฟาวล์หักผู้แทง ให้คนก่อนหน้า</span>
                </div>
              </div>
            </div>
          )}

          {/* Match Length Mode: Best of / Total Games vs Unlimited (Non-Electric modes) */}
          {gameMode !== 'electric-count' && (
            <>
              {gameMode === 'shoot-out' ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-base">⏱️</span>
                <div>
                  <span className="font-bold text-white block">2. รูปแบบการแข่งขัน: 1 เฟรมจบ (Single Frame)</span>
                  <span className="text-[10px] text-slate-400">แข่งขันนับเวลาถอยหลัง {shootOutDurationMins} นาที ผู้ที่มีแต้มมากกว่าเมื่อหมดเวลาเป็นผู้ชนะ</span>
                </div>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-lg">
                1 Frame
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                {gameMode === 'electric-count' ? '2. เลือกจำนวนเกม / รูปแบบการแข่ง' : '2. เลือกความยาวของเกม / รูปแบบการแข่ง'}
              </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMatchLengthType('best-of')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  matchLengthType === 'best-of'
                    ? (gameMode === 'electric-count'
                        ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-400 text-white shadow-md font-bold'
                        : 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-400 text-white shadow-md font-bold')
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Trophy className={`w-4 h-4 ${gameMode === 'electric-count' ? 'text-cyan-300' : 'text-amber-300'}`} />
                  <span className="text-sm font-black">
                    {gameMode === 'electric-count' ? 'แข่งแบบกำหนดจำนวนเกม' : 'แข่งแบบนับเฟรม (Best of)'}
                  </span>
                </div>
                <span className="text-[10px] opacity-90 mt-0.5">
                  {gameMode === 'electric-count' ? 'เล่นครบจำนวนเกมแล้วรวมแต้ม' : 'ชนะครบตามที่ตั้งไว้จบแมตช์'}
                </span>
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
                <span className="text-[10px] opacity-90 mt-0.5">
                  {gameMode === 'electric-count' ? 'ไม่จำกัดเกม / เล่นสะสมแต้มทั้งวัน' : 'ไม่จำกัดเฟรม / เล่นซ้อมทั้งวัน'}
                </span>
              </button>
            </div>

            {/* If Best of / Total Games selected: choose Quick Game / Frame Chips */}
            {matchLengthType === 'best-of' ? (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {gameMode === 'electric-count'
                      ? `เลือกจำนวนเกมที่ต้องการเล่น (${bestOfFrames} เกม):`
                      : `เลือกจำนวนเฟรม (ชนะ ${Math.ceil(bestOfFrames / 2)} ใน ${bestOfFrames} เฟรม):`}
                  </span>
                  <span className={`font-mono font-bold ${gameMode === 'electric-count' ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {gameMode === 'electric-count' ? `${bestOfFrames} เกม` : `Best of ${bestOfFrames}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {gameMode === 'electric-count' ? (
                    [
                      { value: 5, label: '5 เกม', desc: 'มินิเกม' },
                      { value: 10, label: '10 เกม', desc: 'มาตรฐาน (แนะนำ)' },
                      { value: 15, label: '15 เกม', desc: 'แมตช์ยาว' },
                      { value: 20, label: '20 เกม', desc: 'แมตช์ใหญ่' },
                      { value: 30, label: '30 เกม', desc: 'ชิงแชมป์' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setBestOfFrames(opt.value);
                          setCustomFramesInput(opt.value.toString());
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          bestOfFrames === opt.value
                            ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 font-semibold'
                        }`}
                      >
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[9px] opacity-80 truncate">{opt.desc}</div>
                      </button>
                    ))
                  ) : (
                    quickBestOfOptions.map((opt) => (
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
                    ))
                  )}
                </div>

                {/* Custom Frames / Games Input */}
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
                    className={`w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold outline-none ${
                      gameMode === 'electric-count' ? 'text-cyan-300 focus:border-cyan-500' : 'text-amber-300 focus:border-amber-500'
                    }`}
                    placeholder="เช่น 10"
                  />
                  <span className="text-slate-400">
                    {gameMode === 'electric-count'
                      ? `เกม (เล่นทั้งหมด ${bestOfFrames} เกม)`
                      : `เฟรม (ชนะ ${Math.ceil(bestOfFrames / 2)} เฟรม)`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl text-xs text-purple-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>โหมดเล่นไปเรื่อยๆ:</strong> ระบบจะนับ{gameMode === 'electric-count' ? 'เกม' : 'เฟรม'}สะสมไปเรื่อยๆ โดยไม่มีการตัดจบเกมอัตโนมัติ เมื่อต้องการเลิกเล่นสามารถกดปุ่ม <strong>"บันทึกและจบแมตช์"</strong> ได้ตลอดเวลา
                </span>
              </div>
            )}
          </div>
              )}

          {/* Players Names & Handicap Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">3. รายชื่อผู้เล่น & แต้มเวท (Handicap Points)</label>
              <span className="text-[10px] text-amber-400 font-medium">ค่าเริ่มต้น 0 (เสมอ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Player 1 Box */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    <span>ผู้เล่นที่ 1</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">แต้มเวท</span>
                </div>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500 font-semibold"
                  placeholder="ผู้เล่น 1"
                />
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-amber-300 font-semibold">แต้มเวท:</label>
                    <span className="text-[9px] text-slate-500 font-mono">เริ่มต้น 0</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setPlayer1HandicapPoints(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
                    >-</button>
                    <input
                      type="number"
                      min={0}
                      max={147}
                      value={player1HandicapPoints}
                      onChange={(e) => setPlayer1HandicapPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="flex-1 bg-slate-900 border border-amber-500/70 focus:border-amber-400 text-amber-300 font-mono font-black rounded px-1.5 py-0.5 text-sm text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPlayer1HandicapPoints(prev => Math.min(147, prev + 1))}
                      className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Player 2 Box */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                    <span>ผู้เล่นที่ 2</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">แต้มเวท</span>
                </div>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-500 font-semibold"
                  placeholder="ผู้เล่น 2"
                />
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-amber-300 font-semibold">แต้มเวท:</label>
                    <span className="text-[9px] text-slate-500 font-mono">เริ่มต้น 0</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setPlayer2HandicapPoints(prev => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
                    >-</button>
                    <input
                      type="number"
                      min={0}
                      max={147}
                      value={player2HandicapPoints}
                      onChange={(e) => setPlayer2HandicapPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="flex-1 bg-slate-900 border border-amber-500/70 focus:border-amber-400 text-amber-300 font-mono font-black rounded px-1.5 py-0.5 text-sm text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPlayer2HandicapPoints(prev => Math.min(147, prev + 1))}
                      className="w-7 h-7 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Clash Result Banner */}
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border border-amber-500/50 rounded-lg p-2.5 text-xs">
              {player1HandicapPoints === player2HandicapPoints ? (
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <span>⚖️</span>
                    <span>แต้มเวทเท่ากัน ({player1HandicapPoints} แต้ม) : <strong>แข่งแบบเสมอ (ไม่มีแต้มต่อ)</strong></span>
                  </span>
                  <span className="text-[10px] text-slate-500">เริ่มที่ 0 - 0</span>
                </div>
              ) : (player1HandicapPoints - player2HandicapPoints) > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 font-bold">⚡ การชนเวท:</span>
                    <span className="text-slate-200">
                      <strong>{player2Name.trim() || 'ผู้เล่น 2'}</strong> ต่อให้ <strong>{player1Name.trim() || 'ผู้เล่น 1'}</strong> : <strong className="text-amber-400 font-mono text-sm">{Math.abs(player1HandicapPoints - player2HandicapPoints)}</strong> แต้ม
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded font-bold">
                    {player1Name.trim() || 'ผู้เล่น 1'} ได้แต้มตั้งต้น {Math.abs(player1HandicapPoints - player2HandicapPoints)} แต้ม
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 font-bold">⚡ การชนเวท:</span>
                    <span className="text-slate-200">
                      <strong>{player1Name.trim() || 'ผู้เล่น 1'}</strong> ต่อให้ <strong>{player2Name.trim() || 'ผู้เล่น 2'}</strong> : <strong className="text-amber-400 font-mono text-sm">{Math.abs(player1HandicapPoints - player2HandicapPoints)}</strong> แต้ม
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded font-bold">
                    {player2Name.trim() || 'ผู้เล่น 2'} ได้แต้มตั้งต้น {Math.abs(player1HandicapPoints - player2HandicapPoints)} แต้ม
                  </span>
                </div>
              )}
            </div>
          </div>
            </>
          )}

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
