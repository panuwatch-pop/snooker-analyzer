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

      // ทั้งปุ่ม 'แทงพลาด' (MISS) และปุ่ม 'เปลี่ยนฝั่ง' (SWITCH) ให้นับเป็นช็อตพยายามตบพลาด (Attempted Pot Miss) เพื่อความสะดวก
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
      historyStackRef.current = [];
    }
  };

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
  };
}
