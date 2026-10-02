import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { KeyboardDisplayScreen } from './components/KeyboardDisplayScreen';
import { ElectricScoreboard } from './components/ElectricScoreboard';
import { AlertTriangle, RotateCcw, Undo2 } from 'lucide-react';
import { Match, Frame, Shot, Visit, BallColor, GameMode, PocketLocation, ElectricConfig, ShootOutConfig } from './types/snooker';
import { BALL_MAP, createInitialFrame, calculatePlayerStats, calculateGaForPot, calculateElectricPotPoints, calculateRemainingPoints, getElectricDefenderIndex, applyElectricScoreGain, applyElectricScoreLoss, isElectricFinalBlack, DEFAULT_SHOOT_OUT_CONFIG, checkPotBallViolation, PotViolationWarning } from './utils/snookerRules';
import { soundManager, numberToThaiWords } from './utils/audio';
import { saveActiveMatch, loadActiveMatch, saveMatchToHistory, loadAppTheme, saveAppTheme, AppTheme } from './utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'keyboard-display' | 'raw-data' | 'analytics' | 'history'>('scoreboard');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted());
  const [theme, setTheme] = useState<AppTheme>(loadAppTheme);
  const [isKeypadGuideOpen, setIsKeypadGuideOpen] = useState<boolean>(false);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState<boolean>(false);
  const [isFrameEndModalOpen, setIsFrameEndModalOpen] = useState<boolean>(false);
  const [isFoulMode, setIsFoulMode] = useState<boolean>(false);
  const [announcedDeficitFrameId, setAnnouncedDeficitFrameId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [potWarningModal, setPotWarningModal] = useState<{
    ball: BallColor;
    pocket?: PocketLocation;
    warning: PotViolationWarning;
  } | null>(null);

  useEffect(() => {
    saveAppTheme(theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
  const [activeStrikerIndex, setActiveStrikerIndex] = useState<number>(0);
  const [currentBreak, setCurrentBreak] = useState<number>(0);
  const [ballsInCurrentVisit, setBallsInCurrentVisit] = useState<number>(0);
  const [currentVisitNumber, setCurrentVisitNumber] = useState<number>(1);
  const [currentVisitShots, setCurrentVisitShots] = useState<Shot[]>([]);
  const [shotStartTime, setShotStartTime] = useState<number>(Date.now());
  const [shotDurationSec, setShotDurationSec] = useState<number>(0);
  const [frameDurationSec, setFrameDurationSec] = useState<number>(0);

  // Shoot Out Timing & State
  const [shootOutRemainingSec, setShootOutRemainingSec] = useState<number>(() => {
    const cfg = match.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
    return (cfg.matchDurationMinutes || 10) * 60;
  });
  const [shootOutShotSec, setShootOutShotSec] = useState<number>(() => {
    const cfg = match.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
    return cfg.firstHalfShotClockSec || 15;
  });
  const [isShootOutPaused, setIsShootOutPaused] = useState<boolean>(true);
  const [isBlueBallActive, setIsBlueBallActive] = useState<boolean>(false);
  const [ballInHandActive, setBallInHandActive] = useState<boolean>(false);
  const [electricSnapshots, setElectricSnapshots] = useState<any[]>([]);

  const getShootOutMaxShotSec = useCallback((matchSec: number) => {
    const cfg = match.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
    const splitTime = (cfg.matchDurationMinutes * 60) / 2;
    if (matchSec > splitTime) {
      return cfg.firstHalfShotClockSec || 15;
    } else {
      if (cfg.secondHalfRule === 'same') {
        return cfg.firstHalfShotClockSec || 15;
      } else if (cfg.secondHalfRule === 'custom') {
        return cfg.secondHalfCustomSec || 10;
      } else {
        return 10;
      }
    }
  }, [match.shootOutConfig]);

  const resetShootOutShotClock = useCallback(() => {
    const maxSec = getShootOutMaxShotSec(shootOutRemainingSec);
    setShootOutShotSec(maxSec);
  }, [getShootOutMaxShotSec, shootOutRemainingSec]);

  const handleTogglePauseShootOut = useCallback(() => {
    setIsShootOutPaused(prev => !prev);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveActiveMatch(match);
    }, 300);
    return () => clearTimeout(timer);
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
    const currentTotalScore = activeStrikerIndex === 0 ? currentFrame.player1Score : currentFrame.player2Score;
    soundManager.speakScore(currentTotalScore);

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

    const totalElectricPlayers = match.electricConfig?.players?.length || 2;
    const nextStrikerIndex = match.gameMode === 'electric-count'
      ? ((activeStrikerIndex + 1) % totalElectricPlayers)
      : (activeStrikerIndex === 0 ? 1 : 0);

    if (match.gameMode === 'electric-count') {
      setElectricSnapshots(prev => [...prev, {
        match: JSON.parse(JSON.stringify(match)),
        activeStrikerIndex,
        currentBreak,
        ballsInCurrentVisit,
        currentVisitNumber,
        currentVisitShots: [...currentVisitShots],
      }]);
    }

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

    if (match.gameMode === 'shoot-out') {
      setBallInHandActive(false);
      resetShootOutShotClock();
    }
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    currentVisitShots,
    match,
    shotStartTime,
    resetShootOutShotClock,
  ]);

  const checkAndAnnounceDeficit = useCallback((
    p1Score: number,
    p2Score: number,
    redsRemaining: number,
    shots: Shot[],
    frameId: string
  ) => {
    const isElectric = match.gameMode === 'electric-count';
    const effectiveMode = isElectric ? 'electric-count' : (match.gameMode === 'snooker-ga' ? 'snooker-ga' : match.gameMode);
    const remaining = calculateRemainingPoints(
      redsRemaining,
      shots,
      effectiveMode,
      match.electricConfig
    );
    const diff = Math.abs(p1Score - p2Score);

    if (diff > remaining && remaining >= 0) {
      const deficit = diff - remaining;
      if (deficit > 0 && announcedDeficitFrameId !== frameId) {
        setAnnouncedDeficitFrameId(frameId);
        setTimeout(() => {
          const deficitThai = numberToThaiWords(deficit);
          soundManager.speak(`แต้มขาดแล้ว ขาด${deficitThai}แต้ม`);
        }, 750);
      }
    }
  }, [match.gameMode, match.electricConfig, announcedDeficitFrameId]);

  // Unconstrained Ball Potting with Ga Pocket Calculation & Electric Snooker
  const executePotBall = useCallback((ball: BallColor, pocket?: PocketLocation) => {
    const isElectric = match.gameMode === 'electric-count';
    const isGa = match.gameMode === 'snooker-ga';
    const effectiveElectricConfig = match.electricConfig || currentFrame.electricConfig;

    let points = BALL_MAP[ball].points;
    let rawPoints = points;
    let gaEarned = 0;
    let noteText = `ตบลูก ${BALL_MAP[ball].nameTh} (+${points})`;

    if (isElectric) {
      const isLastBlack = isElectricFinalBlack(currentFrame.shots || [], currentFrame.redsRemaining, ball);
      const electricRes = calculateElectricPotPoints(ball, pocket, isLastBlack, effectiveElectricConfig, activeStrikerIndex, currentFrame.redsRemaining);
      points = electricRes.points;
      rawPoints = electricRes.rawPoints;
      noteText = electricRes.description;
    } else if (isGa) {
      gaEarned = calculateGaForPot(ball, pocket);
      noteText = `ตบลูก ${BALL_MAP[ball].nameTh} (+${points})${gaEarned > 0 ? ` (+${gaEarned} กา)` : ''}`;
    }

    soundManager.playPotSound(Math.round(points));
    soundManager.speakNumber(points);

    const duration = Math.max(1, Math.floor((Date.now() - shotStartTime) / 1000));
    const newBreak = Math.round((currentBreak + points) * 10) / 10;
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
      rawPoints,
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
      notes: noteText,
    };

    updatedShots.push(newShot);
    setCurrentVisitShots(prev => [...prev, newShot]);

    if (isElectric && effectiveElectricConfig?.players) {
      const players = [...effectiveElectricConfig.players];
      const totalElectricPlayers = players.length;
      const strikerIdx = activeStrikerIndex % totalElectricPlayers;
      const defenderIdx = getElectricDefenderIndex(strikerIdx, totalElectricPlayers);
      const isLastBlack = isElectricFinalBlack(currentFrame.shots || [], currentFrame.redsRemaining, ball);

      // Save electric snapshot (keep latest 20 steps to prevent lag)
      setElectricSnapshots(prev => [...prev.slice(-20), {
        match: JSON.parse(JSON.stringify(match)),
        activeStrikerIndex,
        currentBreak,
        ballsInCurrentVisit,
        currentVisitNumber,
        currentVisitShots: [...currentVisitShots],
      }]);

      const strikerNewScores = applyElectricScoreGain(players[strikerIdx].currentPlus, players[strikerIdx].currentMinus, points);
      const defenderNewScores = applyElectricScoreLoss(players[defenderIdx].currentPlus, players[defenderIdx].currentMinus, points);

      players[strikerIdx] = {
        ...players[strikerIdx],
        currentPlus: strikerNewScores.currentPlus,
        currentMinus: strikerNewScores.currentMinus,
      };
      players[defenderIdx] = {
        ...players[defenderIdx],
        currentPlus: defenderNewScores.currentPlus,
        currentMinus: defenderNewScores.currentMinus,
        currentFee: currentFrame.redsRemaining === 0 && (effectiveElectricConfig.feeBalls || ['yellow', 'brown', 'black']).includes(ball)
          ? players[defenderIdx].currentFee + 1
          : players[defenderIdx].currentFee,
      };

      if (isLastBlack) {
        soundManager.playApplause();
      }

      const updatedConfig: ElectricConfig = {
        ...effectiveElectricConfig,
        players,
      };

      const updatedFrame: Frame = {
        ...currentFrame,
        player1Score: (players[0]?.currentPlus || 0) - (players[0]?.currentMinus || 0),
        player2Score: (players[1]?.currentPlus || 0) - (players[1]?.currentMinus || 0),
        redsRemaining: nextReds,
        shots: updatedShots,
        visits: updatedVisits,
        electricConfig: updatedConfig,
      };

      const newFrames = [...match.frames];
      newFrames[match.currentFrameIndex] = updatedFrame;

      setMatch({ ...match, electricConfig: updatedConfig, frames: newFrames });
      setCurrentBreak(newBreak);
      setBallsInCurrentVisit(newBallsCount);
      setShotStartTime(Date.now());
      return;
    }

    const newP1Score = activeStrikerIndex === 0 ? Math.round((currentFrame.player1Score + points) * 10) / 10 : currentFrame.player1Score;
    const newP2Score = activeStrikerIndex === 1 ? Math.round((currentFrame.player2Score + points) * 10) / 10 : currentFrame.player2Score;
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
    checkAndAnnounceDeficit(newP1Score, newP2Score, nextReds, updatedShots, currentFrame.id);

    if (match.gameMode === 'shoot-out') {
      setBallInHandActive(false);
      resetShootOutShotClock();
    }
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    checkAndAnnounceDeficit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    currentVisitShots,
    match,
    shotStartTime,
    resetShootOutShotClock,
  ]);

  // Check rules before potting (reds exceeded, colors twice consecutively, etc.)
  const handlePotBall = useCallback((ball: BallColor, pocket?: PocketLocation) => {
    const violation = checkPotBallViolation(
      ball,
      currentFrame.redsRemaining,
      currentVisitShots,
      currentFrame.shots || []
    );

    if (violation) {
      soundManager.playFoulSound();
      setPotWarningModal({
        ball,
        pocket,
        warning: violation,
      });
      return;
    }

    executePotBall(ball, pocket);
  }, [currentFrame.redsRemaining, currentVisitShots, currentFrame.shots, executePotBall]);

  // Add Direct Custom Points
  const handleAddCustomPoints = (points: number, label: string) => {
    soundManager.playPotSound(points);
    soundManager.speakNumber(points);

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
    checkAndAnnounceDeficit(newP1Score, newP2Score, currentFrame.redsRemaining, updatedShots, currentFrame.id);
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

  const handleElectricFoul = useCallback(() => {
    if (!match.electricConfig?.players) return;

    soundManager.playFoulSound();
    const foulPenalty = match.electricConfig.foulPenalty ?? 2;
    soundManager.speakFoul(foulPenalty);

    // Save electric snapshot (keep latest 20 steps to prevent lag)
    setElectricSnapshots(prev => [...prev.slice(-20), {
      match: JSON.parse(JSON.stringify(match)),
      activeStrikerIndex,
      currentBreak,
      ballsInCurrentVisit,
      currentVisitNumber,
      currentVisitShots: [...currentVisitShots],
    }]);

    const players = [...match.electricConfig.players];
    const totalElectricPlayers = players.length;
    const strikerIdx = activeStrikerIndex % totalElectricPlayers;
    const defenderIdx = getElectricDefenderIndex(strikerIdx, totalElectricPlayers);

    // Striker loses foulPenalty, defender gains foulPenalty
    const strikerNewScores = applyElectricScoreLoss(players[strikerIdx].currentPlus, players[strikerIdx].currentMinus, foulPenalty);
    const defenderNewScores = applyElectricScoreGain(players[defenderIdx].currentPlus, players[defenderIdx].currentMinus, foulPenalty);

    players[strikerIdx] = {
      ...players[strikerIdx],
      currentPlus: strikerNewScores.currentPlus,
      currentMinus: strikerNewScores.currentMinus,
    };
    players[defenderIdx] = {
      ...players[defenderIdx],
      currentPlus: defenderNewScores.currentPlus,
      currentMinus: defenderNewScores.currentMinus,
    };

    const nextStriker = (strikerIdx + 1) % totalElectricPlayers;
    const updatedConfig: ElectricConfig = {
      ...match.electricConfig,
      players,
    };

    setMatch(prev => {
      const copy = { ...prev, electricConfig: updatedConfig };
      const copyFrames = [...copy.frames];
      copyFrames[copy.currentFrameIndex] = {
        ...copyFrames[copy.currentFrameIndex],
        player1Score: (players[0]?.currentPlus || 0) - (players[0]?.currentMinus || 0),
        player2Score: (players[1]?.currentPlus || 0) - (players[1]?.currentMinus || 0),
        electricConfig: updatedConfig,
      };
      copy.frames = copyFrames;
      return copy;
    });

    setActiveStrikerIndex(nextStriker);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(prev => prev + 1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
  }, [match, activeStrikerIndex, currentBreak, ballsInCurrentVisit, currentVisitNumber]);

  const handleEndElectricGame = useCallback((winnerIdx?: number) => {
    if (!match.electricConfig?.players) return;
    soundManager.playApplause();
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

    const cfg = match.electricConfig;
    const players = [...cfg.players];
    const totalElectricPlayers = players.length;
    const strikerIdx = activeStrikerIndex % totalElectricPlayers;
    const defenderIdx = getElectricDefenderIndex(strikerIdx, totalElectricPlayers);

    // If winnerIdx not specified, default to player who had the best net score in the frame, or the current striker
    let winningPlayerIdx = winnerIdx;
    if (winningPlayerIdx === undefined) {
      let maxNet = -Infinity;
      let bestIdx = strikerIdx;
      players.forEach((p, idx) => {
        const net = p.currentPlus - p.currentMinus;
        if (net > maxNet) {
          maxNet = net;
          bestIdx = idx;
        }
      });
      winningPlayerIdx = bestIdx;
    }

    // Accumulate current game scores to total
    const accumulated = players.map(p => ({
      ...p,
      totalScore: p.totalScore + (p.currentPlus - p.currentMinus),
      totalFee: p.totalFee + p.currentFee,
      currentPlus: 0,
      currentMinus: 0,
      currentFee: 0,
    }));

    const winner = accumulated[winningPlayerIdx];
    const defenderTargetIdx = defenderIdx === winningPlayerIdx ? (winningPlayerIdx + 1) % totalElectricPlayers : defenderIdx;
    const prevDefender = accumulated[defenderTargetIdx];
    const others = accumulated.filter((_, i) => i !== winningPlayerIdx && i !== defenderTargetIdx);

    // Queue reordering: Winner (opener) at index 0 (top row), Defender at index 1, others in relative order
    const newQueue = [winner, prevDefender, ...others];
    const currentG = (cfg.currentGame || 1);
    const targetG = cfg.targetGames ?? 5;
    const isMatchComplete = targetG > 0 && currentG >= targetG;

    const updatedConfig: ElectricConfig = {
      ...cfg,
      players: newQueue,
      currentGame: currentG + 1,
      isMatchCompleted: isMatchComplete,
    };

    const resetFrame: Frame = createInitialFrame(
      match.currentFrameIndex + 2,
      'electric-count',
      0,
      0,
      updatedConfig
    );

    setMatch(prev => ({
      ...prev,
      player1Name: newQueue[0]?.name || prev.player1Name,
      player2Name: newQueue[1]?.name || prev.player2Name,
      electricConfig: updatedConfig,
      frames: [...prev.frames, resetFrame],
      currentFrameIndex: prev.currentFrameIndex + 1,
    }));

    setActiveStrikerIndex(0);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
  }, [match, activeStrikerIndex]);

  const handleContinueElectricMatch = useCallback(() => {
    if (!match.electricConfig) return;
    const updatedConfig: ElectricConfig = {
      ...match.electricConfig,
      targetGames: (match.electricConfig.targetGames || 5) + 5,
      isMatchCompleted: false,
    };
    setMatch(prev => ({
      ...prev,
      electricConfig: updatedConfig,
    }));
  }, [match.electricConfig]);

  const handleFinishElectricMatch = useCallback(() => {
    if (!match.electricConfig) return;
    const updatedConfig: ElectricConfig = {
      ...match.electricConfig,
      isMatchCompleted: true,
    };
    setMatch(prev => ({
      ...prev,
      isCompleted: true,
      electricConfig: updatedConfig,
    }));
  }, [match.electricConfig]);

  const handleSubmitFoul = useCallback((points: number, options?: { isFreeBall?: boolean; switchStriker?: boolean; note?: string; recipientPlayerIndex?: 0 | 1; gaPenalty?: number }) => {
    soundManager.playFoulSound();
    soundManager.speakFoul(points);
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
    checkAndAnnounceDeficit(newP1Score, newP2Score, currentFrame.redsRemaining, updatedShots, currentFrame.id);

    if (match.gameMode === 'shoot-out') {
      setBallInHandActive(true);
      soundManager.speakBallInHand();
      resetShootOutShotClock();
    }
  }, [
    activeStrikerIndex,
    ballsInCurrentVisit,
    checkAndAnnounceDeficit,
    currentBreak,
    currentFrame,
    currentVisitNumber,
    currentVisitShots,
    match,
    shotStartTime,
    resetShootOutShotClock,
  ]);

  const handleDirectFoul = useCallback((points: number) => {
    handleSubmitFoul(points, { isFreeBall: false, switchStriker: true, note: `ฟาวล์ ${points} แต้ม` });
  }, [handleSubmitFoul]);

  // Shoot Out Countdown Interval Effect
  useEffect(() => {
    if (match.gameMode !== 'shoot-out' || currentFrame.isCompleted || isShootOutPaused) {
      return;
    }

    const cfg = match.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
    const splitTime = (cfg.matchDurationMinutes * 60) / 2;

    const timer = setInterval(() => {
      // 1. Match timer countdown
      setShootOutRemainingSec(prevMatch => {
        if (prevMatch <= 1) {
          soundManager.playShootOutBuzzer(true);
          if (currentFrame.player1Score === currentFrame.player2Score) {
            setIsBlueBallActive(true);
            soundManager.speak('หมดเวลา แข่งขันเสมอกัน ดวลลูกน้ำเงินตัดสิน');
            setIsShootOutPaused(true);
          } else {
            soundManager.speak('หมดเวลาการแข่งขัน ชู๊ตเอาท์');
            setIsFrameEndModalOpen(true);
            setIsShootOutPaused(true);
          }
          return 0;
        }

        const nextMatch = prevMatch - 1;
        if (nextMatch === splitTime) {
          const secondHalfSec = cfg.secondHalfRule === 'same'
            ? cfg.firstHalfShotClockSec
            : (cfg.secondHalfRule === 'custom' ? (cfg.secondHalfCustomSec || 10) : 10);
          soundManager.speakShootOutPeriod(2, secondHalfSec);
        }
        return nextMatch;
      });

      // 2. Shot clock countdown
      setShootOutShotSec(prevShot => {
        if (prevShot <= 1) {
          // Shot clock timeout foul!
          soundManager.playShootOutBuzzer(false);
          soundManager.speak('หมดเวลาช็อต ฟาวล์ 5 แต้ม บอลอินแฮนด์');
          handleSubmitFoul(cfg.minFoulPenalty || 5, {
            switchStriker: true,
            note: 'หมดเวลาช็อต (Shot Clock Expired) +5 แต้ม (บอลอินแฮนด์)',
          });
          setBallInHandActive(true);
          return getShootOutMaxShotSec(shootOutRemainingSec);
        }

        const nextShot = prevShot - 1;
        if (nextShot <= 5 && nextShot > 1) {
          soundManager.playShotClockWarning(false);
        } else if (nextShot === 1) {
          soundManager.playShotClockWarning(true);
        }
        return nextShot;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    match.gameMode,
    currentFrame.isCompleted,
    currentFrame.player1Score,
    currentFrame.player2Score,
    isShootOutPaused,
    match.shootOutConfig,
    shootOutRemainingSec,
    getShootOutMaxShotSec,
    handleSubmitFoul,
  ]);

  const handleUndo = useCallback(() => {
    if (match.gameMode === 'electric-count') {
      if (electricSnapshots.length === 0) return;
      const copy = [...electricSnapshots];
      const last = copy.pop();
      if (last) {
        setMatch(last.match);
        setActiveStrikerIndex(last.activeStrikerIndex);
        setCurrentBreak(last.currentBreak);
        setBallsInCurrentVisit(last.ballsInCurrentVisit);
        setCurrentVisitNumber(last.currentVisitNumber);
        setCurrentVisitShots(last.currentVisitShots || []);
        setElectricSnapshots(copy);
      }
      return;
    }

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

    // If score gap is no longer safe lead after undo, reset deficit announced state
    const diffAfterUndo = Math.abs(newP1Score - newP2Score);
    const effectiveMode = match.gameMode === 'electric-count' ? 'electric-count' : (match.gameMode === 'snooker-ga' ? 'snooker-ga' : match.gameMode);
    const remainingAfterUndo = calculateRemainingPoints(newReds, newShots, effectiveMode, match.electricConfig);
    if (diffAfterUndo <= remainingAfterUndo) {
      setAnnouncedDeficitFrameId(null);
    }
  }, [currentFrame, currentVisitShots, match]);

  const handleNextFrame = useCallback(() => {
    setAnnouncedDeficitFrameId(null);
    const p1Won = currentFrame.player1Score > currentFrame.player2Score;
    const newP1Frames = p1Won ? match.player1FramesWon + 1 : match.player1FramesWon;
    const newP2Frames = !p1Won ? match.player2FramesWon + 1 : match.player2FramesWon;

    const nextFrameNumber = match.frames.length + 1;
    const nextFrame = createInitialFrame(
      nextFrameNumber,
      match.gameMode,
      newP1Frames,
      newP2Frames,
      match.electricConfig,
      match.player1HandicapPoints || 0,
      match.player2HandicapPoints || 0,
      match.shootOutConfig
    );

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

    if (match.gameMode === 'shoot-out') {
      const cfg = match.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
      setShootOutRemainingSec((cfg.matchDurationMinutes || 10) * 60);
      setShootOutShotSec(cfg.firstHalfShotClockSec || 15);
      setIsShootOutPaused(true);
      setIsBlueBallActive(false);
      setBallInHandActive(false);
    }
  }, [currentFrame, match]);

  const handleFinishMatch = useCallback(() => {
    const p1Won = currentFrame.player1Score > currentFrame.player2Score;
    const newP1Frames = p1Won ? match.player1FramesWon + 1 : match.player1FramesWon;
    const newP2Frames = !p1Won ? match.player2FramesWon + 1 : match.player2FramesWon;

    const rawWinnerName = newP1Frames > newP2Frames ? match.player1Name : match.player2Name;
    const winnerName = rawWinnerName === 'Player 1' ? 'ผู้เล่น 1' : (rawWinnerName === 'Player 2' ? 'ผู้เล่น 2' : (rawWinnerName || (newP1Frames > newP2Frames ? 'ผู้เล่น 1' : 'ผู้เล่น 2')));
    soundManager.speak(`${winnerName} ชนะการแข่งขัน`);
    soundManager.playApplause();

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
  }, [currentFrame, match]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;
    const code = e.code;

    // 0. When Frame End Modal is open: Enter -> เริ่มเฟรมใหม่ / . -> ปิดหน้าต่าง / / or Backspace -> จบแมตช์
    if (isFrameEndModalOpen) {
      if (key === 'Enter' || code === 'NumpadEnter' || code === 'Enter' || key === ' ' || code === 'Space' || key === 'Tab' || key === 'ใ') {
        e.preventDefault();
        const isElectric = match.gameMode === 'electric-count';
        const isUnlimited = match.matchLengthType === 'unlimited' || match.bestOfFrames === 0;
        const p1Won = currentFrame.player1Score > currentFrame.player2Score;
        const p1Frames = p1Won ? match.player1FramesWon + 1 : match.player1FramesWon;
        const p2Frames = !p1Won ? match.player2FramesWon + 1 : match.player2FramesWon;
        const framesNeeded = isUnlimited ? Infinity : Math.ceil(match.bestOfFrames / 2);
        const isMatchWon = isElectric
          ? (!isUnlimited && (currentFrame.frameNumber >= match.bestOfFrames))
          : (!isUnlimited && (p1Frames >= framesNeeded || p2Frames >= framesNeeded));

        if (isMatchWon) {
          handleFinishMatch();
        } else {
          handleNextFrame();
        }
        return;
      }

      // Finish match shortcut: / or Backspace or * or =
      if (key === '/' || code === 'NumpadDivide' || code === 'Slash' || key === 'Backspace' || code === 'Backspace' || key === '*' || code === 'NumpadMultiply' || key === '=' || code === 'Equal') {
        e.preventDefault();
        handleFinishMatch();
        return;
      }

      if (key === '.' || code === 'NumpadDecimal' || code === 'Period' || key === 'Delete' || key === 'Escape' || key === 'Clear') {
        e.preventDefault();
        setIsFrameEndModalOpen(false);
        return;
      }
      return;
    }

    // 0.1 When Pot Warning Modal is open:
    if (potWarningModal) {
      // Option 1: ทำต่อ (บันทึกแต้ม) -> Enter / Space / 1 / Tab
      if (
        key === 'Enter' || code === 'NumpadEnter' || code === 'Enter' ||
        key === ' ' || code === 'Space' ||
        key === 'Tab' || key === 'ใ' ||
        key === '1' || code === 'Digit1' || code === 'Numpad1'
      ) {
        e.preventDefault();
        const { ball, pocket } = potWarningModal;
        setPotWarningModal(null);
        executePotBall(ball, pocket);
        return;
      }

      // Option 3: ย้อนกลับช็อตก่อนหน้า (Undo) -> *
      if (key === '*' || code === 'NumpadMultiply') {
        e.preventDefault();
        setPotWarningModal(null);
        handleUndo();
        return;
      }

      // Option 2: ย้อนกลับ (ยกเลิก) -> + / Backspace / . / Esc / Clear / Delete / 2 / -
      if (
        key === '+' || code === 'NumpadAdd' ||
        key === 'Backspace' || code === 'Backspace' ||
        key === '.' || code === 'NumpadDecimal' || code === 'Period' ||
        key === 'Delete' || key === 'Escape' || key === 'Clear' ||
        key === '2' || code === 'Digit2' || code === 'Numpad2' ||
        key === '-' || code === 'NumpadSubtract' || code === 'Minus'
      ) {
        e.preventDefault();
        setPotWarningModal(null);
        return;
      }
      return;
    }

    // Ignore global shortcuts when other modals are open
    if (isNewMatchModalOpen || isKeypadGuideOpen || match.electricConfig?.isMatchCompleted) {
      if (key === '.' || code === 'NumpadDecimal' || code === 'Period' || key === 'Delete' || key === 'Escape' || key === 'Clear') {
        setIsKeypadGuideOpen(false);
        return;
      }
      return;
    }

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // 1. When in Foul Mode: Pressing 4, 5, 6, 7 submits that foul point
    if (isFoulMode) {
      if (key === '4' || code === 'Digit4' || code === 'Numpad4' || key === 'ArrowLeft' || key === 'ภ') {
        e.preventDefault();
        handleSubmitFoul(4, { switchStriker: true, note: 'ฟาวล์ +4 แต้ม' });
        setIsFoulMode(false);
        return;
      }
      if (key === '5' || code === 'Digit5' || code === 'Numpad5' || key === 'ถ') {
        e.preventDefault();
        handleSubmitFoul(5, { switchStriker: true, note: 'ฟาวล์ +5 แต้ม (น้ำเงิน)' });
        setIsFoulMode(false);
        return;
      }
      if (key === '6' || code === 'Digit6' || code === 'Numpad6' || key === 'ArrowRight' || key === 'ุ') {
        e.preventDefault();
        handleSubmitFoul(6, { switchStriker: true, note: 'ฟาวล์ +6 แต้ม (ชมพู)' });
        setIsFoulMode(false);
        return;
      }
      if (key === '7' || code === 'Digit7' || code === 'Numpad7' || key === 'Home' || key === 'ึ') {
        e.preventDefault();
        handleSubmitFoul(7, { switchStriker: true, note: 'ฟาวล์ +7 แต้ม (ดำ)' });
        setIsFoulMode(false);
        return;
      }
      if (key === '0' || code === 'Numpad0' || key === '-' || key === '+') {
        e.preventDefault();
        handleSubmitFoul(4, { switchStriker: true, note: 'ฟาวล์ +4 แต้ม' });
        setIsFoulMode(false);
        return;
      }
      if (key === 'Escape' || key === 'Clear' || key === '.' || code === 'NumpadDecimal' || code === 'Period' || key === 'Delete') {
        e.preventDefault();
        setIsFoulMode(false);
        return;
      }
    }

    // 2. Keys 1 to 7: ALWAYS Direct Scoring Buttons (+1 to +7 points)
    if (key === '1' || code === 'Digit1' || code === 'Numpad1' || key === 'End' || key === 'ๅ') {
      e.preventDefault();
      handlePotBall('red');
      return;
    }
    if (key === '2' || code === 'Digit2' || code === 'Numpad2' || key === 'ArrowDown') {
      e.preventDefault();
      handlePotBall('yellow');
      return;
    }
    if (key === '3' || code === 'Digit3' || code === 'Numpad3' || key === 'PageDown') {
      e.preventDefault();
      handlePotBall('green');
      return;
    }
    if (key === '4' || code === 'Digit4' || code === 'Numpad4' || key === 'ArrowLeft' || key === 'ภ') {
      e.preventDefault();
      handlePotBall('brown');
      return;
    }
    if (key === '5' || code === 'Digit5' || code === 'Numpad5' || key === 'ถ') {
      e.preventDefault();
      handlePotBall('blue');
      return;
    }
    if (key === '6' || code === 'Digit6' || code === 'Numpad6' || key === 'ArrowRight' || key === 'ุ') {
      e.preventDefault();
      handlePotBall('pink');
      return;
    }
    if (key === '7' || code === 'Digit7' || code === 'Numpad7' || key === 'Home' || key === 'ึ') {
      e.preventDefault();
      handlePotBall('black');
      return;
    }

    // 3. Backspace (⌫) or Asterisk (*) or Ctrl+Z -> ย้อนกลับ Undo
    if (key === 'Backspace' || code === 'Backspace' || key === '*' || code === 'NumpadMultiply' || (e.ctrlKey && (key.toLowerCase() === 'z' || code === 'KeyZ'))) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // 4. Slash (/) or Equal (=) or 'E' -> จบเฟรม (End Frame Modal / End Electric Game)
    if (key === '/' || code === 'NumpadDivide' || code === 'Slash' || key === '=' || code === 'NumpadEqual' || code === 'Equal' || key === 'LaunchApplication2' || key === 'Calculator' || key === 'e' || key === 'E' || code === 'KeyE' || key === 'ำ') {
      e.preventDefault();
      if (match.gameMode === 'electric-count') {
        handleEndElectricGame();
      } else {
        setIsFrameEndModalOpen(true);
      }
      return;
    }

    // Shoot Out Controls: 0 (Ins) or Space -> Toggle Pause/Resume
    if (match.gameMode === 'shoot-out' && (key === '0' || code === 'Numpad0' || code === 'Digit0' || key === ' ' || code === 'Space' || key === 'Insert')) {
      e.preventDefault();
      handleTogglePauseShootOut();
      return;
    }

    // Shoot Out Controls: Key 8 -> Reset Shot Clock immediately
    if (match.gameMode === 'shoot-out' && (key === '8' || code === 'Digit8' || code === 'Numpad8' || key === 'ArrowUp')) {
      e.preventDefault();
      resetShootOutShotClock();
      return;
    }

    // Shoot Out Controls: Key - -> Immediate 5-pt Foul + Ball in Hand
    if (match.gameMode === 'shoot-out' && (key === '-' || key === '_' || code === 'NumpadSubtract' || code === 'Minus' || key === 'f' || key === 'F' || code === 'KeyF' || key === 'ด' || key === '์')) {
      e.preventDefault();
      handleSubmitFoul(match.shootOutConfig?.minFoulPenalty || 5, {
        switchStriker: true,
        note: 'ฟาวล์ 5 แต้ม (บอลอินแฮนด์)',
      });
      setBallInHandActive(true);
      soundManager.speakBallInHand();
      resetShootOutShotClock();
      return;
    }

    // 5. Enter / Space / Tab -> เปลี่ยนเทิร์น (Switch Striker / End Turn)
    if (key === 'Enter' || code === 'NumpadEnter' || code === 'Enter' || key === 'Tab' || code === 'Tab' || key === 'ใ' || (match.gameMode !== 'shoot-out' && (key === ' ' || code === 'Space'))) {
      e.preventDefault();
      handleEndTurn('miss');
      return;
    }

    // 6. Period (.) / Del / Clear / Escape -> ยกเลิก (Cancel / Reset)
    if (key === '.' || code === 'NumpadDecimal' || code === 'Period' || key === 'Delete' || key === 'Escape' || key === 'Clear') {
      e.preventDefault();
      if (isFoulMode) {
        setIsFoulMode(false);
        return;
      }
      setIsFrameEndModalOpen(false);
      setIsKeypadGuideOpen(false);
      return;
    }

    // 7. Plus (+) or F11 -> ขยายหน้าจอ / ย่อหน้าจอกลับ (Toggle Fullscreen)
    if (key === '+' || code === 'NumpadAdd' || (code === 'Equal' && e.shiftKey) || key === 'F11' || code === 'F11') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // 8. Minus (-) -> Open Foul Mode or Electric Foul
    if (key === '-' || key === '_' || code === 'NumpadSubtract' || code === 'Minus' || key === 'f' || key === 'F' || code === 'KeyF' || key === 'ด' || key === '์') {
      e.preventDefault();
      if (match.gameMode === 'electric-count') {
        handleElectricFoul();
      } else {
        setIsFoulMode(true);
      }
      return;
    }

    // 9. Key 8 / 'S' -> Safety shot (แทงกัน)
    if (key === '8' || code === 'Digit8' || code === 'Numpad8' || key === 'ArrowUp' || key === 's' || key === 'S' || code === 'KeyS' || key === 'ห') {
      e.preventDefault();
      handleEndTurn('safety');
      return;
    }

    // 10. Key 9 / PageUp -> Multi-red pot (ตบแดงซ้อน +1)
    if (key === '9' || code === 'Digit9' || code === 'Numpad9' || key === 'PageUp') {
      e.preventDefault();
      handleMultiRedPot(1);
      return;
    }

    // 11. NumLock or H / ? -> Open Keypad Guide
    if (code === 'NumLock' || key === 'NumLock' || key === '?' || key === 'h' || key === 'H') {
      e.preventDefault();
      setIsKeypadGuideOpen(prev => !prev);
      return;
    }

    // 12. Key 'T' -> Toggle Theme (โทนมืด / โทนสว่าง)
    if (key === 't' || key === 'T' || code === 'KeyT' || key === 'ะ') {
      e.preventDefault();
      toggleTheme();
      return;
    }
  }, [
    isNewMatchModalOpen,
    isFrameEndModalOpen,
    isKeypadGuideOpen,
    isFoulMode,
    potWarningModal,
    executePotBall,
    currentFrame,
    match,
    handlePotBall,
    handleSubmitFoul,
    handleEndTurn,
    handleUndo,
    handleMultiRedPot,
    handleNextFrame,
    handleFinishMatch,
    handleTogglePauseShootOut,
    resetShootOutShotClock,
    toggleFullscreen,
    toggleTheme,
  ]);

  const handleKeyDownRef = useRef<(e: KeyboardEvent) => void>(handleKeyDown);
  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      handleKeyDownRef.current(e);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  const handleStartNewMatch = (config: {
    player1Name: string;
    player2Name: string;
    gameMode: GameMode;
    matchLengthType: 'best-of' | 'unlimited';
    bestOfFrames: number;
    title: string;
    date: string;
    electricConfig?: ElectricConfig;
    shootOutConfig?: ShootOutConfig;
    player1HandicapPoints?: number;
    player2HandicapPoints?: number;
  }) => {
    const p1Handicap = Math.max(0, config.player1HandicapPoints || 0);
    const p2Handicap = Math.max(0, config.player2HandicapPoints || 0);
    const initialFrame = createInitialFrame(
      1,
      config.gameMode,
      0,
      0,
      config.electricConfig,
      p1Handicap,
      p2Handicap,
      config.shootOutConfig
    );
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
      electricConfig: config.electricConfig,
      shootOutConfig: config.shootOutConfig,
      player1HandicapPoints: p1Handicap,
      player2HandicapPoints: p2Handicap,
      handicapGiverIndex: initialFrame.handicapGiverIndex,
      netHandicapPoints: initialFrame.netHandicapPoints,
    };

    setMatch(newMatch);
    saveActiveMatch(newMatch);
    setActiveStrikerIndex(0);
    setCurrentBreak(0);
    setBallsInCurrentVisit(0);
    setCurrentVisitNumber(1);
    setCurrentVisitShots([]);
    setShotStartTime(Date.now());
    setAnnouncedDeficitFrameId(null);

    if (config.gameMode === 'shoot-out') {
      const cfg = config.shootOutConfig || DEFAULT_SHOOT_OUT_CONFIG;
      setShootOutRemainingSec((cfg.matchDurationMinutes || 10) * 60);
      setShootOutShotSec(cfg.firstHalfShotClockSec || 15);
      setIsShootOutPaused(true);
      setIsBlueBallActive(false);
      setBallInHandActive(false);
    }

    setActiveTab('scoreboard');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const previousFrames = match.frames.slice(0, match.currentFrameIndex);
  const p1CumulativeScore = previousFrames.reduce((sum, f) => sum + f.player1Score, 0) + currentFrame.player1Score;
  const p2CumulativeScore = previousFrames.reduce((sum, f) => sum + f.player2Score, 0) + currentFrame.player2Score;

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white overflow-hidden ${theme === 'light' ? 'theme-light' : 'theme-dark'}`} data-theme={theme}>
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
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 min-h-0 p-0.5 xs:p-1 sm:p-2 md:p-3 max-w-7xl w-full mx-auto flex flex-col overflow-y-auto">
        {activeTab === 'scoreboard' && (
          <div className="flex-1 min-h-0 flex flex-col justify-between space-y-0.5 xs:space-y-1 sm:space-y-1.5 md:space-y-2 animate-fadeIn">
            {match.gameMode === 'electric-count' && (match.electricConfig || currentFrame.electricConfig) ? (
              <ElectricScoreboard
                match={match}
                frame={currentFrame}
                electricConfig={(match.electricConfig || currentFrame.electricConfig)!}
                activeStrikerIndex={activeStrikerIndex}
                redsRemaining={currentFrame.redsRemaining}
                currentBreak={currentBreak}
                ballsInCurrentVisit={ballsInCurrentVisit}
                shotDurationSec={shotDurationSec}
                onPotBall={handlePotBall}
                onFoul={handleElectricFoul}
                onNextTurn={() => handleEndTurn('end-turn')}
                onUndo={handleUndo}
                onResetMatch={() => setIsNewMatchModalOpen(true)}
                onContinueMatch={handleContinueElectricMatch}
                onFinishMatch={handleFinishElectricMatch}
                onEndGame={() => handleEndElectricGame()}
                isKeyboardDisplay={false}
              />
            ) : (
              <Scoreboard
                player1Name={match.player1Name}
                player2Name={match.player2Name}
                activeStrikerIndex={(activeStrikerIndex % 2) as 0 | 1}
                currentBreak={currentBreak}
                ballsInCurrentVisit={ballsInCurrentVisit}
                frame={currentFrame}
                frameDurationFormatted={formatTime(frameDurationSec)}
                shotDurationSec={shotDurationSec}
                isGaMode={match.gameMode === 'snooker-ga'}
                isElectricMode={match.gameMode === 'electric-count'}
                electricConfig={match.electricConfig || currentFrame.electricConfig}
                p1CumulativeScore={p1CumulativeScore}
                p2CumulativeScore={p2CumulativeScore}
                currentGameNumber={match.currentFrameIndex + 1}
                totalGames={match.bestOfFrames}
                isShootOutMode={match.gameMode === 'shoot-out'}
                shootOutRemainingSec={shootOutRemainingSec}
                shootOutShotSec={shootOutShotSec}
                isShootOutPaused={isShootOutPaused}
                ballInHandActive={ballInHandActive}
                onResetShotClock={resetShootOutShotClock}
                onTogglePauseShootOut={handleTogglePauseShootOut}
                onSwitchStriker={() => handleEndTurn('miss')}
              />
            )}

            <BallPots
              redsRemaining={currentFrame.redsRemaining}
              currentVisitShots={currentVisitShots}
              shots={currentFrame.shots || []}
              gameMode={match.gameMode}
              isFoulMode={isFoulMode}
              isGaMode={match.gameMode === 'snooker-ga'}
              isElectricMode={match.gameMode === 'electric-count'}
              electricConfig={match.electricConfig || currentFrame.electricConfig}
              hidePotButtons={false}
              onToggleFoulMode={() => {
                if (match.gameMode === 'electric-count') {
                  handleElectricFoul();
                } else {
                  setIsFoulMode(prev => !prev);
                }
              }}
              onPotBall={handlePotBall}
              onFoul={(pts, gaPenalty) => {
                if (match.gameMode === 'electric-count') {
                  handleElectricFoul();
                } else {
                  handleSubmitFoul(pts, { isFreeBall: false, switchStriker: true, note: `ฟาวล์ +${pts} แต้ม${gaPenalty && gaPenalty > 0 ? ` (หัก -${gaPenalty} กา)` : ''}`, gaPenalty });
                  setIsFoulMode(false);
                }
              }}
              onAddCustomPoints={handleAddCustomPoints}
              onManualAddGa={handleManualAddGa}
              onEndTurn={handleEndTurn}
              onUndo={handleUndo}
              onEndFrame={() => {
                if (match.gameMode === 'electric-count') {
                  handleEndElectricGame();
                } else {
                  setIsFrameEndModalOpen(true);
                }
              }}
              onNewMatch={() => setIsNewMatchModalOpen(true)}
              onMultiRedPot={handleMultiRedPot}
              canUndo={Boolean(match.gameMode === 'electric-count' ? electricSnapshots.length > 0 : (currentFrame.shots && currentFrame.shots.length > 0))}
            />
          </div>
        )}

        {activeTab === 'keyboard-display' && (
          match.gameMode === 'electric-count' && (match.electricConfig || currentFrame.electricConfig) ? (
            <div className="flex-1 min-h-0 flex flex-col justify-between space-y-0.5 xs:space-y-1 md:space-y-2 animate-fadeIn">
              <ElectricScoreboard
                match={match}
                frame={currentFrame}
                electricConfig={(match.electricConfig || currentFrame.electricConfig)!}
                activeStrikerIndex={activeStrikerIndex}
                redsRemaining={currentFrame.redsRemaining}
                currentBreak={currentBreak}
                ballsInCurrentVisit={ballsInCurrentVisit}
                shotDurationSec={shotDurationSec}
                onPotBall={handlePotBall}
                onFoul={handleElectricFoul}
                onNextTurn={() => handleEndTurn('end-turn')}
                onUndo={handleUndo}
                onResetMatch={() => setIsNewMatchModalOpen(true)}
                onContinueMatch={handleContinueElectricMatch}
                onFinishMatch={handleFinishElectricMatch}
                onEndGame={() => handleEndElectricGame()}
                isKeyboardDisplay={true}
              />
              <BallPots
                redsRemaining={currentFrame.redsRemaining}
                currentVisitShots={currentVisitShots}
                shots={currentFrame.shots || []}
                gameMode={match.gameMode}
                isFoulMode={isFoulMode}
                isGaMode={false}
                isElectricMode={true}
                electricConfig={match.electricConfig || currentFrame.electricConfig}
                hidePotButtons={true}
                onToggleFoulMode={handleElectricFoul}
                onPotBall={handlePotBall}
                onFoul={() => handleElectricFoul()}
                onAddCustomPoints={handleAddCustomPoints}
                onManualAddGa={handleManualAddGa}
                onEndTurn={handleEndTurn}
                onUndo={handleUndo}
                onEndFrame={() => {
                  if (match.gameMode === 'electric-count') {
                    handleEndElectricGame();
                  } else {
                    setIsFrameEndModalOpen(true);
                  }
                }}
                onNewMatch={() => setIsNewMatchModalOpen(true)}
                onMultiRedPot={handleMultiRedPot}
                canUndo={Boolean(electricSnapshots.length > 0)}
              />
            </div>
          ) : (
            <KeyboardDisplayScreen
              player1Name={match.player1Name}
              player2Name={match.player2Name}
              activeStrikerIndex={(activeStrikerIndex % 2) as 0 | 1}
              currentBreak={currentBreak}
              ballsInCurrentVisit={ballsInCurrentVisit}
              frame={currentFrame}
              frameDurationFormatted={formatTime(frameDurationSec)}
              shotDurationSec={shotDurationSec}
              gameMode={match.gameMode}
              isGaMode={match.gameMode === 'snooker-ga'}
              isElectricMode={match.gameMode === 'electric-count'}
              electricConfig={match.electricConfig || currentFrame.electricConfig}
              p1CumulativeScore={p1CumulativeScore}
              p2CumulativeScore={p2CumulativeScore}
              currentGameNumber={match.currentFrameIndex + 1}
              totalGames={match.bestOfFrames}
              currentVisitShots={currentVisitShots}
              isFoulMode={isFoulMode}
              isShootOutMode={match.gameMode === 'shoot-out'}
              shootOutRemainingSec={shootOutRemainingSec}
              shootOutShotSec={shootOutShotSec}
              isShootOutPaused={isShootOutPaused}
              ballInHandActive={ballInHandActive}
              onResetShotClock={resetShootOutShotClock}
              onTogglePauseShootOut={handleTogglePauseShootOut}
              onFoulSelect={(pts) => {
                handleSubmitFoul(pts, { switchStriker: true, note: `ฟาวล์ +${pts} แต้ม` });
                setIsFoulMode(false);
              }}
              onCancelFoulMode={() => setIsFoulMode(false)}
              onSwitchStriker={() => handleEndTurn('miss')}
              onEndTurn={handleEndTurn}
              onUndo={handleUndo}
              onEndFrame={() => setIsFrameEndModalOpen(true)}
              onNewMatch={() => setIsNewMatchModalOpen(true)}
              onOpenKeypadGuide={() => setIsKeypadGuideOpen(true)}
              canUndo={currentFrame.shots && currentFrame.shots.length > 0}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )
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

      {/* Potting Rule Violation Warning Modal */}
      {potWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 text-center space-y-3.5 sm:space-y-4 animate-scaleUp">
            {/* Warning Icon Badge */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
            </div>

            {/* Title & Ball Badge */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-amber-300">
                ⚠️ {potWarningModal.warning.title}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <span>กำลังจะตบ:</span>
                <span className={`w-3.5 h-3.5 rounded-full inline-block ${BALL_MAP[potWarningModal.ball].cssClass}`} />
                <span className="font-bold text-white">{BALL_MAP[potWarningModal.ball].nameTh}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-left space-y-1.5">
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {potWarningModal.warning.message}
              </p>
              <p className="text-[11px] sm:text-xs text-amber-300/90 font-medium">
                {potWarningModal.warning.submessage}
              </p>
            </div>

            {/* Main Action Buttons: Proceed vs Back/Cancel */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPotWarningModal(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow transition-all cursor-pointer hover:border-slate-500"
              >
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>↩️ ย้อนกลับ (ยกเลิก)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-black/50 border border-slate-600 font-mono text-[11px] text-amber-300 font-bold">
                  [+ หรือ ⌫]
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const { ball, pocket } = potWarningModal;
                  setPotWarningModal(null);
                  executePotBall(ball, pocket);
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-white font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span>🟢 ทำต่อ (บันทึกแต้ม)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-slate-950/40 border border-amber-900/40 font-mono text-[11px] text-amber-100 font-black">
                  [Enter ↵]
                </span>
              </button>
            </div>

            {/* Optional Undo Last Shot */}
            {(match.gameMode === 'electric-count' ? electricSnapshots.length > 0 : (currentFrame.shots && currentFrame.shots.length > 0)) && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPotWarningModal(null);
                    handleUndo();
                  }}
                  className="py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] sm:text-xs text-slate-300 hover:text-amber-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer border border-slate-700/60"
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>ย้อนกลับช็อตก่อนหน้า (Undo)</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/40 border border-slate-600 font-mono text-[10px] text-amber-300 font-bold">
                    [*]
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
