import React from 'react';
import { Trophy, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Frame, Match } from '../types/snooker';

interface FrameEndModalProps {
  isOpen: boolean;
  frame: Frame;
  match: Match;
  onNextFrame: () => void;
  onFinishMatch: () => void;
}

export const FrameEndModal: React.FC<FrameEndModalProps> = ({
  isOpen,
  frame,
  match,
  onNextFrame,
  onFinishMatch,
}) => {
  if (!isOpen) return null;

  const winnerIndex = frame.player1Score > frame.player2Score ? 0 : 1;
  const winnerName = winnerIndex === 0 ? match.player1Name : match.player2Name;

  const isUnlimited = match.matchLengthType === 'unlimited' || match.bestOfFrames === 0;
  const framesNeeded = isUnlimited ? Infinity : Math.ceil(match.bestOfFrames / 2);
  const p1Frames = frame.player1Score > frame.player2Score ? match.player1FramesWon + 1 : match.player1FramesWon;
  const p2Frames = frame.player2Score > frame.player1Score ? match.player2FramesWon + 1 : match.player2FramesWon;

  const isMatchWon = !isUnlimited && (p1Frames >= framesNeeded || p2Frames >= framesNeeded);
  const matchWinnerName = p1Frames >= framesNeeded ? match.player1Name : match.player2Name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl xs:rounded-2xl max-w-md w-full p-3.5 xs:p-5 sm:p-6 shadow-2xl space-y-2.5 xs:space-y-4 text-center max-h-[95dvh] overflow-y-auto my-auto">
        
        {/* Trophy Icon */}
        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 text-slate-950" />
        </div>

        {/* Title & Winner Header */}
        <div>
          <span className="text-[10px] xs:text-xs font-extrabold uppercase text-amber-400 tracking-widest block mb-0.5">
            {isMatchWon ? '🏆 จบการแข่งขันทั้งแมตช์!' : `🎉 จบเฟรมที่ ${frame.frameNumber}`}
          </span>
          <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            {isMatchWon ? `${matchWinnerName} ชนะการแข่งขัน!` : `${winnerName} ชนะเฟรมนี้!`}
          </h3>
        </div>

        {/* Frame Score Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg xs:rounded-xl p-2.5 xs:p-3 font-mono">
          <div className="text-2xl xs:text-3xl sm:text-4xl font-black text-white flex items-center justify-center space-x-3 xs:space-x-4">
            <span className={winnerIndex === 0 ? 'text-emerald-400' : 'text-slate-400'}>{frame.player1Score}</span>
            <span className="text-slate-600">-</span>
            <span className={winnerIndex === 1 ? 'text-amber-400' : 'text-slate-400'}>{frame.player2Score}</span>
          </div>
          <div className="text-[11px] xs:text-xs text-slate-400 font-sans mt-0.5">
            {match.player1Name} vs {match.player2Name}
          </div>
        </div>

        {/* Frames Progress */}
        <div className="text-[11px] xs:text-xs text-slate-300 font-semibold flex items-center justify-center space-x-1.5 xs:space-x-2">
          <span>สกอร์รวม:</span>
          <span className="font-mono font-bold text-amber-300 text-xs xs:text-sm">{p1Frames} - {p2Frames}</span>
          <span>{isUnlimited ? '(โหมดเล่นไปเรื่อยๆ ♾️)' : `(Best of ${match.bestOfFrames})`}</span>
        </div>

        {/* Action Buttons: Always Fully Clickable & Touch Friendly */}
        <div className="pt-1 xs:pt-2 flex flex-col sm:flex-row items-stretch justify-center gap-2 xs:gap-2.5">
          {isUnlimited ? (
            <>
              <button
                onClick={onNextFrame}
                className="flex-1 py-2 xs:py-2.5 sm:py-3 px-4 rounded-lg xs:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs xs:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
              >
                <span>เริ่มเฟรมต่อไป</span>
                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
              </button>

              <button
                onClick={onFinishMatch}
                className="flex-1 py-2 xs:py-2.5 sm:py-3 px-4 rounded-lg xs:rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-extrabold text-xs xs:text-sm flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span>จบแมตช์ & บันทึกผล</span>
              </button>
            </>
          ) : !isMatchWon ? (
            <>
              <button
                onClick={onNextFrame}
                className="flex-1 py-2 xs:py-2.5 sm:py-3 px-4 rounded-lg xs:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs xs:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
              >
                <span>เริ่มเฟรมถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
              </button>

              <button
                onClick={onFinishMatch}
                className="flex-1 py-2 xs:py-2.5 sm:py-3 px-4 rounded-lg xs:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs xs:text-sm flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-amber-400" />
                <span>จบแมตช์ตอนนี้</span>
              </button>
            </>
          ) : (
            <button
              onClick={onFinishMatch}
              className="w-full py-2.5 xs:py-3 px-6 rounded-lg xs:rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs xs:text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <span>บันทึกผลและปิดแมตช์</span>
              <Trophy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
