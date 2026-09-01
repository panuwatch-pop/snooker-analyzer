import React, { useState } from 'react';
import { Match, PlayerStats } from '../types/snooker';
import { 
  BarChart3, 
  Percent, 
  Target, 
  Flame, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Trophy, 
  HelpCircle,
  TrendingUp 
} from 'lucide-react';
import { calculatePlayerStats } from '../utils/snookerRules';

interface AnalyticsTabProps {
  currentMatch: Match;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ currentMatch }) => {
  const [viewScope, setViewScope] = useState<'match' | 'current-frame'>('match');
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  // Aggregate stats across all frames in match or current frame
  const framesToAnalyze = viewScope === 'match'
    ? currentMatch.frames
    : [currentMatch.frames[currentMatch.currentFrameIndex] || currentMatch.frames[0]];

  const allShots = framesToAnalyze.flatMap(f => f.shots || []);
  const allVisits = framesToAnalyze.flatMap(f => f.visits || []);

  const p1Stats = calculatePlayerStats(
    allShots,
    allVisits,
    0,
    allShots.filter(s => s.playerIndex === 1)
  );

  const p2Stats = calculatePlayerStats(
    allShots,
    allVisits,
    1,
    allShots.filter(s => s.playerIndex === 0)
  );

  const renderComparisonBar = (val1: number, val2: number, isHigherBetter: boolean = true, isPercent: boolean = false, unit: string = '') => {
    const total = val1 + val2;
    const p1Width = total > 0 ? (val1 / total) * 100 : 50;
    const p2Width = total > 0 ? (val2 / total) * 100 : 50;

    const p1Wins = isHigherBetter ? val1 > val2 : val1 < val2;
    const p2Wins = isHigherBetter ? val2 > val1 : val2 < val1;

    return (
      <div className="space-y-1 w-full">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className={p1Wins ? 'text-emerald-400 font-mono' : 'text-slate-400 font-mono'}>
            {val1}{isPercent ? '%' : unit}
          </span>
          <span className={p2Wins ? 'text-amber-400 font-mono' : 'text-slate-400 font-mono'}>
            {val2}{isPercent ? '%' : unit}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${p1Width}%` }}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
          />
          <div
            style={{ width: `${p2Width}%` }}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">วิเคราะห์ผลสถิติ & ประสิทธิภาพ (%)</h2>
              <p className="text-xs text-slate-400">คำนวณแบบ Real-time จากทุกช็อตที่กดแทงลงและจบเทิร์น</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setViewScope('match')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewScope === 'match' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ทั้งแมตช์ (Match)
              </button>
              <button
                onClick={() => setViewScope('current-frame')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewScope === 'current-frame' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                เฟรมปัจจุบัน (Frame)
              </button>
            </div>

            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showFormulas ? 'ซ่อนสูตร' : 'ดูสูตรคำนวณ'}</span>
            </button>
          </div>
        </div>

        {/* Players Legend */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow" />
              <span className="font-black text-slate-100 text-sm sm:text-base">{currentMatch.player1Name}</span>
            </div>
            <span className="text-xs text-emerald-300 font-bold bg-emerald-900/60 px-2 py-0.5 rounded">
              ได้ {currentMatch.player1FramesWon} เฟรม
            </span>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow" />
              <span className="font-black text-slate-100 text-sm sm:text-base">{currentMatch.player2Name}</span>
            </div>
            <span className="text-xs text-amber-300 font-bold bg-amber-900/60 px-2 py-0.5 rounded">
              ได้ {currentMatch.player2FramesWon} เฟรม
            </span>
          </div>
        </div>
      </div>

      {/* Formula Explanation Drawer */}
      {showFormulas && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-3 animate-fadeIn">
          <h3 className="font-black text-amber-400 text-sm flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>คำอธิบายสูตรและวิธีการคำนวณสถิติ 9.1 - 9.8</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.1 แต้มรวม (Total Points):</strong>
              แต้มจากการแทงลูกลงสะสม + แต้มที่ได้จากการฟาวล์ของคู่แข่ง
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.2 ความแม่นยำ (Potting %):</strong>
              (จำนวนลูกที่แทงลง / จำนวนครั้งที่พยายามแทงทั้งหมด) × 100%
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.3 อัตราการทำเบรก (Break %):</strong>
              (จำนวนรอบที่แทงลงตั้งแต่ <strong>2 ลูกขึ้นไป</strong> / จำนวนรอบที่ขึ้นโต๊ะทั้งหมด) × 100%
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.4 เวลาเฉลี่ยต่อช็อต (AST):</strong>
              เวลารวมที่ใช้แทงทั้งหมด (วินาที) / จำนวนครั้งที่แทงทั้งหมด
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.6 สถิติการฟาวล์ (Fouls):</strong>
              จำนวนครั้งที่ฟาวล์ และอัตราการเสียฟาวล์ต่อรอบการขึ้นโต๊ะ
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <strong className="text-white block mb-0.5">9.7 เปอร์เซนต์ความผิดพลาดที่เสียแต้ม (Error Conceded %):</strong>
              (จำนวนรอบที่เล่นพลาดหรือจบเทิร์น แล้วคู่แข่งขึ้นมาแทงลงทันที / รอบที่จบเทิร์นทั้งหมด) × 100%
            </div>
          </div>
        </div>
      )}

      {/* Main 8 Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 9.1 Total Points */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>9.1 แต้มรวมทั้งหมด (Total Points)</span>
          </div>
          {renderComparisonBar(p1Stats.totalPoints, p2Stats.totalPoints, true, false, ' แต้ม')}
        </div>

        {/* 9.2 Potting Accuracy % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>9.2 ความแม่นยำในการยิง (Potting Accuracy %)</span>
          </div>
          {renderComparisonBar(p1Stats.pottingAccuracy, p2Stats.pottingAccuracy, true, true)}
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>ลง {p1Stats.potsPotted}/{p1Stats.potsAttempted} ช็อต</span>
            <span>ลง {p2Stats.potsPotted}/{p2Stats.potsAttempted} ช็อต</span>
          </div>
        </div>

        {/* 9.3 Break Building % (>= 2 balls potted) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>9.3 อัตราการทำเบรก (Break % ≥ 2 ลูกขึ้นไป)</span>
          </div>
          {renderComparisonBar(p1Stats.breakRate, p2Stats.breakRate, true, true)}
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>ทำได้ {p1Stats.breakVisits}/{p1Stats.totalVisits} รอบ</span>
            <span>ทำได้ {p2Stats.breakVisits}/{p2Stats.totalVisits} รอบ</span>
          </div>
        </div>

        {/* 9.8 Highest Break */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>9.8 เบรกสูงสุด (Highest Break)</span>
          </div>
          {renderComparisonBar(p1Stats.highestBreak, p2Stats.highestBreak, true, false, ' แต้ม')}
        </div>

        {/* 9.4 Average Shot Time (AST) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>9.4 เวลาเฉลี่ยต่อช็อต (AST - วินาที)</span>
          </div>
          {/* Lower AST is generally faster */}
          {renderComparisonBar(p1Stats.averageShotTime, p2Stats.averageShotTime, false, false, 's')}
        </div>

        {/* 9.7 Error Conceded % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>9.7 ความผิดพลาดที่ทำให้คู่แข่งได้แต้ม (Error Conceded %)</span>
          </div>
          {/* Lower error rate is better */}
          {renderComparisonBar(p1Stats.errorRate, p2Stats.errorRate, false, true)}
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>พลาดเปิดโอกาส {p1Stats.errorsConceded} ครั้ง</span>
            <span>พลาดเปิดโอกาส {p2Stats.errorsConceded} ครั้ง</span>
          </div>
        </div>

        {/* 9.6 Fouls Conceded */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>9.6 สถิติการฟาวล์ (Fouls Conceded)</span>
          </div>
          {renderComparisonBar(p1Stats.foulsCount, p2Stats.foulsCount, false, false, ' ครั้ง')}
          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>เสียแต้มฟาวล์: {p1Stats.foulPointsConceded} แต้ม</span>
            <span>เสียแต้มฟาวล์: {p2Stats.foulPointsConceded} แต้ม</span>
          </div>
        </div>

        {/* Total Inning Visits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
            <Percent className="w-4 h-4 text-teal-400" />
            <span>จำนวนรอบขึ้นโต๊ะทั้งหมด (Inning Visits)</span>
          </div>
          {renderComparisonBar(p1Stats.totalVisits, p2Stats.totalVisits, true, false, ' รอบ')}
        </div>
      </div>

      {/* Break Tier Distribution breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <h3 className="text-base font-black text-white flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>การแจกแจงระดับคะแนนเบรก (Break Tiers Distribution)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold">2-4 ลูก (&lt;20)</div>
            <div className="flex justify-around font-mono font-bold text-sm">
              <span className="text-emerald-400">{p1Stats.breakTiers.twoToFourBalls}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{p2Stats.breakTiers.twoToFourBalls}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold">เบรก 20 - 49</div>
            <div className="flex justify-around font-mono font-bold text-sm">
              <span className="text-emerald-400">{p1Stats.breakTiers.twentyPlus}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{p2Stats.breakTiers.twentyPlus}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold">เบรก 50 - 69</div>
            <div className="flex justify-around font-mono font-bold text-sm">
              <span className="text-emerald-400">{p1Stats.breakTiers.fiftyPlus}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{p2Stats.breakTiers.fiftyPlus}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1 font-semibold">เบรก 70 - 99</div>
            <div className="flex justify-around font-mono font-bold text-sm">
              <span className="text-emerald-400">{p1Stats.breakTiers.seventyPlus}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{p2Stats.breakTiers.seventyPlus}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-amber-400 text-[11px] mb-1 font-bold">Century 100+</div>
            <div className="flex justify-around font-mono font-bold text-sm">
              <span className="text-emerald-400">{p1Stats.breakTiers.centuryPlus}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">{p2Stats.breakTiers.centuryPlus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
