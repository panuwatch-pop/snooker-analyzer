import React, { useState, useEffect } from 'react';
import { useSnookerMatch } from './hooks/useSnookerMatch';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useDeviceDetect } from './hooks/useDeviceDetect';
import { ScoreboardHeader } from './components/ScoreboardHeader';
import { StatsDashboard } from './components/StatsDashboard';
import { RefereeDeck } from './components/RefereeDeck';
import { ShotHistoryLog } from './components/ShotHistoryLog';
import { HeadToHeadComparisonView } from './components/HeadToHeadComparisonView';
import { FoulModal } from './components/FoulModal';
import { Keyboard, BarChart2, Maximize, Minimize, RotateCcw, Smartphone, Monitor, Tablet } from 'lucide-react';

export default function App() {
  const match = useSnookerMatch();
  const device = useDeviceDetect(); // ตรวจจับอุปกรณ์และขนาดหน้าจอ
  const [activeTab, setActiveTab] = useState('REFEREE'); // 'REFEREE' | 'HEAD_TO_HEAD'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false); // สเตต Dropdown สถิติตามสั่ง

  // ผูกการทำงานกับปุ่มบนคีย์บอร์ด
  useKeyboardControls({
    scoreBall: match.scoreBall,
    switchTurn: match.switchTurn,
    setIsFoulModalOpen: match.setIsFoulModalOpen,
    isFoulModalOpen: match.isFoulModalOpen,
    commitFoul: match.commitFoul,
    undo: match.undo,
    nextFrame: match.nextFrame,
    resetMatch: match.resetMatch,
  });

  // ตรวจจับการเอียงหน้าจอมือถือ (Portrait vs Landscape Detection)
  useEffect(() => {
    setIsPortrait(device.orientation === 'portrait' && device.type === 'Mobile');
  }, [device]);

  // ฟัง Event สำหรับกรณีหลุดจากโหมด Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (!isNative && isFullscreen) {
        // คงสเตต fullscreen ไว้ถ้าเป็นโหมดมือถือ CSS Fallback
      } else {
        setIsFullscreen(isNative);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  /**
   * สลับโหมดเต็มหน้าจอ
   */
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      window.scrollTo(0, 1);
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().then(() => {
          if (window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const isDesktop = device.type === 'Desktop';

  return (
    <div className={`w-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-emerald-500 selection:text-white transition-all ${
      isFullscreen 
        ? 'fixed inset-0 z-[9999] h-[100dvh] w-vw overflow-y-auto p-[2px] sm:p-1 bg-slate-950' 
        : 'h-[100dvh] overflow-x-hidden'
    }`}>
      
      {/* ป็อปอัปแจ้งเตือนให้หมุนมือถือเป็นแนวขวางอัตโนมัติ (Portrait Rotation Overlay) */}
      {isPortrait && !isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
          <div className="relative">
            <Smartphone className="w-16 h-16 text-amber-400 animate-pulse" />
            <RotateCcw className="w-8 h-8 text-emerald-400 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">กรุณาหมุนโทรศัพท์เป็นแนวขวาง</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              เพื่อการแสดงผลแผงกดแต้มของกรรมการแบบ <span className="text-amber-400 font-bold">เต็มหน้าจอ 100%</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={toggleFullscreen}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Maximize className="w-4 h-4" />
              <span>เปิดเต็มหน้าจอแนวขวาง</span>
            </button>
            <button
              onClick={() => setIsPortrait(false)}
              className="text-xs text-slate-500 underline hover:text-slate-300 py-1"
            >
              ข้ามไปก่อน (แสดงผลแนวตั้ง)
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar - บนมือถือปรับขนาดให้เล็กลงแบบ ultra-compact */}
      {!isFullscreen && (
        <nav className="bg-slate-900 border-b border-slate-800 px-1 sm:px-3 py-0.5 sm:py-1 flex items-center justify-between text-xs shrink-0 z-20">
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow">
                S
              </div>
              <span className="text-slate-200 text-xs sm:text-sm font-bold tracking-wide hidden md:inline">
                SNOOKER ANALYTICS
              </span>
            </div>

            {/* Navigation Tabs (ปรับขนาดปุ่มแท็บแผงควบคุม & สถิติ บนมือถือให้เล็กลงจิ๋วและกระชับ) */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setActiveTab('REFEREE')}
                className={`flex items-center gap-1 px-1.5 sm:px-3 py-0.5 rounded font-bold transition-all text-[10px] sm:text-xs ${
                  activeTab === 'REFEREE'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-3 h-3 shrink-0" />
                <span>แผงควบคุม</span>
              </button>
              <button
                onClick={() => setActiveTab('HEAD_TO_HEAD')}
                className={`flex items-center gap-1 px-1.5 sm:px-3 py-0.5 rounded font-bold transition-all text-[10px] sm:text-xs ${
                  activeTab === 'HEAD_TO_HEAD'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3 h-3 shrink-0" />
                <span>แทบสถิติ</span>
              </button>
            </div>
          </div>

          {/* Device Detection Badge & Fullscreen Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
              {device.type === 'Mobile' && <Smartphone className="w-3 h-3 text-sky-400" />}
              {device.type === 'Tablet' && <Tablet className="w-3 h-3 text-emerald-400" />}
              {device.type === 'Desktop' && <Monitor className="w-3 h-3 text-amber-400" />}
              <span>{device.deviceName} ({device.width} × {device.height}px)</span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-extrabold border border-amber-400 text-[10px] sm:text-xs transition-all shadow active:scale-95"
            >
              <Maximize className="w-3 h-3 text-white" />
              <span>เต็มหน้าจอ</span>
            </button>
          </div>
        </nav>
      )}

      {/* Scoreboard Header Component (1. Top - ตัวเลขคะแนนหลักดั้งเดิมแสดงผลเด่นชัดเสมอ) */}
      <div className="shrink-0">
        <ScoreboardHeader
          players={match.players}
          p1Stats={match.p1Stats}
          p2Stats={match.p2Stats}
          currentPlayerIndex={match.currentPlayerIndex}
          currentFrame={match.currentFrame}
          currentShotDuration={match.currentShotDuration}
          breakHistory={match.breakHistory}
          updatePlayerName={match.updatePlayerName}
          setCurrentPlayerIndex={match.setCurrentPlayerIndex}
        />
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto p-[2px] sm:p-2 overflow-y-auto md:overflow-hidden flex flex-col ${
        isDesktop ? 'max-w-none px-4 py-2' : 'max-w-7xl'
      }`}>
        {activeTab === 'REFEREE' ? (
          <div className="h-full flex flex-col justify-between space-y-1 md:space-y-2">
            
            {/* 🔴🟡🟢 2. Middle Row: Referee Deck & Log Split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-1 sm:gap-2 min-h-0">
              <div className="lg:col-span-2 flex flex-col justify-between">
                <RefereeDeck
                  currentPlayerIndex={match.currentPlayerIndex}
                  players={match.players}
                  p1Stats={match.p1Stats}
                  p2Stats={match.p2Stats}
                  matchState={match.matchState}
                  currentFrame={match.currentFrame}
                  currentShotDuration={match.currentShotDuration}
                  startGame={match.startGame}
                  pauseGame={match.pauseGame}
                  endGame={match.endGame}
                  scoreBall={match.scoreBall}
                  switchTurn={match.switchTurn}
                  setIsFoulModalOpen={match.setIsFoulModalOpen}
                  undo={match.undo}
                  canUndo={match.canUndo}
                  nextFrame={match.nextFrame}
                  resetMatch={match.resetMatch}
                  setCurrentPlayerIndex={match.setCurrentPlayerIndex}
                  isMobileStatsOpen={isMobileStatsOpen}
                  setIsMobileStatsOpen={setIsMobileStatsOpen}
                />
              </div>

              {/* ซ่อน ShotHistoryLog บนมือถือ เพื่อไม่ให้ดันแผงกดแต้มลงไปบังแผงสถิติ */}
              <div className="hidden lg:flex lg:col-span-1 h-full min-h-[140px] overflow-hidden flex-col">
                <ShotHistoryLog shotLog={match.shotLog} />
              </div>
            </div>

            {/* 📊 3. Bottom Row: Stats Dashboard (เฉพาะ iPad / Desktop) */}
            {device.type !== 'Mobile' && (
              <div className="shrink-0 mt-1">
                <StatsDashboard
                  p1Stats={match.p1Stats}
                  p2Stats={match.p2Stats}
                  players={match.players}
                  device={device}
                />
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Full Head-to-Head Comparison Bar View */
          <div className="h-full overflow-y-auto">
            <HeadToHeadComparisonView
              p1Stats={match.p1Stats}
              p2Stats={match.p2Stats}
              players={match.players}
            />
          </div>
        )}
      </main>

      {/* Foul Modal */}
      <FoulModal
        isOpen={match.isFoulModalOpen}
        onClose={() => match.setIsFoulModalOpen(false)}
        commitFoul={match.commitFoul}
        activePlayerName={match.players[match.currentPlayerIndex].name}
        opponentName={match.players[match.currentPlayerIndex === 0 ? 1 : 0].name}
      />
    </div>
  );
}
