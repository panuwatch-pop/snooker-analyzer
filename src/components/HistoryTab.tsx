import React, { useState, useEffect } from 'react';
import { Match, GameMode } from '../types/snooker';
import { loadMatchHistory, deleteMatchFromHistory, exportHistoryJSON, exportMatchToCSV } from '../utils/storage';
import { History, Calendar, Trophy, Download, Trash2, Filter, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryTabProps {
  onLoadMatch: (match: Match) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onLoadMatch }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'all' | GameMode>('all');
  const [dateQuery, setDateQuery] = useState<string>('');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  useEffect(() => {
    setMatches(loadMatchHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('คุณต้องการลบผลการแข่งขันนี้ใช่หรือไม่?')) {
      deleteMatchFromHistory(id);
      setMatches(loadMatchHistory());
    }
  };

  const handleExportJSON = () => {
    const data = exportHistoryJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snooker-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleExportCSV = (m: Match) => {
    const csv = exportMatchToCSV(m);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snooker-match-${m.title}-${m.date}.csv`;
    a.click();
  };

  const filteredMatches = matches.filter(m => {
    if (selectedFormat !== 'all' && m.gameMode !== selectedFormat) return false;
    if (dateQuery && !m.date.includes(dateQuery) && !m.title.toLowerCase().includes(dateQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <History className="w-6 h-6" />
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">ประวัติการแข่งขันย้อนหลัง (Match History)</h2>
              <p className="text-xs text-slate-400">บันทึกผลการเล่น 15 แดง และ 6 แดง พร้อมวันที่และสถิติครบถ้วน</p>
            </div>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export ข้อมูลทั้งหมด (JSON)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs font-semibold">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">รูปแบบ:</span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'all' | GameMode)}
              className="bg-slate-800 text-slate-100 rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer"
            >
              <option value="all">ทั้งหมด</option>
              <option value="15-reds">15 แดง (Standard)</option>
              <option value="6-reds">6 แดง (Six-red)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex-1 min-w-[200px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตามวันที่ (เช่น 2026-08-31) หรือชื่อแมตช์..."
              value={dateQuery}
              onChange={(e) => setDateQuery(e.target.value)}
              className="bg-transparent text-slate-100 placeholder-slate-500 w-full outline-none"
            />
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 space-y-2">
          <Trophy className="w-12 h-12 mx-auto text-slate-700 opacity-50" />
          <p className="text-sm font-semibold">ยังไม่มีประวัติการแข่งขันที่บันทึกไว้</p>
          <p className="text-xs">เมื่อเล่นจบเฟรมหรือจบแมตช์ ข้อมูลจะถูกจัดเก็บบันทึกอัตโนมัติที่นี่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const isExpanded = expandedMatchId === m.id;
            const p1Won = m.player1FramesWon;
            const p2Won = m.player2FramesWon;
            const winnerName = m.winnerIndex !== undefined 
              ? (m.winnerIndex === 0 ? m.player1Name : m.player2Name)
              : (p1Won > p2Won ? m.player1Name : p2Won > p1Won ? m.player2Name : 'เสมอ');

            return (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] font-extrabold">
                        {m.gameMode === '15-reds' ? '15 แดง' : '6 แดง'}
                      </span>
                      <h3 className="text-base font-black text-white">{m.title || 'แมตช์กระชับมิตร'}</h3>
                      <span className="text-xs text-slate-400 font-mono">({m.date})</span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center space-x-2">
                      <span>ผู้ชนะ: <strong className="text-amber-400 font-bold">{winnerName}</strong></span>
                      <span>•</span>
                      <span>Best of {m.bestOfFrames}</span>
                    </div>
                  </div>

                  {/* Score pill & Quick Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center font-mono">
                      <div className="text-lg font-black text-white">
                        <span className={p1Won > p2Won ? 'text-emerald-400' : 'text-slate-300'}>{p1Won}</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className={p2Won > p1Won ? 'text-amber-400' : 'text-slate-300'}>{p2Won}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {m.player1Name} vs {m.player2Name}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleExportCSV(m)}
                        title="ดาวน์โหลด CSV"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => handleDelete(m.id)}
                        title="ลบแมตช์"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        <span>รายละเอียด</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Frame Breakdown Table */}
                {isExpanded && (
                  <div className="bg-slate-950 border-t border-slate-800/80 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      สรุปผลแยกตามแต่ละเฟรม (Frame by Frame Breakdown)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-2">เฟรม</th>
                            <th className="py-2 px-2">{m.player1Name}</th>
                            <th className="py-2 px-2">{m.player2Name}</th>
                            <th className="py-2 px-2">เวลา</th>
                            <th className="py-2 px-2">เบรกสูงสุด P1</th>
                            <th className="py-2 px-2">เบรกสูงสุด P2</th>
                            <th className="py-2 px-2">แม่นยำ P1</th>
                            <th className="py-2 px-2">แม่นยำ P2</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-slate-200">
                          {m.frames.map((f, fIdx) => (
                            <tr key={fIdx}>
                              <td className="py-2 px-2 font-mono font-bold">เฟรม {fIdx + 1}</td>
                              <td className="py-2 px-2 font-mono font-bold text-emerald-400">{f.player1Score}</td>
                              <td className="py-2 px-2 font-mono font-bold text-amber-400">{f.player2Score}</td>
                              <td className="py-2 px-2 font-mono text-slate-400">{Math.round(f.durationSec / 60)} นาที</td>
                              <td className="py-2 px-2 font-mono">{f.stats[0]?.highestBreak || 0}</td>
                              <td className="py-2 px-2 font-mono">{f.stats[1]?.highestBreak || 0}</td>
                              <td className="py-2 px-2 font-mono">{f.stats[0]?.pottingAccuracy || 0}%</td>
                              <td className="py-2 px-2 font-mono">{f.stats[1]?.pottingAccuracy || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
