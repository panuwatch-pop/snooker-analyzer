import React from 'react';
import { Trophy, ArrowRight, CheckCircle2, Percent, Zap } from 'lucide-react';
import { Frame, Match } from '../types/snooker';
import { calculateHandicapScore } from '../utils/snookerRules';

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

  const isElectric = match.gameMode === 'electric-count';
  const electricConfig = match.electricConfig || frame.electricConfig;
  const hasHandicap = isElectric && electricConfig?.handicapEnabled;

  const winnerIndex = frame.player1Score > frame.player2Score ? 0 : 1;
  const winnerName = winnerIndex === 0 ? match.player1Name : match.player2Name;

  const isUnlimited = match.matchLengthType === 'unlimited' || match.bestOfFrames === 0;
  const framesNeeded = isUnlimited ? Infinity : Math.ceil(match.bestOfFrames / 2);
  const p1Frames = frame.player1Score > frame.player2Score ? match.player1FramesWon + 1 : match.player1FramesWon;
  const p2Frames = frame.player2Score > frame.player1Score ? match.player2FramesWon + 1 : match.player2FramesWon;

  // In electric mode, match is won when total games reached or decided by user
  const totalGamesTarget = match.bestOfFrames;
  const isMatchWon = isElectric
    ? (!isUnlimited && (frame.frameNumber >= totalGamesTarget))
    : (!isUnlimited && (p1Frames >= framesNeeded || p2Frames >= framesNeeded));

  const matchWinnerName = isElectric
    ? (p1Frames > p2Frames ? match.player1Name : (p2Frames > p1Frames ? match.player2Name : 'เสมอ'))
    : (p1Frames >= framesNeeded ? match.player1Name : match.player2Name);

  // Cumulative score calculations for electric mode
  const completedFrames = match.frames.filter(f => f.id !== frame.id);
  const p1CumRaw = completedFrames.reduce((sum, f) => sum + f.player1Score, 0) + frame.player1Score;
  const p2CumRaw = completedFrames.reduce((sum, f) => sum + f.player2Score, 0) + frame.player2Score;

  const p1Giver = hasHandicap && electricConfig.handicapGiverIndex === 0;
  const p2Giver = hasHandicap && electricConfig.handicapGiverIndex === 1;
  const giverRatio = electricConfig?.handicapGiverRatio ?? 80;

  const p1GameHandicap = hasHandicap ? calculateHandicapScore(frame.player1Score, p1Giver, giverRatio) : frame.player1Score;
  const p2GameHandicap = hasHandicap ? calculateHandicapScore(frame.player2Score, p2Giver, giverRatio) : frame.player2Score;

  const p1CumHandicap = hasHandicap ? calculateHandicapScore(p1CumRaw, p1Giver, giverRatio) : p1CumRaw;
  const p2CumHandicap = hasHandicap ? calculateHandicapScore(p2CumRaw, p2Giver, giverRatio) : p2CumRaw;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl xs:rounded-2xl max-w-md w-full p-3.5 xs:p-5 sm:p-6 shadow-2xl space-y-2.5 xs:space-y-3.5 text-center max-h-[95dvh] overflow-y-auto my-auto">
        
        {/* Trophy / Mode Icon */}
        <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center shadow-lg ${
          isElectric
            ? 'bg-gradient-to-tr from-cyan-500 to-teal-300 shadow-cyan-500/30'
            : 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/30'
        }`}>
          {isElectric ? (
            <Zap className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-slate-950" />
          ) : (
            <Trophy className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-slate-950" />
          )}
        </div>

        {/* Title & Winner Header */}
        <div>
          <span className="text-[10px] xs:text-xs font-extrabold uppercase text-amber-400 tracking-widest block mb-0.5">
            {isMatchWon
              ? '🏆 จบการแข่งขันทั้งแมตช์!'
              : (isElectric ? `⚡ จบเกมที่ ${frame.frameNumber}` : `🎉 จบเฟรมที่ ${frame.frameNumber}`)}
          </span>
          <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            {isMatchWon ? `${matchWinnerName} ชนะการแข่งขัน!` : `${winnerName} ชนะ${isElectric ? 'เกมนี้' : 'เฟรมนี้'}!`}
          </h3>
        </div>

        {/* Game / Frame Score Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg xs:rounded-xl p-2.5 xs:p-3 font-mono space-y-1.5">
          <div className="text-2xl xs:text-3xl sm:text-4xl font-black text-white flex items-center justify-center space-x-3 xs:space-x-4">
            <span className={winnerIndex === 0 ? 'text-emerald-400' : 'text-slate-400'}>{frame.player1Score}</span>
            <span className="text-slate-600">-</span>
            <span className={winnerIndex === 1 ? 'text-amber-400' : 'text-slate-400'}>{frame.player2Score}</span>
          </div>
          <div className="text-[11px] xs:text-xs text-slate-400 font-sans">
            {match.player1Name} vs {match.player2Name}
          </div>

          {/* Handicap Detailed Breakdown (If Handicap is enabled in Electric mode) */}
          {hasHandicap && (
            <div className="pt-2 border-t border-slate-800 text-[10px] xs:text-xs text-left bg-slate-900/80 rounded-lg p-2 space-y-1 font-sans">
              <div className="flex items-center space-x-1 font-bold text-cyan-300">
                <Percent className="w-3 h-3 text-cyan-400" />
                <span>สรุปการคำนวณแต้มต่อ (Handicap):</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <div className="font-bold text-slate-300 truncate">{match.player1Name} {p1Giver ? `(ต่อ ${giverRatio}%)` : '(รอง 100%)'}</div>
                  <div className="text-slate-400">แต้มดิบเกมนี้: <strong className="text-white font-mono">{frame.player1Score}</strong></div>
                  <div className="text-cyan-300">หลังคิดแต้มต่อ: <strong className="text-cyan-200 font-mono text-xs">{p1GameHandicap}</strong></div>
                  <div className="text-amber-300 pt-0.5 border-t border-slate-800 mt-0.5 font-bold">รวมสะสมสุทธิ: {p1CumHandicap}</div>
                </div>

                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <div className="font-bold text-slate-300 truncate">{match.player2Name} {p2Giver ? `(ต่อ ${giverRatio}%)` : '(รอง 100%)'}</div>
                  <div className="text-slate-400">แต้มดิบเกมนี้: <strong className="text-white font-mono">{frame.player2Score}</strong></div>
                  <div className="text-cyan-300">หลังคิดแต้มต่อ: <strong className="text-cyan-200 font-mono text-xs">{p2GameHandicap}</strong></div>
                  <div className="text-amber-300 pt-0.5 border-t border-slate-800 mt-0.5 font-bold">รวมสะสมสุทธิ: {p2CumHandicap}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Progress / Total Games info */}
        <div className="text-[11px] xs:text-xs text-slate-300 font-semibold flex items-center justify-center space-x-1.5 xs:space-x-2">
          {isElectric ? (
            <span>
              แต้มสะสมรวมทั้งแมตช์: <strong className="text-cyan-300 font-mono font-bold text-xs xs:text-sm">{p1CumRaw} - {p2CumRaw}</strong>
              {hasHandicap ? ` (สุทธิ: ${p1CumHandicap} - ${p2CumHandicap})` : ''}
              <span className="text-slate-400 ml-1.5">
                {isUnlimited ? `(เล่นไปเรื่อยๆ เกมที่ ${frame.frameNumber})` : `(เกมที่ ${frame.frameNumber}/${totalGamesTarget})`}
              </span>
            </span>
          ) : (
            <span>
              เฟรมรวม: <strong className="text-amber-300 font-mono font-bold text-xs xs:text-sm">{p1Frames} - {p2Frames}</strong>
              <span className="text-slate-400 ml-1.5">
                {isUnlimited ? '(โหมดเล่นไปเรื่อยๆ ♾️)' : `(Best of ${match.bestOfFrames})`}
              </span>
            </span>
          )}
        </div>

        {/* Action Buttons: Always Fully Clickable & Touch Friendly */}
        <div className="pt-1 xs:pt-1.5 flex flex-col sm:flex-row items-stretch justify-center gap-2 xs:gap-2.5">
          {isUnlimited ? (
            <>
              <button
                onClick={onNextFrame}
                className="flex-1 py-2 xs:py-2.5 sm:py-3 px-4 rounded-lg xs:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs xs:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
              >
                <span>{isElectric ? 'เริ่มเกมถัดไป' : 'เริ่มเฟรมต่อไป'}</span>
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
                <span>{isElectric ? 'เริ่มเกมถัดไป' : 'เริ่มเฟรมถัดไป'}</span>
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
