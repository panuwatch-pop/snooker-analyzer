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
import { Match, Frame, Shot, Visit, BallColor, GameMode, PocketLocation } from './types/snooker';
import { BALL_MAP, createInitialFrame, calculatePlayerStats, calculateGaForPot } from './utils/snookerRules';
import { soundManager } from './utils/audio';
import { saveActiveMatch, loadActiveMatch, saveMatchToHistory } from './utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'raw-data' | 'analytics' | 'history'>('scoreboard');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [isKeypadGuideOpen, setIsKeypadGuideOpen] = useState<boolean>(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState<boolean>(false);
  const [isFrameEndModalOpen, setIsFrameEndModalOpen] = useState<boolean>(false);
  const [isFoulMode, setIsFoulMode] = useState<boolean>(false);

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

  // Unconstrained Ball Potting with Ga Pocket Calculation
  const handlePotBall = useCallback((ball: BallColor, pocket?: PocketLocation) => {
    const ballInfo = BALL_MAP[ball];
    const points = ballInfo.points;
    soundManager.playPotSound(points);

    const isGa = match.gameMode === 'snooker-ga';
    const gaEarned = isGa ? calculateGaForPot(ball, pocket) : 0;

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
      gaCount: gaEarned,
      pocket,
      notes: `ตบลูก ${ballInfo.nameTh} (+${points})${gaEarned > 0 ? ` (+${gaEarned} กา)` : ''}`,
    };

    updatedShots.push(newShot);
    setCurrentVisitShots(prev => [...prev, newShot]);

    const newP1Score = activeStrikerIndex === 0 ? currentFrame.player1Score + points : currentFrame.player1Score;
    const newP2Score = activeStrikerIndex === 1 ? currentFrame.player2Score + points : currentFrame.player2Score;
    const newP1Ga = activeStrikerIndex === 0 ? (currentFrame.player1Ga || 0) + gaEarned : (currentFrame.player1Ga || 0);
    const newP2Ga = activeStrikerIndex === 1 ? (currentFrame.player2Ga || 0) + gaEarned : (currentFrame.player2Ga || 0);

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: newP1Score,
      player2Score: newP2Score,
      player1Ga: newP1Ga,
      player2Ga: newP2Ga,
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

  // Add Direct Manual Ga
  const handleManualAddGa = useCallback((gaCount: number) => {
    soundManager.playApplause();
    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    const gaShot: Shot = {
      id: 'shot-' + Date.now(),
      shotNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      shotTimeSec: duration,
      playerIndex: activeStrikerIndex,
      action: 'pot',
      points: 0,
      redsRemainingBefore: currentFrame.redsRemaining,
      redsRemainingAfter: currentFrame.redsRemaining,
      legalTargetBefore: 'red',
      legalTargetAfter: 'red',
      visitNumber: currentVisitNumber,
      ballsInVisit: ballsInCurrentVisit,
      visitBreakPoints: currentBreak,
      isBreakAttempt: false,
      gaCount: gaCount,
      notes: `เพิ่มกาพิเศษ (+${gaCount} กา)`,
    };

    const updatedShots = [...(currentFrame.shots || []), gaShot];
    const newP1Ga = activeStrikerIndex === 0 ? (currentFrame.player1Ga || 0) + gaCount : (currentFrame.player1Ga || 0);
    const newP2Ga = activeStrikerIndex === 1 ? (currentFrame.player2Ga || 0) + gaCount : (currentFrame.player2Ga || 0);

    const updatedVisits = [...(currentFrame.visits || [])];
    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Ga: newP1Ga,
      player2Ga: newP2Ga,
      shots: updatedShots,
      stats: [p1Stats, p2Stats],
    };

    const newFrames = [...match.frames];
    newFrames[match.currentFrameIndex] = updatedFrame;

    setMatch({ ...match, frames: newFrames });
    setCurrentVisitShots(prev => [...prev, gaShot]);
  }, [activeStrikerIndex, ballsInCurrentVisit, currentBreak, currentFrame, currentVisitNumber, match, shotStartTime]);

  const handleSubmitFoul = useCallback((points: number, options?: { isFreeBall?: boolean; switchStriker?: boolean; note?: string; recipientPlayerIndex?: 0 | 1; gaPenalty?: number }) => {
    soundManager.playFoulSound();
    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const shotNumber = (currentFrame.shots?.length || 0) + 1;

    const recipientIndex = (options?.recipientPlayerIndex !== undefined)
      ? options.recipientPlayerIndex
      : ((activeStrikerIndex === 0 ? 1 : 0) as 0 | 1);
    const foulPlayerIndex = (recipientIndex === 1 ? 0 : 1) as 0 | 1;
    const shouldSwitch = options?.switchStriker !== false;
    const gaPenalty = options?.gaPenalty || 0;

    // Calculate Ga deduction and Ga given to opponent if not enough Ga to deduct
    const currentFoulPlayerGa = foulPlayerIndex === 0 ? (currentFrame.player1Ga || 0) : (currentFrame.player2Ga || 0);
    const gaDeducted = Math.min(currentFoulPlayerGa, gaPenalty);
    const gaAwardedToOpponent = Math.max(0, gaPenalty - currentFoulPlayerGa);

    let noteText = options?.note || `เสียฟาวล์ +${points} แต้ม`;
    if (gaPenalty > 0) {
      if (gaDeducted > 0 && gaAwardedToOpponent > 0) {
        noteText += ` (หัก -${gaDeducted} กา, กาไม่พอให้คู่แข่ง +${gaAwardedToOpponent} กา)`;
      } else if (gaAwardedToOpponent > 0) {
        noteText += ` (ไม่มีกาให้หัก -> ให้คู่แข่ง +${gaAwardedToOpponent} กา)`;
      } else {
        noteText += ` (หัก -${gaDeducted} กา)`;
      }
    }

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
      gaPenalty: gaPenalty,
      gaDeducted: gaDeducted,
      gaAwardedToOpponent: gaAwardedToOpponent,
      notes: noteText,
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

    // Calculate new Ga for both players:
    // Foul player loses gaDeducted, Recipient (opponent) gains gaAwardedToOpponent
    const newP1Ga = foulPlayerIndex === 0
      ? (currentFrame.player1Ga || 0) - gaDeducted
      : (currentFrame.player1Ga || 0) + gaAwardedToOpponent;

    const newP2Ga = foulPlayerIndex === 1
      ? (currentFrame.player2Ga || 0) - gaDeducted
      : (currentFrame.player2Ga || 0) + gaAwardedToOpponent;

    const nextStrikerIndex = (shouldSwitch ? (recipientIndex === 0 ? 0 : 1) : activeStrikerIndex) as 0 | 1;

    const p1Stats = calculatePlayerStats(updatedShots, updatedVisits, 0, updatedShots.filter(s => s.playerIndex === 1));
    const p2Stats = calculatePlayerStats(updatedShots, updatedVisits, 1, updatedShots.filter(s => s.playerIndex === 0));

    const updatedFrame: Frame = {
      ...currentFrame,
      player1Score: newP1Score,
      player2Score: newP2Score,
      player1Ga: Math.max(0, newP1Ga),
      player2Ga: Math.max(0, newP2Ga),
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
    let newP1Ga = currentFrame.player1Ga || 0;
    let newP2Ga = currentFrame.player2Ga || 0;

    if (lastShot.action === 'pot') {
      if (lastShot.playerIndex === 0) {
        newP1Score -= lastShot.points;
        if (lastShot.gaCount) newP1Ga = Math.max(0, newP1Ga - lastShot.gaCount);
      } else {
        newP2Score -= lastShot.points;
        if (lastShot.gaCount) newP2Ga = Math.max(0, newP2Ga - lastShot.gaCount);
      }
    } else if (lastShot.action === 'foul') {
      if (lastShot.playerIndex === 0) {
        newP2Score -= lastShot.points;
        // P1 was foul committer: restore P1 deducted Ga, revert opponent P2 awarded Ga
        if (lastShot.gaDeducted) newP1Ga += lastShot.gaDeducted;
        if (lastShot.gaAwardedToOpponent) newP2Ga = Math.max(0, newP2Ga - lastShot.gaAwardedToOpponent);
      } else {
        newP1Score -= lastShot.points;
        // P2 was foul committer: restore P2 deducted Ga, revert opponent P1 awarded Ga
        if (lastShot.gaDeducted) newP2Ga += lastShot.gaDeducted;
        if (lastShot.gaAwardedToOpponent) newP1Ga = Math.max(0, newP1Ga - lastShot.gaAwardedToOpponent);
      }
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
      player1Ga: Math.max(0, newP1Ga),
      player2Ga: Math.max(0, newP2Ga),
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

      // Minus key or F toggles Foul Mode
      if (key === '-' || key === '_' || code === 'NumpadSubtract' || code === 'Minus' || key === 'f' || key === 'F' || code === 'KeyF' || key === 'ด' || key === '์') {
        e.preventDefault();
        setIsFoulMode(prev => !prev);
        return;
      }

      // When Foul Mode is active: 4, 5, 6, 7 submit foul points
      if (isFoulMode) {
        if (key === '4' || code === 'Digit4' || code === 'Numpad4' || key === 'ภ') {
          handleSubmitFoul(4, { switchStriker: true, note: 'ฟาวล์ +4 แต้ม' });
          setIsFoulMode(false);
        } else if (key === '5' || code === 'Digit5' || code === 'Numpad5' || key === 'ถ') {
          handleSubmitFoul(5, { switchStriker: true, note: 'ฟาวล์ +5 แต้ม' });
          setIsFoulMode(false);
        } else if (key === '6' || code === 'Digit6' || code === 'Numpad6' || key === 'ุ') {
          handleSubmitFoul(6, { switchStriker: true, note: 'ฟาวล์ +6 แต้ม' });
          setIsFoulMode(false);
        } else if (key === '7' || code === 'Digit7' || code === 'Numpad7' || key === 'ึ') {
          handleSubmitFoul(7, { switchStriker: true, note: 'ฟาวล์ +7 แต้ม' });
          setIsFoulMode(false);
        }
        return;
      }

      // Normal Potting Mode
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
  }, [isNewMatchModalOpen, isFrameEndModalOpen, isKeypadGuideOpen, isFoulMode, handlePotBall, handleSubmitFoul, handleEndTurn, handleUndo]);

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
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white overflow-hidden">
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

      <main className="flex-1 min-h-0 p-1 xs:p-1.5 sm:p-2 md:p-3 max-w-7xl w-full mx-auto flex flex-col overflow-hidden">
        {activeTab === 'scoreboard' && (
          <div className="flex-1 min-h-0 flex flex-col justify-start space-y-1 sm:space-y-1.5 md:space-y-2 animate-fadeIn overflow-hidden">
            <Scoreboard
              player1Name={match.player1Name}
              player2Name={match.player2Name}
              activeStrikerIndex={activeStrikerIndex}
              currentBreak={currentBreak}
              ballsInCurrentVisit={ballsInCurrentVisit}
              frame={currentFrame}
              frameDurationFormatted={formatTime(frameDurationSec)}
              shotDurationSec={shotDurationSec}
              isGaMode={match.gameMode === 'snooker-ga'}
              onSwitchStriker={() => handleEndTurn('miss')}
            />

            <BallPots
              redsRemaining={currentFrame.redsRemaining}
              currentVisitShots={currentVisitShots}
              isFoulMode={isFoulMode}
              isGaMode={match.gameMode === 'snooker-ga'}
              onToggleFoulMode={() => setIsFoulMode(prev => !prev)}
              onPotBall={handlePotBall}
              onFoul={(pts, gaPenalty) => {
                handleSubmitFoul(pts, { isFreeBall: false, switchStriker: true, note: `ฟาวล์ +${pts} แต้ม${gaPenalty && gaPenalty > 0 ? ` (หัก -${gaPenalty} กา)` : ''}`, gaPenalty });
                setIsFoulMode(false);
              }}
              onAddCustomPoints={handleAddCustomPoints}
              onManualAddGa={handleManualAddGa}
              onEndTurn={handleEndTurn}
              onUndo={handleUndo}
              onEndFrame={() => setIsFrameEndModalOpen(true)}
              onNewMatch={() => setIsNewMatchModalOpen(true)}
              onMultiRedPot={handleMultiRedPot}
              canUndo={currentFrame.shots && currentFrame.shots.length > 0}
            />
          </div>
        )}

        {activeTab === 'raw-data' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <RawDataTab currentMatch={match} currentFrame={currentFrame} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <AnalyticsTab currentMatch={match} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <HistoryTab onLoadMatch={(m) => setMatch(m)} />
          </div>
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
