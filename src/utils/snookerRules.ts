import { BallInfo, BallColor, LegalTarget, Shot, Visit, PlayerStats, GameMode, PocketLocation, ElectricConfig } from '../types/snooker';

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
  redPoints: 1,
  yellowPoints: 2,
  greenPoints: 1,
  brownPoints: 1,
  bluePoints: 1,
  pinkPoints: 1,
  blackPoints: 4,
  lastBlackPoints: 7,
  foulPenalty: 4,
  handicapEnabled: false,
  handicapGiverIndex: 0,
  handicapGiverRatio: 80,
  handicapReceiverRatio: 100,
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
 * Calculate pot points for Electric Snooker / Ball Count with Handicap
 */
export function calculateElectricPotPoints(
  ball: BallColor,
  pocket?: PocketLocation,
  isFinalBlack: boolean = false,
  electricConfig?: ElectricConfig,
  playerIndex: 0 | 1 = 0
): { points: number; rawPoints: number; isGaBonus: boolean; description: string } {
  if (!electricConfig) {
    const raw = BALL_MAP[ball].points;
    return {
      points: raw,
      rawPoints: raw,
      isGaBonus: false,
      description: `ตบลูก ${BALL_MAP[ball].nameTh} (+${raw})`,
    };
  }

  let rawPoints = 1;
  let isGaBonus = false;

  if (electricConfig.countMode === 'ball-only') {
    // Pure ball count: custom points per ball or 1 pt each
    rawPoints = getBallBasePoints(ball, isFinalBlack, electricConfig);
  } else {
    // Ball count + Ga bonus
    if (ball === 'red') {
      rawPoints = electricConfig.redPoints;
    } else {
      const isGa = isGaPocket(ball, pocket);
      if (isGa) {
        rawPoints = getBallBasePoints(ball, isFinalBlack, electricConfig);
        isGaBonus = true;
      } else {
        rawPoints = 1; // Standard non-ga pocket counts as 1 ball
      }
    }
  }

  // Apply handicap multiplier if enabled
  let multiplier = 1;
  if (electricConfig.handicapEnabled && playerIndex === electricConfig.handicapGiverIndex) {
    multiplier = electricConfig.handicapGiverRatio / 100;
  }

  const effectivePoints = Math.round(rawPoints * multiplier * 10) / 10;
  const desc = `ตบลูก ${BALL_MAP[ball].nameTh}${isGaBonus ? ' (หลุมกา)' : ''} (+${effectivePoints}${multiplier !== 1 ? ` [ต่อ ${electricConfig.handicapGiverRatio}%]` : ''})`;

  return {
    points: effectivePoints,
    rawPoints,
    isGaBonus,
    description: desc,
  };
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
  electricConfig?: ElectricConfig
): Frame {
  const redsRemaining = gameMode === '15-reds' ? 15 : 6;
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

  return {
    id: 'frame-' + Date.now(),
    frameNumber,
    startTime: Date.now(),
    durationSec: 0,
    player1Score: 0,
    player2Score: 0,
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
  };
}
