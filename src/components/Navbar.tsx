import React from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  BarChart3, 
  TableProperties, 
  History, 
  Tv,
  Keyboard,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sun,
  Moon
} from 'lucide-react';
import { GameMode } from '../types/snooker';
import { APP_VERSION } from '../version';
import { useDevice } from '../utils/device';

interface NavbarProps {
  activeTab: 'scoreboard' | 'keyboard-display' | 'raw-data' | 'analytics' | 'history';
  setActiveTab: (tab: 'scoreboard' | 'keyboard-display' | 'raw-data' | 'analytics' | 'history') => void;
  gameMode: GameMode;
  matchLengthType?: 'best-of' | 'unlimited';
  bestOfFrames: number;
  currentFrameNumber: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onNewMatch: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
  isFullscreen = false,
  onToggleFullscreen,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isUnlimited = matchLengthType === 'unlimited' || bestOfFrames === 0;
  const { isMobile } = useDevice();

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-1.5 sm:px-3 py-0.5 sm:py-1.5 shadow-md flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
        {/* Left Section: Logo, Version & Prominent Fullscreen Toggle Button */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-pulse flex-shrink-0" />
            <span className="text-[11px] sm:text-sm tracking-wide font-black uppercase whitespace-nowrap">SNOOKER PRO</span>
            <span className="text-[8px] sm:text-[9px] bg-amber-400 text-slate-950 font-black px-1 py-0.2 rounded shadow">{APP_VERSION}</span>
          </div>

          {/* Prominent Fullscreen Toggle Button next to SNOOKER PRO */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "ย่อหน้าจอกลับ (คีย์ลัด: + หรือ F11)" : "ขยายเต็มจอ (คีย์ลัด: + หรือ F11)"}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg transition-all border font-black text-[10px] sm:text-xs cursor-pointer shadow-md flex-shrink-0 active:scale-95 ${
                isFullscreen
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-amber-500/30 ring-1 ring-amber-300'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border-indigo-400 shadow-indigo-600/30'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 flex-shrink-0" />
                  <span className="hidden xs:inline font-bold">ย่อจอ</span>
                  <span className="bg-slate-900/30 text-slate-950 px-1 py-0.2 rounded text-[9px] font-mono font-bold">[+]</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                  <span className="hidden xs:inline font-bold">ขยายจอ</span>
                  <span className="bg-black/30 text-indigo-100 px-1 py-0.2 rounded text-[9px] font-mono font-bold">[+]</span>
                </>
              )}
            </button>
          )}

          <div className="hidden xs:flex items-center space-x-1 text-[9px] sm:text-xs font-semibold flex-shrink-0">
            <span className={`px-1.5 py-0.5 rounded-full border ${
              gameMode === 'snooker-ga' 
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 font-extrabold shadow-sm' 
                : (gameMode === 'electric-count'
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500 font-extrabold shadow-sm'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60')
            }`}>
              {gameMode === 'snooker-ga' ? '🎯 กา' : (gameMode === 'electric-count' ? '⚡ ไฟฟ้า' : (gameMode === '15-reds' ? '15 แดง' : '6 แดง'))}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full border hidden sm:inline-block ${isUnlimited ? 'bg-purple-950/80 text-purple-300 border-purple-700' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {isUnlimited ? `เฟรม ${currentFrameNumber} (♾️)` : `เฟรม ${currentFrameNumber}/${bestOfFrames}`}
            </span>
          </div>
        </div>

        {/* Center / Right Section: Mobile Dropdown (Top Row) OR Desktop/Tablet Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-1 justify-end min-w-0">
          {isMobile ? (
            /* Mobile Tab Dropdown in the TOP ROW with Down Arrow (for Phones in Portrait & Landscape) */
            <div className="relative flex items-center min-w-0 max-w-[170px] xs:max-w-[210px]">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="appearance-none w-full bg-slate-950 text-emerald-300 font-bold text-[11px] xs:text-xs rounded-lg pl-2 pr-6 py-1 border border-emerald-600/80 outline-none focus:ring-1 focus:ring-emerald-400 shadow cursor-pointer truncate"
              >
                <option value="scoreboard" className="bg-slate-900 text-slate-100 font-semibold">📺 กระดานคะแนน</option>
                <option value="keyboard-display" className="bg-slate-900 text-slate-100 font-semibold">⌨️ จอคีย์บอร์ด / TV</option>
                <option value="raw-data" className="bg-slate-900 text-slate-100 font-semibold">📋 ข้อมูลดิบ (Logs)</option>
                <option value="analytics" className="bg-slate-900 text-slate-100 font-semibold">📊 วิเคราะห์สถิติ %</option>
                <option value="history" className="bg-slate-900 text-slate-100 font-semibold">📜 ประวัติการแข่ง</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            /* Tablet / Desktop Horizontal Tabs */
            <nav className="flex items-center bg-slate-950/70 p-0.5 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('scoreboard')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scoreboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>กระดานคะแนน</span>
            </button>

            <button
              onClick={() => setActiveTab('keyboard-display')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'keyboard-display'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>จอคีย์บอร์ด / TV</span>
            </button>

            <button
              onClick={() => setActiveTab('raw-data')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'raw-data'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>ข้อมูลดิบ (Logs)</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>วิเคราะห์สถิติ %</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>ประวัติการแข่ง</span>
            </button>
          </nav>
        )}

          {/* Theme Toggle Button: Dark / Light */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'light' ? 'เปลี่ยนเป็นธีมมืด (Dark Theme)' : 'เปลี่ยนเป็นธีมสว่าง (Light Theme)'}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all border font-bold text-[10px] sm:text-xs cursor-pointer shadow-sm flex-shrink-0 active:scale-95 ${
                theme === 'light'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 shadow-amber-200/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-slate-900/50'
              }`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-800" />
                  <span className="hidden xs:inline">ธีมมืด</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">ธีมสว่าง</span>
                </>
              )}
            </button>
          )}

          {/* Mute / Unmute Button: Top Right */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียง (Sound Unmuted)' : 'ปิดเสียง (Sound Muted)'}
            className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all border font-bold text-[10px] sm:text-xs cursor-pointer shadow-sm flex-shrink-0 ${
              isMuted
                ? 'bg-rose-950/90 text-rose-300 border-rose-700 hover:bg-rose-900 shadow-rose-950/40'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-600 hover:bg-emerald-900 shadow-emerald-950/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse" />}
            <span className="hidden xs:inline">{isMuted ? 'เปิดเสียง' : 'เสียงเปิด'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
