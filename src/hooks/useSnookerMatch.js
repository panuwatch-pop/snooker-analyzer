import { useState, useEffect, useRef } from 'react';
import { BALL_TYPES, calculatePlayerStats } from '../utils/snookerCalculator';

const initialPlayerData = (name) => ({
  name,
  frameScore: 0,
  currentFramePoints: 0,
  totalPoints: 0,
  totalTimeOnTable: 0,
  totalShots: 0,
  successfulPots: 0,
  attemptedPots: 0,
  foulsCommitted: 0,
  foulPointsConceded: 0,
  totalSafeties: 0,
  successfulSafeties: 0,
  currentBreak: 0,
  highestBreak: 0,
});

export function useSnookerMatch() {
  const [players, setPlayers] = useState([
    initialPlayerData('ผู้เล่น 1 (Player 1)'),
    initialPlayerData('ผู้เล่น 2 (Player 2)'),
  ]);

  // Match states: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED'
  const [matchState, setMatchState] = useState('NOT_STARTED');

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // 0 or 1
  const [currentFrame, setCurrentFrame] = useState(1);
  const [lastShotTime, setLastShotTime] = useState(Date.now());
  const [currentShotDuration, setCurrentShotDuration] = useState(0);
  const [breakHistory, setBreakHistory] = useState([]); // ประวัติลูกที่ตบในไม้ปัจจุบัน
  const [shotLog, setShotLog] = useState([]); // Log ประวัติการแทงย้อนหลัง
  const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);
  
  // 🎱 สนุ๊กเกอร์ 6 แดง: สเตตติดตามแต้มคงเหลือบนโต๊ะ (Max 6 Reds + Black = 6x8 + 27 = 75 แต้ม)
  const [remainingReds, setRemainingReds] = useState(6);
  const [colorsPhasePotted, setColorsPhasePotted] = useState([]); // ลูกสีที่ตบหมดไปแล้วในเฟสเก็บสี (2,3,4,5,6,7)
  
  // Pending safety shot tracking
  const [pendingSafety, setPendingSafety] = useState(null); // { playerIndex: number }
  
  // Undo history stack
  const historyStackRef = useRef([]);

  // Live timer tick for current shot duration display (only when IN_PROGRESS)
  useEffect(() => {
    if (matchState !== 'IN_PROGRESS') return;
    const timer = setInterval(() => {
      setCurrentShotDuration(Math.max(0, Math.floor((Date.now() - lastShotTime) / 1000)));
    }, 500);
    return () => clearInterval(timer);
  }, [lastShotTime, matchState]);

  /**
   * ควบคุมสถานะเกม: เริ่มเกม / หยุดชั่วคราว / เลิกเกม
   */
  const startGame = () => {
    setMatchState('IN_PROGRESS');
    setLastShotTime(Date.now());
  };

  const pauseGame = () => {
    setMatchState('PAUSED');
  };

  const endGame = () => {
    if (window.confirm('คุณต้องการจบแมตช์ / เลิกการแข่งขันเลยใช่หรือไม่?')) {
      setMatchState('FINISHED');
    }
  };

  /**
   * บันทึก Snapshot ลงใน Undo Stack
   */
  const saveSnapshot = () => {
    const snapshot = {
      players: JSON.parse(JSON.stringify(players)),
      matchState,
      currentPlayerIndex,
      currentFrame,
      lastShotTime,
      breakHistory: [...breakHistory],
      shotLog: [...shotLog],
      pendingSafety: pendingSafety ? { ...pendingSafety } : null,
      remainingReds,
      colorsPhasePotted: [...colorsPhasePotted],
    };
    historyStackRef.current.push(snapshot);
  };

  /**
   * ย้อนกลับการทำงานล่าสุด (Undo - Backspace / Ctrl+Z)
   */
  const undo = () => {
    if (historyStackRef.current.length === 0) return false;
    const prev = historyStackRef.current.pop();
    setPlayers(prev.players);
    setMatchState(prev.matchState);
    setCurrentPlayerIndex(prev.currentPlayerIndex);
    setCurrentFrame(prev.currentFrame);
    setLastShotTime(prev.lastShotTime);
    setBreakHistory(prev.breakHistory);
    setShotLog(prev.shotLog);
    setPendingSafety(prev.pendingSafety);
    setRemainingReds(prev.remainingReds);
    setColorsPhasePotted(prev.colorsPhasePotted);
    return true;
  };

  /**
   * เมื่อนักกีฬาตบลูกลง (กดปุ่ม 1-7)
   */
  const scoreBall = (ballNum) => {
    if (matchState === 'PAUSED' || matchState === 'FINISHED') return;
    if (matchState === 'NOT_STARTED') {
      setMatchState('IN_PROGRESS');
    }

    const ball = BALL_TYPES[ballNum];
    if (!ball) return;

    saveSnapshot();

    const now = Date.now();
    const duration = Math.max(1, Math.round((now - lastShotTime) / 1000));
    setLastShotTime(now);

    // อัปเดตจำนวนลูกแดง หรือลูกสีที่เหลือบนโต๊ะ
    if (ballNum === 1 && remainingReds > 0) {
      setRemainingReds((r) => Math.max(0, r - 1));
    } else if (remainingReds === 0 && ballNum >= 2 && ballNum <= 7) {
      // อยู่ในเฟสเก็บสี (Colors Phase)
      setColorsPhasePotted((prev) => [...prev, ballNum]);
    }

    setPlayers((prev) => {
      const newPlayers = [...prev];
      const p = { ...newPlayers[currentPlayerIndex] };

      p.currentFramePoints += ball.points;
      p.totalPoints += ball.points;
      p.totalShots += 1;
      p.totalTimeOnTable += duration;
      p.successfulPots += 1;
      p.attemptedPots += 1;
      p.currentBreak += ball.points;

      if (p.currentBreak > p.highestBreak) {
        p.highestBreak = p.currentBreak;
      }

      newPlayers[currentPlayerIndex] = p;

      if (pendingSafety && pendingSafety.playerIndex !== currentPlayerIndex) {
        setPendingSafety(null);
      }

      return newPlayers;
    });

    setBreakHistory((prev) => [...prev, ball]);

    const newLog = {
      id: Date.now().toString(),
      playerIndex: currentPlayerIndex,
      playerName: players[currentPlayerIndex].name,
      type: 'POT',
      ball,
      points: ball.points,
      duration,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setShotLog((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  /**
   * เปลี่ยนฝั่ง / แทง Safety / แทงพลาด
   */
  const switchTurn = (type = 'SWITCH') => {
    if (matchState === 'PAUSED' || matchState === 'FINISHED') return;
    if (matchState === 'NOT_STARTED') {
      setMatchState('IN_PROGRESS');
    }

    saveSnapshot();

    const now = Date.now();
    const duration = Math.max(1, Math.round((now - lastShotTime) / 1000));
    setLastShotTime(now);

    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;

    setPlayers((prev) => {
      const newPlayers = [...prev];
      const p = { ...newPlayers[currentPlayerIndex] };

      p.totalShots += 1;
      p.totalTimeOnTable += duration;
      p.currentBreak = 0;

      if (type === 'MISS' || type === 'SWITCH') {
        p.attemptedPots += 1;
      } else if (type === 'SAFETY') {
        p.totalSafeties += 1;
      }

      newPlayers[currentPlayerIndex] = p;

      if (pendingSafety && pendingSafety.playerIndex === opponentIndex) {
        const opp = { ...newPlayers[opponentIndex] };
        opp.successfulSafeties += 1;
        newPlayers[opponentIndex] = opp;
        setPendingSafety(null);
      }

      if (type === 'SAFETY') {
        setPendingSafety({ playerIndex: currentPlayerIndex });
      } else {
        setPendingSafety(null);
      }

      return newPlayers;
    });

    setBreakHistory([]);
    setCurrentPlayerIndex(opponentIndex);

    const newLog = {
      id: Date.now().toString(),
      playerIndex: currentPlayerIndex,
      playerName: players[currentPlayerIndex].name,
      type: type === 'SAFETY' ? 'SAFETY' : type === 'MISS' ? 'MISS' : 'SWITCH',
      points: 0,
      duration,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setShotLog((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  /**
   * กดฟาวล์ (Foul) และยกแต้มให้ฝั่งตรงข้าม
   */
  const commitFoul = (foulPoints = 4) => {
    if (matchState === 'PAUSED' || matchState === 'FINISHED') return;
    if (matchState === 'NOT_STARTED') {
      setMatchState('IN_PROGRESS');
    }

    saveSnapshot();

    const now = Date.now();
    const duration = Math.max(1, Math.round((now - lastShotTime) / 1000));
    setLastShotTime(now);

    const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;

    setPlayers((prev) => {
      const newPlayers = [...prev];
      const fouler = { ...newPlayers[currentPlayerIndex] };
      const victim = { ...newPlayers[opponentIndex] };

      fouler.totalShots += 1;
      fouler.totalTimeOnTable += duration;
      fouler.foulsCommitted += 1;
      fouler.foulPointsConceded += foulPoints;
      fouler.currentBreak = 0;

      victim.currentFramePoints += foulPoints;
      victim.totalPoints += foulPoints;

      if (pendingSafety && pendingSafety.playerIndex === opponentIndex) {
        victim.successfulSafeties += 1;
        setPendingSafety(null);
      }

      newPlayers[currentPlayerIndex] = fouler;
      newPlayers[opponentIndex] = victim;

      return newPlayers;
    });

    setBreakHistory([]);
    setCurrentPlayerIndex(opponentIndex);
    setIsFoulModalOpen(false);

    const newLog = {
      id: Date.now().toString(),
      playerIndex: currentPlayerIndex,
      playerName: players[currentPlayerIndex].name,
      type: 'FOUL',
      points: -foulPoints,
      foulPointsGiven: foulPoints,
      duration,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setShotLog((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  /**
   * เริ่มเฟรมถัดไป
   */
  const nextFrame = (winnerIndex = null) => {
    saveSnapshot();
    setPlayers((prev) => {
      const newPlayers = [...prev];
      if (winnerIndex !== null) {
        newPlayers[winnerIndex].frameScore += 1;
      } else {
        if (newPlayers[0].currentFramePoints > newPlayers[1].currentFramePoints) {
          newPlayers[0].frameScore += 1;
        } else if (newPlayers[1].currentFramePoints > newPlayers[0].currentFramePoints) {
          newPlayers[1].frameScore += 1;
        }
      }
      newPlayers[0].currentFramePoints = 0;
      newPlayers[1].currentFramePoints = 0;
      newPlayers[0].currentBreak = 0;
      newPlayers[1].currentBreak = 0;
      return newPlayers;
    });
    setCurrentFrame((prev) => prev + 1);
    setBreakHistory([]);
    setRemainingReds(6); // รีเซ็ตลูกแดงเป็น 6 ลูกสำหรับ 6-Red Snooker
    setColorsPhasePotted([]);
    setLastShotTime(Date.now());
  };

  /**
   * Reset ทั้งแมตช์
   */
  const resetMatch = () => {
    if (window.confirm('คุณต้องการรีเซ็ตสถิติและการแข่งขันทั้งหมดใช่หรือไม่?')) {
      setPlayers([
        initialPlayerData('ผู้เล่น 1 (Player 1)'),
        initialPlayerData('ผู้เล่น 2 (Player 2)'),
      ]);
      setMatchState('NOT_STARTED');
      setCurrentPlayerIndex(0);
      setCurrentFrame(1);
      setLastShotTime(Date.now());
      setBreakHistory([]);
      setShotLog([]);
      setPendingSafety(null);
      setRemainingReds(6);
      setColorsPhasePotted([]);
      historyStackRef.current = [];
    }
  };

  /**
   * ปรับจำนวนลูกแดงคงเหลือแบบกำหนดเอง (กรณีฟาวล์/ฟรีย์บอล)
   */
  const adjustRemainingReds = (delta) => {
    saveSnapshot();
    setRemainingReds((r) => Math.max(0, Math.min(6, r + delta)));
  };

  /**
   * คำนวณแต้มคงเหลือบนโต๊ะ (6-Red Snooker Points Remaining Engine)
   */
  let pointsRemaining = 0;
  if (remainingReds > 0) {
    // แต่ละชุดลูกแดง + ดำ (1+7 = 8 แต้ม) + ลูกสีทั้งหมดตอนเก็บสี (27 แต้ม)
    pointsRemaining = (remainingReds * 8) + 27;
  } else {
    // เฟสเก็บสี: 27 ลบด้วยคะแนนลูกสีที่ตบหมดไปแล้ว
    const allColors = [2, 3, 4, 5, 6, 7];
    const remainingColors = allColors.filter((pts, idx) => {
      // ตรวจสอบว่าลูกสีแต้มนี้ตบไปหรือยัง
      const countPotted = colorsPhasePotted.filter((p) => p === pts).length;
      const countTotal = 1;
      return countPotted < countTotal;
    });
    pointsRemaining = remainingColors.reduce((a, b) => a + b, 0);
  }

  // คำนวณส่วนต่างคะแนนและสถิติต้นแต้มขาด / ต้องการสนุ๊ก
  const p1Pts = players[0].currentFramePoints;
  const p2Pts = players[1].currentFramePoints;
  const scoreDiff = Math.abs(p1Pts - p2Pts);
  const isPointsDeficit = scoreDiff > pointsRemaining; // แต้มขาดแล้ว
  const snookersRequired = isPointsDeficit ? Math.ceil((scoreDiff - pointsRemaining) / 4) : 0;
  const leadingPlayerName = p1Pts > p2Pts ? players[0].name : p2Pts > p1Pts ? players[1].name : null;

  /**
   * อัปเดตชื่อผู้เล่น
   */
  const updatePlayerName = (index, name) => {
    setPlayers((prev) => {
      const newPlayers = [...prev];
      newPlayers[index] = { ...newPlayers[index], name };
      return newPlayers;
    });
  };

  const p1Stats = calculatePlayerStats(players[0]);
  const p2Stats = calculatePlayerStats(players[1]);

  return {
    players,
    p1Stats,
    p2Stats,
    matchState,
    startGame,
    pauseGame,
    endGame,
    currentPlayerIndex,
    currentFrame,
    currentShotDuration,
    breakHistory,
    shotLog,
    isFoulModalOpen,
    setIsFoulModalOpen,
    scoreBall,
    switchTurn,
    commitFoul,
    undo,
    nextFrame,
    resetMatch,
    updatePlayerName,
    setCurrentPlayerIndex,
    canUndo: historyStackRef.current.length > 0,
    // 🎱 แต้มคงเหลือและการวิเคราะห์เกมส์ 6 แดง
    remainingReds,
    pointsRemaining,
    scoreDiff,
    isPointsDeficit,
    snookersRequired,
    leadingPlayerName,
    adjustRemainingReds,
  };
}
