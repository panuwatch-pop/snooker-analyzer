import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function FoulModal({ isOpen, onClose, commitFoul, activePlayerName, opponentName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-900/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-100">บันทึกการฟาวล์ (Foul Penalty)</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300">
          <span className="font-bold text-red-400">{activePlayerName}</span> ทำฟาวล์! 
          กรุณาเลือกแต้มปรับที่จะยกให้ <span className="font-bold text-emerald-400">{opponentName}</span>:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[4, 5, 6, 7].map((pts) => (
            <button
              key={pts}
              onClick={() => commitFoul(pts)}
              className="flex flex-col items-center justify-center p-4 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 group"
            >
              <span className="text-3xl font-extrabold font-mono text-red-400 group-hover:text-white">
                +{pts}
              </span>
              <span className="text-xs text-red-300 mt-1">
                ฟาวล์ {pts} แต้ม (กด [{pts}])
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-800">
          * การฟาวล์จะเปลี่ยนสิทธิ์การเล่นให้อีกฝั่งอัตโนมัติ และบันทึกลงสถิติลบ
        </div>
      </div>
    </div>
  );
}
