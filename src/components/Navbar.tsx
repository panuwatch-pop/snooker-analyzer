import React from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  PlusCircle, 
  BarChart3, 
  TableProperties, 
  History, 
  Tv 
} from 'lucide-react';
import { GameMode } from '../types/snooker';

interface NavbarProps {
  activeTab: 'scoreboard' | 'raw-data' | 'analytics' | 'history';
  setActiveTab: (tab: 'scoreboard' | 'raw-data' | 'analytics' | 'history') => void;
  gameMode: GameMode;
  matchLengthType?: 'best-of' | 'unlimited';
  bestOfFrames: number;
  currentFrameNumber: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenKeypadGuide: () => void;
  onNewMatch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  gameMode,
  matchLengthType = 'best-of',
  bestOfFrames,
  currentFrameNumber,
  isMuted,
  onToggleMute,
  onOpenKeypadGuide,
  onNewMatch,
}) => {
  const isUnlimited = matchLengthType === 'unlimited' || bestOfFrames === 0;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-md">
            <Trophy className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-base tracking-wide font-black uppercase">SNOOKER PRO</span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full">
              {gameMode === '15-reds' ? '15 แดง' : '6 แดง'}
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${isUnlimited ? 'bg-purple-950/80 text-purple-300 border-purple-700' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {isUnlimited ? `เฟรม ${currentFrameNumber} (เล่นไปเรื่อยๆ ♾️)` : `เฟรม ${currentFrameNumber} / Best of ${bestOfFrames}`}
            </span>
          </div>
        </div>

        <nav className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveTab('scoreboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scoreboard'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>กระดานคะแนน</span>
          </button>

          <button
            onClick={() => setActiveTab('raw-data')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'raw-data'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>ข้อมูลดิบ (Logs)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>วิเคราะห์สถิติ %</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติการแข่ง</span>
          </button>
        </nav>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenKeypadGuide}
            title="คู่มือปุ่มคีย์บอร์ดไร้สาย / Numpad"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">คีย์บอร์ด</span>
          </button>

          <button
            onClick={onNewMatch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-all text-xs md:text-sm font-bold shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เริ่มแมตช์ใหม่</span>
          </button>
        </div>
      </div>
    </header>
  );
};
