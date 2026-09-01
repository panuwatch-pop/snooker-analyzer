import React, { useState } from 'react';
import { Frame, Match } from '../types/snooker';
import { BALL_MAP } from '../utils/snookerRules';
import { TableProperties, Filter, CheckCircle2, XCircle, Flame } from 'lucide-react';

interface RawDataTabProps {
  currentMatch: Match;
  currentFrame: Frame;
}

export const RawDataTab: React.FC<RawDataTabProps> = ({ currentMatch, currentFrame }) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(currentMatch.currentFrameIndex);
  const [playerFilter, setPlayerFilter] = useState<'all' | 0 | 1>('all');

  const activeFrame = currentMatch.frames[selectedFrameIndex] || currentFrame;
  const shots = activeFrame.shots || [];
  const visits = activeFrame.visits || [];

  const filteredShots = shots
    .filter(s => {
      if (playerFilter === 'all') return true;
      return s.playerIndex === playerFilter;
    })
    .slice()
    .reverse(); // Latest shot on top, first shot on bottom

  const getActionBadge = (action: string, ball?: string, points?: number, concededOpportunity?: boolean) => {
    switch (action) {
      case 'pot': {
        const ballInfo = ball ? BALL_MAP[ball as keyof typeof BALL_MAP] : null;
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
            {ballInfo && (
              <span className={`w-3.5 h-3.5 rounded-full inline-block ${ballInfo.cssClass}`} />
            )}
            <span>ลง (+{points} {ballInfo?.nameTh || ball})</span>
          </span>
        );
      }
      case 'foul':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-700">
            เสียฟาวล์ (+{points} แต้ม)
          </span>
        );
      case 'miss':
      case 'safety':
      case 'end-turn':
        if (concededOpportunity === false) {
          return (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600 shadow-sm">
              <span>🛡️ ป้องกันดี</span>
            </span>
          );
        }
        if (concededOpportunity === true) {
          return (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-950/90 text-rose-300 border border-rose-600 shadow-sm">
              <span>❌ แทงพลาด</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            🔄 เปลี่ยนเทิร์น
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{action}</span>;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <TableProperties className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-black text-white">ล็อคการเล่น & ตารางข้อมูลดิบ (Match Play Logs)</h2>
              <p className="text-xs text-slate-400">บันทึกช็อตต่อช็อต ลูกที่ตบลง และคะแนนจริงทั้งหมดในเกม</p>
            </div>
          </div>

          {/* Frame Selector & Player Filter */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">เลือกเฟรม:</span>
              <select
                value={selectedFrameIndex}
                onChange={(e) => setSelectedFrameIndex(Number(e.target.value))}
                className="bg-slate-800 text-slate-100 rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer"
              >
                {currentMatch.frames.map((_, idx) => (
                  <option key={idx} value={idx}>
                    เฟรมที่ {idx + 1} {idx === currentMatch.currentFrameIndex ? '(ปัจจุบัน)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">ผู้เล่น:</span>
              <select
                value={playerFilter}
                onChange={(e) => setPlayerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as 0 | 1)}
                className="bg-slate-800 text-slate-100 rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer"
              >
                <option value="all">ทุกคน (All)</option>
                <option value={0}>{currentMatch.player1Name}</option>
                <option value={1}>{currentMatch.player2Name}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Frame Summary Info Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">ช็อตทั้งหมดในเฟรม:</span>
            <span className="font-mono font-bold text-base text-white">{shots.length} ช็อต</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">{currentMatch.player1Name} (P1):</span>
            <span className="font-mono font-bold text-base text-emerald-400">{activeFrame.player1Score} แต้ม</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">{currentMatch.player2Name} (P2):</span>
            <span className="font-mono font-bold text-base text-emerald-400">{activeFrame.player2Score} แต้ม</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">ลูกแดงคงเหลือ:</span>
            <span className="font-mono font-bold text-base text-red-400">{activeFrame.redsRemaining} ลูก</span>
          </div>
        </div>
      </div>

      {/* Raw Event Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-400 sticky top-0 uppercase tracking-wider font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-3"># ช็อต</th>
                <th className="py-3 px-3">เวลา</th>
                <th className="py-3 px-3">ผู้เล่น</th>
                <th className="py-3 px-3">การกระทำ (Action)</th>
                <th className="py-3 px-3 text-center">แต้ม</th>
                <th className="py-3 px-3 text-center">เบรกในรอบ</th>
                <th className="py-3 px-3 text-center">ลูกสะสม</th>
                <th className="py-3 px-3 text-center">เวลาแทง</th>
                <th className="py-3 px-3 text-center">เปิดโอกาสให้คู่แข่ง</th>
                <th className="py-3 px-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {filteredShots.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-semibold">
                    ยังไม่มีข้อมูลช็อตในเฟรมนี้ (กดแทงลูกบนกระดานคะแนนเพื่อเริ่มบันทึก)
                  </td>
                </tr>
              ) : (
                filteredShots.map((shot, idx) => {
                  const playerName = shot.playerIndex === 0 ? currentMatch.player1Name : currentMatch.player2Name;
                  const isP1 = shot.playerIndex === 0;

                  return (
                    <tr
                      key={shot.id || idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isP1 ? 'bg-slate-900/40' : 'bg-slate-950/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{shot.shotNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{shot.timestamp}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${isP1 ? 'text-teal-400' : 'text-amber-400'}`}>
                          {playerName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {getActionBadge(shot.action, shot.ballPotted, shot.points, shot.concededOpportunity)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {shot.points > 0 ? (
                          <span className="text-emerald-400">+{shot.points}</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-300">
                        {shot.visitBreakPoints > 0 ? shot.visitBreakPoints : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        {shot.ballsInVisit > 0 ? `${shot.ballsInVisit} ลูก` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        {shot.shotTimeSec}s
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {shot.concededOpportunity === true ? (
                          <span className="inline-flex items-center space-x-1 text-rose-400 font-bold text-[11px] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>แทงพลาด (เสียแต้ม)</span>
                          </span>
                        ) : shot.concededOpportunity === false ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ป้องกันดี (คู่แข่งไม่ได้แต้ม)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {shot.notes || (shot.action === 'pot' ? `ลงลูก ${shot.ballPotted}` : '')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
