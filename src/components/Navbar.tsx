import React from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  BarChart3, 
  TableProperties, 
  History, 
  Tv 
} from 'lucide-react';
import { GameMode } from '../types/snooker';
import { APP_VERSION } from '../version';

interface NavbarProps {
  activeTab: 'scoreboard' | 'raw-data' | 'analytics' | 'history';
  setActiveTab: (tab: 'scoreboard' | 'raw-data' | 'analytics' | 'history') => void;
  gameMode: GameMode;
  matchLengthType?: 'best-of' | 'unlimited';
  bestOfFrames: number;
  currentFrameNumber: number;
  isMuted: boolean;
  onToggleMute: () => void;
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
  onNewMatch,
}) => {
  const isUnlimited = matchLengthType === 'unlimited' || bestOfFrames === 0;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-2 sm:px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Top Header Row: Logo, Match Mode & Sound Toggle pinned on top */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
              <span className="text-xs sm:text-base tracking-wide font-black uppercase">SNOOKER PRO</span>
              <span className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-1 sm:px-1.5 py-0.5 rounded shadow">{APP_VERSION}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-[10px] sm:text-xs font-semibold">
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border ${
                gameMode === 'snooker-ga' 
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500 font-extrabold shadow-sm' 
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              }`}>
                {gameMode === 'snooker-ga' ? '🎯 สนุ๊กกา' : (gameMode === '15-reds' ? '15 แดง' : '6 แดง')}
              </span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full border hidden xs:inline-block ${isUnlimited ? 'bg-purple-950/80 text-purple-300 border-purple-700' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {isUnlimited ? `เฟรม ${currentFrameNumber} (♾️)` : `เฟรม ${currentFrameNumber}/${bestOfFrames}`}
              </span>
            </div>
          </div>

          {/* Mute / Unmute Button: ALWAYS on TOP RIGHT of screen */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียง (Sound Unmuted)' : 'ปิดเสียง (Sound Muted)'}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all border font-bold text-[10px] sm:text-xs cursor-pointer shadow-sm flex-shrink-0 ${
              isMuted
                ? 'bg-rose-950/90 text-rose-300 border-rose-700 hover:bg-rose-900 shadow-rose-950/40'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-600 hover:bg-emerald-900 shadow-emerald-950/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />}
            <span>{isMuted ? 'เปิดเสียง' : 'เสียงเปิด'}</span>
          </button>
        </div>

        {/* Tab Navigation: Mobile Dropdown (< md) vs Desktop Full Buttons (>= md) */}
        <div className="flex items-center space-x-2">
          {/* Mobile Tab Dropdown */}
          <div className="md:hidden flex-1 sm:flex-initial">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-950 text-emerald-300 font-bold text-xs rounded-lg px-2.5 py-1.5 border border-emerald-600/70 outline-none focus:ring-2 focus:ring-emerald-500 shadow-md cursor-pointer"
            >
              <option value="scoreboard" className="bg-slate-900 text-slate-100 font-semibold">📺 กระดานคะแนน</option>
              <option value="raw-data" className="bg-slate-900 text-slate-100 font-semibold">📋 ข้อมูลดิบ (Logs)</option>
              <option value="analytics" className="bg-slate-900 text-slate-100 font-semibold">📊 วิเคราะห์สถิติ %</option>
              <option value="history" className="bg-slate-900 text-slate-100 font-semibold">📜 ประวัติการแข่ง</option>
            </select>
          </div>

          {/* Desktop Horizontal Tabs */}
          <nav className="hidden md:flex items-center bg-slate-950/70 p-0.5 sm:p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('scoreboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ประวัติการแข่ง</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
