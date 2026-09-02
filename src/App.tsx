import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Scoreboard } from './components/Scoreboard';
import { BallPots } from './components/BallPots';
import { KeypadGuide } from './components/KeypadGuide';
import { RawDataTab } from './components/RawDataTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { HistoryTab } from './components/HistoryTab';
import { NewMatchModal } from './components/NewMatchModal';
import { FrameEndModal } from './components/FrameEndModal';
import { Match, Frame, Shot, Visit, BallColor, GameMode } from './types/snooker';
import { BALL_MAP, createInitialFrame, calculatePlayerStats } from './utils/snookerRules';
import { soundManager } from './utils/audio';
import { saveActiveMatch, loadActiveMatch, saveMatchToHistory } from './utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'raw-data' | 'analytics' | 'history'>('scoreboard');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [isKeypadGuideOpen, setIsKeypadGuideOpen] = useState<boolean>(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState<boolean>(false);
  const [isFrameEndModalOpen, setIsFrameEndModalOpen] = useState<boolean>(false);

  // Active match state
  const [match, setMatch] = useState<Match>(() => {
    const saved = loadActiveMatch();
    if (saved) return saved;

    const initialFrame = createInitialFrame(1, '15-reds', 0, 0);
    return {
      id: 'match-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      title: 'แมตช์กระชับมิตร',
      player1Name: 'ผู้เล่น 1',
      player2Name: 'ผู้เล่น 2',
      gameMode: '15-reds',
      matchLengthType: 'best-of',
      bestOfFrames: 5,
      player1FramesWon: 0,
      player2FramesWon: 0,
      frames: [initialFrame as Frame],
      currentFrameIndex: 0,
      isCompleted: false,
      totalDurationSec: 0,
    };
  });

  // Turn state
  const [activeStrikerIndex, setActiveStrikerIndex] = useState<0 | 1>(0);
  const [currentBreak, setCurrentBreak] = useState<number>(0);
  const [ballsInCurrentVisit, setBallsInCurrentVisit] = useState<number>(0);
  const [currentVisitNumber, setCurrentVisitNumber] = useState<number>(1);
  const [currentVisitShots, setCurrentVisitShots] = useState<Shot[]>([]);
  const [shotStartTime, setShotStartTime] = useState<number>(Date.now());
  const [shotDurationSec, setShotDurationSec] = useState<number>(0);
  const [frameDurationSec, setFrameDurationSec] = useState<number>(0);

  useEffect(() => {
    saveActiveMatch(match);
  }, [match]);

  const currentFrame = match.frames[match.currentFrameIndex] || match.frames[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setShotDurationSec(Math.floor((Date.now() - shotStartTime) / 1000));
      if (!currentFrame.isCompleted) {
        setFrameDurationSec(Math.floor((Date.now() - currentFrame.startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [shotStartTime, currentFrame.startTime, currentFrame.isCompleted]);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleEndTurn = useCallback((reason: 'miss' | 'safety' | 'end-turn' = 'miss') => {
    soundManager.playTurnSound();
    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    let updatedShots = [...currentFrame.shots];
    let updatedVisits = [...currentFrame.visits];

    // If striker didn't score any balls in this visit (ballsInCurrentVisit === 0),
    // it means the opponent's previous turn end was a SUCCESSFUL DEFENSE ("ป้องกันดี")!
    if (ballsInCurrentVisit === 0 && updatedVisits.length > 0) {
      const prevVisit = updatedVisits[updatedVisits.length - 1];
      if (prevVisit.playerIndex !== activeStrikerIndex) {
        prevVisit.endedWithOpportunityGiven = false;
        // Find last shot of previous visit
        for (let i = updatedShots.length - 1; i >= 0; i--) {
          if (updatedShots[i].playerIndex !== activeStrikerIndex) {
            updatedShots[i].concededOpportunity = false;
            updatedShots[i].notes = 'ป้องกันดี (อีกฝ่ายทำแต้มไม่ได้)';
            break;
          }
        }
      }
    }

    const endShot: Shot = {
      id: 'shot-' + Date.now(),
      shotNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      shotTimeSec: duration,
      playerIndex: activeStrikerIndex,
      action: reason === 'safety' ? 'safety' : 'miss',
      points: 0,
      redsRemainingBefore: currentFrame.redsRemaining,
      redsRemainingAfter: currentFrame.redsRemaining,
      legalTargetBefore: 'red',
      legalTargetAfter: 'red',
      visitNumber: currentVisitNumber,
      ballsInVisit: ballsInCurrentVisit,
      visitBreakPoints: currentBreak,
      isBreakAttempt: true,
      concededOpportunity: undefined, // Pending until opponent's turn resolves
      notes: reason === 'safety' ? 'กัน (Safety)' : 'จบเทิร์น/ส่งไม้ต่อ',
    };

    const allVisitShots = [...currentVisitShots, endShot];
    const visitRecord: Visit = {
      visitNumber: currentVisitNumber,
      playerIndex: activeStrikerIndex,
      shots: allVisitShots,
      pointsScored: currentBreak,
      ballsPotted: ballsInCurrentVisit,
      hadFoul: false,
      foulPointsGiven: 0,
      totalTimeSec: allVisitShots.reduce((sum, s) => sum + s.shotTimeSec, 0),
      endedWithOpportunityGiven: false,
    };

    const nextStrikerIndex = (activeStrikerIndex === 0 ? 1 : 0) as 0 | 1;
    updatedShots.push(endShot);
    updatedVisits.push(visitRecord);

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      shots: updatedShots,
      visits: updatedVisits,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setActiveStrikerIndex(nextStrikerIndex);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(prev => prev + 1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    currentVisitShots,
    match,
    shotStartTime,
  ]);

  // Unconstrained Ball Potting
  const handlePotBall = useCallback((ball: BallColor) => {
    const ballInfo = BALL_MAP[ball];
    const points = ballInfo.points;
    soundManager.playPotSound(points);

    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const newBreak = currentBreak + points;
    const newBallsCount = ballsInCurrentVisit + 1;

    if (newBreak >= 50 && currentBreak < 50) {
      soundManager.playApplause();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else if (newBreak >= 100 && currentBreak < 100) {
      soundManager.playApplause();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }

    const nextReds = ball === 'red' ? Math.max(0, currentFrame.redsRemaining - 1) : currentFrame.redsRemaining;
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    let updatedVisits = [...currentFrame.visits];
    let updatedShots = [...currentFrame.shots];

    // If this is the first pot of a new visit, it means the opponent's previous turn end conceded an opportunity ("แทงพลาด")!
    if (ballsInCurrentVisit === 0 && updatedVisits.length > 0) {
      const prevVisit = updatedVisits[updatedVisits.length - 1];
      if (prevVisit.playerIndex !== activeStrikerIndex) {
        prevVisit.endedWithOpportunityGiven = true;
        for (let i = updatedShots.length - 1; i >= 0; i--) {
          if (updatedShots[i].playerIndex !== activeStrikerIndex) {
            updatedShots[i].concededOpportunity = true;
            updatedShots[i].notes = 'แทงพลาด (อีกฝ่ายทำแต้มได้)';
            break;
          }
        }
      }
    }

    const newShot: Shot = {
      id: 'shot-' + Date.now(),
      shotNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      shotTimeSec: duration,
      playerIndex: activeStrikerIndex,
      action: 'pot',
      ballPotted: ball,
      points,
      redsRemainingBefore: currentFrame.redsRemaining,
      redsRemainingAfter: nextReds,
      legalTargetBefore: 'red',
      legalTargetAfter: 'red',
      visitNumber: currentVisitNumber,
      ballsInVisit: newBallsCount,
      visitBreakPoints: newBreak,
      isBreakAttempt: true,
      notes: `ตบลูก ${ballInfo.nameTh} (+${points})`,
    };

    updatedShots.push(newShot);
    setCurrentVisitShots(prev => [...prev, newShot]);

    const newP1Score = activeStrikerIndex === 0 ? currentFrame.player1Score + points : currentFrame.player1Score;
    const newP2Score = activeStrikerIndex === 1 ? currentFrame.player2Score + points : currentFrame.player2Score;

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: newP1Score,
      player2Score: newP2Score,
      redsRemaining: nextReds,
      shots: updatedShots,
      visits: updatedVisits,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setCurrentBreak(newBreak);
    setBallsInCurrentVisit(newBallsCount);
    setShotStartTime(Date.now());
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    match,
    shotStartTime,
  ]);

  // Add Direct Custom Points
  const handleAddCustomPoints = (points: number, label: string) => {
    soundManager.playPotSound(points);

    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const newBreak = currentBreak + points;
    const newBallsCount = ballsInCurrentVisit + 1;
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    const newShot: Shot = {
      id: 'shot-' + Date.now(),
      shotNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      shotTimeSec: duration,
      playerIndex: activeStrikerIndex,
      action: 'pot',
      points,
      redsRemainingBefore: currentFrame.redsRemaining,
      redsRemainingAfter: currentFrame.redsRemaining,
      legalTargetBefore: 'red',
      legalTargetAfter: 'red',
      visitNumber: currentVisitNumber,
      ballsInVisit: newBallsCount,
      visitBreakPoints: newBreak,
      isBreakAttempt: true,
      notes: label,
    };

    const updatedShots = [...currentFrame.shots, newShot];
    const updatedVisits = [...currentFrame.visits];
    setCurrentVisitShots(prev => [...prev, newShot]);

    const newP1Score = activeStrikerIndex === 0 ? currentFrame.player1Score + points : currentFrame.player1Score;
    const newP2Score = activeStrikerIndex === 1 ? currentFrame.player2Score + points : currentFrame.player2Score;

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: newP1Score,
      player2Score: newP2Score,
      shots: updatedShots,
      visits: updatedVisits,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setCurrentBreak(newBreak);
    setBallsInCurrentVisit(newBallsCount);
    setShotStartTime(Date.now());
  };

  const handleMultiRedPot = (count: number) => {
    for (let i = 0; i < count; i++) {
      handlePotBall('red');
    }
  };

  const handleSubmitFoul = useCallback((points: number, options?: { isFreeBall?: boolean; switchStriker?: boolean; note?: string; recipientPlayerIndex?: 0 | 1 }) => {
    soundManager.playFoulSound();
    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    const recipientIndex = (options?.recipientPlayerIndex !== undefined)
      ? options.recipientPlayerIndex
      : ((activeStrikerIndex === 0 ? 1 : 0) as 0 | 1);
    const foulPlayerIndex = (recipientIndex === 1 ? 0 : 1) as 0 | 1;
    const shouldSwitch = options?.switchStriker !== false;

    const foulShot: Shot = {
      id: 'shot-' + Date.now(),
      shotNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      shotTimeSec: duration,
      playerIndex: foulPlayerIndex,
      action: 'foul',
      points: points,
      redsRemainingBefore: currentFrame.redsRemaining,
      redsRemainingAfter: currentFrame.redsRemaining,
      legalTargetBefore: 'red',
      legalTargetAfter: 'red',
      visitNumber: currentVisitNumber,
      ballsInVisit: ballsInCurrentVisit,
      visitBreakPoints: currentBreak,
      isBreakAttempt: true,
      notes: options?.note || `เสียฟาวล์ +${points} แต้ม`,
      concededOpportunity: true,
    };

    const updatedShots = [...(currentFrame.shots || []), foulShot];
    const allVisitShots = [...currentVisitShots, foulShot];

    const visitRecord: Visit = {
      visitNumber: currentVisitNumber,
      playerIndex: foulPlayerIndex,
      shots: allVisitShots,
      pointsScored: currentBreak,
      ballsPotted: ballsInCurrentVisit,
      hadFoul: true,
      foulPointsGiven: points,
      totalTimeSec: allVisitShots.reduce((sum, s) => sum + (s.shotTimeSec || 0), 0),
      endedWithOpportunityGiven: true,
    };

    const updatedVisits = [...(currentFrame.visits || []), visitRecord];

    const newP1Score = recipientIndex === 0 ? currentFrame.player1Score + points : currentFrame.player1Score;
    const newP2Score = recipientIndex === 1 ? currentFrame.player2Score + points : currentFrame.player2Score;
    const nextStrikerIndex = (shouldSwitch ? (recipientIndex === 0 ? 0 : 1) : activeStrikerIndex) as 0 | 1;

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: newP1Score,
      player2Score: newP2Score,
      shots: updatedShots,
      visits: updatedVisits,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setActiveStrikerIndex(nextStrikerIndex);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(prev => prev + 1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    currentVisitShots,
    match,
    shotStartTime,
  ]);

  const handleDirectFoul = useCallback((points: number) => {
    handleSubmitFoul(points, { isFreeBall: false, switchStriker: true, note: `ฟาวล์ ${points} แต้ม` });
  }, [handleSubmitFoul]);

  const handleUndo = useCallback(() => {
    if (!currentFrame.shots || currentFrame.shots.length === 0) return;

    const newShots = [...currentFrame.shots];
    const lastShot = newShots.pop()!;

    let newP1Score = currentFrame.player1Score;
    let newP2Score = currentFrame.player2Score;

    if (lastShot.action === 'pot') {
      if (lastShot.playerIndex === 0) newP1Score -= lastShot.points;
      else newP2Score -= lastShot.points;
    } else if (lastShot.action === 'foul') {
      if (lastShot.playerIndex === 0) newP2Score -= lastShot.points;
      else newP1Score -= lastShot.points;
    }

    const newReds = lastShot.redsRemainingBefore;
    const newStriker = lastShot.playerIndex;

    const newVisits = [...currentFrame.visits];
    let restoredVisitShots: Shot[] = [];

    if (lastShot.action === 'miss' || lastShot.action === 'safety' || lastShot.action === 'end-turn' || lastShot.action === 'foul') {
      // Undoing a turn end / foul: pop the visit record and restore previous visit's shots
      const poppedVisit = newVisits.pop();
      if (poppedVisit && poppedVisit.shots) {
        restoredVisitShots = poppedVisit.shots.filter(s => s.id !== lastShot.id && s.action === 'pot');
      }
      setCurrentVisitNumber(prev => Math.max(1, prev - 1));
    } else {
      // Undoing a normal pot shot within current visit
      if (currentVisitShots.length > 0) {
        restoredVisitShots = currentVisitShots.filter(s => s.id !== lastShot.id);
      } else {
        restoredVisitShots = newShots.filter(s => s.visitNumber === lastShot.visitNumber && s.action === 'pot');
      }
    }

    const p1Stats = calculatePlayerStats(newShots, newVisits, 0, newShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(newShots, newVisits, 1, newShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: Math.max(0, newP1Score),
      player2Score: Math.max(0, newP2Score),
      redsRemaining: newReds,
      shots: newShots,
      visits: newVisits,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setActiveStrikerIndex(newStriker);
    setCurrentVisitShots(restoredVisitShots);

    const restoredBreak = restoredVisitShots.reduce((sum, s) => sum + s.points, 0);
    const restoredBalls = restoredVisitShots.length;

    setCurrentBreak(restoredBreak);
    setBallsInCurrentVisit(restoredBalls);
  }, [currentFrame, currentVisitShots, match]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore global shortcuts when any modal is open or when typing in inputs
      if (isNewMatchModalOpen || isFrameEndModalOpen || isKeypadGuideOpen) {
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key;
      const code = e.code;

      if (key === '1' || code === 'Digit1' || code === 'Numpad1' || key === 'ๅ') handlePotBall('red');
      else if (key === '2' || code === 'Digit2' || code === 'Numpad2' || key === '/') handlePotBall('yellow');
      else if (key === '3' || code === 'Digit3' || code === 'Numpad3' || key === '-') handlePotBall('green');
      else if (key === '4' || code === 'Digit4' || code === 'Numpad4' || key === 'ภ') handlePotBall('brown');
      else if (key === '5' || code === 'Digit5' || code === 'Numpad5' || key === 'ถ') handlePotBall('blue');
      else if (key === '6' || code === 'Digit6' || code === 'Numpad6' || key === 'ุ') handlePotBall('pink');
      else if (key === '7' || code === 'Digit7' || code === 'Numpad7' || key === 'ึ') handlePotBall('black');
      else if (key === '.' || code === 'NumpadDecimal' || code === 'Period' || key === ' ' || code === 'Space' || key === 'Delete' || key === 'ใ') handleEndTurn('miss');
      else if (key === 's' || key === 'S' || code === 'KeyS' || key === 'ห') handleEndTurn('safety');
      else if (key === '*' || code === 'NumpadMultiply' || (e.ctrlKey && (key.toLowerCase() === 'z' || code === 'KeyZ'))) handleUndo();
      else if (key === 'e' || key === 'E' || code === 'KeyE' || key === 'ำ') setIsFrameEndModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewMatchModalOpen, isFrameEndModalOpen, isKeypadGuideOpen, handlePotBall, handleEndTurn, handleUndo]);

  const handleNextFrame = () => {
    const p1Won = currentFrame.player1Score > currentFrame.player2Score;
    const newP1Frames = p1Won ? match.player1FramesWon + 1 : match.player1FramesWon;
    const newP2Frames = !p1Won ? match.player2FramesWon + 1 : match.player2FramesWon;

    const nextFrameNumber = match.frames.length + 1;
    const nextFrame = createInitialFrame(nextFrameNumber, match.gameMode, newP1Frames, newP2Frames);

    const updatedCurrentFrame: Frame = {
      ...currentFrame,
      isCompleted: true,
      endTime: Date.now(),
      durationSec: Math.floor((Date.now() - currentFrame.startTime) / 1000),
      winnerIndex: p1Won ? 0 : 1,
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedCurrentFrame;
    newFrames.push(nextFrame as Frame);

    const updatedMatch: Match = {
      ...match,
      player1FramesWon: newP1Frames,
      player2FramesWon: newP2Frames,
      frames: newFrames,
      currentFrameIndex: match.currentFrameIndex + 1,
    };

    setMatch(updatedMatch);
    saveMatchToHistory(updatedMatch);
    setIsFrameEndModalOpen(false);
    setActiveStrikerIndex(0);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
  };

  const handleFinishMatch = () => {
    const p1Won = currentFrame.player1Score > currentFrame.player2Score;
    const newP1Frames = p1Won ? match.player1FramesWon + 1 : match.player1FramesWon;
    const newP2Frames = !p1Won ? match.player2FramesWon + 1 : match.player2FramesWon;

    const updatedMatch: Match = {
      ...match,
      player1FramesWon: newP1Frames,
      player2FramesWon: newP2Frames,
      isCompleted: true,
      winnerIndex: newP1Frames > newP2Frames ? 0 : 1,
    };

    saveMatchToHistory(updatedMatch);
    setIsFrameEndModalOpen(false);
    setActiveTab('history');
  };

  const handleStartNewMatch = (config: {
    player1Name: string;
    player2Name: string;
    gameMode: GameMode;
    matchLengthType: 'best-of' | 'unlimited';
    bestOfFrames: number;
    title: string;
    date: string;
  }) => {
    const initialFrame = createInitialFrame(1, config.gameMode, 0, 0);
    const newMatch: Match = {
      id: 'match-' + Date.now(),
      date: config.date,
      title: config.title,
      player1Name: config.player1Name,
      player2Name: config.player2Name,
      gameMode: config.gameMode,
      matchLengthType: config.matchLengthType,
      bestOfFrames: config.bestOfFrames,
      player1FramesWon: 0,
      player2FramesWon: 0,
      frames: [initialFrame as Frame],
      currentFrameIndex: 0,
      isCompleted: false,
      totalDurationSec: 0,
    };

    setMatch(newMatch);
    saveActiveMatch(newMatch);
    setActiveStrikerIndex(0);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
    setActiveTab('scoreboard');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gameMode={match.gameMode}
        matchLengthType={match.matchLengthType}
        bestOfFrames={match.bestOfFrames}
        currentFrameNumber={match.currentFrameIndex + 1}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onNewMatch={() => setIsNewMatchModalOpen(true)}
      />

      <main className="flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto space-y-4">
        {activeTab === 'scoreboard' && (
          <div className="space-y-4 animate-fadeIn">
            <Scoreboard
              player1Name={match.player1Name}
              player2Name={match.player2Name}
              activeStrikerIndex={activeStrikerIndex}
              currentBreak={currentBreak}
              ballsInCurrentVisit={ballsInCurrentVisit}
              frame={currentFrame}
              frameDurationFormatted={formatTime(frameDurationSec)}
              shotDurationSec={shotDurationSec}
              onSwitchStriker={() => handleEndTurn('miss')}
              onEndFrame={() => setIsFrameEndModalOpen(true)}
            />

            <BallPots
              redsRemaining={currentFrame.redsRemaining}
              currentVisitShots={currentVisitShots}
              onPotBall={handlePotBall}
              onAddCustomPoints={handleAddCustomPoints}
              onEndTurn={handleEndTurn}
              onUndo={handleUndo}
              onEndFrame={() => setIsFrameEndModalOpen(true)}
              onMultiRedPot={handleMultiRedPot}
              canUndo={currentFrame.shots && currentFrame.shots.length > 0}
            />
          </div>
        )}

        {activeTab === 'raw-data' && (
          <RawDataTab currentMatch={match} currentFrame={currentFrame} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab currentMatch={match} />
        )}

        {activeTab === 'history' && (
          <HistoryTab onLoadMatch={(m) => setMatch(m)} />
        )}
      </main>

      <KeypadGuide
        isOpen={isKeypadGuideOpen}
        onClose={() => setIsKeypadGuideOpen(false)}
      />

      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        onStartMatch={handleStartNewMatch}
      />

      <FrameEndModal
        isOpen={isFrameEndModalOpen}
        frame={currentFrame}
        match={match}
        onNextFrame={handleNextFrame}
        onFinishMatch={handleFinishMatch}
      />
    </div>
  );
}

export default App;
