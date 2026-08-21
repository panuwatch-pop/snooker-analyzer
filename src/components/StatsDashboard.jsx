import React, { useState } from 'react';
import { ComparisonBar } from './ComparisonBar';
import { calculateBarRatio } from '../utils/snookerCalculator';
import { Zap, Target, ShieldCheck, AlertTriangle, Trophy, Hash, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';

export function StatsDashboard({ p1Stats, p2Stats, players, device, isMobileStatsOpen }) {
  const isMobile = device?.type === 'Mobile';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // หากเป็นโทรศัพท์มือถือ และผู้ใช้งานยังไม่ได้กดปุ่ม Dropdown สถิติ ข้างคำว่า จบแมตช์ ➔ ไม่ต้องแสดงผล
  if (isMobile && !isMobileStatsOpen) {
    return null;
  }

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

  // 4. Fouls Committed & Conceded Points (Fewer is better)
  const foulRatio = calculateBarRatio(p1Stats.foulsCommitted, p2Stats.foulsCommitted, true);
  const p1FoulBetter = p2Stats.foulsCommitted > p1Stats.foulsCommitted;
  const p2FoulBetter = p1Stats.foulsCommitted > p2Stats.foulsCommitted;

  // 5. Highest Break
  const breakRatio = calculateBarRatio(p1Stats.highestBreak, p2Stats.highestBreak);

  // 6. Total Match Points
  const totalPointsRatio = calculateBarRatio(p1Stats.totalPoints, p2Stats.totalPoints);

  return (
    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Section Title with Collapse / Expand Toggle Button */}
      <div className="flex items-center justify-between bg-slate-900/80 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <h2 className="text-[11px] sm:text-xs font-bold text-slate-200">สถิติเปรียบเทียบสด (Live Analytics)</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* ปุ่มกด ย่อ / ขยาย แผงสถิติ */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all shadow-sm active:scale-95"
            title={isCollapsed ? 'ขยายแผงสถิติ' : 'ย่อแผงสถิติ'}
          >
            <BarChart2 className="w-3 h-3 text-amber-400" />
            <span>{isCollapsed ? 'ขยายสถิติ' : 'ย่อสถิติ'}</span>
            {isCollapsed ? (
              <ChevronDown className="w-3 h-3 text-amber-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* เมื่อ ย่อ สถิติ ➔ แสดงสรุปแบบบรรทัดเดียว (Slim Mini Bar ด้านล่างสุด) */}
      {isCollapsed ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-1 flex items-center justify-between text-[10px] font-mono text-slate-300 gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400">AST:</span>
            <span className="text-sky-400 font-bold">{p1Stats.ast}s</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">{p2Stats.ast}s</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400">Pot%:</span>
            <span className="text-sky-400 font-bold">{p1Stats.potAccuracy}%</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">{p2Stats.potAccuracy}%</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400">Safety%:</span>
            <span className="text-sky-400 font-bold">{p1Stats.safetyRate}%</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">{p2Stats.safetyRate}%</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-400">Fouls:</span>
            <span className="text-sky-400 font-bold">{p1Stats.foulsCommitted}</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">{p2Stats.foulsCommitted}</span>
          </div>
        </div>
      ) : (
        /* เมื่อ ขยาย สถิติ ➔ แสดงสถิติเปรียบเทียบเต็มรูปแบบ 6 รายการ */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5 animate-in fade-in duration-200">
          <ComparisonBar
            label="1. ความเร็วเฉลี่ย (AST)"
            val1={p1Stats.ast}
            val2={p2Stats.ast}
            p1Pct={astRatio.p1Pct}
            p2Pct={astRatio.p2Pct}
            unit="s"
            subtext1={`แทง ${p1Stats.totalShots} ครั้ง`}
            subtext2={`แทง ${p2Stats.totalShots} ครั้ง`}
            p1Better={p1AstBetter}
            p2Better={p2AstBetter}
            icon={Zap}
          />

          <ComparisonBar
            label="2. ความแม่นยำ (Pot Accuracy)"
            val1={p1Stats.potAccuracy}
            val2={p2Stats.potAccuracy}
            p1Pct={potRatio.p1Pct}
            p2Pct={potRatio.p2Pct}
            unit="%"
            subtext1={`${p1Stats.successfulPots}/${p1Stats.attemptedPots}`}
            subtext2={`${p2Stats.successfulPots}/${p2Stats.attemptedPots}`}
            p1Better={p1PotBetter}
            p2Better={p2PotBetter}
            icon={Target}
          />

          <ComparisonBar
            label="3. อัตราการกัน (Safety Rate)"
            val1={p1Stats.safetyRate}
            val2={p2Stats.safetyRate}
            p1Pct={safetyRatio.p1Pct}
            p2Pct={safetyRatio.p2Pct}
            unit="%"
            subtext1={`${p1Stats.successfulSafeties}/${p1Stats.totalSafeties}`}
            subtext2={`${p2Stats.successfulSafeties}/${p2Stats.totalSafeties}`}
            p1Better={p1SafetyBetter}
            p2Better={p2SafetyBetter}
            icon={ShieldCheck}
          />

          <ComparisonBar
            label="4. การฟาวล์ (Fouls)"
            val1={p1Stats.foulsCommitted}
            val2={p2Stats.foulsCommitted}
            p1Pct={foulRatio.p1Pct}
            p2Pct={foulRatio.p2Pct}
            unit=" ครั้ง"
            subtext1={`เสีย ${p1Stats.foulPointsConceded} แต้ม`}
            subtext2={`เสีย ${p2Stats.foulPointsConceded} แต้ม`}
            p1Better={p1FoulBetter}
            p2Better={p2FoulBetter}
            icon={AlertTriangle}
          />

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

          <ComparisonBar
            label="6. คะแนนรวม (Total Points)"
            val1={p1Stats.totalPoints}
            val2={p2Stats.totalPoints}
            p1Pct={totalPointsRatio.p1Pct}
            p2Pct={totalPointsRatio.p2Pct}
            unit=" แต้ม"
            p1Better={p1Stats.totalPoints > p2Stats.totalPoints}
            p2Better={p2Stats.totalPoints > p1Stats.totalPoints}
            icon={Hash}
          />
        </div>
      )}
    </div>
  );
}
