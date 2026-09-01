import React from 'react';
import { Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-9 h-9 text-slate-950" />
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase text-amber-400 tracking-widest block mb-1">
            {isMatchWon ? '🏆 จบการแข่งขันทั้งแมตช์!' : `🎉 จบเฟรมที่ ${frame.frameNumber}`}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {isMatchWon ? `${matchWinnerName} ชนะการแข่งขัน!` : `${winnerName} ชนะเฟรมนี้!`}
          </h3>
        </div>

        {/* Frame Score Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
          <div className="text-3xl font-black text-white flex items-center justify-center space-x-4">
            <span className={winnerIndex === 0 ? 'text-emerald-400' : 'text-slate-400'}>{frame.player1Score}</span>
            <span className="text-slate-600">-</span>
            <span className={winnerIndex === 1 ? 'text-amber-400' : 'text-slate-400'}>{frame.player2Score}</span>
          </div>
          <div className="text-xs text-slate-400 font-sans mt-1">
            {match.player1Name} vs {match.player2Name}
          </div>
        </div>

        {/* Frames Progress */}
        <div className="text-xs text-slate-300 font-semibold flex items-center justify-center space-x-2">
          <span>สกอร์เฟรมรวม:</span>
          <span className="font-mono font-bold text-amber-300 text-sm">{p1Frames} - {p2Frames}</span>
          <span>{isUnlimited ? '(โหมดเล่นไปเรื่อยๆ ♾️)' : `(Best of ${match.bestOfFrames})`}</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isUnlimited ? (
            <>
              <button
                onClick={onNextFrame}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <span>เริ่มเฟรมต่อไป</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onFinishMatch}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-extrabold text-sm flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>จบแมตช์ & บันทึกผล</span>
              </button>
            </>
          ) : !isMatchWon ? (
            <button
              onClick={onNextFrame}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <span>เริ่มเฟรมถัดไป (Next Frame)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onFinishMatch}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-extrabold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
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
