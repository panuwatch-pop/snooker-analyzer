import React from 'react';
import { History, Clock, Target, Shield, AlertTriangle, ArrowRightLeft, Trophy, Flag } from 'lucide-react';

const getDisplayName = (name) => {
  if (!name) return 'ผู้เล่น';
  return name.replace(/\s*\(.*?\)/g, '').trim();
};

export function ShotHistoryLog({ shotLog }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-400" />
          <span>ประวัติการกดช็อตย้อนหลัง (Shot Log)</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">{shotLog.length} ช็อตล่าสุด</span>
      </div>

      {shotLog.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 italic">
          ยังไม่มีข้อมูลการกดแต้มในแมตช์นี้ (กดปุ่ม 1-7 หรือ S, M, F บนคีย์บอร์ดเพื่อเริ่มบันทึก)
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
          {shotLog.map((log) => {
            const isP1 = log.playerIndex === 0;

            // 🏁 แสดงแถบจบเฟรมเด่นชัดในประวัติย้อนหลัง
            if (log.type === 'FRAME_END') {
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-200 shadow-md animate-in fade-in"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>🏁 จบเฟรมที่ {log.frameCompleted}</span>
                    <span className="text-[10px] text-slate-300 font-normal">
                      (ชนะ: <strong className="text-amber-300">{getDisplayName(log.playerName)}</strong>)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300 font-black">
                      {log.p1FramePoints} - {log.p2FramePoints}
                    </span>
                    <span className="text-[9px] text-amber-400/80">{log.timestamp}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-1.5 sm:p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-slate-700"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className={`font-semibold px-1.5 py-0.2 rounded text-[10px] shrink-0 ${
                    isP1 ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {getDisplayName(log.playerName)}
                  </span>

                  {log.type === 'POT' && log.ball && (
                    <div className="flex items-center gap-1 truncate">
                      <span className={`w-4 h-4 rounded-full ${log.ball.color} border ${log.ball.border} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                        {log.points}
                      </span>
                      <span className="text-slate-300 truncate">ตบลูก {getDisplayName(log.ball.name)} (+{log.points})</span>
                    </div>
                  )}

                  {log.type === 'SAFETY' && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Shield className="w-3 h-3" />
                      <span>แทงกัน (Safety)</span>
                    </span>
                  )}

                  {log.type === 'MISS' && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Target className="w-3 h-3" />
                      <span>แทงพลาด (Miss Shot)</span>
                    </span>
                  )}

                  {log.type === 'FOUL' && (
                    <span className="flex items-center gap-1 text-red-400 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>ฟาวล์ (เสีย +{log.foulPointsGiven} แต้ม)</span>
                    </span>
                  )}

                  {log.type === 'SWITCH' && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>เปลี่ยนฝั่ง</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 pl-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{log.duration}s</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
