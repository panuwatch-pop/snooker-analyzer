import { BallInfo, BallColor, LegalTarget, Shot, Visit, PlayerStats, GameMode, PocketLocation, ElectricConfig, ShootOutConfig } from '../types/snooker';

export const BALLS: BallInfo[] = [
  { color: 'red', nameTh: 'ลูกแดง', nameEn: 'Red', points: 1, cssClass: 'ball-red', numpadKey: '1', regularKey: '1' },
  { color: 'yellow', nameTh: 'ลูกเหลือง', nameEn: 'Yellow', points: 2, cssClass: 'ball-yellow', numpadKey: '2', regularKey: '2' },
  { color: 'green', nameTh: 'ลูกเขียว', nameEn: 'Green', points: 3, cssClass: 'ball-green', numpadKey: '3', regularKey: '3' },
  { color: 'brown', nameTh: 'ลูกน้ำตาล', nameEn: 'Brown', points: 4, cssClass: 'ball-brown', numpadKey: '4', regularKey: '4' },
  { color: 'blue', nameTh: 'ลูกน้ำเงิน', nameEn: 'Blue', points: 5, cssClass: 'ball-blue', numpadKey: '5', regularKey: '5' },
  { color: 'pink', nameTh: 'ลูกชมพู', nameEn: 'Pink', points: 6, cssClass: 'ball-pink', numpadKey: '6', regularKey: '6' },
  { color: 'black', nameTh: 'ลูกดำ', nameEn: 'Black', points: 7, cssClass: 'ball-black', numpadKey: '7', regularKey: '7' },
];

export const BALL_MAP: Record<BallColor, BallInfo> = BALLS.reduce((acc, b) => {
  acc[b.color] = b;
  return acc;
}, {} as Record<BallColor, BallInfo>);

export const FINAL_COLORS: BallColor[] = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

/**
 * Default Electric Snooker Configuration
 */
export const DEFAULT_ELECTRIC_CONFIG: ElectricConfig = {
  countMode: 'ball-only',
  targetGames: 5,
  currentGame: 1,
  players: [
    { id: 'p1', name: 'Pop', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
    { id: 'p2', name: 'A', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
    { id: 'p3', name: 'C', currentPlus: 0, currentMinus: 0, currentFee: 0, totalScore: 0, totalFee: 0 },
  ],
  strikerIndex: 0,
  feeBalls: ['yellow', 'brown', 'black'],
  ballPoints: 1,
  redPoints: 1,
  yellowPoints: 1,
  greenPoints: 1,
  brownPoints: 1,
  bluePoints: 1,
  pinkPoints: 1,
  blackPoints: 2,
  lastBlackPoints: 4,
  foulPenalty: 2,
  handicapEnabled: false,
  handicapGiverIndex: 0,
  handicapGiverRatio: 80,
  handicapReceiverRatio: 100,
};

/**
 * Default Snooker Shoot Out Configuration
 */
export const DEFAULT_SHOOT_OUT_CONFIG: ShootOutConfig = {
  matchDurationMinutes: 10,
  firstHalfShotClockSec: 15,
  secondHalfRule: 'reduced',
  secondHalfCustomSec: 10,
  minFoulPenalty: 5,
};

/**
 * Calculate "Ga" (กา) count according to Snooker Ga rules:
 * - Yellow (เหลือง): Every pocket -> 2 Ga
 * - Green (เขียว): Bottom pockets (หลุมล่าง) -> 1 Ga
 * - Brown (น้ำตาล): Middle pockets (หลุมกลาง) -> 2 Ga
 * - Blue (น้ำเงิน): Middle pockets (หลุมกลาง) -> 1 Ga
 * - Pink (ชมพู): Top pockets (หลุมบน) -> 1 Ga
 * - Black (ดำ): Every pocket -> 2 Ga
 * - Red (แดง): 0 Ga
 */
export function calculateGaForPot(ball: BallColor, pocket?: PocketLocation): number {
  if (ball === 'red') return 0;
  if (ball === 'yellow') return 2;
  if (ball === 'black') return 2;

  if (!pocket || pocket === 'any') {
    return 0;
  }

  if (ball === 'green') {
    return (pocket === 'bottom-left' || pocket === 'bottom-right') ? 1 : 0;
  }

  if (ball === 'brown') {
    return (pocket === 'middle-left' || pocket === 'middle-right') ? 2 : 0;
  }

  if (ball === 'blue') {
    return (pocket === 'middle-left' || pocket === 'middle-right') ? 1 : 0;
  }

  if (ball === 'pink') {
    return (pocket === 'top-left' || pocket === 'top-right') ? 1 : 0;
  }

  return 0;
}

/**
 * Check if pocket is a Ga pocket for a specific ball
 */
export function isGaPocket(ball: BallColor, pocket?: PocketLocation): boolean {
  if (ball === 'red') return false;
  if (ball === 'yellow' || ball === 'black') return true;
  if (!pocket || pocket === 'any') return false;
  if (ball === 'green') return pocket === 'bottom-left' || pocket === 'bottom-right';
  if (ball === 'brown' || ball === 'blue') return pocket === 'middle-left' || pocket === 'middle-right';
  if (ball === 'pink') return pocket === 'top-left' || pocket === 'top-right';
  return false;
}

/**
 * Get base ball points taking Electric Snooker config into account
 */
export function getBallBasePoints(
  ball: BallColor,
  isFinalBlack: boolean = false,
  electricConfig?: ElectricConfig
): number {
  if (!electricConfig) {
    return BALL_MAP[ball].points;
  }

  if (isFinalBlack && ball === 'black') {
    return electricConfig.lastBlackPoints;
  }

  switch (ball) {
    case 'red': return electricConfig.redPoints;
    case 'yellow': return electricConfig.yellowPoints;
    case 'green': return electricConfig.greenPoints;
    case 'brown': return electricConfig.brownPoints;
    case 'blue': return electricConfig.bluePoints;
    case 'pink': return electricConfig.pinkPoints;
    case 'black': return electricConfig.blackPoints;
    default: return 1;
  }
}

/**
 * Calculate defender index in Electric Snooker (previous player in rotation queue)
 */
export function getElectricDefenderIndex(strikerIndex: number, totalPlayers: number): number {
  if (totalPlayers <= 1) return 0;
  return (strikerIndex - 1 + totalPlayers) % totalPlayers;
}

/**
 * Calculate net offset for Electric Snooker scoring when gaining points.
 * If player currently has currentMinus > 0, offset currentMinus first.
 */
export function applyElectricScoreGain(
  currentPlus: number,
  currentMinus: number,
  points: number
): { currentPlus: number; currentMinus: number } {
  if (currentMinus > 0) {
    if (currentMinus >= points) {
      return { currentPlus: 0, currentMinus: currentMinus - points };
    } else {
      return { currentPlus: points - currentMinus, currentMinus: 0 };
    }
  }
  return { currentPlus: currentPlus + points, currentMinus: 0 };
}

/**
 * Calculate net offset for Electric Snooker scoring when losing points.
 * If player currently has currentPlus > 0, offset currentPlus first.
 */
export function applyElectricScoreLoss(
  currentPlus: number,
  currentMinus: number,
  points: number
): { currentPlus: number; currentMinus: number } {
  if (currentPlus > 0) {
    if (currentPlus >= points) {
      return { currentPlus: currentPlus - points, currentMinus: 0 };
    } else {
      return { currentPlus: 0, currentMinus: points - currentPlus };
    }
  }
  return { currentPlus: 0, currentMinus: currentMinus + points };
}

/**
 * Check if the ball being potted is the true FINAL black ball of the Electric Snooker frame.
 * The black after the 6th red is NOT the final black.
 * The final black only occurs after the clearance phase (i.e. Pink was already potted during final colors).
 */
export function isElectricFinalBlack(
  shots: Shot[],
  redsRemaining: number,
  ball: BallColor
): boolean {
  if (ball !== 'black') return false;
  if (redsRemaining > 0) return false;

  // Find index of the very last red pot shot
  let lastRedIndex = -1;
  for (let i = shots.length - 1; i >= 0; i--) {
    if (shots[i].action === 'pot' && shots[i].ballPotted === 'red') {
      lastRedIndex = i;
      break;
    }
  }

  // If no red shot was ever potted, it's not the final black
  if (lastRedIndex === -1) return false;

  const lastRedShot = shots[lastRedIndex];
  const shotsAfterLastRed = shots.slice(lastRedIndex + 1);
  const potShotsAfterLastRed = shotsAfterLastRed.filter(s => s.action === 'pot' && s.ballPotted);

  // If the first shot after the last red was in the same visit, it's the color for the 6th red
  let colorPotsToExclude = 0;
  if (potShotsAfterLastRed.length > 0 && potShotsAfterLastRed[0].visitNumber === lastRedShot.visitNumber) {
    colorPotsToExclude = 1;
  }

  const finalColorPots = potShotsAfterLastRed.slice(colorPotsToExclude);
  // In snooker clearance, the final black is preceded by pink!
  return finalColorPots.some(s => s.ballPotted === 'pink');
}

/**
 * Returns set of colors cleared off the table during the clearance phase (after all reds are potted).
 */
export function getClearedColors(shots: Shot[], redsRemaining: number): Set<BallColor> {
  const cleared = new Set<BallColor>();
  if (redsRemaining > 0) return cleared;

  let lastRedIndex = -1;
  for (let i = shots.length - 1; i >= 0; i--) {
    if (shots[i].action === 'pot' && shots[i].ballPotted === 'red') {
      lastRedIndex = i;
      break;
    }
  }

  if (lastRedIndex === -1) {
    shots.forEach(s => {
      if (s.action === 'pot' && s.ballPotted && s.ballPotted !== 'red') {
        cleared.add(s.ballPotted as BallColor);
      }
    });
    return cleared;
  }

  const lastRedShot = shots[lastRedIndex];
  const colorPotShotsAfterRed = shots
    .slice(lastRedIndex + 1)
    .filter(s => s.action === 'pot' && s.ballPotted && s.ballPotted !== 'red');

  let startIndex = 0;
  if (colorPotShotsAfterRed.length > 0 && colorPotShotsAfterRed[0].visitNumber === lastRedShot.visitNumber) {
    startIndex = 1;
  }

  for (let i = startIndex; i < colorPotShotsAfterRed.length; i++) {
    cleared.add(colorPotShotsAfterRed[i].ballPotted as BallColor);
  }

  return cleared;
}

export interface PotViolationWarning {
  type: 'red_exceeded' | 'consecutive_colors' | 'color_already_cleared';
  title: string;
  message: string;
  submessage: string;
}

/**
 * Checks if a pot shot potentially violates snooker rules (e.g. potting reds exceeding count, or potting colors twice consecutively).
 */
export function checkPotBallViolation(
  ball: BallColor,
  redsRemaining: number,
  currentVisitShots: Shot[],
  allFrameShots: Shot[]
): PotViolationWarning | null {
  // 1. Red count exceeded: ball is red, but no reds remain on the table
  if (ball === 'red' && redsRemaining <= 0) {
    return {
      type: 'red_exceeded',
      title: 'ลูกแดงบนโต๊ะหมดแล้ว',
      message: 'ลูกแดงบนโต๊ะหมดแล้ว (เหลือ 0 ลูก) การกดลูกแดงอาจเป็นการบันทึกแต้มเกินจำนวนลูกแดงที่มี',
      submessage: 'คุณต้องการ "ทำต่อ" เพื่อบันทึกแต้มนี้ หรือ "ย้อนกลับ" เพื่อยกเลิก?',
    };
  }

  // 2. Color potted twice consecutively in the same visit while reds remain:
  const pottedInVisit = currentVisitShots.filter(s => s.action === 'pot' && s.ballPotted);
  const lastPotInVisit = pottedInVisit.length > 0 ? pottedInVisit[pottedInVisit.length - 1] : null;

  if (redsRemaining > 0 && lastPotInVisit && lastPotInVisit.ballPotted !== 'red' && ball !== 'red') {
    const prevBallName = BALL_MAP[lastPotInVisit.ballPotted as BallColor]?.nameTh || lastPotInVisit.ballPotted;
    const currentBallName = BALL_MAP[ball]?.nameTh || ball;
    return {
      type: 'consecutive_colors',
      title: 'กดลูกสีซ้ำ 2 ครั้ง',
      message: `คุณเพิ่งตบลูก${prevBallName}ไปในไม้นี้ และกำลังจะตบลูก${currentBallName}ซ้ำอีกครั้งโดยไม่มีลูกแดงคั่น`,
      submessage: 'ตามกติกาสนุ๊กเกอร์ต้องตบแดงสลับสี คุณต้องการ "ทำต่อ" หรือ "ย้อนกลับ"?',
    };
  }

  // 3. Color already cleared off the table when reds are 0:
  if (redsRemaining === 0 && ball !== 'red') {
    const cleared = getClearedColors(allFrameShots, redsRemaining);
    if (cleared.has(ball)) {
      const ballName = BALL_MAP[ball]?.nameTh || ball;
      return {
        type: 'color_already_cleared',
        title: `ลูก${ballName}ลงไปแล้ว`,
        message: `ลูก${ballName} ถูกตบลงไปแล้ว (ไม่มีอยู่บนโต๊ะแล้ว) การตบลูกเดิมซ้ำอาจผิดกติกา`,
        submessage: 'คุณต้องการ "ทำต่อ" เพื่อบันทึกแต้มนี้ หรือ "ย้อนกลับ" เพื่อยกเลิก?',
      };
    }
  }

  return null;
}

/**
 * Calculate pot points for Electric Snooker / Ball Count
 * Live play scores raw ball points. Electric fee is accumulated when reds are cleared.
 */
export function calculateElectricPotPoints(
  ball: BallColor,
  pocket?: PocketLocation,
  isFinalBlack: boolean = false,
  electricConfig?: ElectricConfig,
  _playerIndex: number = 0,
  redsRemaining: number = 6
): { points: number; rawPoints: number; isGaBonus: boolean; isFee: boolean; description: string } {
  if (!electricConfig) {
    const raw = BALL_MAP[ball].points;
    return {
      points: raw,
      rawPoints: raw,
      isGaBonus: false,
      isFee: false,
      description: `ตบลูก ${BALL_MAP[ball].nameTh} (+${raw})`,
    };
  }

  let rawPoints = 1;
  let isGaBonus = false;

  if (electricConfig.countMode === 'ball-plus-ga') {
    // Ball count + Ga bonus
    if (ball === 'red') {
      rawPoints = electricConfig.redPoints || 1;
    } else {
      const isGa = isGaPocket(ball, pocket);
      if (isGa) {
        rawPoints = getBallBasePoints(ball, isFinalBlack, electricConfig);
        isGaBonus = true;
      } else {
        rawPoints = 1; // Standard non-ga pocket counts as 1 ball
      }
    }
  } else {
    // Pure ball count: custom points per ball
    rawPoints = getBallBasePoints(ball, isFinalBlack, electricConfig);
  }

  // Rule: Fee applies ONLY when all 6 reds are cleared and ball is in feeBalls
  const feeBalls = electricConfig.feeBalls || ['yellow', 'brown', 'black'];
  const isFee = redsRemaining === 0 && feeBalls.includes(ball);

  let desc = `ตบลูก ${BALL_MAP[ball].nameTh}${isGaBonus ? ' (หลุมกา)' : ''} (+${rawPoints})`;
  if (isFee) {
    desc += ' ⚡ คิดค่าไฟ (+1)';
  }

  return {
    points: rawPoints,
    rawPoints,
    isGaBonus,
    isFee,
    description: desc,
  };
}

/**
 * Calculate handicap adjusted score for game/match summaries
 */
export function calculateHandicapScore(
  rawScore: number,
  isGiver: boolean,
  giverRatio: number
): number {
  if (!isGiver) return rawScore;
  return Math.round(rawScore * (giverRatio / 100) * 10) / 10;
}

/**
 * Calculates remaining points on the table accurately
 */
export function calculateRemainingPoints(
  redsRemaining: number,
  shots: Shot[] = [],
  gameMode: GameMode = '15-reds',
  electricConfig?: ElectricConfig
): number {
  const isElectric = gameMode === 'electric-count';
  const redVal = isElectric && electricConfig ? electricConfig.redPoints : 1;
  const topColorVal = isElectric && electricConfig ? electricConfig.blackPoints : 7;
  const colorPoints: Record<string, number> = isElectric && electricConfig ? {
    yellow: electricConfig.yellowPoints,
    green: electricConfig.greenPoints,
    brown: electricConfig.brownPoints,
    blue: electricConfig.bluePoints,
    pink: electricConfig.pinkPoints,
    black: electricConfig.lastBlackPoints,
  } : {
    yellow: 2,
    green: 3,
    brown: 4,
    blue: 5,
    pink: 6,
    black: 7,
  };

  const totalColorsVal = Object.values(colorPoints).reduce((sum, v) => sum + v, 0);

  if (redsRemaining > 0) {
    const lastShot = shots.length > 0 ? shots[shots.length - 1] : null;
    const isCurrentlyOnColor = lastShot?.action === 'pot' && lastShot?.ballPotted === 'red';
    return (redsRemaining * (redVal + topColorVal)) + totalColorsVal + (isCurrentlyOnColor ? topColorVal : 0);
  }

  // 0 reds remaining
  const lastShot = shots.length > 0 ? shots[shots.length - 1] : null;
  const isCurrentlyOnColorForLastRed = lastShot?.action === 'pot' && lastShot?.ballPotted === 'red';

  if (isCurrentlyOnColorForLastRed) {
    return topColorVal + totalColorsVal;
  }

  // Find index of the very last red pot
  let lastRedIndex = -1;
  for (let i = shots.length - 1; i >= 0; i--) {
    if (shots[i].action === 'pot' && shots[i].ballPotted === 'red') {
      lastRedIndex = i;
      break;
    }
  }

  const shotsAfterLastRed = lastRedIndex >= 0 ? shots.slice(lastRedIndex + 1) : shots;
  const potShotsAfterLastRed = shotsAfterLastRed.filter(s => s.action === 'pot' && s.ballPotted);

  let colorPotsToExclude = 0;
  if (lastRedIndex >= 0 && potShotsAfterLastRed.length > 0) {
    const lastRedShot = shots[lastRedIndex];
    if (potShotsAfterLastRed[0].visitNumber === lastRedShot.visitNumber) {
      colorPotsToExclude = 1;
    }
  }

  const finalColorPots = potShotsAfterLastRed.slice(colorPotsToExclude);
  const pottedColors = new Set<string>();
  for (const shot of finalColorPots) {
    if (shot.ballPotted && shot.ballPotted !== 'red') {
      pottedColors.add(shot.ballPotted);
    }
  }

  let remaining = 0;
  for (const [color, pts] of Object.entries(colorPoints)) {
    if (!pottedColors.has(color)) {
      remaining += pts;
    }
  }

  return remaining;
}

/**
 * Calculates snookers required.
 * Each foul yields at least 4 penalty points.
 */
export function calculateSnookersRequired(pointsDiff: number, remainingPoints: number): number {
  if (pointsDiff <= remainingPoints) {
    return 0;
  }
  const deficit = pointsDiff - remainingPoints;
  return Math.ceil(deficit / 4);
}

/**
 * Determine the next legal target after a pot or foul.
 */
export function getNextTargetAfterPot(
  currentReds: number,
  currentTarget: LegalTarget,
  pottedBall: BallColor
): { nextReds: number; nextTarget: LegalTarget } {
  if (pottedBall === 'red') {
    const nextReds = Math.max(0, currentReds - 1);
    return { nextReds, nextTarget: 'color' };
  }

  // A color ball was potted
  if (currentTarget === 'color') {
    if (currentReds > 0) {
      return { nextReds: currentReds, nextTarget: 'red' };
    } else {
      // Last red followed by color completed -> move to yellow
      return { nextReds: 0, nextTarget: 'yellow' };
    }
  }

  // Final colors clearance sequence
  if (pottedBall === 'yellow' && currentTarget === 'yellow') {
    return { nextReds: 0, nextTarget: 'green' };
  }
  if (pottedBall === 'green' && currentTarget === 'green') {
    return { nextReds: 0, nextTarget: 'brown' };
  }
  if (pottedBall === 'brown' && currentTarget === 'brown') {
    return { nextReds: 0, nextTarget: 'blue' };
  }
  if (pottedBall === 'blue' && currentTarget === 'blue') {
    return { nextReds: 0, nextTarget: 'pink' };
  }
  if (pottedBall === 'pink' && currentTarget === 'pink') {
    return { nextReds: 0, nextTarget: 'black' };
  }
  if (pottedBall === 'black' && currentTarget === 'black') {
    return { nextReds: 0, nextTarget: 'game-over' };
  }

  return { nextReds: currentReds, nextTarget: currentTarget };
}

/**
 * Reset legal target after a miss, foul, or end of turn.
 */
export function getTargetAfterTurnEnd(currentReds: number, currentTarget: LegalTarget): LegalTarget {
  if (currentReds > 0) {
    return 'red';
  }
  if (currentTarget === 'color') {
    // Was on color after last red, but turn ended -> next striker must play yellow
    return 'yellow';
  }
  return currentTarget;
}

/**
 * Check if a ball is legal to pot given current state.
 */
export function isBallLegal(ball: BallColor, legalTarget: LegalTarget, redsRemaining: number): boolean {
  if (legalTarget === 'game-over') return false;

  if (legalTarget === 'red') {
    return ball === 'red';
  }

  if (legalTarget === 'color') {
    return ball !== 'red';
  }

  if (legalTarget === 'yellow') return ball === 'yellow';
  if (legalTarget === 'green') return ball === 'green';
  if (legalTarget === 'brown') return ball === 'brown';
  if (legalTarget === 'blue') return ball === 'blue';
  if (legalTarget === 'pink') return ball === 'pink';
  if (legalTarget === 'black') return ball === 'black';

  return false;
}

/**
 * Compute detailed analytics for a player from their shots and visits.
 */
export function calculatePlayerStats(
  allShots: Shot[],
  allVisits: Visit[],
  playerIndex: 0 | 1,
  opponentShots: Shot[]
): PlayerStats {
  const playerShots = allShots.filter(s => s.playerIndex === playerIndex);
  const playerVisits = allVisits.filter(v => v.playerIndex === playerIndex);

  const totalPoints = playerShots.reduce((sum, s) => sum + (s.action === 'pot' ? s.points : 0), 0);
  const potsAttempted = playerShots.filter(s => s.action === 'pot' || s.action === 'miss' || s.isBreakAttempt).length;
  const potsPotted = playerShots.filter(s => s.action === 'pot').length;
  const pottingAccuracy = potsAttempted > 0 ? (potsPotted / potsAttempted) * 100 : 0;

  const totalVisits = playerVisits.length;
  const breakVisits = playerVisits.filter(v => v.ballsPotted >= 2).length;
  const breakRate = totalVisits > 0 ? (breakVisits / totalVisits) * 100 : 0;

  const breakTiers = {
    twoToFourBalls: playerVisits.filter(v => v.ballsPotted >= 2 && v.ballsPotted <= 4 && v.pointsScored < 20).length,
    twentyPlus: playerVisits.filter(v => v.pointsScored >= 20 && v.pointsScored < 50).length,
    fiftyPlus: playerVisits.filter(v => v.pointsScored >= 50 && v.pointsScored < 70).length,
    seventyPlus: playerVisits.filter(v => v.pointsScored >= 70 && v.pointsScored < 100).length,
    centuryPlus: playerVisits.filter(v => v.pointsScored >= 100).length,
  };

  const highestBreak = playerVisits.reduce((max, v) => Math.max(max, v.pointsScored), 0);

  const foulsCount = playerShots.filter(s => s.action === 'foul').length;
  const foulPointsConceded = playerShots
    .filter(s => s.action === 'foul')
    .reduce((sum, s) => sum + s.points, 0);
  const foulRate = totalVisits > 0 ? (foulsCount / totalVisits) * 100 : 0;

  // Errors conceded: visits that ended in a miss/foul and directly allowed opponent to pot
  const errorsConceded = playerVisits.filter(v => v.endedWithOpportunityGiven).length;
  const errorRate = totalVisits > 0 ? (errorsConceded / totalVisits) * 100 : 0;

  const totalShotTimeSec = playerShots.reduce((sum, s) => sum + (s.shotTimeSec || 0), 0);
  const averageShotTime = playerShots.length > 0 ? totalShotTimeSec / playerShots.length : 0;

  const totalGa = playerShots.reduce((sum, s) => sum + (s.gaCount || 0), 0);

  return {
    totalPoints,
    potsAttempted,
    potsPotted,
    pottingAccuracy: Math.round(pottingAccuracy * 10) / 10,
    totalVisits,
    breakVisits,
    breakRate: Math.round(breakRate * 10) / 10,
    breakTiers,
    highestBreak,
    foulsCount,
    foulPointsConceded,
    foulRate: Math.round(foulRate * 10) / 10,
    errorsConceded,
    errorRate: Math.round(errorRate * 10) / 10,
    totalShotTimeSec: Math.round(totalShotTimeSec),
    averageShotTime: Math.round(averageShotTime * 10) / 10,
    totalGa,
  };
}

export function createInitialFrame(
  frameNumber: number,
  gameMode: GameMode,
  p1FramesWon: number = 0,
  p2FramesWon: number = 0,
  electricConfig?: ElectricConfig,
  p1HandicapPoints: number = 0,
  p2HandicapPoints: number = 0,
  shootOutConfig?: ShootOutConfig
): Frame {
  const redsRemaining = (gameMode === '15-reds' || gameMode === 'shoot-out') ? 15 : 6;
  const emptyStats: PlayerStats = {
    totalPoints: 0,
    potsAttempted: 0,
    potsPotted: 0,
    pottingAccuracy: 0,
    totalVisits: 0,
    breakVisits: 0,
    breakRate: 0,
    breakTiers: { twoToFourBalls: 0, twentyPlus: 0, fiftyPlus: 0, seventyPlus: 0, centuryPlus: 0 },
    highestBreak: 0,
    foulsCount: 0,
    foulPointsConceded: 0,
    foulRate: 0,
    errorsConceded: 0,
    errorRate: 0,
    totalShotTimeSec: 0,
    averageShotTime: 0,
    totalGa: 0,
  };

  const diff = (p1HandicapPoints || 0) - (p2HandicapPoints || 0);
  const netHandicapPoints = Math.abs(diff);
  let handicapGiverIndex: 0 | 1 | -1 = -1;
  let p1InitialScore = 0;
  let p2InitialScore = 0;

  if (diff > 0) {
    // Player 1 has higher base points (e.g. 18 vs 16) -> Player 2 gives handicap to Player 1!
    handicapGiverIndex = 1;
    p1InitialScore = netHandicapPoints;
    p2InitialScore = 0;
  } else if (diff < 0) {
    // Player 2 has higher base points -> Player 1 gives handicap to Player 2!
    handicapGiverIndex = 0;
    p1InitialScore = 0;
    p2InitialScore = netHandicapPoints;
  }

  return {
    id: 'frame-' + Date.now(),
    frameNumber,
    startTime: Date.now(),
    durationSec: 0,
    player1Score: p1InitialScore,
    player2Score: p2InitialScore,
    player1FramesWon: p1FramesWon,
    player2FramesWon: p2FramesWon,
    player1Ga: 0,
    player2Ga: 0,
    redsRemaining,
    legalTarget: 'red',
    freeBallActive: false,
    shots: [],
    visits: [],
    isCompleted: false,
    stats: [emptyStats, { ...emptyStats }],
    electricConfig: electricConfig ? { ...electricConfig } : undefined,
    shootOutConfig: shootOutConfig ? { ...shootOutConfig } : undefined,
    player1HandicapPoints: p1HandicapPoints || 0,
    player2HandicapPoints: p2HandicapPoints || 0,
    handicapGiverIndex,
    netHandicapPoints,
  };
}
