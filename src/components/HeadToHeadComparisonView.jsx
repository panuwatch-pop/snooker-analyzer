import React from 'react';
import { ComparisonBar } from './ComparisonBar';
import { calculateBarRatio } from '../utils/snookerCalculator';
import { Zap, Target, ShieldCheck, AlertTriangle, Trophy, Hash, Clock, Award, User, Flame } from 'lucide-react';

export function HeadToHeadComparisonView({ p1Stats, p2Stats, players }) {
  // 1. AST (Average Shot Time)
  const astRatio = calculateBarRatio(p1Stats.ast, p2Stats.ast, true);
  const p1AstBetter = p1Stats.ast > 0 && (p2Stats.ast === 0 || p1Stats.ast < p2Stats.ast);
  const p2AstBetter = p2Stats.ast > 0 && (p1Stats.ast === 0 || p2Stats.ast < p1Stats.ast);

  // 2. Pot Accuracy (%)
  const potRatio = calculateBarRatio(p1Stats.potAccuracy, p2Stats.potAccuracy);
  const p1PotBetter = p1Stats.potAccuracy > p2Stats.potAccuracy;
  const p2PotBetter = p2Stats.potAccuracy > p1Stats.potAccuracy;

  // 3. Safety Success Rate (%)
  const safetyRatio = calculateBarRatio(p1Stats.safetyRate, p2Stats.safetyRate);
  const p1SafetyBetter = p1Stats.safetyRate > p2Stats.safetyRate;
  const p2SafetyBetter = p2Stats.safetyRate > p1Stats.safetyRate;

  // 4. Fouls Committed (Fewer is better)
  const foulRatio = calculateBarRatio(p1Stats.foulsCommitted, p2Stats.foulsCommitted, true);
  const p1FoulBetter = p2Stats.foulsCommitted > p1Stats.foulsCommitted;
  const p2FoulBetter = p1Stats.foulsCommitted > p2Stats.foulsCommitted;

  // 5. Highest Break
  const breakRatio = calculateBarRatio(p1Stats.highestBreak, p2Stats.highestBreak);

  // 6. Total Points
  const totalPointsRatio = calculateBarRatio(p1Stats.totalPoints, p2Stats.totalPoints);

  // 7. Successful Pots
  const potsRatio = calculateBarRatio(p1Stats.successfulPots, p2Stats.successfulPots);

  // 8. Total Time on Table
  const timeRatio = calculateBarRatio(p1Stats.totalTimeOnTable, p2Stats.totalTimeOnTable);

  const formatMinSec = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Top Banner Player Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Card */}
        <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-4 flex items-center justify-between glow-cyan">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-950 border border-sky-400 flex items-center justify-center text-sky-300 font-bold text-lg">
              P1
            </div>
            <div>
              <div className="text-xs text-sky-400 font-mono font-semibold uppercase">PLAYER 1</div>
              <div className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-[250px]">
                {players[0].name}
              </div>
              <div className="text-xs text-slate-400">
                เฟรมชนะ: <span className="font-bold text-sky-400">{players[0].frameScore}</span> | HB: <span className="font-bold text-slate-200">{p1Stats.highestBreak}</span>
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-2xl md:text-3xl font-extrabold text-sky-400">
              {p1Stats.totalPoints}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">คะแนนรวม</div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between flex-row-reverse text-right glow-amber">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-400 flex items-center justify-center text-amber-300 font-bold text-lg">
              P2
            </div>
            <div>
              <div className="text-xs text-amber-400 font-mono font-semibold uppercase">PLAYER 2</div>
              <div className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-[250px]">
                {players[1].name}
              </div>
              <div className="text-xs text-slate-400">
                HB: <span className="font-bold text-slate-200">{p2Stats.highestBreak}</span> | เฟรมชนะ: <span className="font-bold text-amber-400">{players[1].frameScore}</span>
              </div>
            </div>
          </div>
          <div className="text-left font-mono">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-400">
              {p2Stats.totalPoints}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">คะแนนรวม</div>
          </div>
        </div>
      </div>

      {/* Main Comparative Bar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        
        {/* 1. ความเร็วเฉลี่ย (AST) */}
        <ComparisonBar
          label="1. ความเร็วเฉลี่ยต่อช็อต (AST)"
          val1={p1Stats.ast}
          val2={p2Stats.ast}
          p1Pct={astRatio.p1Pct}
          p2Pct={astRatio.p2Pct}
          unit=" วินาที"
          subtext1={`แทง ${p1Stats.totalShots} ช็อต`}
          subtext2={`แทง ${p2Stats.totalShots} ช็อต`}
          p1Better={p1AstBetter}
          p2Better={p2AstBetter}
          icon={Zap}
        />

        {/* 2. ความแม่นยำในการตบลูก (Pot Accuracy %) */}
        <ComparisonBar
          label="2. ความแม่นยำในการตบลูก (Pot Success)"
          val1={p1Stats.potAccuracy}
          val2={p2Stats.potAccuracy}
          p1Pct={potRatio.p1Pct}
          p2Pct={potRatio.p2Pct}
          unit="%"
          subtext1={`ตบลง ${p1Stats.successfulPots}/${p1Stats.attemptedPots} ลูก`}
          subtext2={`ตบลง ${p2Stats.successfulPots}/${p2Stats.attemptedPots} ลูก`}
          p1Better={p1PotBetter}
          p2Better={p2PotBetter}
          icon={Target}
        />

        {/* 3. อัตราการกันสำเร็จ (Safety Success Rate %) */}
        <ComparisonBar
          label="3. อัตราการกันสำเร็จ (Safety Success)"
          val1={p1Stats.safetyRate}
          val2={p2Stats.safetyRate}
          p1Pct={safetyRatio.p1Pct}
          p2Pct={safetyRatio.p2Pct}
          unit="%"
          subtext1={`กันได้ผล ${p1Stats.successfulSafeties}/${p1Stats.totalSafeties} ครั้ง`}
          subtext2={`กันได้ผล ${p2Stats.successfulSafeties}/${p2Stats.totalSafeties} ครั้ง`}
          p1Better={p1SafetyBetter}
          p2Better={p2SafetyBetter}
          icon={ShieldCheck}
        />

        {/* 4. การฟาวล์ (Fouls Committed) */}
        <ComparisonBar
          label="4. จำนวนการทำฟาวล์ (Fouls Committed)"
          val1={p1Stats.foulsCommitted}
          val2={p2Stats.foulsCommitted}
          p1Pct={foulRatio.p1Pct}
          p2Pct={foulRatio.p2Pct}
          unit=" ครั้ง"
          subtext1={`เสีย ${p1Stats.foulPointsConceded} แต้มให้คู่แข่ง`}
          subtext2={`เสีย ${p2Stats.foulPointsConceded} แต้มให้คู่แข่ง`}
          p1Better={p1FoulBetter}
          p2Better={p2FoulBetter}
          icon={AlertTriangle}
        />

        {/* 5. เบรกสูงสุด (Highest Break) */}
        <ComparisonBar
          label="5. เบรกสูงสุด (Highest Break)"
          val1={p1Stats.highestBreak}
          val2={p2Stats.highestBreak}
          p1Pct={breakRatio.p1Pct}
          p2Pct={breakRatio.p2Pct}
          unit=" แต้ม"
          p1Better={p1Stats.highestBreak > p2Stats.highestBreak}
          p2Better={p2Stats.highestBreak > p1Stats.highestBreak}
          icon={Trophy}
        />

        {/* 6. คะแนนรวมทั้งแมตช์ (Total Match Points) */}
        <ComparisonBar
          label="6. คะแนนรวมทั้งแมตช์ (Total Points)"
          val1={p1Stats.totalPoints}
          val2={p2Stats.totalPoints}
          p1Pct={totalPointsRatio.p1Pct}
          p2Pct={totalPointsRatio.p2Pct}
          unit=" แต้ม"
          p1Better={p1Stats.totalPoints > p2Stats.totalPoints}
          p2Better={p2Stats.totalPoints > p1Stats.totalPoints}
          icon={Hash}
        />

        {/* 7. ลูกสีตบลงรวม (Total Balls Potted) */}
        <ComparisonBar
          label="7. จำนวนลูกที่ตบลงสำเร็จ (Balls Potted)"
          val1={p1Stats.successfulPots}
          val2={p2Stats.successfulPots}
          p1Pct={potsRatio.p1Pct}
          p2Pct={potsRatio.p2Pct}
          unit=" ลูก"
          p1Better={p1Stats.successfulPots > p2Stats.successfulPots}
          p2Better={p2Stats.successfulPots > p1Stats.successfulPots}
          icon={Target}
        />

        {/* 8. เวลาครองโต๊ะรวม (Total Time on Table) */}
        <ComparisonBar
          label="8. เวลาครองโต๊ะรวม (Table Time)"
          val1={formatMinSec(p1Stats.totalTimeOnTable)}
          val2={formatMinSec(p2Stats.totalTimeOnTable)}
          p1Pct={timeRatio.p1Pct}
          p2Pct={timeRatio.p2Pct}
          unit=""
          p1Better={p1Stats.totalTimeOnTable > p2Stats.totalTimeOnTable}
          p2Better={p2Stats.totalTimeOnTable > p1Stats.totalTimeOnTable}
          icon={Clock}
        />
      </div>
    </div>
  );
}
